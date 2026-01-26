"use client";
import { useEffect, useState, useRef } from 'react';
import { Shield, Users, Clock, Award, CheckCircle2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface StatItem {
    icon: string;
    value: string;
    label: string;
}

interface AboutData {
    badge?: string;
    title?: string;
    description?: string;
    image?: string;
    points?: string[];
    stats?: StatItem[];
    backgroundColor?: string;
    titleColor?: string;
    textColor?: string;
}

const iconMap: Record<string, any> = { Shield, Users, Clock, Award };

function Counter({ value }: { value: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    // Extract number from string (e.g., "23+" -> 23)
    const numericValue = parseInt(value) || 0;
    const suffix = value.replace(/[0-9]/g, '');

    const spring = useSpring(0, { stiffness: 40, damping: 20 });
    const displayValue = useTransform(spring, (latest) => Math.floor(latest) + suffix);

    useEffect(() => {
        if (isInView) {
            spring.set(numericValue);
        }
    }, [isInView, numericValue, spring]);

    return <motion.span ref={ref}>{displayValue}</motion.span>;
}

export default function About({ previewData }: { previewData?: AboutData }) {
    const [data, setData] = useState<AboutData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (previewData) {
            setData(previewData);
            setLoading(false);
            return;
        }

        const docRef = doc(db, 'settings', 'landing');
        const unsub = onSnapshot(docRef, (doc) => {
            if (doc.exists() && doc.data().about) {
                setData(doc.data().about);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [previewData]);

    const defaultStats = [
        { label: 'Años de Experiencia', value: '23+', icon: 'Clock' },
        { label: 'Clientes Satisfechos', value: '500+', icon: 'Users' },
        { label: 'Certificaciones', value: '15+', icon: 'Award' },
        { label: 'Soporte 24/7', value: '100%', icon: 'Shield' },
    ];

    if (loading) return null;

    const hasImage = !!data?.image;
    const statsList = data?.stats && data.stats.length === 4 ? data.stats : defaultStats;

    return (
        <section
            id="about"
            className="py-24 transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: data?.backgroundColor || undefined }}
        >
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className={`flex flex-col lg:flex-row items-center gap-16 ${!hasImage ? 'text-center' : ''}`}>
                    {/* Content Column */}
                    <div className={`${hasImage ? 'lg:w-1/2' : 'w-full max-w-4xl mx-auto'} space-y-8 animate-in fade-in slide-in-from-left-8 duration-700`}>
                        <div className={`inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-500/10`}>
                            {data?.badge || 'Sobre Nosotros'}
                        </div>

                        <h2
                            className={`text-3xl md:text-5xl font-bold leading-tight ${!data?.titleColor ? 'text-gray-900 dark:text-white' : ''}`}
                            style={{ color: data?.titleColor }}
                        >
                            {data?.title || 'Líderes en soluciones tecnológicas desde hace más de dos décadas.'}
                        </h2>

                        <p
                            className={`text-lg leading-relaxed ${!data?.textColor ? 'text-gray-600 dark:text-gray-400' : ''}`}
                            style={{ color: data?.textColor }}
                        >
                            {data?.description || 'NetSystemsDc nació con la misión de proporcionar infraestructura IT de clase mundial. Hoy, somos el aliado estratégico de cientos de organizaciones.'}
                        </p>

                        {/* Trust Points / Features List */}
                        {data?.points && data.points.length > 0 && (
                            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 ${!hasImage ? 'justify-items-center' : ''}`}>
                                {data.points.map((point, i) => (
                                    <div key={i} className={`flex items-center gap-3 text-sm ${!data?.textColor ? 'text-zinc-600 dark:text-zinc-400' : ''}`} style={{ color: data?.textColor }}>
                                        <CheckCircle2 size={18} className="text-blue-500 flex-shrink-0" />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-8 pt-8 border-t border-gray-200 dark:border-zinc-800 ${!hasImage ? 'justify-center max-w-3xl mx-auto' : ''}`}>
                            {statsList.map((stat, index) => {
                                const Icon = iconMap[stat.icon] || Clock;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="text-blue-600 flex items-center gap-2">
                                            <Icon size={18} />
                                            <span
                                                className={`text-2xl font-bold ${!data?.titleColor ? 'text-gray-900 dark:text-white' : ''}`}
                                                style={{ color: data?.titleColor }}
                                            >
                                                <Counter value={stat.value} />
                                            </span>
                                        </div>
                                        <p
                                            className={`text-[10px] font-bold uppercase tracking-wider ${!data?.textColor ? 'text-gray-500 dark:text-zinc-500' : ''}`}
                                            style={{ color: data?.textColor, opacity: 0.8 }}
                                        >
                                            {stat.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Image Column (Conditional) */}
                    {hasImage && (
                        <div className="lg:w-1/2 relative animate-in fade-in zoom-in duration-1000">
                            <div className="aspect-square rounded-3xl bg-zinc-900 overflow-hidden shadow-2xl relative border border-zinc-200 dark:border-zinc-800 group">
                                <img
                                    src={data?.image}
                                    alt="About Us"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute bottom-8 left-8 right-8 bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                    <p className="text-white text-sm font-medium italic leading-relaxed">
                                        "Nuestra pasión es la tecnología, nuestro compromiso es su tranquilidad."
                                    </p>
                                </div>
                            </div>
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/30 transition-colors" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl -z-10 group-hover:bg-blue-600/30 transition-colors" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
