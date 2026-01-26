"use client";
import { useState } from 'react';
import { useGlobalConfig } from '@/context/GlobalConfigContext';
import { useTheme } from 'next-themes';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Loader2, Upload, Type, Palette, Sun, Moon, Monitor, Save, X, RotateCcw } from 'lucide-react';
import { ChromePicker } from 'react-color';

const FONTS = [
    'Inter', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Poppins', 'Playfair Display', 'Merriweather'
];

export default function SettingsPanel() {
    const { config } = useGlobalConfig();
    const { theme, setTheme } = useTheme();

    // Local state for immediate feedback before saving
    const [localConfig, setLocalConfig] = useState(config);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [activeColorPicker, setActiveColorPicker] = useState<'primary' | 'accent' | 'text' | null>(null);

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
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-zinc-100 tracking-tight">Configuración Global</h1>
                    <p className="text-zinc-500 text-sm mt-1 font-medium">Personaliza la identidad visual de tu plataforma.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 text-sm"
                >
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Guardar Cambios
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Branding Section */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-900">
                        <Type size={18} className="text-blue-500" /> Identidad de Marca
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Tipo de Logo</label>
                            <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-fit">
                                <button
                                    onClick={() => setLocalConfig({ ...localConfig, logoType: 'text' })}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${localConfig.logoType === 'text' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Texto
                                </button>
                                <button
                                    onClick={() => setLocalConfig({ ...localConfig, logoType: 'image' })}
                                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${localConfig.logoType === 'image' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    Imagen
                                </button>
                            </div>

                            {localConfig.logoType === 'text' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Texto del Logo</label>
                                    <input
                                        type="text"
                                        value={localConfig.logoText || ''}
                                        onChange={(e) => setLocalConfig({ ...localConfig, logoText: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                        placeholder="Nombre de tu Marca"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Subir Logo (PNG/SVG)</label>
                                    <div className="flex items-center gap-4">
                                        {localConfig.logoUrl && (
                                            <div className="p-2 bg-zinc-800 rounded-xl border border-zinc-700">
                                                <img src={localConfig.logoUrl} alt="Logo Preview" className="h-10 w-auto" />
                                            </div>
                                        )}
                                        <label className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all text-xs font-bold text-zinc-400 hover:text-white">
                                            {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                            <span>{uploading ? 'Subiendo...' : 'Seleccionar Archivo'}</span>
                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Tipografía</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {FONTS.map(font => (
                                    <button
                                        key={font}
                                        onClick={() => setLocalConfig({ ...localConfig, fontFamily: font })}
                                        className={`p-2 rounded-xl border text-xs transition-all ${localConfig.fontFamily === font ? 'bg-blue-600 border-blue-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                        style={{ fontFamily: font }}
                                    >
                                        {font}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Login Background Image */}
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Fondo del Login</label>
                            <div className="flex items-center gap-4">
                                {localConfig.loginBackgroundImage && (
                                    <div className="w-16 h-16 rounded-xl border border-zinc-700 overflow-hidden relative group">
                                        <img src={localConfig.loginBackgroundImage} alt="Login Background" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => setLocalConfig({ ...localConfig, loginBackgroundImage: '' })}
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                        >
                                            <X size={16} className="text-white" />
                                        </button>
                                    </div>
                                )}
                                <label className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all text-xs font-bold text-zinc-400 hover:text-white">
                                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                    <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            if (!e.target.files?.[0]) return;
                                            const file = e.target.files[0];
                                            setUploading(true);
                                            try {
                                                const storageRef = ref(storage, `branding/login_bg_${Date.now()}`);
                                                await uploadBytes(storageRef, file);
                                                const url = await getDownloadURL(storageRef);
                                                setLocalConfig({ ...localConfig, loginBackgroundImage: url });
                                            } catch (error) {
                                                console.error("Upload failed", error);
                                                alert("Error al subir imagen");
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Colors & Theme Section */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2 pb-2 border-b border-zinc-900">
                        <Palette size={18} className="text-purple-500" /> Colores & Tema
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-8">

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Tema del Sistema</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setTheme('light')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'light' ? 'bg-zinc-100 text-zinc-900 border-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Sun size={20} />
                                        <span className="text-[10px] font-black uppercase">Claro</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('dark')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Moon size={20} />
                                        <span className="text-[10px] font-black uppercase">Oscuro</span>
                                    </button>
                                    <button
                                        onClick={() => setTheme('system')}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${theme === 'system' ? 'bg-blue-600/10 text-blue-500 border-blue-500/20' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <Monitor size={20} />
                                        <span className="text-[10px] font-black uppercase">Sistema</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Color Primario</label>
                                        <button
                                            onClick={() => setActiveColorPicker(activeColorPicker === 'primary' ? null : 'primary')}
                                            className="w-full h-10 rounded-xl border border-zinc-700 flex items-center justify-between px-3 transition-all hover:scale-[1.02]"
                                            style={{ backgroundColor: localConfig.primaryColor }}
                                        >
                                            <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono text-white backdrop-blur-sm">{localConfig.primaryColor}</span>
                                        </button>
                                        {activeColorPicker === 'primary' && (
                                            <div className="absolute z-50 top-14 left-0">
                                                <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                                <ChromePicker
                                                    color={localConfig.primaryColor}
                                                    onChange={(c: any) => setLocalConfig({ ...localConfig, primaryColor: c.hex })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Color de Acento</label>
                                        <button
                                            onClick={() => setActiveColorPicker(activeColorPicker === 'accent' ? null : 'accent')}
                                            className="w-full h-10 rounded-xl border border-zinc-700 flex items-center justify-between px-3 transition-all hover:scale-[1.02]"
                                            style={{ backgroundColor: localConfig.accentColor }}
                                        >
                                            <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono text-white backdrop-blur-sm">{localConfig.accentColor}</span>
                                        </button>
                                        {activeColorPicker === 'accent' && (
                                            <div className="absolute z-50 top-14 right-0 sm:left-0">
                                                <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                                <ChromePicker
                                                    color={localConfig.accentColor}
                                                    onChange={(c: any) => setLocalConfig({ ...localConfig, accentColor: c.hex })}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 relative">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Color de Texto</label>
                                        <button
                                            onClick={() => setActiveColorPicker(activeColorPicker === 'text' ? null : 'text')}
                                            className="w-full h-10 rounded-xl border border-zinc-700 flex items-center justify-between px-3 transition-all hover:scale-[1.02]"
                                            style={{ backgroundColor: localConfig.textColor || '#171717' }}
                                        >
                                            <span className="bg-black/20 px-2 py-0.5 rounded text-[10px] font-mono text-white backdrop-blur-sm">{localConfig.textColor || '#171717'}</span>
                                        </button>
                                        {activeColorPicker === 'text' && (
                                            <div className="absolute z-50 top-14 left-0 sm:left-auto sm:right-0">
                                                <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                                                <ChromePicker
                                                    color={localConfig.textColor || '#171717'}
                                                    onChange={(c: any) => setLocalConfig({ ...localConfig, textColor: c.hex })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setLocalConfig({
                                        ...localConfig,
                                        primaryColor: '#3b82f6',
                                        accentColor: '#10b981',
                                        textColor: '#171717'
                                    })}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-bold transition-all w-fit self-end"
                                >
                                    <RotateCcw size={14} />
                                    Restablecer Colores
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
