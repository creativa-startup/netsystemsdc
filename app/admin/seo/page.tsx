"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, Globe, Loader2 } from 'lucide-react';

export default function SeoManagerPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [seoData, setSeoData] = useState({
        metaTitle: '',
        metaDescription: '',
        canonicalUrl: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSeo = async () => {
            try {
                const docRef = doc(db, 'settings_seo', 'global');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSeoData(docSnap.data() as any);
                } else {
                    // Default data
                    setSeoData({
                        metaTitle: 'NetSystemsDc - Soluciones Integrales en Infraestructura IT',
                        metaDescription: 'Expertos en continuidad de negocio, mantenimiento IT y soluciones cloud con 23 años de experiencia.',
                        canonicalUrl: 'https://netsystemsdc.com'
                    });
                }
            } catch (error) {
                console.error("Error fetching SEO settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSeo();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            await setDoc(doc(db, 'settings_seo', 'global'), seoData);
            setMessage('¡Configuración SEO actualizada correctamente!');
            // In a real SSR scenario, this might trigger a re-validation of cached pages
        } catch (error) {
            console.error("Error saving settings:", error);
            setMessage('Error al guardar. Intente nuevamente.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
                    <Globe size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestor SEO Global</h1>
                    <p className="text-gray-500 dark:text-gray-400">Edite los metadatos principales del sitio sin desplegar código.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                    <input
                        type="text"
                        value={seoData.metaTitle}
                        onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Recomendado: 50-60 caracteres</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                    <textarea
                        value={seoData.metaDescription}
                        onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        required
                    />
                    <p className="text-xs text-gray-400 mt-1">Recomendado: 150-160 caracteres</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Canonical URL</label>
                    <input
                        type="url"
                        value={seoData.canonicalUrl}
                        onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-all transform hover:scale-[1.02]"
                >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Guardar Cambios
                </button>
            </form>
        </div>
    );
}
