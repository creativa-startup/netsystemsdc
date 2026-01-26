"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useTheme } from 'next-themes';

interface GlobalConfig {
    logoType: 'image' | 'text';
    logoUrl?: string;
    logoText?: string;
    fontFamily: string;
    primaryColor: string;
    primaryTextColor?: string;
    accentColor: string;
    textColor?: string;
    loginBackgroundImage?: string;
    logoSize?: number;
    page_bg?: string;
    brandColor?: string; // Alias for primary or specific brand color usage
    logoIconUrl?: string;
}

interface GlobalConfigContextType {
    config: GlobalConfig;
    loading: boolean;
}

const defaultConfig: GlobalConfig = {
    logoType: 'text',
    logoText: 'NetSystemsDC',
    fontFamily: 'Inter',
    primaryColor: '#3b82f6', // blue-500
    primaryTextColor: '#ffffff',
    accentColor: '#10b981', // emerald-500
    textColor: '#171717',
    loginBackgroundImage: '',
    logoSize: 32,
};

const GlobalConfigContext = createContext<GlobalConfigContextType>({
    config: defaultConfig,
    loading: true,
});

export function GlobalConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<GlobalConfig>(defaultConfig);
    const [loading, setLoading] = useState(true);
    const { setTheme } = useTheme();

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'global_config'), (snap) => {
            if (snap.exists()) {
                const data = snap.data() as GlobalConfig;
                // Merge with default to ensure new fields like textColor exist
                setConfig({ ...defaultConfig, ...data });
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // Apply CSS Variables dynamic updates
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-primary', config.fontFamily);
        root.style.setProperty('--color-primary', config.primaryColor);
        if (config.primaryTextColor) {
            root.style.setProperty('--color-primary-text', config.primaryTextColor);
        }
        root.style.setProperty('--color-accent', config.accentColor);
        if (config.textColor) {
            root.style.setProperty('--foreground', config.textColor); // Override core foreground
        }

        // Ensure font is loaded (Basic Google Fonts implementation)
        // Note: For production, better to use next/font, but for dynamic user selection we might need a link tag injector
        if (config.fontFamily && typeof document !== 'undefined') {
            const linkId = 'dynamic-font-link';
            let link = document.getElementById(linkId) as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.id = linkId;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
            }
            const fontName = config.fontFamily.replace(/\s+/g, '+');
            link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@300;400;600;700;900&display=swap`;

            // Apply to body
            document.body.style.fontFamily = `"${config.fontFamily}", sans-serif`;
        }

    }, [config]);

    return (
        <GlobalConfigContext.Provider value={{ config, loading }}>
            {children}
        </GlobalConfigContext.Provider>
    );
}

export const useGlobalConfig = () => useContext(GlobalConfigContext);
