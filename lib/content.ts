import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HeroContent {
    title: string;
    subtitle: string;
    ctaText: string;
    bgImage: string;
    titleColor?: string;
    titleSize?: string;
    subtitleColor?: string;
}

export interface SolutionsMeta {
    title: string;
    description: string;
}

export interface CatalogContent {
    title: string;
    description: string;
    ctaText: string;
    catalogLink?: string;
}

export interface RRSSContent {
    facebook: string;
    instagram: string;
    whatsapp: string;
}

export async function getHeroContent(): Promise<HeroContent> {
    try {
        const docRef = doc(db, 'content', 'hero');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as HeroContent;
        }
    } catch (error) {
        console.warn("Error fetching hero content:", error);
    }

    // Default fallback
    return {
        title: '23 Años Liderando Soluciones Integrales',
        subtitle: 'Continuidad de Negocio Garantizada. Transformamos tu infraestructura tecnológica para el futuro.',
        ctaText: 'Solicitar Consultoría',
        bgImage: '/images/Ejemplo Frontend.webp',
        titleColor: '#ffffff',
        titleSize: 'text-5xl md:text-7xl',
        subtitleColor: '#d1d5db' // gray-300
    };
}

export async function getSolutionsMeta(): Promise<SolutionsMeta> {
    try {
        const docRef = doc(db, 'content', 'solutions_meta');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data() as SolutionsMeta;
    } catch (e) {
        console.warn("fetch solutions meta failed", e);
    }
    return {
        title: 'Soluciones Integrales',
        description: 'Optimizamos cada aspecto de su infraestructura tecnológica con servicios especializados.'
    };
}

export async function getCatalogContent(): Promise<CatalogContent> {
    try {
        const docRef = doc(db, 'content', 'catalog');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data() as CatalogContent;
    } catch (e) {
        console.warn("fetch catalog content failed", e);
    }
    return {
        title: 'Catálogo Técnico & Lista de Precios',
        description: 'Acceda a nuestra documentación técnica detallada y listas de precios actualizadas para licencias corporativas.',
        ctaText: 'Ver Catálogo'
    };
}

export async function getRRSSContent(): Promise<RRSSContent> {
    try {
        const docRef = doc(db, 'content', 'rrss');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data() as RRSSContent;
    } catch (e) {
        console.warn("fetch rrss content failed", e);
    }
    return {
        facebook: '',
        instagram: '',
        whatsapp: ''
    };
}
