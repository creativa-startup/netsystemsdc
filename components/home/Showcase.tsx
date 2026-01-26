"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

interface ShowcaseItem {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    link?: string;
}

import { useGlobalConfig } from '@/context/GlobalConfigContext';

// ... interface ...

export default function Showcase({ previewData }: { previewData?: any }) {
    const { config } = useGlobalConfig();
    const [items, setItems] = useState<ShowcaseItem[]>([]);
    const [meta, setMeta] = useState<any>({
        title: 'Casos de Éxito & Soluciones',
        description: 'Explora nuestra trayectoria transformando la infraestructura de empresas líderes con tecnología de vanguardia.',
        ctaText: 'Descargar Catálogo Completo',
        catalogLink: '#',
        backgroundColor: '#09090b', // zinc-950
        titleColor: '#ffffff',
        textColor: '#a1a1aa'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (previewData) {
            setMeta(previewData);
            // Items logic for preview? Maybe just leave empty set if user doesn't care or pass dummy items
            setLoading(false);
            return;
        }

        // Real-time listener for showcase items
        const showcaseRef = collection(db, 'settings', 'landing', 'showcase');
        const unsubItems = onSnapshot(showcaseRef, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShowcaseItem));
            setItems(list);
            setLoading(false);
        });

        // Real-time listener for meta data
        const metaRef = doc(db, 'content', 'catalog');
        const unsubMeta = onSnapshot(metaRef, (snap) => {
            if (snap.exists()) setMeta((prev: any) => ({ ...prev, ...snap.data() }));
            // Add default background if missing in DB
            else setMeta((prev: any) => ({ ...prev, backgroundColor: '#09090b', titleColor: '#ffffff' }));
        });

        return () => {
            unsubItems();
            unsubMeta();
        };
    }, [previewData]);

    return (
        <section
            id="showcase"
            className="py-24 transition-colors duration-500 relative overflow-hidden"
            style={{ backgroundColor: meta.backgroundColor || '#09090b' }}
        >
            {/* Background Accents (only show if using default dark bg or allow them to blend?) */}
            {/* Let's keep accents but make them blend with new bg */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div
                    className="absolute top-1/4 -left-20 w-96 h-96 rounded-full blur-[120px] opacity-10"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                />
                <div
                    className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-10"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                />
            </div>

            <div className="container mx-auto px-6 lg:px-[100px] relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
                            style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.1)', // Fallback or needs hex-to-rgba logic. For now use slight opacity on solid var if possible
                                borderColor: 'var(--color-primary)',
                                opacity: 0.8
                            }}
                        >
                            <span
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                            />
                            <span
                                className="text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                Showcase de Proyectos
                            </span>
                        </motion.div>
                        <motion.h2
                            className="text-4xl md:text-6xl font-black leading-tight"
                            style={{ color: meta.titleColor || '#ffffff' }}
                        >
                            {meta.title}
                        </motion.h2>
                        {/* ... */}
                    </div>

                    {/* ... CTA Button ... */}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <motion.div
                                key={item.id}
                                // ... props
                                className="group relative"
                            >
                                <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:border-[var(--color-primary)]"
                                    style={{ borderColor: 'var(--zinc-800)' }} /* Default border */
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />

                                    {/* Overlay Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />

                                    {/* Content Info */}
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <span
                                                className="inline-block px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest shadow-lg"
                                                style={{ backgroundColor: 'var(--color-primary)' }}
                                            >
                                                {item.category}
                                            </span>
                                            <h3 className="text-2xl font-bold text-white leading-tight">
                                                {item.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                {item.description}
                                            </p>

                                            {item.link && (
                                                <Link
                                                    href={item.link}
                                                    className="inline-flex items-center gap-2 text-white text-xs font-bold uppercase tracking-widest pt-2 group/btn"
                                                >
                                                    Ver Detalles
                                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" style={{ color: 'var(--color-primary)' }} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {items.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800 text-zinc-700">
                                <Search size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100">Sin proyectos a la vista</h3>
                            <p className="text-zinc-500 mt-2">Próximamente estaremos publicando nuestros casos de éxito más recientes.</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
