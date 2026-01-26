import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
// Ensure GEMINI_API_KEY is in your .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        // Debug Log
        console.log('[Gemini API] Prompt received');
        console.log('[Gemini API] Key configured:', !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            console.error('[Gemini API] Error: Missing API Key');
            return NextResponse.json(
                { error: 'Server configuration error: Missing API Key' },
                { status: 500 }
            );
        }

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const systemPrompt = `
        You are an expert web copywriter and CRO (Conversion Rate Optimization) specialist.
        Your task is to generate high-quality, persuasive landing page content based on the user's business description.
        
        Generate content for three sections:
        1. **Hero (S1)**: Impactful headline and subtitle.
        2. **Features (S2)**: 3 to 4 key features/benefits.
        3. **About (S3)**: Section title, description, and trust metrics.
        4. **Contact (S5)**: Badge, Title, and Description.

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
                ]
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

        const result = await model.generateContent([
            systemPrompt,
            `User Business/Request: ${prompt}`
        ]);

        const response = await result.response;
        let text = response.text();

        // Cleanup markdown if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const json = JSON.parse(text);

        return NextResponse.json(json);

    } catch (error: any) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate content', details: error.message },
            { status: 500 }
        );
    }
}
