"use client";
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroContent } from '@/lib/content';
import { getContrastColor } from '@/lib/colors';

export default function Hero({ previewData }: { previewData?: any }) {
    const [content, setContent] = useState<HeroContent | null>(previewData || null);

    useEffect(() => {
        if (previewData) {
            setContent(previewData);
            return;
        }

        // Listen to the new settings/landing document
        const unsub = onSnapshot(doc(db, 'settings', 'landing'), (snapshot) => {
            if (snapshot.exists() && snapshot.data().hero) {
                setContent(snapshot.data().hero);
            } else {
                // Fallback to defaults or try the old content/hero
                // For now, let's just use the fallback values
                setContent({
                    title: '23 Años Liderando Soluciones Integrales',
                    subtitle: 'Continuidad de Negocio Garantizada. Transformamos tu infraestructura tecnológica para el futuro.',
                    btn1: { label: 'Solicitar Consultoría', link: '#contacto', color: '#2563eb' },
                    btn2: { label: 'Ver Catálogo', link: '#showcase' },
                    bgImage: '/images/Ejemplo Frontend.webp',
                    titleColor: '#ffffff',
                    titleSize: 'text-5xl md:text-7xl',
                    subtitleColor: '#d1d5db',
                    overlayColor: '#000000',
                    overlayOpacity: 0.6
                });
            }
        });

        return () => unsub();
    }, [previewData]);

    if (!content) return (
        previewData ? (
            <div className="h-full flex items-center justify-center text-zinc-500">
                <span className="text-sm">Cargando Previsualización...</span>
            </div>
        ) : (
            <div className="h-[80vh] bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    );

    return (
        <section className={`relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900 text-white ${previewData ? 'rounded-3xl border border-zinc-800' : ''}`}>
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0 transition-opacity duration-1000">
                {content.bgImage && (
                    <Image
                        src={content.bgImage}
                        alt="Infrastructure Background"
                        fill
                        className="object-cover"
                        priority
                    />
                )}

                <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                        backgroundColor: content.overlayColor || '#000000',
                        opacity: content.overlayOpacity ?? 0.6
                    }}
                />
            </div>

            <div className="container mx-auto px-6 lg:px-[100px] relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-blue-400 text-xs md:text-sm font-medium tracking-wide uppercase">Expertos en Infraestructura IT</span>
                    </div>

                    {/* Logic for contrast */}
                    {(() => {
                        const overlay = content.overlayColor || '#000000';
                        const contrast = getContrastColor(overlay);
                        const isLight = contrast === '#000000'; // If contrast is black, bg is light

                        const defaultTitle = isLight ? '#111827' : '#ffffff';
                        const defaultSub = isLight ? '#4b5563' : '#d1d5db';

                        return (
                            <>
                                <h1
                                    className={`font-black tracking-tight leading-tight animate-fade-in-up delay-100 ${content.titleSize || 'text-5xl md:text-7xl'}`}
                                    style={{ color: content.titleColor || defaultTitle }}
                                >
                                    {content.title}
                                </h1>

                                <p
                                    className={`max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 ${content.subtitleSize || 'text-lg md:text-xl'}`}
                                    style={{ color: content.subtitleColor || defaultSub }}
                                >
                                    {content.subtitle}
                                </p>
                            </>
                        );
                    })()}

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up delay-300">
                        <Link
                            href={content.btn1.link}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 bg-primary text-primary-foreground"
                            style={{
                                backgroundColor: content.btn1.color || undefined,
                                color: content.btn1.color ? 'white' : undefined
                            }}
                        >
                            {content.btn1.label}
                            <ArrowRight size={20} />
                        </Link>

                        <Link
                            href={content.btn2.link}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold border transition-all hover:scale-105 flex items-center justify-center gap-2"
                            style={{
                                backgroundColor: content.btn2.color || 'transparent',
                                color: content.btn2.color ? 'white' : 'white',
                                borderColor: content.btn2.color || '#3f3f46'
                            }}
                        >
                            {content.btn2.label}
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}
