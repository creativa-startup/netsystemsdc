'use server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, addDoc, serverTimestamp, getDoc, limit, query, orderBy, setDoc } from 'firebase/firestore';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Define Types for Context
interface Service {
    title: string;
    description: string;
    features?: string[];
}

interface CompanyInfo {
    name: string;
    mission?: string;
    contact?: any;
    hours?: string;
}

// Tool Definition for saving leads
const saveLeadTool = {
    name: "save_lead",
    description: "Guarda un cliente potencial (lead) en la base de datos cuando el usuario muestra interés y proporciona sus datos de contacto.",
    parameters: {
        type: SchemaType.OBJECT,
        properties: {
            name: { type: SchemaType.STRING, description: "Nombre del cliente" },
            email: { type: SchemaType.STRING, description: "Correo electrónico del cliente" },
            phone: { type: SchemaType.STRING, description: "Teléfono del cliente (opcional)" },
            interest: { type: SchemaType.STRING, description: "Servicio o tema de interés" },
            notes: { type: SchemaType.STRING, description: "Notas adicionales o contexto de la conversación" }
        },
        required: ["name", "email", "interest"]
    }
};

async function getSystemContext() {
    let contextParts: string[] = [];

    try {
        // 1. Hero / Main Value Proposition
        const heroSnap = await getDocs(collection(db, 'hero_s1'));
        if (!heroSnap.empty) {
            const heroData = heroSnap.docs.map(d => d.data());
            contextParts.push(`PROPUESTA DE VALOR PRINCIPAL:\n${JSON.stringify(heroData, null, 2)}`);
        }

        // 2. Features / Services
        const featuresSnap = await getDocs(collection(db, 'features_s2'));
        if (!featuresSnap.empty) {
            const featuresData = featuresSnap.docs.map(d => d.data());
            contextParts.push(`CARACTERÍSTICAS Y SERVICIOS:\n${JSON.stringify(featuresData, null, 2)}`);
        }

        // 3. About Us
        const aboutSnap = await getDocs(collection(db, 'about_s3'));
        if (!aboutSnap.empty) {
            const aboutData = aboutSnap.docs.map(d => d.data());
            contextParts.push(`SOBRE LA EMPRESA:\n${JSON.stringify(aboutData, null, 2)}`);
        }

    } catch (error) {
        console.error("Error fetching context:", error);
    }

    if (contextParts.length === 0) {
        console.warn("WARNING: Firestore context empty. Using fallback context.");
        return `
        CONTEXTO DE RESPALDO (La base de datos parece vacía, usa esto por ahora):
        Empresa: NetSystemsDC
        Descripción: Soluciones tecnológicas integrales, consultoría en la nube y desarrollo de software.
        Servicios generales: Desarrollo web, Migración a la nube, Ciberseguridad, Soporte TI.
        Contacto: Solicita el correo o teléfono al usuario para que un humano lo contacte.
        `;
    }

    return contextParts.join('\n\n');
}

export async function processChat(chatId: string, userMessage: string, userInfo: { name: string, email: string }) {
    console.log("--- processChat Triggered ---");
    console.log("ChatID:", chatId);

    if (!process.env.GEMINI_API_KEY) {
        console.error("ERROR: GEMINI_API_KEY is missing in server env");
        return { error: 'API Key missing' };
    }

    try {
        // 1. Get Context
        console.log("Fetching context...");
        const contextData = await getSystemContext();
        console.log("Context loaded length:", contextData.length);

        // 2. Fetch History (Last 10 messages)
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(10));
        const historySnap = await getDocs(q);
        // Reverse to chronological order
        const history = historySnap.docs.reverse().map(doc => {
            const data = doc.data();
            return {
                role: data.sender === 'user' ? 'user' : 'model',
                parts: [{ text: data.text }]
            };
        });

        // 3. Initialize Model with System Prompt
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            // Casting to any to avoid strict Schema typing issues in TS
            tools: [{ functionDeclarations: [saveLeadTool as any] }],
        });

        const systemPrompt = `
        Eres el asistente oficial de NetSystemsDC. Tu conocimiento se basa estrictamente en la siguiente información de la empresa:
        
        ${contextData}

        INFORMACIÓN DEL USUARIO ACTUAL:
        Nombre: ${userInfo.name}
        Email: ${userInfo.email}

        INSTRUCCIONES:
        1. Utiliza ÚNICAMENTE la información provista arriba para responder.
        2. Si el usuario pregunta algo que no está en esta información, dile amablemente que consultarás con un asesor humano y pídeles su contacto (si no lo tienes) o confírmalo.
        3. SIEMPRE que obtengas datos de contacto o confirmes interés, USA LA HERRAMIENTA "save_lead" para guardar la información.
        4. Sé conciso, profesional y amable.
        `;

        // Start Chat Session
        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: "System Start: Context Loaded." }] },
                { role: "model", parts: [{ text: "Entendido. Soy el asistente de NetSystemsDC. ¿En qué puedo ayudarte?" }] },
                ...history
            ] as any,
            systemInstruction: {
                role: 'system',
                parts: [{ text: systemPrompt }]
            }
        });

        // Send Message
        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        // Handle Function Calls
        const functionCalls = response.functionCalls();
        let finalResponseText = "";

        if (functionCalls && functionCalls.length > 0) {
            for (const call of functionCalls) {
                if (call.name === 'save_lead') {
                    const args = call.args as any;
                    // Save to Firestore
                    await addDoc(collection(db, 'leads'), {
                        name: args.name || userInfo.name,
                        email: args.email || userInfo.email,
                        phone: args.phone || 'No especificado',
                        interest: args.interest,
                        notes: args.notes || 'Generado por Gemini Chatbot',
                        status: 'new',
                        source: 'chatbot',
                        createdAt: serverTimestamp()
                    });

                    // Send function response back to model to get final refined answer
                    const functionResponse = {
                        functionResponse: {
                            name: 'save_lead',
                            response: { success: true, message: "Lead guardado correctamente." }
                        }
                    };

                    // We need to send the function response back to the model
                    const followUpResult = await chat.sendMessage([functionResponse] as any);
                    finalResponseText = followUpResult.response.text();
                }
            }
        } else {
            finalResponseText = response.text();
        }

        // 4. Save Bot Response to Firestore
        if (finalResponseText) {
            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text: finalResponseText,
                sender: 'bot', // distinguishing from 'admin'
                timestamp: serverTimestamp()
            });

            // Update chat status
            await setDoc(doc(db, 'chats', chatId), {
                lastMessage: finalResponseText,
                adminUnread: false, // Bot answered, so technically "read" or handled
                updatedAt: serverTimestamp()
            }, { merge: true });
        }

        return { success: true };

    } catch (error: any) {
        console.error("Agent Error Details:", error);
        return { error: error.message || 'Error desconocido en el agente', details: JSON.stringify(error) };
    }
}
