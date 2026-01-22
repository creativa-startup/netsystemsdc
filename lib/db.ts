import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Solution {
    id: string;
    title: string;
    description: string;
    icon: string; // Name of the icon
    features: string[];
}

export async function getSolutions(): Promise<Solution[]> {
    // In a real scenario with Admin SDK, this would be more robust for SSR.
    // Using client SDK on server might require specific auth or rules allowing read.
    // For now, we return mock data if DB is empty or fails, to ensure UI renders.

    try {
        const q = query(collection(db, 'solutions'), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        const solutions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solution));

        if (solutions.length > 0) return solutions;
    } catch (error) {
        console.warn("Firestore fetch failed (expected if collection doesn't exist yet). Using fallback data.");
    }

    // Fallback data matching requirements
    return [
        {
            id: 'mantenimiento',
            title: 'Mantenimiento',
            description: 'Servicio técnico especializado para garantizar la operatividad de sus equipos.',
            icon: 'Settings',
            features: ['Técnico', 'Preventivo', 'Correctivo']
        },
        {
            id: 'hardware',
            title: 'Hardware',
            description: 'Infraestructura de punta para telecomunicaciones y procesamiento.',
            icon: 'Server',
            features: ['Telecomunicaciones', 'Equipos de Alta Gama', 'Redes']
        },
        {
            id: 'software',
            title: 'Software',
            description: 'Soluciones digitales para la gestión corporativa eficiente.',
            icon: 'Code',
            features: ['Gestión Corporativa', 'Licencias a Medida', 'Desarrollo Web']
        }
    ];
}
