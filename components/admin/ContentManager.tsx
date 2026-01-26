"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import {
    LayoutTemplate, Grid, Users, BookOpen, MessageSquare,
    Globe, Save, Loader2, ChevronRight,
    Upload, Trash2, Edit2, Plus, Type, Palette, Maximize,
    Search, Filter, ListChecks, Award, Clock, Shield,
    Phone, Mail, MapPin, Linkedin, Instagram, MessageCircle, Menu, X, ChevronUp, ChevronDown, Facebook, Music
} from 'lucide-react';
import FeatureModal from './FeatureModal';
import ShowcaseModal from './ShowcaseModal';
import ContentGeneratorModal from './ContentGeneratorModal';
import { Wand2 } from 'lucide-react';
import { getContrastColor } from '@/lib/colors';

type SubSection = 'hero' | 'features' | 'about' | 'showcase' | 'contact' | 'navbar' | 'footer' | 'blog';

export default function ContentManager() {
    const [activeSection, setActiveSection] = useState<SubSection>('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    // Data states
    const [heroData, setHeroData] = useState<any>({});
    const [featuresMeta, setFeaturesMeta] = useState<any>({});
    const [aboutData, setAboutData] = useState<any>({});
    const [showcaseData, setShowcaseData] = useState<any>({});
    const [contactData, setContactData] = useState<any>({});
    const [navbarData, setNavbarData] = useState<any>({});
    const [footerData, setFooterData] = useState<any>({});
    const [landingSettings, setLandingSettings] = useState<any>({});


    const [featuresList, setFeaturesList] = useState<any[]>([]);
    const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<any>(null);

    const [showcaseList, setShowcaseList] = useState<any[]>([]);
    const [isShowcaseModalOpen, setIsShowcaseModalOpen] = useState(false);
    const [editingShowcase, setEditingShowcase] = useState<any>(null);

    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch the new hierarchical doc for Hero and About
                const landingRef = doc(db, 'settings', 'landing');
                const landingSnap = await getDoc(landingRef);

                if (landingSnap.exists()) {
                    const data = landingSnap.data();
                    setLandingSettings(data);
                    setHeroData(data.hero || {});
                    setAboutData(data.about || {});
                    setNavbarData(data.navbar || {});
                    setFooterData(data.footer || {});
                }

                // Fetch other docs from content collection
                const docsToFetch = ['solutions_meta', 'catalog', 'contact'];
                const snapshots = await Promise.all(docsToFetch.map(d => getDoc(doc(db, 'content', d))));

                setFeaturesMeta(snapshots[0].exists() ? snapshots[0].data() : {});
                setShowcaseData(snapshots[1].exists() ? snapshots[1].data() : {});
                setContactData(snapshots[2].exists() ? snapshots[2].data() : {});

                // Fetch features from the NEW subcollection path: settings/landing/features
                const featRef = collection(db, 'settings', 'landing', 'features');
                const featSnap = await getDocs(featRef);
                setFeaturesList(featSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch showcase items
                const showcaseRef = collection(db, 'settings', 'landing', 'showcase');
                const showcaseSnap = await getDocs(showcaseRef);
                setShowcaseList(showcaseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            } catch (error) {
                console.error("Error loading content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            let docRef;
            let data;
            switch (activeSection) {
                case 'hero':
                    // Use the new settings/landing path
                    docRef = doc(db, 'settings', 'landing');
                    // We save the entire 'landing' doc, or just the 'hero' field?
                    // Let's use setDoc with merge to be safe
                    await setDoc(docRef, { hero: heroData }, { merge: true });
                    setMessage('¡Cambios guardados con éxito!');
                    setSaving(false);
                    return;
                case 'features':
                    docRef = doc(db, 'content', 'solutions_meta');
                    data = featuresMeta;
                    break;
                case 'showcase':
                    docRef = doc(db, 'content', 'catalog');
                    data = showcaseData;
                    break;
                case 'contact':
                    docRef = doc(db, 'content', 'contact');
                    data = contactData;
                    break;
                case 'about':
                    docRef = doc(db, 'settings', 'landing');
                    await setDoc(docRef, { about: aboutData }, { merge: true });
                    setMessage('¡Sección About guardada!');
                    setSaving(false);
                case 'about':
                    docRef = doc(db, 'settings', 'landing');
                    await setDoc(docRef, { about: aboutData }, { merge: true });
                    setMessage('¡Sección About guardada!');
                    setSaving(false);
                    return;
                case 'navbar':
                    docRef = doc(db, 'settings', 'landing');
                    await setDoc(docRef, { navbar: navbarData }, { merge: true });
                    setMessage('¡Navegación guardada!');
                    setSaving(false);
                    return;
                case 'footer':
                    docRef = doc(db, 'settings', 'landing');
                    await setDoc(docRef, { footer: footerData }, { merge: true });
                    setMessage('¡Footer guardado!');
                    setSaving(false);
                    return;

                default: return;
            }
            await setDoc(docRef, data);
            setMessage('¡Cambios guardados con éxito!');
        } catch (error) {
            console.error("Save error:", error);
            setMessage('Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: 'hero' | 'about') => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        console.log(`[Upload] Starting for ${section}: ${file.name}`);

        setUploading(true);
        try {
            // Cleanup: Non-blocking delete attempt
            const currentUrl = section === 'hero' ? heroData.bgImage : aboutData.image;
            if (currentUrl && currentUrl.includes('firebasestorage.googleapis.com')) {
                const decodedUrl = decodeURIComponent(currentUrl);
                const pathStart = decodedUrl.indexOf('/o/') + 3;
                const pathEnd = decodedUrl.indexOf('?');
                if (pathStart > 2 && pathEnd > pathStart) {
                    const fullPath = decodedUrl.substring(pathStart, pathEnd);
                    deleteObject(ref(storage, fullPath)).catch(e => console.warn("[Upload] Cleanup skipped:", e));
                }
            }

            const storagePath = `landing/${section}/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    uploadTask.cancel();
                    reject(new Error("Timeout (35s). Verifique configuración CORS."));
                }, 35000);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`[Upload] ${progress.toFixed(0)}%`);
                    },
                    (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    },
                    () => {
                        clearTimeout(timeout);
                        resolve();
                    }
                );
            });

            const url = await getDownloadURL(uploadTask.snapshot.ref);
            if (section === 'hero') setHeroData({ ...heroData, bgImage: url });
            if (section === 'about') setAboutData({ ...aboutData, image: url });

            setMessage('Imagen subida con éxito.');
        } catch (e: any) {
            console.error("[Upload] Error:", e);
            alert(`Error en carga: ${e.message || 'Fallo de conexión'}`);
            setMessage(`Error: ${e.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveFeature = async (data: any) => {
        try {
            const featRef = collection(db, 'settings', 'landing', 'features');
            if (editingFeature) {
                const docRef = doc(db, 'settings', 'landing', 'features', editingFeature.id);
                await updateDoc(docRef, data);
                setMessage('Servicio actualizado.');
            } else {
                await addDoc(featRef, data);
                setMessage('Servicio creado.');
            }
            // Refresh list
            const featSnap = await getDocs(featRef);
            setFeaturesList(featSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error saving feature:", error);
            setMessage('Error al guardar servicio.');
        }
    };

    const handleDeleteFeature = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
        try {
            const docRef = doc(db, 'settings', 'landing', 'features', id);
            await deleteDoc(docRef);
            setMessage('Servicio eliminado.');
            setFeaturesList(featuresList.filter(f => f.id !== id));
        } catch (error) {
            console.error("Error deleting feature:", error);
            setMessage('Error al eliminar.');
        }
    };

    const handleSaveShowcase = async (data: any) => {
        try {
            const showcaseRef = collection(db, 'settings', 'landing', 'showcase');
            if (editingShowcase) {
                const docRef = doc(db, 'settings', 'landing', 'showcase', editingShowcase.id);
                await updateDoc(docRef, data);
                setMessage('Proyecto actualizado.');
            } else {
                await addDoc(showcaseRef, data);
                setMessage('Proyecto creado.');
            }
            // Refresh list
            const snap = await getDocs(showcaseRef);
            setShowcaseList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setIsShowcaseModalOpen(false);
        } catch (error) {
            console.error("Error saving showcase:", error);
            setMessage('Error al guardar proyecto.');
        }
    };

    const handleDeleteShowcase = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este proyecto del showcase?')) return;
        try {
            const docRef = doc(db, 'settings', 'landing', 'showcase', id);
            await deleteDoc(docRef);
            setMessage('Proyecto eliminado.');
            setShowcaseList(showcaseList.filter(s => s.id !== id));
        } catch (error) {
            console.error("Error deleting showcase:", error);
            setMessage('Error al eliminar.');
        }
    };

    const menuGroups = [
        {
            title: 'Secciones de Página',
            items: [
                { id: 'navbar', label: 'Navbar (Nav)', icon: Menu },
                { id: 'footer', label: 'Footer', icon: LayoutTemplate },
                { id: 'hero', label: 'Hero (S1)', icon: LayoutTemplate },
                { id: 'features', label: 'Features (S2)', icon: Grid },
                { id: 'about', label: 'About (S3)', icon: Users },
                { id: 'showcase', label: 'Showcase (S4)', icon: BookOpen },
                { id: 'blog', label: 'Blog (S6)', icon: LayoutTemplate },
                { id: 'contact', label: 'Contact (S5)', icon: MessageSquare },
            ]
        }
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Gestor de Contenidos</h1>
                    <p className="text-zinc-500 mt-2">Administra todas las secciones de tu Landing Page desde aquí.</p>
                </div>
                <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2"
                >
                    <Wand2 size={18} />
                    Generar con IA
                </button>
            </div>

            {/* Navigation Bar - Linear */}
            <div className="border-b border-zinc-800 pb-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {menuGroups[0].items.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveSection(item.id as SubSection); setMessage(''); }}
                            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${activeSection === item.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-zinc-900/50 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-800'
                                }`}
                        >
                            <item.icon size={14} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col h-full min-h-0">
                {/* Content Area - Full Width */}

                {/* Content Area */}
                <div className="flex-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
                        <div>
                            <h2 className="text-xl font-bold text-zinc-100 capitalize">{activeSection}</h2>
                            <p className="text-sm text-zinc-500">Gestión de datos para la sección {activeSection}.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {message && <span className={`text-xs font-bold ${message.includes('Error') ? 'text-red-400' : 'text-emerald-400'}`}>{message}</span>}
                            <button
                                onClick={handleSave}
                                disabled={saving || uploading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Guardar Cambios
                            </button>
                        </div>
                    </div>

                    <div className="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar">
                        {/* HERO SECTION EDITOR */}
                        {activeSection === 'hero' && (
                            <div className="space-y-8">
                                {/* Preview Section */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                            <Maximize size={14} /> Vista Previa
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] uppercase text-zinc-600 font-bold">Opacidad Capa</label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.1"
                                                    value={heroData.overlayOpacity ?? 0.6}
                                                    onChange={(e) => setHeroData({ ...heroData, overlayOpacity: parseFloat(e.target.value) })}
                                                    className="w-24 accent-blue-500"
                                                />
                                                <span className="text-xs text-zinc-400 w-8">{(heroData.overlayOpacity ?? 0.6).toFixed(1)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-[10px] uppercase text-zinc-600 font-bold">Color Capa</label>
                                                <input
                                                    type="color"
                                                    value={heroData.overlayColor || '#000000'}
                                                    onChange={e => setHeroData({ ...heroData, overlayColor: e.target.value })}
                                                    className="h-6 w-8 bg-transparent cursor-pointer rounded overflow-hidden p-0 border-0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Embed Hero Component as Preview */}
                                    {/* We dynamically import or just use it if available. Since it's client component we can use it directly */}
                                    <div className="rounded-3xl overflow-hidden border border-zinc-800 relative group">
                                        {/* We need to require/import Hero at top. Assuming it's imported or available. 
                                            Wait, ContentManager doesn't import Hero yet. 
                                            I need to add the import in a separate step or assume I can't interactively add imports in replace block easily without header context.
                                            Actually VS Code auto-imports often but here I must be explicit.
                                            
                                            ERROR: 'Hero' is not defined. 
                                            I will add the import in a subsequent step if I can't do it here. 
                                            But to avoid runtime error during render if I save this, I should probably add import first or use a placeholder.
                                            
                                            Let's use a "Preview Placeholder" logic for now and I will add the import in the next tool call, 
                                            OR I can try to use a dynamic structure. 
                                            
                                            Actually, I'll modify the top of file to add import in next step. For now I will comment out the component usage or use a placeholder div.
                                            
                                            Wait, I will use a simple placeholder div that SAYS "HERO COMPONENT WILL RENDER HERE" to avoid breaking build, 
                                            then I will add the import, then uncomment/fix. 
                                            
                                            BETTER STRATEGY: I will perform the import update FIRST in a separate tool call if possible? 
                                            No, I'm already in this tool call. 
                                            
                                            I'll write the code assuming 'Hero' is available, but I'll add the import in the *next* tool call immediately.
                                            Actually, if I save this file and it re-compiles, it will crash. 
                                            
                                            I will render a "Preview Frame" style div for now that mimics portions or just shows the bg image and text overlay using the logic I have in `heroData`.
                                         */}
                                        <div className="relative aspect-video lg:aspect-[21/9] bg-zinc-950 flex flex-col items-center justify-center text-center p-8 overflow-hidden">
                                            {/* BG Image */}
                                            {heroData.bgImage && (
                                                <img src={heroData.bgImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                            )}
                                            {/* Overlay */}
                                            <div
                                                className="absolute inset-0 z-10"
                                                style={{ backgroundColor: heroData.overlayColor || '#000000', opacity: heroData.overlayOpacity ?? 0.6 }}
                                            />
                                            {/* Content */}
                                            <div className="relative z-20 max-w-2xl space-y-6">
                                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-medium">
                                                    Expertos en Infraestructura IT
                                                </div>
                                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight" style={{ color: heroData.titleColor }}>
                                                    {heroData.title || 'Título Principal'}
                                                </h1>
                                                <p className="text-sm md:text-base text-gray-300" style={{ color: heroData.subtitleColor }}>
                                                    {heroData.subtitle || 'Subtítulo descriptivo...'}
                                                </p>
                                                <div className="flex justify-center gap-3 pt-2">
                                                    <div className="px-6 py-2 rounded-full font-bold text-xs" style={{ backgroundColor: heroData.btn1?.color || '#2563eb', color: 'white' }}>
                                                        {heroData.btn1?.label || 'Botón 1'}
                                                    </div>
                                                    <div className="px-6 py-2 rounded-full font-medium text-xs border border-zinc-600 text-white">
                                                        {heroData.btn2?.label || 'Botón 2'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 text-center italic">
                                        * Esta es una aproximación. Guarda los cambios para ver el resultado final exacto en la Landing.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-zinc-800 pt-8">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                        <Type size={14} /> Título Principal
                                                    </label>
                                                    <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                                        <input
                                                            type="color"
                                                            value={heroData.titleColor || '#ffffff'}
                                                            onChange={e => setHeroData({ ...heroData, titleColor: e.target.value })}
                                                            className="w-5 h-5 bg-transparent border-0 p-0 cursor-pointer rounded"
                                                        />
                                                        <select
                                                            value={heroData.titleSize || 'text-5xl md:text-7xl'}
                                                            onChange={e => setHeroData({ ...heroData, titleSize: e.target.value })}
                                                            className="bg-transparent text-[10px] text-zinc-400 outline-none border-l border-zinc-800 pl-2 uppercase font-bold"
                                                        >
                                                            <option value="text-3xl md:text-5xl">Pequeño</option>
                                                            <option value="text-4xl md:text-6xl">Mediano</option>
                                                            <option value="text-5xl md:text-7xl">Grande</option>
                                                            <option value="text-6xl md:text-8xl">Extra Grande</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <input
                                                    value={heroData.title || ''}
                                                    onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Subtítulo</label>
                                                    <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                                                        <input
                                                            type="color"
                                                            value={heroData.subtitleColor || '#d1d5db'}
                                                            onChange={e => setHeroData({ ...heroData, subtitleColor: e.target.value })}
                                                            className="w-5 h-5 bg-transparent border-0 p-0 cursor-pointer rounded"
                                                        />
                                                        <select
                                                            value={heroData.subtitleSize || 'text-lg md:text-xl'}
                                                            onChange={e => setHeroData({ ...heroData, subtitleSize: e.target.value })}
                                                            className="bg-transparent text-[10px] text-zinc-400 outline-none border-l border-zinc-800 pl-2 uppercase font-bold"
                                                        >
                                                            <option value="text-base md:text-lg">Pequeño</option>
                                                            <option value="text-lg md:text-xl">Mediano</option>
                                                            <option value="text-xl md:text-2xl">Grande</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <textarea
                                                    rows={3}
                                                    value={heroData.subtitle || ''}
                                                    onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Color (Opcional)</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        value={heroData.btn2?.color || '#ffffff'}
                                                        onChange={e => setHeroData({ ...heroData, btn2: { ...heroData.btn2, color: e.target.value } })}
                                                        className="h-10 w-12 bg-transparent cursor-pointer rounded overflow-hidden"
                                                    />
                                                    <input
                                                        value={heroData.btn2?.color || ''}
                                                        onChange={e => setHeroData({ ...heroData, btn2: { ...heroData.btn2, color: e.target.value } })}
                                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs uppercase text-zinc-400"
                                                        placeholder="HEX o Transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                                            <div className="col-span-2 text-xs font-bold text-blue-400 uppercase tracking-widest">Botón 1 (Principal)</div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Etiqueta</label>
                                                <input
                                                    value={heroData.btn1?.label || ''}
                                                    onChange={e => setHeroData({ ...heroData, btn1: { ...heroData.btn1, label: e.target.value } })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Enlace</label>
                                                <input
                                                    value={heroData.btn1?.link || ''}
                                                    onChange={e => setHeroData({ ...heroData, btn1: { ...heroData.btn1, link: e.target.value } })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Color de Marca (HEX)</label>
                                                <div className="flex gap-3">
                                                    <input
                                                        type="color"
                                                        value={heroData.btn1?.color || '#2563eb'}
                                                        onChange={e => setHeroData({ ...heroData, btn1: { ...heroData.btn1, color: e.target.value } })}
                                                        className="h-10 w-12 bg-transparent cursor-pointer rounded overflow-hidden"
                                                    />
                                                    <input
                                                        value={heroData.btn1?.color || '#2563eb'}
                                                        onChange={e => setHeroData({ ...heroData, btn1: { ...heroData.btn1, color: e.target.value } })}
                                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 text-xs uppercase text-zinc-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6 p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                                            <div className="col-span-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Botón 2 (Secundario)</div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Etiqueta</label>
                                                <input
                                                    value={heroData.btn2?.label || ''}
                                                    onChange={e => setHeroData({ ...heroData, btn2: { ...heroData.btn2, label: e.target.value } })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase text-zinc-500">Enlace</label>
                                                <input
                                                    value={heroData.btn2?.link || ''}
                                                    onChange={e => setHeroData({ ...heroData, btn2: { ...heroData.btn2, link: e.target.value } })}
                                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Imagen de Fondo (Full HD Recomendado)</label>
                                        <div className="relative aspect-[4/3] bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-blue-500/50">
                                            {heroData.bgImage ? (
                                                <>
                                                    <img src={heroData.bgImage} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40" />
                                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="text-white mb-2" size={32} />
                                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Reemplazar Imagen</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'hero')} />
                                                    </label>
                                                </>
                                            ) : (
                                                <label className="flex flex-col items-center gap-3 cursor-pointer p-12 text-center">
                                                    <div className="p-4 bg-zinc-900 rounded-full text-zinc-700"><Upload size={40} /></div>
                                                    <div>
                                                        <span className="text-sm text-zinc-400 font-bold block">Subir Fondo Hero</span>
                                                        <span className="text-[10px] text-zinc-600 uppercase mt-1 block tracking-wider">Formatos: JPG, PNG, WEBP</span>
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'hero')} />
                                                </label>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-20">
                                                    <Loader2 className="animate-spin text-blue-500" size={40} />
                                                    <span className="text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">Subiendo...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* NAVBAR EDITOR */}
                        {activeSection === 'navbar' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Menu size={16} className="text-blue-500" /> Enlaces de Navegación
                                            </h3>
                                            <p className="text-xs text-zinc-500">
                                                Define los enlaces principales del menú superior.
                                            </p>

                                            <div className="space-y-3">
                                                {(navbarData.links || []).map((link: any, idx: number) => {
                                                    const isAnchor = link.type === 'anchor';

                                                    const updateLink = (field: string, val: string) => {
                                                        const newLinks = [...(navbarData.links || [])];
                                                        newLinks[idx] = { ...newLinks[idx], [field]: val };
                                                        // Reset href if type changes
                                                        if (field === 'type') {
                                                            newLinks[idx].href = val === 'anchor' ? '#hero' : '';
                                                        }
                                                        setNavbarData({ ...navbarData, links: newLinks });
                                                    };

                                                    return (
                                                        <div key={idx} className="flex flex-col gap-3 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-bold uppercase text-zinc-500">Enlace #{idx + 1}</span>
                                                                <div className="flex items-center gap-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            if (idx === 0) return;
                                                                            const newLinks = [...(navbarData.links || [])];
                                                                            [newLinks[idx - 1], newLinks[idx]] = [newLinks[idx], newLinks[idx - 1]];
                                                                            setNavbarData({ ...navbarData, links: newLinks });
                                                                        }}
                                                                        className="p-1 text-zinc-500 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-zinc-500"
                                                                        disabled={idx === 0}
                                                                        title="Mover Arriba"
                                                                    >
                                                                        <ChevronUp size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            if (idx === (navbarData.links || []).length - 1) return;
                                                                            const newLinks = [...(navbarData.links || [])];
                                                                            [newLinks[idx + 1], newLinks[idx]] = [newLinks[idx], newLinks[idx + 1]];
                                                                            setNavbarData({ ...navbarData, links: newLinks });
                                                                        }}
                                                                        className="p-1 text-zinc-500 hover:text-blue-400 disabled:opacity-30 disabled:hover:text-zinc-500"
                                                                        disabled={idx === (navbarData.links || []).length - 1}
                                                                        title="Mover Abajo"
                                                                    >
                                                                        <ChevronDown size={14} />
                                                                    </button>
                                                                    <div className="w-px h-3 bg-zinc-800 mx-1" />
                                                                    <button
                                                                        onClick={() => {
                                                                            const newLinks = navbarData.links.filter((_: any, i: number) => i !== idx);
                                                                            setNavbarData({ ...navbarData, links: newLinks });
                                                                        }}
                                                                        className="p-1 text-zinc-600 hover:text-red-400"
                                                                        title="Eliminar"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">Etiqueta</label>
                                                                    <input
                                                                        placeholder="Texto (Ej: Inicio)"
                                                                        value={link.label}
                                                                        onChange={(e) => updateLink('label', e.target.value)}
                                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">Tipo</label>
                                                                    <select
                                                                        value={link.type || 'custom'}
                                                                        onChange={(e) => updateLink('type', e.target.value)}
                                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                                                                    >
                                                                        <option value="anchor">Sección</option>
                                                                        <option value="custom">URL</option>
                                                                    </select>
                                                                </div>
                                                                <div className="md:col-span-2 space-y-1">
                                                                    <label className="text-[10px] uppercase text-zinc-600 font-bold">Destino</label>
                                                                    {isAnchor ? (
                                                                        <select
                                                                            value={link.href}
                                                                            onChange={(e) => updateLink('href', e.target.value)}
                                                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                                                                        >
                                                                            <option value="#hero">Inicio (Hero)</option>
                                                                            <option value="#features">Servicios (Features)</option>
                                                                            <option value="#about">Nosotros (About)</option>
                                                                            <option value="#showcase">Portafolio (Showcase)</option>
                                                                            <option value="#contact">Contacto</option>
                                                                        </select>
                                                                    ) : (
                                                                        <input
                                                                            placeholder="URL (Ej: /blog)"
                                                                            value={link.href}
                                                                            onChange={(e) => updateLink('href', e.target.value)}
                                                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-blue-500/50"
                                                                        />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <button
                                                    onClick={() => {
                                                        const newLinks = [...(navbarData.links || []), { label: '', href: '', type: 'custom' }];
                                                        setNavbarData({ ...navbarData, links: newLinks });
                                                    }}
                                                    className="w-full py-2 border border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-blue-400 hover:border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                                                >
                                                    <Plus size={14} /> Añadir Enlace
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <MessageCircle size={16} className="text-blue-500" /> Botón CTA Principal
                                            </h3>
                                            <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Texto del Botón</label>
                                                    <input
                                                        value={navbarData.cta?.label || ''}
                                                        onChange={e => setNavbarData({ ...navbarData, cta: { ...navbarData.cta, label: e.target.value } })}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
                                                        placeholder="Ej: Contáctanos"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold">Enlace de Destino</label>
                                                    <input
                                                        value={navbarData.cta?.href || ''}
                                                        onChange={e => setNavbarData({ ...navbarData, cta: { ...navbarData.cta, href: e.target.value } })}
                                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-blue-500/50"
                                                        placeholder="Ej: /contact"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FOOTER EDITOR */}
                        {activeSection === 'footer' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <LayoutTemplate size={16} className="text-blue-500" /> Información General
                                            </h3>
                                            <div className="space-y-3">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción del Footer</label>
                                                    <textarea
                                                        rows={3}
                                                        value={footerData.description || ''}
                                                        onChange={e => setFooterData({ ...footerData, description: e.target.value })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                        placeholder="Breve descripción..."
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Texto de Copyright</label>
                                                    <input
                                                        value={footerData.copyright || ''}
                                                        onChange={e => setFooterData({ ...footerData, copyright: e.target.value })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t border-zinc-800 pt-6">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Globe size={16} className="text-blue-500" /> Redes Sociales
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><Linkedin size={12} /> LinkedIn</label>
                                                    <input
                                                        value={footerData.social?.linkedin || ''}
                                                        onChange={e => setFooterData({ ...footerData, social: { ...footerData.social, linkedin: e.target.value } })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><Instagram size={12} /> Instagram</label>
                                                    <input
                                                        value={footerData.social?.instagram || ''}
                                                        onChange={e => setFooterData({ ...footerData, social: { ...footerData.social, instagram: e.target.value } })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><Facebook size={12} /> Facebook</label>
                                                    <input
                                                        value={footerData.social?.facebook || ''}
                                                        onChange={e => setFooterData({ ...footerData, social: { ...footerData.social, facebook: e.target.value } })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><Music size={12} /> TikTok</label>
                                                    <input
                                                        value={footerData.social?.tiktok || ''}
                                                        onChange={e => setFooterData({ ...footerData, social: { ...footerData.social, tiktok: e.target.value } })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] uppercase text-zinc-500 font-bold flex items-center gap-2"><MessageCircle size={12} /> WhatsApp</label>
                                                    <input
                                                        value={footerData.social?.whatsapp || ''}
                                                        onChange={e => setFooterData({ ...footerData, social: { ...footerData.social, whatsapp: e.target.value } })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                    <ListChecks size={16} className="text-blue-500" /> Columnas de Enlaces
                                                </h3>
                                                <button
                                                    onClick={() => {
                                                        const newCols = [...(footerData.columns || []), { title: 'Nueva Columna', links: [] }];
                                                        setFooterData({ ...footerData, columns: newCols });
                                                    }}
                                                    className="text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all"
                                                >
                                                    <Plus size={12} /> Columna
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {(footerData.columns || []).map((col: any, colIdx: number) => (
                                                    <div key={colIdx} className="bg-zinc-950/50 p-4 rounded-xl border border-zinc-800 space-y-3 relative group">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <input
                                                                value={col.title}
                                                                onChange={(e) => {
                                                                    const newCols = [...(footerData.columns || [])];
                                                                    newCols[colIdx].title = e.target.value;
                                                                    setFooterData({ ...footerData, columns: newCols });
                                                                }}
                                                                className="flex-1 bg-transparent border-b border-transparent focus:border-blue-500 text-sm font-bold text-zinc-200 outline-none"
                                                                placeholder="Título Columna"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const newCols = footerData.columns.filter((_: any, i: number) => i !== colIdx);
                                                                    setFooterData({ ...footerData, columns: newCols });
                                                                }}
                                                                className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-2 pl-2 border-l border-zinc-800">
                                                            {(col.links || []).map((link: any, linkIdx: number) => (
                                                                <div key={linkIdx} className="flex gap-2">
                                                                    <input
                                                                        value={link.label}
                                                                        onChange={(e) => {
                                                                            const newCols = [...(footerData.columns || [])];
                                                                            newCols[colIdx].links[linkIdx].label = e.target.value;
                                                                            setFooterData({ ...footerData, columns: newCols });
                                                                        }}
                                                                        className="flex-1 bg-zinc-900 rounded px-2 py-1 text-xs text-zinc-300 border border-zinc-800 outline-none focus:border-blue-500/50"
                                                                        placeholder="Texto"
                                                                    />
                                                                    <input
                                                                        value={link.href}
                                                                        onChange={(e) => {
                                                                            const newCols = [...(footerData.columns || [])];
                                                                            newCols[colIdx].links[linkIdx].href = e.target.value;
                                                                            setFooterData({ ...footerData, columns: newCols });
                                                                        }}
                                                                        className="flex-1 bg-zinc-900 rounded px-2 py-1 text-xs text-zinc-300 border border-zinc-800 outline-none focus:border-blue-500/50"
                                                                        placeholder="URL"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const newCols = [...(footerData.columns || [])];
                                                                            newCols[colIdx].links = newCols[colIdx].links.filter((_: any, i: number) => i !== linkIdx);
                                                                            setFooterData({ ...footerData, columns: newCols });
                                                                        }}
                                                                        className="text-zinc-600 hover:text-red-400"
                                                                    >
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            <button
                                                                onClick={() => {
                                                                    const newCols = [...(footerData.columns || [])];
                                                                    newCols[colIdx].links.push({ label: '', href: '' });
                                                                    setFooterData({ ...footerData, columns: newCols });
                                                                }}
                                                                className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-1 mt-2"
                                                            >
                                                                <Plus size={10} /> Añadir Link
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* FEATURES SECTION EDITOR */}
                        {activeSection === 'features' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Color de Fondo</label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={featuresMeta.backgroundColor || '#111827'} // Default gray-900 equivalent
                                                        onChange={(e) => {
                                                            const newBg = e.target.value;
                                                            const contrast = getContrastColor(newBg);
                                                            setFeaturesMeta({
                                                                ...featuresMeta,
                                                                backgroundColor: newBg,
                                                                titleColor: contrast,
                                                                textColor: contrast === '#ffffff' ? '#d1d5db' : '#4b5563'
                                                            });
                                                        }}
                                                        className="w-6 h-6 bg-transparent border-0 p-0 cursor-pointer rounded"
                                                    />
                                                    <span className="text-[10px] text-zinc-500 uppercase">{featuresMeta.backgroundColor || 'Default'}</span>
                                                </div>
                                            </div>
                                            <p className="text-[10px] text-zinc-500">Texto automático por contraste.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título de Sección</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={featuresMeta.title || ''}
                                                        onChange={e => setFeaturesMeta({ ...featuresMeta, title: e.target.value })}
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        style={{ color: featuresMeta.titleColor }}
                                                    />
                                                    <input
                                                        type="color"
                                                        value={featuresMeta.titleColor || '#ffffff'}
                                                        onChange={e => setFeaturesMeta({ ...featuresMeta, titleColor: e.target.value })}
                                                        className="w-10 bg-transparent cursor-pointer rounded border border-zinc-800"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción Corta</label>
                                                <input
                                                    value={featuresMeta.description || ''}
                                                    onChange={e => setFeaturesMeta({ ...featuresMeta, description: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100"
                                                    style={{ color: featuresMeta.textColor }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                            <ListChecks size={16} className="text-blue-500" />
                                            Listado de Servicios/Características
                                        </h3>
                                        <button
                                            onClick={() => { setEditingFeature(null); setIsFeatureModalOpen(true); }}
                                            className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg border border-blue-500/20 flex items-center gap-2 shadow-lg shadow-blue-900/10 transition-all hover:scale-105"
                                        >
                                            <Plus size={14} /> Añadir Servicio
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {featuresList.map((feat, i) => (
                                            <div key={i} className="flex flex-col gap-3 p-5 bg-zinc-950/50 border border-zinc-800 rounded-2xl group hover:border-blue-500/30 transition-all relative">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-zinc-900 rounded-xl text-blue-400 group-hover:bg-blue-600/10 transition-colors border border-zinc-800 group-hover:border-blue-500/20">
                                                            <LayoutTemplate size={20} />
                                                        </div>
                                                        <span className="font-bold text-zinc-100">{feat.title}</span>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => { setEditingFeature(feat); setIsFeatureModalOpen(true); }}
                                                            className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-zinc-900 rounded-lg transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFeature(feat.id)}
                                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{feat.description}</p>
                                                {feat.features && feat.features.length > 0 && (
                                                    <div className="flex gap-2 flex-wrap mt-1">
                                                        {feat.features.slice(0, 3).map((f: string, idx: number) => (
                                                            <span key={idx} className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800">
                                                                {f}
                                                            </span>
                                                        ))}
                                                        {feat.features.length > 3 && <span className="text-[10px] text-zinc-600">+{feat.features.length - 3} más</span>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {featuresList.length === 0 && (
                                            <div className="col-span-full py-12 text-center text-zinc-600 flex flex-col items-center gap-3 bg-zinc-950/20 rounded-3xl border border-dashed border-zinc-800">
                                                <Search size={40} className="text-zinc-800" />
                                                <p className="italic text-sm">No se encontraron servicios configurados.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Modals */}
                        <ContentGeneratorModal
                            isOpen={isGeneratorOpen}
                            onClose={() => setIsGeneratorOpen(false)}
                            onSuccess={() => window.location.reload()}
                        />

                        <FeatureModal
                            isOpen={isFeatureModalOpen}
                            onClose={() => setIsFeatureModalOpen(false)}
                            onSave={handleSaveFeature}
                            initialData={editingFeature}
                        />

                        <ShowcaseModal
                            isOpen={isShowcaseModalOpen}
                            onClose={() => setIsShowcaseModalOpen(false)}
                            onSave={handleSaveShowcase}
                            initialData={editingShowcase}
                        />

                        {/* ABOUT SECTION EDITOR */}
                        {activeSection === 'about' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Encabezado (Badge)</label>
                                            <input
                                                value={aboutData.badge || ''}
                                                onChange={e => setAboutData({ ...aboutData, badge: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                placeholder="Ej: Nuestra Historia"
                                            />
                                        </div>
                                        <div className="space-y-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Color de Fondo</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="color"
                                                            value={aboutData.backgroundColor || '#111827'}
                                                            onChange={(e) => {
                                                                const newBg = e.target.value;
                                                                const contrast = getContrastColor(newBg);
                                                                setAboutData({
                                                                    ...aboutData,
                                                                    backgroundColor: newBg,
                                                                    titleColor: contrast,
                                                                    textColor: contrast === '#ffffff' ? '#d1d5db' : '#4b5563'
                                                                });
                                                            }}
                                                            className="w-6 h-6 bg-transparent border-0 p-0 cursor-pointer rounded"
                                                        />
                                                        <span className="text-[10px] text-zinc-500 uppercase">{aboutData.backgroundColor || 'Default'}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-500">Texto automático por contraste.</p>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título Principal</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={aboutData.title || ''}
                                                        onChange={e => setAboutData({ ...aboutData, title: e.target.value })}
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        style={{ color: aboutData.titleColor }}
                                                    />
                                                    <input
                                                        type="color"
                                                        value={aboutData.titleColor || '#ffffff'}
                                                        onChange={e => setAboutData({ ...aboutData, titleColor: e.target.value })}
                                                        className="w-10 bg-transparent cursor-pointer rounded border border-zinc-800"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción</label>
                                                <textarea
                                                    rows={4}
                                                    value={aboutData.description || ''}
                                                    onChange={e => setAboutData({ ...aboutData, description: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                    style={{ color: aboutData.textColor }}
                                                />
                                            </div>
                                        </div>

                                        {/* Trust Points List */}
                                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                                <ListChecks size={14} className="text-blue-500" /> Puntos de Confianza
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    id="newAboutPoint"
                                                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 outline-none"
                                                    placeholder="Añadir punto..."
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter') {
                                                            const val = (e.target as HTMLInputElement).value;
                                                            if (val.trim()) {
                                                                const points = aboutData.points || [];
                                                                setAboutData({ ...aboutData, points: [...points, val.trim()] });
                                                                (e.target as HTMLInputElement).value = '';
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {(aboutData.points || []).map((point: string, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group transition-all hover:border-zinc-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                            <span className="text-sm text-zinc-300">{point}</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setAboutData({ ...aboutData, points: aboutData.points.filter((_: any, i: number) => i !== idx) })}
                                                            className="p-1.5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Imagen de Marca</label>
                                        <div className="relative aspect-square bg-zinc-950 rounded-3xl border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center overflow-hidden group transition-all hover:border-blue-500/50">
                                            {aboutData.image ? (
                                                <>
                                                    <img src={aboutData.image} className="w-full h-full object-cover opacity-60 transition-opacity group-hover:opacity-40" />
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <label className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer hover:bg-zinc-200 transition-colors shadow-xl">
                                                            Cambiar Imagen
                                                            <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'about')} />
                                                        </label>
                                                        <button
                                                            onClick={() => setAboutData({ ...aboutData, image: '' })}
                                                            className="bg-red-500/20 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-colors"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="flex flex-col items-center gap-4 cursor-pointer p-12 text-center group">
                                                    <div className="p-5 bg-zinc-900 rounded-2xl text-zinc-700 group-hover:text-blue-500 group-hover:bg-blue-600/5 transition-all">
                                                        <Upload size={48} />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm text-zinc-400 font-bold block">Vincular Imagen Principal</span>
                                                        <span className="text-[10px] text-zinc-600 uppercase mt-1 block tracking-wider">Altos estándares de calidad visual</span>
                                                    </div>
                                                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'about')} />
                                                </label>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-20">
                                                    <Loader2 className="animate-spin text-blue-500" size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6 bg-blue-600/5 rounded-2xl border border-blue-500/10 space-y-3 text-xs text-zinc-400">
                                            <div className="font-bold flex items-center gap-2 text-blue-400"><LayoutTemplate size={14} /> Visualización Adaptativa</div>
                                            <p className="leading-relaxed">
                                                Si no se carga una imagen, el sistema reorganizará el contenido de la Landing Page para centrarlo dinámicamente, asegurando un diseño limpio y profesional.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats / Metrics Editor - Full Width */}
                                <div className="space-y-4 pt-10 border-t border-zinc-800">
                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                                        <Grid size={14} className="text-blue-500" /> Métricas de Confianza (4 Bloques)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[0, 1, 2, 3].map((idx) => {
                                            const stat = (aboutData.stats || [])[idx] || { icon: 'Clock', value: '', label: '' };
                                            const updateStat = (field: string, val: string) => {
                                                const newStats = [...(aboutData.stats || [])];
                                                for (let i = 0; i < 4; i++) {
                                                    if (!newStats[i]) newStats[i] = { icon: 'Clock', value: '', label: '' };
                                                }
                                                newStats[idx] = { ...newStats[idx], [field]: val };
                                                setAboutData({ ...aboutData, stats: newStats });
                                            };

                                            const statIcons = [
                                                { name: 'Clock', icon: Clock },
                                                { name: 'Users', icon: Users },
                                                { name: 'Award', icon: Award },
                                                { name: 'Shield', icon: Shield },
                                            ];

                                            return (
                                                <div key={idx} className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl space-y-4">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <label className="text-[10px] uppercase text-zinc-600 font-bold">Valor</label>
                                                            <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                                                {statIcons.map((si) => (
                                                                    <button
                                                                        key={si.name}
                                                                        type="button"
                                                                        onClick={() => updateStat('icon', si.name)}
                                                                        className={`p-1 rounded-md transition-all ${stat.icon === si.name ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                                                                    >
                                                                        <si.icon size={12} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <input
                                                            value={stat.value}
                                                            onChange={e => updateStat('value', e.target.value)}
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-2xl font-black text-blue-500 outline-none focus:border-blue-500/50 text-center"
                                                            placeholder="20+"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] uppercase text-zinc-600 font-bold">Descripción</label>
                                                        <input
                                                            value={stat.label}
                                                            onChange={e => updateStat('label', e.target.value)}
                                                            className="w-full bg-transparent border-b border-zinc-800 py-1 text-[10px] text-zinc-400 outline-none focus:border-blue-500/50 uppercase font-bold"
                                                            placeholder="MÉTRICA"
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* SHOWCASE / CATALOG EDITOR */}
                        {activeSection === 'showcase' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <BookOpen size={16} className="text-blue-500" /> Cabecera de Portafolio
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título de Sección</label>
                                                    <input
                                                        value={showcaseData.title || ''}
                                                        onChange={e => setShowcaseData({ ...showcaseData, title: e.target.value })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        placeholder="Ej: Portafolio de Soluciones"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción</label>
                                                    <textarea
                                                        rows={4}
                                                        value={showcaseData.description || ''}
                                                        onChange={e => setShowcaseData({ ...showcaseData, description: e.target.value })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-zinc-800">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Upload size={16} className="text-blue-500" /> Configuración de Catálogo
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Enlace de Descarga del Catálogo</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={showcaseData.catalogLink || ''}
                                                            onChange={e => setShowcaseData({ ...showcaseData, catalogLink: e.target.value })}
                                                            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
                                                            placeholder="https://firebasestorage... o link PDF"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título del Botón</label>
                                                    <input
                                                        value={showcaseData.ctaText || ''}
                                                        onChange={e => setShowcaseData({ ...showcaseData, ctaText: e.target.value })}
                                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        placeholder="Ej: Descargar Catálogo PDF"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Grid size={16} className="text-blue-500" /> Proyectos en Showcase
                                            </h3>
                                            <button
                                                onClick={() => { setEditingShowcase(null); setIsShowcaseModalOpen(true); }}
                                                className="text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                                            >
                                                <Plus size={14} /> Añadir Proyecto
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {showcaseList.map((item, i) => (
                                                <div key={i} className="flex gap-4 p-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl group hover:border-blue-500/30 transition-all">
                                                    <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                                                        <img src={item.image} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{item.category}</span>
                                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => { setEditingShowcase(item); setIsShowcaseModalOpen(true); }} className="p-1.5 text-zinc-500 hover:text-blue-400"><Edit2 size={14} /></button>
                                                                <button onClick={() => handleDeleteShowcase(item.id)} className="p-1.5 text-zinc-500 hover:text-red-400"><Trash2 size={14} /></button>
                                                            </div>
                                                        </div>
                                                        <h4 className="font-bold text-zinc-100 truncate">{item.title}</h4>
                                                        <p className="text-xs text-zinc-500 line-clamp-2 mt-1">{item.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {showcaseList.length === 0 && (
                                                <div className="py-12 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-2xl">
                                                    <p className="italic text-sm">No hay proyectos en el showcase.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BLOG SECTION EDITOR */}
                        {activeSection === 'blog' && (
                            <div className="space-y-12">
                                <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-zinc-300">Visibilidad de Blog</h3>
                                            <p className="text-xs text-zinc-500">Activa o desactiva la sección de noticias en la Landing Page.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={landingSettings?.showBlog || false}
                                                onChange={(e) => {
                                                    const docRef = doc(db, 'settings', 'landing');
                                                    setDoc(docRef, { showBlog: e.target.checked }, { merge: true });
                                                    setLandingSettings({ ...landingSettings, showBlog: e.target.checked });
                                                }}
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CONTACT SECTION EDITOR */}
                        {activeSection === 'contact' && (
                            <div className="space-y-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Type size={16} className="text-blue-500" /> Textos de la Sección
                                            </h3>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Badge/Encabezado</label>
                                                <input
                                                    value={contactData.badge || ''}
                                                    onChange={e => setContactData({ ...contactData, badge: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título Principal</label>
                                                <input
                                                    value={contactData.title || ''}
                                                    onChange={e => setContactData({ ...contactData, title: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción</label>
                                                <textarea
                                                    rows={4}
                                                    value={contactData.description || ''}
                                                    onChange={e => setContactData({ ...contactData, description: e.target.value })}
                                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-zinc-800">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Clock size={16} className="text-blue-500" /> Horarios de Atención
                                            </h3>
                                            <input
                                                value={contactData.hours || ''}
                                                onChange={e => setContactData({ ...contactData, hours: e.target.value })}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                placeholder="Ej: Lunes a Viernes: 9:00 AM - 6:00 PM"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Users size={16} className="text-blue-500" /> Información de Contacto
                                            </h3>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email de Contacto</label>
                                                    <div className="relative">
                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                        <input
                                                            value={contactData.email || ''}
                                                            onChange={e => setContactData({ ...contactData, email: e.target.value })}
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Teléfono</label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                                        <input
                                                            value={contactData.phone || ''}
                                                            onChange={e => setContactData({ ...contactData, phone: e.target.value })}
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Dirección Física</label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-3 text-zinc-600" size={18} />
                                                        <textarea
                                                            rows={2}
                                                            value={contactData.address || ''}
                                                            onChange={e => setContactData({ ...contactData, address: e.target.value })}
                                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-12 pr-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-6 border-t border-zinc-800">
                                            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                                <Globe size={16} className="text-blue-500" /> Enlaces a Redes Sociales
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-green-500"><MessageCircle size={18} /></div>
                                                    <input
                                                        value={contactData.whatsapp || ''}
                                                        onChange={e => setContactData({ ...contactData, whatsapp: e.target.value })}
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/50"
                                                        placeholder="Link de WhatsApp"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-blue-600"><Linkedin size={18} /></div>
                                                    <input
                                                        value={contactData.linkedin || ''}
                                                        onChange={e => setContactData({ ...contactData, linkedin: e.target.value })}
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/50"
                                                        placeholder="Link de LinkedIn"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-pink-500"><Instagram size={18} /></div>
                                                    <input
                                                        value={contactData.instagram || ''}
                                                        onChange={e => setContactData({ ...contactData, instagram: e.target.value })}
                                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none focus:ring-2 focus:ring-blue-500/50"
                                                        placeholder="Link de Instagram"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
