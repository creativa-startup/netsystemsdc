"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PRESET_PALETTES } from '@/lib/palettes';
import MiniLandingPreview from './MiniLandingPreview';
import { Loader2, Save, RotateCcw, Palette, Wand2 } from 'lucide-react';
import { ChromePicker } from 'react-color';
import { getContrastColor } from '@/lib/colors';

export default function ColorLab() {
    const [loading, setLoading] = useState(true);
    const [baseData, setBaseData] = useState<any>({ hero: {}, features: {}, about: {}, showcase: {}, contact: {}, navbar: {}, footer: {} });
    const [colorState, setColorState] = useState({
        primary: '#3b82f6',
        hero_overlay: '#000000',
        features_bg: '#111827',
        about_bg: '#000000',
        showcase_bg: '#09090b',
        contact_bg: '#18181b',
        navbar_bg: '#000000',
        footer_bg: '#18181b',
        page_bg: '#000000'
    });

    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const landingDoc = await getDoc(doc(db, 'settings', 'landing'));
                const solutionsMetaDoc = await getDoc(doc(db, 'content', 'solutions_meta'));
                const catalogMetaDoc = await getDoc(doc(db, 'content', 'catalog'));
                const contactDoc = await getDoc(doc(db, 'content', 'contact'));
                const globalConfigDoc = await getDoc(doc(db, 'settings', 'global_config'));

                const landingData = landingDoc.data() || {};
                const solutionsData = solutionsMetaDoc.data() || {};
                const catalogData = catalogMetaDoc.data() || {};
                const contactData = contactDoc.data() || {};
                const globalData = globalConfigDoc.data() || {};

                setBaseData({
                    hero: landingData.hero || {},
                    features: solutionsData || {},
                    about: landingData.about || {},
                    showcase: catalogData || {},
                    contact: contactData || {},
                    navbar: landingData.navbar || {},
                    footer: landingData.footer || {}
                });

                // Init state from DB
                setColorState({
                    primary: globalData.primaryColor || '#3b82f6',
                    hero_overlay: landingData.hero?.overlayColor || '#000000',
                    features_bg: solutionsData.backgroundColor || '#111827',
                    about_bg: landingData.about?.backgroundColor || '#000000',
                    showcase_bg: catalogData.backgroundColor || '#09090b',
                    contact_bg: contactData.backgroundColor || '#18181b',
                    navbar_bg: landingData.navbar?.backgroundColor || '#000000',
                    footer_bg: landingData.footer?.backgroundColor || '#18181b',
                    page_bg: landingData.page_bg || '#000000'
                });
            } catch (error) {
                console.error("Error loading Lab data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const applyPalette = (palette: any) => {
        setColorState({
            primary: palette.colors.primary,
            hero_overlay: palette.colors.hero_overlay,
            features_bg: palette.colors.features_bg,
            about_bg: palette.colors.about_bg,
            showcase_bg: palette.colors.showcase_bg,
            contact_bg: palette.colors.contact_bg,
            navbar_bg: palette.colors.navbar_bg,
            footer_bg: palette.colors.footer_bg,
            page_bg: palette.colors.page_bg
        });
    };

    const handleSaveGlobal = async () => {
        setSaving(true);
        try {
            const batch = writeBatch(db);

            // 1. Global Config (Primary Color)
            const primaryContrast = getContrastColor(colorState.primary);
            batch.set(doc(db, 'settings', 'global_config'), {
                primaryColor: colorState.primary,
                primaryTextColor: primaryContrast
            }, { merge: true });

            // 2. Hero (Overlay + Text Contrast)
            const heroContrast = getContrastColor(colorState.hero_overlay);
            const isHeroLight = heroContrast === '#000000';

            batch.set(doc(db, 'settings', 'landing'), {
                hero: {
                    ...baseData.hero,
                    overlayColor: colorState.hero_overlay,
                    titleColor: isHeroLight ? '#111827' : '#ffffff',
                    subtitleColor: isHeroLight ? '#4b5563' : '#d1d5db'
                }
            }, { merge: true });

            // 3. Features (Bg + Contrast)
            const featContrast = getContrastColor(colorState.features_bg);
            batch.set(doc(db, 'content', 'solutions_meta'), {
                backgroundColor: colorState.features_bg,
                titleColor: featContrast,
                textColor: featContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
            }, { merge: true });

            // 4. About (Bg + Contrast)
            const aboutContrast = getContrastColor(colorState.about_bg);
            batch.set(doc(db, 'settings', 'landing'), {
                about: {
                    ...baseData.about,
                    backgroundColor: colorState.about_bg,
                    titleColor: aboutContrast,
                    textColor: aboutContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
                }
            }, { merge: true });

            // 5. Showcase (Bg + Contrast)
            const showcaseContrast = getContrastColor(colorState.showcase_bg);
            batch.set(doc(db, 'content', 'catalog'), {
                backgroundColor: colorState.showcase_bg,
                titleColor: showcaseContrast,
                textColor: showcaseContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
            }, { merge: true });

            // 6. Contact (Bg)
            batch.set(doc(db, 'content', 'contact'), {
                backgroundColor: colorState.contact_bg
            }, { merge: true });

            // 7. Navbar & Footer & Page BG
            batch.set(doc(db, 'settings', 'landing'), {
                navbar: { ...baseData.navbar, backgroundColor: colorState.navbar_bg },
                footer: { ...baseData.footer, backgroundColor: colorState.footer_bg },
                page_bg: colorState.page_bg
            }, { merge: true });

            await batch.commit();
            alert("¡Paleta Global aplicada con éxito!");

        } catch (error) {
            console.error("Error Saving", error);
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] gap-6 p-6">
            {/* Control Panel */}
            <div className="w-full lg:w-1/3 space-y-8 overflow-y-auto pr-2 custom-scrollbar">

                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Palette className="text-purple-500" /> Presets
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {PRESET_PALETTES.map(p => (
                            <button
                                key={p.id}
                                onClick={() => applyPalette(p)}
                                className="p-3 rounded-xl border border-zinc-700 hover:border-blue-500 transition-all text-left group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-transparent to-white" style={{ backgroundColor: p.colors.primary }} />
                                <span className="text-sm font-bold relative z-10">{p.name}</span>
                                <div className="flex gap-1 mt-2 relative z-10">
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: p.colors.primary }} />
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: p.colors.features_bg }} />
                                    <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: p.colors.showcase_bg }} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Wand2 className="text-blue-500" /> Personalizar
                    </h2>

                    {/* Primary Color */}
                    <div className="space-y-2 relative">
                        <label className="text-xs font-bold text-zinc-500 uppercase">Color Primario</label>
                        <button
                            onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                            className="w-full h-10 rounded-lg flex items-center px-3 border border-zinc-700"
                            style={{ backgroundColor: colorState.primary }}
                        >
                            <span className="bg-black/40 px-2 py-0.5 rounded text-xs text-white font-mono backdrop-blur-sm">{colorState.primary}</span>
                        </button>
                        {activeColorPicker === 'primary' && (
                            <div className="absolute z-50 top-12 left-0">
                                <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                <ChromePicker color={colorState.primary} onChange={(c) => setColorState({ ...colorState, primary: c.hex })} />
                            </div>
                        )}
                    </div>

                    {[
                        { id: 'navbar_bg', label: 'Fondo Navbar', val: colorState.navbar_bg },
                        { id: 'hero_overlay', label: 'Overlay Sección Hero', val: colorState.hero_overlay },
                        { id: 'features_bg', label: 'Fondo Sección Servicios', val: colorState.features_bg },
                        { id: 'about_bg', label: 'Fondo Sección Nosotros', val: colorState.about_bg },
                        { id: 'showcase_bg', label: 'Fondo Sección Showcase', val: colorState.showcase_bg },
                        { id: 'contact_bg', label: 'Fondo Sección Contacto', val: colorState.contact_bg },
                        { id: 'footer_bg', label: 'Fondo Footer', val: colorState.footer_bg },
                        { id: 'page_bg', label: 'Fondo Página Global', val: colorState.page_bg },
                    ].map((item) => (
                        <div key={item.id} className="space-y-2 relative">
                            <label className="text-xs font-bold text-zinc-500 uppercase">{item.label}</label>
                            <button
                                onClick={() => setActiveColorPicker(activeColorPicker === item.id ? null : item.id)}
                                className="w-full h-10 rounded-lg flex items-center px-3 border border-zinc-700"
                                style={{ backgroundColor: item.val }}
                            >
                                <span className="bg-black/40 px-2 py-0.5 rounded text-xs text-white font-mono backdrop-blur-sm">{item.val}</span>
                            </button>
                            {activeColorPicker === item.id && (
                                <div className="absolute z-50 top-12 left-0">
                                    <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                    <ChromePicker color={item.val} onChange={(c) => setColorState({ ...colorState, [item.id]: c.hex })} />
                                </div>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleSaveGlobal}
                        disabled={saving}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Guardar Cambios Globales
                    </button>

                </div>
            </div>

            {/* Preview Panel */}
            <div className="w-full lg:w-2/3 bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden relative">
                <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-zinc-400 border border-white/10 pointer-events-none">
                    Vista Previa en Vivo
                </div>
                <MiniLandingPreview colorState={colorState} baseData={baseData} />
            </div>
        </div>
    );
}
