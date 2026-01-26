'use server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateBlogContent(prompt: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { error: 'GEMINI_API_KEY no configurada en .env.local' };
    }

    try {
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

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown code blocks if present
        const jsonString = text.replace(/```json\n?|```/g, '').trim();

        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback for plain text response
            return { content: text };
        }
    } catch (error: any) {
        console.error("Gemini Error:", error);
        return { error: error.message || 'Error generando contenido' };
    }
}
