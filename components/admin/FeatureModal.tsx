"use client";
import { useState, useEffect } from 'react';
import {
    X, Save, Loader2, Plus, Trash2,
    Settings, Server, Code, CheckCircle, Shield,
    Zap, Cloud, Database, Lock, Cpu,
    Network, HardDrive, Wifi, Globe
} from 'lucide-react';

const iconList = [
    { name: 'Settings', icon: Settings },
    { name: 'Server', icon: Server },
    { name: 'Code', icon: Code },
    { name: 'CheckCircle', icon: CheckCircle },
    { name: 'Shield', icon: Shield },
    { name: 'Zap', icon: Zap },
    { name: 'Cloud', icon: Cloud },
    { name: 'Database', icon: Database },
    { name: 'Lock', icon: Lock },
    { name: 'Cpu', icon: Cpu },
    { name: 'Network', icon: Network },
    { name: 'HardDrive', icon: HardDrive },
    { name: 'Wifi', icon: Wifi },
    { name: 'Globe', icon: Globe },
];

interface FeatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function FeatureModal({ isOpen, onClose, onSave, initialData }: FeatureModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        icon: 'Settings',
        features: [] as string[]
    });
    const [newBenefit, setNewBenefit] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                icon: initialData.icon || 'Settings',
                features: initialData.features || []
            });
        } else {
            setFormData({
                title: '',
                description: '',
                icon: 'Settings',
                features: []
            });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleAddBenefit = () => {
        if (!newBenefit.trim()) return;
        setFormData({
            ...formData,
            features: [...formData.features, newBenefit.trim()]
        });
        setNewBenefit('');
    };

    const handleRemoveBenefit = (index: number) => {
        setFormData({
            ...formData,
            features: formData.features.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return;

        setIsSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Error saving feature:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white">
                            {initialData ? 'Editar Servicio' : 'Nuevo Servicio'}
                        </h3>
                        <p className="text-sm text-zinc-500">Configura los detalles del servicio para la landing page.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Título del Servicio</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                placeholder="Ej: Ciberseguridad Prolactiva"
                            />
                        </div>

                        {/* Icon Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Icono Representativo</label>
                            <div className="grid grid-cols-7 gap-2">
                                {iconList.map((item) => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: item.name })}
                                        className={`p-2 rounded-lg border flex items-center justify-center transition-all ${formData.icon === item.name
                                                ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                                : 'bg-zinc-950 border-zinc-800 text-zinc-600 hover:text-zinc-300'
                                            }`}
                                        title={item.name}
                                    >
                                        <item.icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción Corta</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                            placeholder="Describa brevemente en qué consiste este servicio..."
                        />
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Lista de Beneficios / Puntos Clave</label>
                        <div className="flex gap-2">
                            <input
                                value={newBenefit}
                                onChange={e => setNewBenefit(e.target.value)}
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 outline-none"
                                placeholder="Añadir un beneficio..."
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddBenefit())}
                            />
                            <button
                                type="button"
                                onClick={handleAddBenefit}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-2 mt-4">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl group">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-sm text-zinc-300">{feature}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveBenefit(index)}
                                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {formData.features.length === 0 && (
                                <p className="text-center py-4 text-xs text-zinc-600 italic">No hay beneficios añadidos aún.</p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 font-bold transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.title || !formData.description}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {initialData ? 'Actualizar Servicio' : 'Crear Servicio'}
                    </button>
                </div>
            </div>
        </div>
    );
}
