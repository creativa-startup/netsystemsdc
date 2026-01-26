"use client";

import React, { useState, useEffect } from 'react';
import { X, Upload, Loader2, Save, Image as ImageIcon, Link as LinkIcon, Type, Tag, AlignLeft } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface ShowcaseItem {
    id?: string;
    title: string;
    category: string;
    description: string;
    image: string;
    link?: string;
}

interface ShowcaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ShowcaseItem) => void;
    initialData?: ShowcaseItem | null;
}

export default function ShowcaseModal({ isOpen, onClose, onSave, initialData }: ShowcaseModalProps) {
    const [formData, setFormData] = useState<ShowcaseItem>({
        title: '',
        category: '',
        description: '',
        image: '',
        link: ''
    });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ title: '', category: '', description: '', image: '', link: '' });
        }
    }, [initialData, isOpen]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("[ShowcaseModal] Starting upload...", file.name);
        setUploading(true);
        try {
            const storagePath = `landing/showcase/${Date.now()}_${file.name}`;
            const storageRef = ref(storage, storagePath);
            const uploadTask = uploadBytesResumable(storageRef, file);

            await new Promise<void>((resolve, reject) => {
                const timeout = setTimeout(() => {
                    uploadTask.cancel();
                    reject(new Error("Timeout (35s). Verifique conexión o CORS."));
                }, 35000);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log(`[Showcase] Progress: ${progress.toFixed(0)}%`);
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
            console.log("[Showcase] URL:", url);
            setFormData(prev => ({ ...prev, image: url }));
        } catch (error: any) {
            console.error("[Showcase] Error:", error);
            alert(`Error al subir: ${error.message || 'Fallo de red'}`);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ImageIcon size={20} className="text-blue-500" />
                            {initialData ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                        </h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1 font-bold">Showcase Especializado</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Image Upload Area */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Imagen de Portada</label>
                        <div className="relative aspect-video bg-zinc-950 rounded-2xl border-2 border-dashed border-zinc-800 overflow-hidden group hover:border-blue-500/50 transition-all">
                            {formData.image ? (
                                <>
                                    <img src={formData.image} className="w-full h-full object-cover opacity-60" />
                                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="text-white mb-2" size={32} />
                                        <span className="text-white text-xs font-bold uppercase tracking-widest">Cambiar Imagen</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </>
                            ) : (
                                <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-12 text-center h-full">
                                    <div className="p-4 bg-zinc-900 rounded-full text-zinc-700 group-hover:text-blue-500 transition-colors">
                                        <Upload size={40} />
                                    </div>
                                    <div>
                                        <span className="text-sm text-zinc-400 font-bold block">Subir Imagen del Servicio</span>
                                        <span className="text-[10px] text-zinc-600 uppercase mt-1 block">Recomendado: 1280x720px</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center gap-3 z-20">
                                    <Loader2 className="animate-spin text-blue-500" size={40} />
                                    <span className="text-blue-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">Procesando...</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-2">
                                <Type size={12} /> Título
                            </label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                placeholder="Ej: Implementación SAP s/4HANA"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-2">
                                <Tag size={12} /> Categoría
                            </label>
                            <input
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                placeholder="Ej: Infraestructura"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-2">
                            <AlignLeft size={12} /> Descripción Corta
                        </label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none leading-relaxed"
                            placeholder="Breve descripción del impacto o alcance del servicio..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest flex items-center gap-2">
                            <LinkIcon size={12} /> Enlace Externo (Opcional)
                        </label>
                        <input
                            value={formData.link}
                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave(formData)}
                        disabled={uploading || !formData.title || !formData.image}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        <Save size={18} />
                        {initialData ? 'Actualizar' : 'Crear Proyecto'}
                    </button>
                </div>
            </div>
        </div>
    );
}
