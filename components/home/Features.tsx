"use client";
import { useEffect, useState } from 'react';
import {
    Settings, Server, Code, CheckCircle, Shield,
    Zap, Cloud, Database, Lock, Cpu,
    Network, HardDrive, Wifi, Globe
} from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getSolutionsMeta, SolutionsMeta } from '@/lib/content';
import { getContrastColor } from '@/lib/colors';

const iconMap: Record<string, any> = {
    Settings, Server, Code, CheckCircle, Shield,
    Zap, Cloud, Database, Lock, Cpu,
    Network, HardDrive, Wifi, Globe
};

export default function Features({ previewData }: { previewData?: any }) {
    const [solutions, setSolutions] = useState<any[]>([]);
    const [meta, setMeta] = useState<SolutionsMeta>({
        title: 'Soluciones Integrales',
        description: 'Optimizamos cada aspecto de su infraestructura tecnológica con servicios especializados.'
    });

    useEffect(() => {
        if (previewData) {
            if (previewData.meta) setMeta(previewData.meta);
            // We might want to pass distinct solutions list too, but for color lab, we mainly care about meta styles
            return;
        }

        // Real-time listener for features subcollection
        const featRef = collection(db, 'settings', 'landing', 'features');
        const unsubFeatures = onSnapshot(featRef, (snapshot) => {
            const featList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSolutions(featList);
        });

        // Meta data
        getSolutionsMeta().then(setMeta);

        return () => unsubFeatures();
    }, [previewData]);

    return (
        <section
            id="solutions"
            className="py-24 transition-colors duration-500"
            style={{
                backgroundColor: meta.backgroundColor || undefined
            }}
        >
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="text-center max-w-3xl mx-auto mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h2
                        className={`text-3xl md:text-5xl font-bold mb-6 ${!meta.titleColor ? 'text-gray-900 dark:text-white' : ''}`}
                        style={{ color: meta.titleColor }}
                    >
                        {meta.title}
                    </h2>
                    <p
                        className={`text-lg ${!meta.textColor ? 'text-gray-600 dark:text-gray-400' : ''}`}
                        style={{ color: meta.textColor }}
                    >
                        {meta.description}
                    </p>
                </div>

                <div className={
                    solutions.length > 3
                        ? "flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 -mx-6 px-6 lg:-mx-[100px] lg:px-[100px] scrollbar-hide"
                        : "grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                }>
                    {solutions.map((solution, index) => {
                        const Icon = iconMap[solution.icon] || Settings;

                        // Layout classes based on mode
                        const itemClasses = solutions.length > 3
                            ? "flex-none w-[85vw] md:w-[350px] snap-center"
                            : "";

                        // Robust contrast check
                        const bgContrast = meta.backgroundColor ? getContrastColor(meta.backgroundColor) : (meta.titleColor === '#ffffff' ? '#ffffff' : '#000000');
                        const isDarkBg = bgContrast === '#ffffff';

                        const cardBg = isDarkBg ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
                        const cardBorder = isDarkBg ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
                        // Use calculated contrast for text if specific color not provided
                        const cardText = meta.textColor || (isDarkBg ? '#d1d5db' : '#4b5563');
                        const cardTitle = meta.titleColor || (isDarkBg ? '#ffffff' : '#111827');

                        return (
                            <div
                                key={solution.id}
                                className={`group p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 animate-in fade-in zoom-in-95 ${itemClasses}`}
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    backgroundColor: cardBg,
                                    borderColor: cardBorder,
                                    borderWidth: '1px'
                                }}
                            >
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'var(--color-primary-text)',
                                        opacity: 0.9
                                    }}
                                >
                                    <Icon size={30} strokeWidth={1.5} />
                                </div>

                                <h3 className="text-2xl font-bold mb-4 transition-colors" style={{ color: cardTitle }}>
                                    {solution.title}
                                </h3>

                                <p className="mb-6 leading-relaxed text-sm" style={{ color: cardText }}>
                                    {solution.description}
                                </p>

                                {solution.features && solution.features.length > 0 && (
                                    <ul className="space-y-3 pt-4 border-t" style={{ borderColor: cardBorder }}>
                                        {solution.features.map((feature: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-xs group/item" style={{ color: cardText }}>
                                                <CheckCircle size={14} className="mt-0.5 group-hover/item:scale-125 transition-transform" style={{ color: 'var(--color-primary)' }} />
                                                <span className="leading-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>

                <style jsx global>{`
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    .scrollbar-hide {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>

                {solutions.length === 0 && (
                    <div className="py-20 text-center text-gray-400 italic">
                        Cargando servicios...
                    </div>
                )}
            </div>
        </section>
    );
}
