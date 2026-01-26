const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");

admin.initializeApp();
const db = admin.firestore();

// Define configuration parameters
// Users can set this via CLI: firebase functions:secrets:set GEMINI_API_KEY
// Or purely via environment variables if using .env
const geminiApiKey = defineString("GEMINI_API_KEY");

// --- 1. Generate Content Function ---
exports.generateContent = onCall({ region: "us-central1", secrets: [geminiApiKey] }, async (request) => {
    const prompt = request.data.prompt;
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new HttpsError('failed-precondition', 'Missing GEMINI_API_KEY');
    }
    if (!prompt) {
        throw new HttpsError('invalid-argument', 'Prompt is required');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `
        You are an expert web copywriter and CRO (Conversion Rate Optimization) specialist.
        Your task is to generate high-quality, persuasive landing page content based on the user's business description.
        
        Generate content for three sections:
        1. **Hero (S1)**: Impactful headline and subtitle.
        2. **Features (S2)**: 3 to 4 key features/benefits.
        3. **About (S3)**: Section title, description, and trust metrics.
        4. **Contact (S5)**: Badge, Title, and Description.
        5. **Footer**: Description and Copyright.

        **Strict Output Format**:
        Return ONLY a valid JSON object with the following structure. Do not include markdown formatting like \`\`\`json.
        {
            "hero": {
                "title": "Impactful Headline",
                "subtitle": "Persuasive subtitle...",
                "overlayColor": "#000000 or custom hex"
            },
            "features": {
                "title": "Core Services",
                "description": "Brief section intro",
                "backgroundColor": "#ffffff or hex",
                "items": [
                    {
                        "title": "Feature 1",
                        "description": "Benefit description..."
                    },
                    {
                        "title": "Feature 2",
                        "description": "Benefit description..."
                    },
                    {
                        "title": "Feature 3",
                        "description": "Benefit description..."
                    }
                ]
            },
            "about": {
                "badge": "About Us",
                "title": "Section Title",
                "description": "Compelling story...",
                "backgroundColor": "#f4f4f5 or hex",
                "metrics": [
                    { "value": "10+", "label": "Years Experience" },
                    { "value": "500+", "label": "Clients" },
                    { "value": "24/7", "label": "Support" }
                ],
                "titleColor": "#000000",
                "textColor": "#4b5563"
            },
            "contact": {
                "badge": "Contact Us",
                "title": "Get in Touch",
                "description": "Call to action..."
            },
            "footer": {
                "description": "Short trusted company description (max 2 sentences)",
                "copyright": "© 2024 Company Name. All rights reserved."
            }
        }
        
        **Design & Color Instructions**:
        - Suggest a **Background Color** (hex) for "features" and "about" sections that matches the tone of the content (e.g., dark/elegant vs light/clean).
        - Ensure the colors provide good foundation for contrast (dark hex for tech/premium, light hex for trust/clean).
    `;

    try {
        const result = await model.generateContent([
            systemPrompt,
            `User Business/Request: ${prompt}`
        ]);

        const response = result.response;
        let text = response.text();
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(text);

        return json;
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new HttpsError('internal', 'Failed to generate content: ' + error.message);
    }
});


// --- 2. Chat Agent Function ---
exports.chatAgent = onCall({ region: "us-central1", secrets: [geminiApiKey] }, async (request) => {
    const { chatId, message, userInfo } = request.data;
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;

    console.log("--- chatAgent Triggered ---", chatId);

    if (!apiKey) {
        throw new HttpsError('failed-precondition', 'Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // 1. Get Context (Helper Function inline)
        let contextParts = [];
        try {
            const heroSnap = await db.collection('hero_s1').get();
            if (!heroSnap.empty) {
                const heroData = heroSnap.docs.map(d => d.data());
                contextParts.push(`PROPUESTA DE VALOR PRINCIPAL:\n${JSON.stringify(heroData, null, 2)}`);
            }
            const featuresSnap = await db.collection('features_s2').get();
            if (!featuresSnap.empty) {
                const featuresData = featuresSnap.docs.map(d => d.data());
                contextParts.push(`CARACTERÍSTICAS Y SERVICIOS:\n${JSON.stringify(featuresData, null, 2)}`);
            }
            const aboutSnap = await db.collection('about_s3').get();
            if (!aboutSnap.empty) {
                const aboutData = aboutSnap.docs.map(d => d.data());
                contextParts.push(`SOBRE LA EMPRESA:\n${JSON.stringify(aboutData, null, 2)}`);
            }
        } catch (e) {
            console.error("Error fetching context:", e);
        }

        const contextData = contextParts.length > 0 ? contextParts.join('\n\n') : `
            CONTEXTO DE RESPALDO:
            Empresa: NetSystemsDC
            Descripción: Soluciones tecnológicas integrales.
        `;

        // 2. Fetch History (Last 10 messages)
        const messagesRef = db.collection('chats').doc(chatId).collection('messages');
        const historySnap = await messagesRef.orderBy('timestamp', 'desc').limit(10).get();
        // reverse to asc
        const historyDocs = historySnap.docs.reverse();
        const history = historyDocs.map(doc => {
            const data = doc.data();
            return {
                role: data.sender === 'user' ? 'user' : 'model',
                parts: [{ text: data.text }]
            };
        });

        // 3. Initialize Model
        const saveLeadTool = {
            name: "save_lead",
            description: "Guarda un cliente potencial (lead).",
            parameters: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    email: { type: "STRING" },
                    phone: { type: "STRING" },
                    interest: { type: "STRING" },
                    notes: { type: "STRING" }
                },
                required: ["name", "email", "interest"]
            }
        };

        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            tools: [{ functionDeclarations: [saveLeadTool] }],
        });

        const systemPrompt = `
            Eres el asistente de NetSystemsDC.
            CONTEXTO:
            ${contextData}

            USUARIO: ${userInfo.name} (${userInfo.email})

            INSTRUCCIONES:
            1. Usa solo la información provista.
            2. Usa "save_lead" si obtienes datos de contacto o interés claro.
            3. Sé conciso y profesional.
        `;

        const chatSession = model.startChat({
            history: [
                { role: "user", parts: [{ text: "System Start." }] },
                { role: "model", parts: [{ text: "Entendido." }] },
                ...history
            ],
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemPrompt }]
            }
        });

        const result = await chatSession.sendMessage(message);
        const response = result.response;
        const functionCalls = response.functionCalls();
        let finalResponseText = "";

        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === 'save_lead') {
                    const args = call.args;
                    await db.collection('leads').add({
                        name: args.name || userInfo.name,
                        email: args.email || userInfo.email,
                        phone: args.phone || 'No especificado',
                        interest: args.interest,
                        notes: args.notes || 'Generado por Chatbot',
                        status: 'new',
                        source: 'chatbot',
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                    // Send response back
                    const fsResp = {
                        functionResponse: {
                            name: 'save_lead',
                            response: { success: true, message: "Lead guardado." }
                        }
                    };
                    const followUp = await chatSession.sendMessage([fsResp]);
                    finalResponseText = followUp.response.text();
                }
            }
        } else {
            finalResponseText = response.text();
        }

        // 4. Save Bot Response
        if (finalResponseText) {
            await messagesRef.add({
                text: finalResponseText,
                sender: 'bot',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
            await db.collection('chats').doc(chatId).set({
                lastMessage: finalResponseText,
                adminUnread: false,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        return { success: true };

    } catch (error) {
        console.error("Agent Error:", error);
        throw new HttpsError('internal', error.message);
    }
});

// --- 3. Generate Blog Content Function ---
exports.generateBlogContent = onCall({ region: "us-central1", secrets: [geminiApiKey] }, async (request) => {
    const prompt = request.data.prompt;
    const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new HttpsError('failed-precondition', 'Missing GEMINI_API_KEY');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemInstruction = `Eres un experto en copywriting y SEO para agencias de marketing digital. Tu tarea es generar artículos de blog informativos, atractivos y optimizados para SEO.
    
    IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido (sin markdown code blocks) con la siguiente estructura:
    {
        "content": "El artículo completo en formato Markdown (HTML compatible). Usa H2, H3, bolds, listas, etc.",
        "metaTitle": "Título SEO optimizado (max 60 chars)",
        "metaDescription": "Descripción atractiva para Google (max 160 chars)",
        "slug": "url-friendly-slug-basado-en-titulo"
    }

    Reglas para el slug: solo letras minúsculas, números y guiones. Sin tildes, ñ o caracteres especiales.
    Reglas para el contenido: Estructura lógica, introducción, desarrollo, conclusión y CTA.`;

    const fullPrompt = `${systemInstruction}\n\nInstrucción del Usuario: ${prompt}`;

    try {
        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();
        const jsonString = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Return plain text wrapped if JSON fails, client handles it
            return { content: text };
        }
    } catch (error) {
        console.error('Gemini API Error:', error);
        throw new HttpsError('internal', 'Failed to generate blog content: ' + error.message);
    }
});
