"use client";

import { useState } from 'react';
import { X, Sparkles, Loader2, Wand2, Calculator, Check, AlertCircle } from 'lucide-react';
import { doc, writeBatch, collection, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getContrastColor } from '@/lib/colors';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface ContentGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ContentGeneratorModal({ isOpen, onClose, onSuccess }: ContentGeneratorModalProps) {
    const [prompt, setPrompt] = useState('');
    const [generating, setGenerating] = useState(false);
    const [applying, setApplying] = useState(false);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [generatedData, setGeneratedData] = useState<any>(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setError('');

        try {
            const functions = getFunctions(undefined, 'us-central1');
            const generateContentFn = httpsCallable(functions, 'generateContent');

            const result = await generateContentFn({ prompt });
            const data = result.data;

            setGeneratedData(data);
            setStep('preview');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Error desconocido');
        } finally {
            setGenerating(false);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            const batch = writeBatch(db);

            // 1. Update Hero & About (in settings/landing)
            const landingRef = doc(db, 'settings', 'landing');
            const aboutBg = generatedData.about.backgroundColor || '#111827';
            const aboutContrast = getContrastColor(aboutBg);

            const heroOverlay = generatedData.hero.overlayColor || '#000000';

            batch.set(landingRef, {
                hero: {
                    ...generatedData.hero,
                    overlayColor: heroOverlay
                },
                about: {
                    ...generatedData.about,
                    backgroundColor: aboutBg,
                    titleColor: aboutContrast,
                    textColor: aboutContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
                }
            }, { merge: true });

            // 2. Update Features Meta (content/solutions_meta)
            const solutionsMetaRef = doc(db, 'content', 'solutions_meta');
            const featBg = generatedData.features.backgroundColor || '#111827';
            const featContrast = getContrastColor(featBg);

            batch.set(solutionsMetaRef, {
                title: generatedData.features.title,
                description: generatedData.features.description,
                backgroundColor: featBg,
                titleColor: featContrast,
                textColor: featContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
            }, { merge: true });

            // 3. Update Features List
            const featureList = generatedData.features.items || [];
            featureList.forEach((feat: any, idx: number) => {
                const featRef = doc(db, 'settings', 'landing', 'features', `feature-${idx + 1}`);
                batch.set(featRef, {
                    id: `feature-${idx + 1}`,
                    title: feat.title,
                    description: feat.description,
                    features: []
                });
            });

            // 4. Update Contact (in content/contact)
            if (generatedData.contact) {
                const contactRef = doc(db, 'content', 'contact');
                // Use merge to keep existing social links/phone/email
                batch.set(contactRef, {
                    badge: generatedData.contact.badge,
                    title: generatedData.contact.title,
                    description: generatedData.contact.description
                }, { merge: true });
            }

            // 5. Update Footer
            if (generatedData.footer) {
                // Fetch current footer first to preserve social/backgroundColor
                const currentLanding = (await getDoc(doc(db, 'settings', 'landing'))).data();
                const currentFooter = currentLanding?.footer || {};

                batch.set(doc(db, 'settings', 'landing'), {
                    footer: {
                        ...currentFooter,
                        description: generatedData.footer.description,
                        copyright: generatedData.footer.copyright
                    }
                }, { merge: true });
            }

            await batch.commit();
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError('Error al guardar en Firebase: ' + err.message);
        } finally {
            setApplying(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
                            <Sparkles className="text-purple-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-100">Generador de Contenido IA</h2>
                            <p className="text-xs text-zinc-500">Impulsado por Google Gemini</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {step === 'input' ? (
                        <div className="space-y-6">
                            <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-2xl flex gap-4">
                                <AlertCircle className="text-purple-400 flex-shrink-0" size={24} />
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold text-purple-200">¿Cómo funciona?</h3>
                                    <p className="text-xs text-purple-300/80 leading-relaxed">
                                        Describe tu negocio, tu audiencia y el tono que deseas. La IA generará automáticamente textos persuasivos para las secciones <strong>Hero, Servicios, Nosotros, Contacto y Footer</strong>.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-zinc-400">Tu Prompt / Descripción</label>
                                <textarea
                                    className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:ring-2 focus:ring-purple-500/50 outline-none resize-none transition-all"
                                    placeholder="Ej: Somos una veterinaria en el centro de Quito llamada 'Patitas Felices'. Nos enfocamos en un trato amable y emergencias 24/7. Queremos transmitir confianza y profesionalismo..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Hero Preview */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-2">1. Sección Hero</h3>
                                <div className="grid gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Título</label>
                                        <input
                                            value={generatedData.hero.title}
                                            onChange={(e) => setGeneratedData({ ...generatedData, hero: { ...generatedData.hero, title: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Subtítulo</label>
                                        <textarea
                                            value={generatedData.hero.subtitle}
                                            onChange={(e) => setGeneratedData({ ...generatedData, hero: { ...generatedData.hero, subtitle: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Features Preview */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-2">2. Servicios Destacados</h3>
                                <div className="grid gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Título Sección</label>
                                        <input
                                            value={generatedData.features.title}
                                            onChange={(e) => setGeneratedData({ ...generatedData, features: { ...generatedData.features, title: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                        />
                                    </div>
                                    {generatedData.features.items?.map((feat: any, i: number) => (
                                        <div key={i} className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-800 space-y-2">
                                            <input
                                                value={feat.title}
                                                onChange={(e) => {
                                                    const newItems = [...generatedData.features.items];
                                                    newItems[i].title = e.target.value;
                                                    setGeneratedData({ ...generatedData, features: { ...generatedData.features, items: newItems } });
                                                }}
                                                className="w-full bg-transparent font-bold text-sm text-zinc-200 border-b border-zinc-800 focus:border-purple-500 outline-none"
                                            />
                                            <textarea
                                                value={feat.description}
                                                onChange={(e) => {
                                                    const newItems = [...generatedData.features.items];
                                                    newItems[i].description = e.target.value;
                                                    setGeneratedData({ ...generatedData, features: { ...generatedData.features, items: newItems } });
                                                }}
                                                className="w-full bg-transparent text-xs text-zinc-400 resize-none outline-none"
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* About Preview */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-2">3. Sobre Nosotros</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Título</label>
                                        <input
                                            value={generatedData.about.title}
                                            onChange={(e) => setGeneratedData({ ...generatedData, about: { ...generatedData.about, title: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Descripción</label>
                                        <textarea
                                            value={generatedData.about.description}
                                            onChange={(e) => setGeneratedData({ ...generatedData, about: { ...generatedData.about, description: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                {/* Contact Preview (Moved here or appended) */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-2">4. Contacto</h3>
                                    <div className="space-y-3">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500">Badge/Encabezado</label>
                                            <input
                                                value={generatedData.contact?.badge || ''}
                                                onChange={(e) => setGeneratedData({ ...generatedData, contact: { ...generatedData.contact, badge: e.target.value } })}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500">Título</label>
                                            <input
                                                value={generatedData.contact?.title || ''}
                                                onChange={(e) => setGeneratedData({ ...generatedData, contact: { ...generatedData.contact, title: e.target.value } })}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase text-zinc-500">Descripción</label>
                                            <textarea
                                                value={generatedData.contact?.description || ''}
                                                onChange={(e) => setGeneratedData({ ...generatedData, contact: { ...generatedData.contact, description: e.target.value } })}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Preview */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 border-b border-purple-500/20 pb-2">5. Footer</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Descripción Empresa</label>
                                        <textarea
                                            value={generatedData.footer?.description || ''}
                                            onChange={(e) => setGeneratedData({ ...generatedData, footer: { ...generatedData.footer, description: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase text-zinc-500">Copyright</label>
                                        <input
                                            value={generatedData.footer?.copyright || ''}
                                            onChange={(e) => setGeneratedData({ ...generatedData, footer: { ...generatedData.footer, copyright: e.target.value } })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer / Actions */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between gap-4">
                    {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

                    <div className="flex items-center gap-3 ml-auto">
                        {step === 'input' ? (
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !prompt.trim()}
                                className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2"
                            >
                                {generating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
                                Generar Borrador
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={() => setStep('input')}
                                    className="px-4 py-2 text-zinc-400 hover:text-white font-medium text-sm transition-colors"
                                >
                                    Volver / Editar Prompt
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
                                >
                                    {applying ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                                    Aplicar Cambios
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
