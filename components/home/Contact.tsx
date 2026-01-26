"use client";
import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Send, CheckCircle, Loader2, Phone, Mail, MapPin,
    Linkedin, Instagram, MessageCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getContrastColor } from '@/lib/colors';

interface ContactData {
    badge?: string;
    title?: string;
    description?: string;
    email?: string;
    phone?: string;
    address?: string;
    whatsapp?: string;
    linkedin?: string;
    instagram?: string;
    hours?: string;
}

export default function Contact({ previewData }: { previewData?: ContactData & { backgroundColor?: string } }) {
    const [data, setData] = useState<ContactData | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        service: 'Mantenimiento',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (previewData) {
            setData(previewData);
            return;
        }

        const unsub = onSnapshot(doc(db, 'content', 'contact'), (snap) => {
            if (snap.exists()) {
                setData(snap.data());
            } else {
                setData({
                    badge: 'Contacto',
                    title: 'Hablemos de su Infraestructura',
                    description: 'Déjenos un mensaje y nuestros especialistas analizarán su caso de forma personalizada.',
                    email: 'contacto@netsystemsdc.com',
                    phone: '+52 (000) 000-0000',
                    address: 'Calle Ejemplo 123, Ciudad de México',
                    hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM'
                });
            }
        });
        return () => unsub();
    }, [previewData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');
        try {
            await addDoc(collection(db, 'leads'), {
                ...formData,
                createdAt: serverTimestamp(),
                status: 'new'
            });
            setStatus('success');
            setFormData({ name: '', email: '', phone: '', service: 'Mantenimiento', message: '' });
        } catch (error) {
            console.error("Error submitting lead:", error);
            setStatus('error');
        }
    };

    if (!data) return null;

    const socialLinks = [
        { icon: MessageCircle, link: data.whatsapp, label: 'WhatsApp', color: 'hover:text-green-500' },
        { icon: Linkedin, link: data.linkedin, label: 'LinkedIn', color: 'hover:text-blue-600' },
        { icon: Instagram, link: data.instagram, label: 'Instagram', color: 'hover:text-pink-500' },
    ];

    const bgColor = (data as any)?.backgroundColor || '#18181b'; // Default dark
    const bgContrast = getContrastColor(bgColor);
    const isDarkBg = bgContrast === '#ffffff';

    const titleColor = isDarkBg ? '#ffffff' : '#111827';
    const textColor = isDarkBg ? '#d1d5db' : '#4b5563';
    const cardBg = isDarkBg ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const cardBorder = isDarkBg ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

    return (
        <section
            id="contacto"
            className="py-24 transition-colors duration-500 overflow-hidden"
            style={{ backgroundColor: (data as any)?.backgroundColor || undefined }} // Cast to allow extra prop or extend interface
        >
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="flex flex-col lg:flex-row gap-16 lg:items-center">

                    {/* Info Column */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2 space-y-10"
                    >
                        <div className="space-y-6">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest border border-blue-200 dark:border-blue-500/10">
                                {data.badge || 'Contacto'}
                            </div>

                            <h2
                                className="text-4xl md:text-6xl font-black leading-tight transition-colors"
                                style={{ color: titleColor }}
                            >
                                {data.title}
                            </h2>

                            <p
                                className="text-lg leading-relaxed max-w-xl transition-colors"
                                style={{ color: textColor }}
                            >
                                {data.description}
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                            {/* Contact Details */}
                            <div
                                className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:border-blue-500/30 group border"
                                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                            >
                                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Llámanos</p>
                                    <p className="text-lg font-bold transition-colors" style={{ color: titleColor }}>{data.phone}</p>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:border-blue-500/30 group border"
                                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                            >
                                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Email</p>
                                    <p className="text-lg font-bold transition-colors" style={{ color: titleColor }}>{data.email}</p>
                                </div>
                            </div>

                            <div
                                className="flex items-start gap-4 p-5 rounded-2xl transition-all hover:border-blue-500/30 group border"
                                style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                            >
                                <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Oficina</p>
                                    <p className="text-sm font-medium transition-colors" style={{ color: textColor }}>{data.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-6">
                            <span className="text-sm font-bold text-zinc-500 uppercase">Síguenos:</span>
                            <div className="flex gap-4">
                                {socialLinks.map((s, i) => s.link && (
                                    <a
                                        key={i}
                                        href={s.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`w-12 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-all ${s.color} hover:-translate-y-1 hover:shadow-lg`}
                                    >
                                        <s.icon size={22} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Form Column */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="lg:w-1/2"
                    >
                        <div className="relative p-8 md:p-12 rounded-[40px] bg-zinc-900 dark:bg-zinc-900 text-white shadow-3xl overflow-hidden">
                            {/* Background Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -z-10" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-900/40 blur-[100px] -z-10" />

                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-12 space-y-6"
                                    >
                                        <div className="w-24 h-24 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl shadow-blue-500/40">
                                            <CheckCircle size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-bold mb-2">¡Todo listo!</h3>
                                            <p className="text-zinc-400">Recibimos tus datos. Un especialista te contactará en breve.</p>
                                        </div>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-bold transition-colors"
                                        >
                                            Enviar otro mensaje
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold">Inicia tu Proyecto</h3>
                                            <p className="text-zinc-400 text-sm">Cuéntanos qué necesitas y te responderemos en menos de 24 horas.</p>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">Nombre</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-zinc-600"
                                                    placeholder="Juan Pérez"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">Email Corporativo</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-zinc-600"
                                                    placeholder="juan@empresa.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">WhatsApp / Teléfono</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-zinc-600"
                                                    placeholder="+57 300 000 0000"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">Ciudad</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={(formData as any).city || ''}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value } as any)}
                                                    className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-zinc-600"
                                                    placeholder="Bogotá"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">¿Cómo podemos ayudarte?</label>
                                            <select
                                                value={formData.service}
                                                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all appearance-none cursor-pointer"
                                            >
                                                <option className="bg-zinc-900">Mantenimiento Preventivo</option>
                                                <option className="bg-zinc-900">Infraestructura & Redes</option>
                                                <option className="bg-zinc-900">Licenciamiento Software</option>
                                                <option className="bg-zinc-900">Cloud & Seguridad</option>
                                                <option className="bg-zinc-900">Otro Servicio</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">Breve descripción</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:bg-white/10 outline-none transition-all placeholder:text-zinc-600 resize-none"
                                                placeholder="Describe tu proyecto o necesidad técnica..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={status === 'submitting'}
                                            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 text-white rounded-2xl font-black text-lg transition-all shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 group/btn hover:scale-[1.02] active:scale-95"
                                        >
                                            {status === 'submitting' ? (
                                                <Loader2 className="animate-spin" />
                                            ) : (
                                                <>
                                                    Enviar Solicitud <Send size={20} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
