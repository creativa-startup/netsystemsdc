"use client";
import { useState, useRef, useEffect } from 'react';
import { useGlobalConfig } from '@/context/GlobalConfigContext';
import { useTheme } from 'next-themes';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Loader2, Upload, Type, Palette, Sun, Moon, Monitor, CheckCircle, Save, X, MessageSquare, BookOpen, Settings } from 'lucide-react';
import { ChromePicker } from 'react-color';
import { getContrastColor } from '@/lib/colors';


const FONTS = [
    'Inter', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Poppins', 'Playfair Display', 'Merriweather'
];

export default function SettingsPage() {
    const { config } = useGlobalConfig();
    const { theme, setTheme } = useTheme();

    // Local state for immediate feedback before saving
    const [localConfig, setLocalConfig] = useState(config);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'accent' | null>(null);

    // Sync local state when config loads
    if (localConfig.logoText !== config.logoText && !saving) {
        // Simple sync strategy: only sync if not edited. 
        // For now, let's initialize state once or use useEffect. 
        // Actually, better to just let user edit localConfig.
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'settings', 'global_config'), localConfig as any, { merge: true });
            alert("Configuración guardada correctamente");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            alert("Error al guardar: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const storageRef = ref(storage, `branding/logo_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setLocalConfig({ ...localConfig, logoUrl: url, logoType: 'image' });
        } catch (error) {
            console.error("Upload failed", error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20 w-full overflow-y-auto custom-scrollbar h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-zinc-100 tracking-tight">Configuración Global</h1>
                    <p className="text-zinc-500 mt-2">Personaliza la identidad visual de tu plataforma.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                    >
                        {saving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        Guardar Cambios
                    </button>
                    {/* Close button removed as redundant with sidebar */}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Branding Section */}
                <section className="space-y-8">
                    <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3 pb-4 border-b border-zinc-900">
                        <Type className="text-blue-500" /> Identidad de Marca
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block">Tipo de Logo</label>
                            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-fit">
                                <button
                                    onClick={() => setLocalConfig({ ...localConfig, logoType: 'text' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${localConfig.logoType === 'text' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Texto
                                </button>
                                <button
                                    onClick={() => setLocalConfig({ ...localConfig, logoType: 'image' })}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${localConfig.logoType === 'image' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Imagen
                                </button>
                            </div>

                            {localConfig.logoType === 'text' ? (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Texto del Logo</label>
                                    <input
                                        type="text"
                                        value={localConfig.logoText || ''}
                                        onChange={(e) => setLocalConfig({ ...localConfig, logoText: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                        placeholder="Nombre de tu Marca"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Subir Logo (PNG/SVG)</label>
                                    <div className="flex items-center gap-4">
                                        {localConfig.logoUrl && (
                                            <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                                                <img src={localConfig.logoUrl} alt="Logo Preview" className="h-10 w-auto" />
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all text-sm font-bold text-zinc-400 hover:text-white">
                                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                            <span>{uploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            )}
                            <div className="pt-6 border-t border-zinc-800 space-y-3">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Icono del Logo (Opcional)</label>
                                <p className="text-xs text-zinc-600">Se mostrará junto al texto o imagen del logo.</p>
                                <div className="flex items-center gap-4">
                                    {localConfig.logoIconUrl && (
                                        <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                                            <img src={localConfig.logoIconUrl} alt="Icon Preview" className="h-10 w-10 object-contain" />
                                        </div>
                                    )}
                                    <label className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all text-sm font-bold text-zinc-400 hover:text-white">
                                        <Upload size={16} />
                                        <span>Subir Icono</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={async (e) => {
                                                if (!e.target.files || !e.target.files[0]) return;
                                                const file = e.target.files[0];
                                                setUploading(true);
                                                try {
                                                    const storageRef = ref(storage, `branding/icon_${Date.now()}`);
                                                    await uploadBytes(storageRef, file);
                                                    const url = await getDownloadURL(storageRef);
                                                    setLocalConfig({ ...localConfig, logoIconUrl: url });
                                                } catch (error) {
                                                    console.error("Upload failed", error);
                                                    alert("Error al subir icono");
                                                } finally {
                                                    setUploading(false);
                                                }
                                            }}
                                        />
                                    </label>
                                    {localConfig.logoIconUrl && (
                                        <button
                                            onClick={() => setLocalConfig({ ...localConfig, logoIconUrl: '' })}
                                            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6">
                            <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block">Tipografía</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {FONTS.map(font => (
                                    <button
                                        key={font}
                                        onClick={() => setLocalConfig({ ...localConfig, fontFamily: font })}
                                        className={`p-3 rounded-xl border text-sm transition-all ${localConfig.fontFamily === font ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                        style={{ fontFamily: font }}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Colors & Theme Section */}
                <section className="space-y-8">
                    <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3 pb-4 border-b border-zinc-900">
                        <Palette className="text-purple-500" /> Colores & Tema
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-8">

                            <div className="space-y-4">
                                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest block">Tema del Sistema</label>
                                <div className="grid grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-zinc-100 text-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Sun size={24} />
                                        <span className="text-xs font-black uppercase">Claro</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Moon size={24} />
                                        <span className="text-xs font-black uppercase">Oscuro</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'system' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Monitor size={24} />
                                        <span className="text-xs font-black uppercase">Sistema</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Color Primario</label>
                                    <button
                                        onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                                        className="w-full h-12 rounded-xl border border-zinc-700 flex items-center justify-between px-4 transition-all hover:scale-[1.02]"
                                        style={{ backgroundColor: localConfig.primaryColor }}
                                    >
                                        <span className="bg-black/20 px-2 py-1 rounded text-xs font-mono text-white backdrop-blur-sm">{localConfig.primaryColor}</span>
                                    </button>
                                    {activeColorPicker === 'primary' && (
                                        <div className="absolute z-50 top-20 left-0">
                                            <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                            <ChromePicker
                                                color={localConfig.primaryColor}
                                                onChange={(c: any) => {
                                                    const contrast = getContrastColor(c.hex);
                                                    setLocalConfig({
                                                        ...localConfig,
                                                        primaryColor: c.hex,
                                                        primaryTextColor: contrast
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 relative">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Color de Acento</label>
                                    <button
                                        onClick={() => setActiveColorPicker(activeColorPicker === 'accent' ? null : 'accent')}
                                        className="w-full h-12 rounded-xl border border-zinc-700 flex items-center justify-between px-4 transition-all hover:scale-[1.02]"
                                        style={{ backgroundColor: localConfig.accentColor }}
                                    >
                                        <span className="bg-black/20 px-2 py-1 rounded text-xs font-mono text-white backdrop-blur-sm">{localConfig.accentColor}</span>
                                    </button>
                                    {activeColorPicker === 'accent' && (
                                        <div className="absolute z-50 top-12 right-0 sm:left-0">
                                            <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                            <ChromePicker
                                                color={localConfig.accentColor}
                                                onChange={(c: any) => setLocalConfig({ ...localConfig, accentColor: c.hex })}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Configuration Section (Moved from Lead Center) */}
                <ContentSettingsSection />
            </div>
        </div>
    );
}

function ContentSettingsSection() {
    const [settings, setSettings] = useState<any>({ showChat: true, showBlog: true, chatWelcomeMessage: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'content', 'settings'), (snap) => {
            if (snap.exists()) {
                setSettings(snap.data());
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const toggleSetting = async (key: string) => {
        const newVal = !settings[key];
        await setDoc(doc(db, 'content', 'settings'), { ...settings, [key]: newVal }, { merge: true });
    };

    const saveMessage = async () => {
        await setDoc(doc(db, 'content', 'settings'), { ...settings }, { merge: true });
        alert('Mensaje guardado correctamente');
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <section className="space-y-8">
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-3 pb-4 border-b border-zinc-900">
                <Settings className="text-green-500" /> Configuración de Módulos
            </h2>

            <div className="grid grid-cols-1 gap-8">
                {/* Live Chat Settings */}
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                        <div>
                            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                                <MessageSquare size={18} className="text-blue-500" /> Chat En Vivo
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Habilitar widget flotante en la web.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('showChat')}
                            className={`relative w-12 h-7 rounded-full transition-all ${settings.showChat ? 'bg-blue-600' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.showChat ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mensaje de Bienvenida (Pre-llenado)</label>
                        <textarea
                            value={settings.chatWelcomeMessage || ''}
                            onChange={(e) => setSettings({ ...settings, chatWelcomeMessage: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none h-32"
                            placeholder="Ej: ¡Hola! ¿En qué podemos ayudarte?"
                        />
                        <button
                            onClick={saveMessage}
                            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold uppercase transition-colors"
                        >
                            Actualizar Mensaje
                        </button>
                    </div>
                </div>

                {/* Blog Settings */}
                <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 space-y-6 h-fit">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                                <BookOpen size={18} className="text-purple-500" /> Blog / Noticias
                            </h3>
                            <p className="text-xs text-zinc-500 mt-1">Mostrar sección de artículos en Home.</p>
                        </div>
                        <button
                            onClick={() => toggleSetting('showBlog')}
                            className={`relative w-12 h-7 rounded-full transition-all ${settings.showBlog ? 'bg-blue-600' : 'bg-zinc-800'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${settings.showBlog ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
