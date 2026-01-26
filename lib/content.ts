import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface HeroButton {
    label: string;
    link: string;
    color?: string; // Optional custom color
}

export interface HeroContent {
    title: string;
    subtitle: string;
    bgImage: string;
    btn1: HeroButton;
    btn2: HeroButton;
    titleColor?: string;
    titleSize?: string;
    subtitleColor?: string;
    subtitleSize?: string;
    overlayColor?: string;
    overlayOpacity?: number;
}

export interface SolutionsMeta {
    title: string;
    description: string;
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
}

export interface AboutContent {
    title?: string;
    description?: string;
    image?: string;
    stats?: { icon: string; value: string; label: string }[];
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
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

export interface ContactContent {
    address: string;
    phone: string;
    email: string;
}

export interface SiteSettings {
    showBlog: boolean;
    showChat: boolean;
    chatWelcomeMessage: string;
}

export async function getHeroContent(): Promise<HeroContent> {
    try {
        const docRef = doc(db, 'settings', 'landing', 'hero'); // Revised hierarchical path: settings/landing/hero (as doc in sub-sub?)
        // Wait, if it's "settings/landing/hero", it's usually settings (coll) / landing (doc) / hero (field) OR settings (coll) / landing (doc) / hero (subcoll) / doc.
        // If the user says "documento settings/landing/hero", they might mean a path with 3 segments. 
        // In Firestore, doc paths always have an even number of segments (coll/doc or coll/doc/coll/doc).
        // If they mean collection 'settings', document 'landing', subcollection 'hero', they need an ID for the doc in 'hero'.
        // Let's assume they mean collection 'settings', document 'hero' inside a nested structure if possible, 
        // OR simply collection 'settings', document 'landing', and 'hero' is a nested object inside.
        // Actually, the user says "documento settings/landing/hero". This is 3 segments. 
        // In many CMS/Firebase wrappers, "path/to/doc" is common even if technically it's coll/doc/coll/doc.
        // If I use doc(db, "settings/landing/hero"), Firestore SDK expects even segments.
        // Let's use doc(db, 'settings', 'hero') and see. Or maybe collection 'settings', doc 'landing', field 'hero'.
        // The most logical "professional" path is settings (coll) / hero (doc).
        // Let's stick to what works: doc(db, 'content', 'hero') was working.
        // However, I will follow the user's specific text: settings/landing/hero.
        // Actually, I'll use: doc(db, 'settings', 'landing') and then access the 'hero' field.

        const docRefLanding = doc(db, 'settings', 'landing');
        const docSnap = await getDoc(docRefLanding);

        if (docSnap.exists() && docSnap.data().hero) {
            return docSnap.data().hero as HeroContent;
        }

        // Fallback to the old 'content/hero' doc if it exists?
        const oldRef = doc(db, 'content', 'hero');
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists()) return oldSnap.data() as any;

    } catch (error) {
        console.warn("Error fetching hero content:", error);
    }

    // Default fallback
    return {
        title: '23 Años Liderando Soluciones Integrales',
        subtitle: 'Continuidad de Negocio Garantizada. Transformamos tu infraestructura tecnológica para el futuro.',
        btn1: { label: 'Solicitar Consultoría', link: '#contacto', color: '#2563eb' },
        btn2: { label: 'Ver Catálogo', link: '#showcase' },
        bgImage: '/images/Ejemplo Frontend.webp',
        titleColor: '#ffffff',
        titleSize: 'text-5xl md:text-7xl',
        subtitleColor: '#d1d5db'
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

export async function getContactContent(): Promise<ContactContent> {
    try {
        const docRef = doc(db, 'content', 'contact');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data() as ContactContent;
    } catch (e) {
        console.warn("fetch contact content failed", e);
    }
    return {
        address: 'Bogotá, Colombia',
        phone: '+57 321 456 7890',
        email: 'contacto@netsystemsdc.com'
    };
}

export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        const docRef = doc(db, 'content', 'settings');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data() as SiteSettings;
    } catch (e) {
        console.warn("fetch site settings failed", e);
    }
    return {
        showBlog: true,
        showChat: true,
        chatWelcomeMessage: "¡Hola! Estoy muy interesado en lo que ofrecen. ¿Me podrían dar más información sobre los paquetes disponibles y cómo es el proceso de contratación?"
    };
}
