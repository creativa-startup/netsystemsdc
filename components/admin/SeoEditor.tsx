"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Save, Globe, Loader2, Info, Search, Layout, Share2, AlertTriangle, Upload, X } from 'lucide-react';
import { ChromePicker } from 'react-color';

export default function SeoEditor() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false); // New uploading state
    const [message, setMessage] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false); // For theme color
    const [seoData, setSeoData] = useState({
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: '',
        ogImage: '',
        themeColor: '#3b82f6', // Default blue-500
    });

    useEffect(() => {
        const fetchSeo = async () => {
            try {
                const docRef = doc(db, 'settings_seo', 'global');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSeoData(docSnap.data() as any);
                } else {
                    setSeoData({
                        metaTitle: 'NetSystemsDc - Soluciones Integrales en Infraestructura IT',
                        metaDescription: 'Expertos en continuidad de negocio, mantenimiento IT y soluciones cloud.',
                        canonicalUrl: 'https://netsystemsdc.com',
                        ogImage: '',
                        themeColor: '#3b82f6',
                    });
                }
            } catch (error) {
                console.error("SEO fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSeo();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage('');
        try {
            await setDoc(doc(db, 'settings_seo', 'global'), seoData);
            setMessage('SEO Actualizado.');
        } catch (e) {
            setMessage('Error al guardar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                        <Search className="text-blue-500" /> Optimización SEO
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Configuración técnica para motores de búsqueda.</p>
                </div>

                <div className="flex gap-4 items-center">
                    {message && <span className="text-xs font-bold text-emerald-400">{message}</span>}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold font-sans transition-all shadow-lg shadow-blue-900/40"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Guardar SEO
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">
                <div className="space-y-6">
                    {/* Main Tags */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-4 flex items-center gap-2">
                            <Globe size={14} /> Etiquetas Meta Principales
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Page Title</label>
                                <input
                                    value={seoData.metaTitle}
                                    onChange={e => setSeoData({ ...seoData, metaTitle: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                />
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mt-1">
                                    <span className="text-zinc-600">{seoData.metaTitle.length} / 60 caracteres</span>
                                    {seoData.metaTitle.length > 60 && <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={10} /> Demasiado largo</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Meta Description</label>
                                <textarea
                                    rows={4}
                                    value={seoData.metaDescription}
                                    onChange={e => setSeoData({ ...seoData, metaDescription: e.target.value })}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                                />
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mt-1">
                                    <span className="text-zinc-600">{seoData.metaDescription.length} / 160 caracteres</span>
                                    {seoData.metaDescription.length > 160 && <span className="text-amber-500 flex items-center gap-1"><AlertTriangle size={10} /> Demasiado largo</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Tags */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 pb-4 flex items-center gap-2">
                            <Share2 size={14} /> OpenGraph & RRSS
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-400">Imagen Compartida (Open Graph)</label>
                                <div className="flex items-center gap-4">
                                    {seoData.ogImage && (
                                        <div className="w-24 h-24 rounded-xl border border-zinc-700 overflow-hidden relative group">
                                            <img src={seoData.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setSeoData({ ...seoData, ogImage: '' })}
                                                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                            >
                                                <X size={20} className="text-white" />
                                            </button>
                                        </div>
                                    )}
                                    <label className="flex items-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl cursor-pointer transition-all text-xs font-bold text-zinc-400 hover:text-white h-fit">
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
                                                    const storageRef = ref(storage, `seo/og_image_${Date.now()}`);
                                                    await uploadBytes(storageRef, file);
                                                    const url = await getDownloadURL(storageRef);
                                                    setSeoData({ ...seoData, ogImage: url });
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

                            {/* Theme Color Picker */}
                            <div className="space-y-2 relative">
                                <label className="text-sm font-medium text-zinc-400">Color del Tema (Browser Toolbar)</label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                        className="w-full h-12 rounded-xl border border-zinc-800 flex items-center justify-between px-4 transition-all hover:border-zinc-700 bg-zinc-950"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-6 h-6 rounded-full border border-zinc-700 shadow-sm"
                                                style={{ backgroundColor: seoData.themeColor }}
                                            />
                                            <span className="text-sm font-mono text-zinc-300">{seoData.themeColor}</span>
                                        </div>
                                    </button>
                                </div>
                                {showColorPicker && (
                                    <div className="absolute z-50 top-20 left-0">
                                        <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
                                        <ChromePicker
                                            color={seoData.themeColor}
                                            onChange={(c) => setSeoData({ ...seoData, themeColor: c.hex })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Live Preview Sidebar */}
                <div className="space-y-8">
                    <div>
                        <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-600 mb-4 px-2">Previsualización Google & Social</h4>
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            {/* Browser Mock Header with Theme Color */}
                            <div className="h-4 w-full" style={{ backgroundColor: seoData.themeColor }} />

                            <div className="p-6 space-y-3">
                                <div className="text-[12px] text-[#202124] font-normal leading-tight flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px]">🌐</div>
                                    <span>netsystemsdc.com</span>
                                </div>
                                <div className="text-[20px] text-[#1a0dab] font-medium leading-tight hover:underline cursor-pointer">
                                    {seoData.metaTitle || 'NetSystemsDc - Soluciones IT'}
                                </div>
                                <div className="text-[14px] text-[#4d5156] leading-relaxed line-clamp-2">
                                    {seoData.metaDescription || 'Configura una descripción para mejorar el CTR de tu búsqueda.'}
                                </div>

                                {/* Social Image Preview (Mocking how it might look in Discover or Card) */}
                                {seoData.ogImage && (
                                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100">
                                        <img src={seoData.ogImage} alt="OG Preview" className="w-full h-40 object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-zinc-600 px-2 flex items-center justify-between">
                            <span>Rendimiento Orgánico (GSC)</span>
                            <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[9px]">Últimos 28 días</span>
                        </h4>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-950 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Término de Búsqueda</th>
                                        <th className="px-6 py-4 text-right">Clics</th>
                                        <th className="px-6 py-4 text-right">Impr.</th>
                                        <th className="px-6 py-4 text-right">Pos.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                    {[
                                        { term: 'mantenimiento servidores quito', clicks: 124, imp: '2.4k', pos: 3.2 },
                                        { term: 'cableado estructurado ecuador', clicks: 98, imp: '1.8k', pos: 4.5 },
                                        { term: 'netsystems dc', clicks: 850, imp: '900', pos: 1.0 },
                                        { term: 'soporte it empresas', clicks: 56, imp: '1.2k', pos: 8.1 },
                                        { term: 'virtualizacion vmware', clicks: 42, imp: '850', pos: 5.6 },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-zinc-800/50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-white">{row.term}</td>
                                            <td className="px-6 py-3 text-right">{row.clicks}</td>
                                            <td className="px-6 py-3 text-right text-zinc-500">{row.imp}</td>
                                            <td className="px-6 py-3 text-right text-blue-400 font-bold">{row.pos}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 bg-zinc-950/50 text-center border-t border-zinc-800">
                                <button className="text-xs text-zinc-500 hover:text-white transition-colors">Ver reporte completo en Search Console ↗</button>
                            </div>
                        </div>

                        <div className="bg-blue-600/5 border border-blue-500/10 p-6 rounded-3xl space-y-3">
                            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
                                <Info size={16} /> Tips Profesionales
                            </div>
                            <p className="text-xs text-zinc-500 leading-loose">
                                Tu título debe contener la palabra clave principal de tu negocio. La descripción debe invitar a la acción y resumir el valor diferencial de <strong>NetSystemsDc</strong>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
