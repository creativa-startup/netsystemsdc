"use client";
import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Send, CheckCircle, Loader2 } from 'lucide-react';

export default function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: 'Mantenimiento',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

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
            setFormData({ name: '', email: '', service: 'Mantenimiento', message: '' });
        } catch (error) {
            console.error("Error submitting lead:", error);
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        Hablemos de su Infraestructura
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Déjenos un mensaje y nuestros especialistas analizarán su caso.
                    </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800">
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">¡Mensaje Enviado!</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Hemos recibido su solicitud correctamente. Un asesor se pondrá en contacto pronto.
                            </p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 text-blue-600 font-medium hover:underline"
                            >
                                Enviar otro mensaje
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correo Corporativo</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="juan@empresa.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Servicio de Interés</label>
                                <select
                                    value={formData.service}
                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                >
                                    <option>Mantenimiento</option>
                                    <option>Hardware & Redes</option>
                                    <option>Licencias de Software</option>
                                    <option>Consultoría General</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mensaje</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Describa brevemente sus necesidades..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'submitting'}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                            >
                                {status === 'submitting' ? (
                                    <>
                                        <Loader2 className="animate-spin" /> Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Solicitud <Send size={20} />
                                    </>
                                )}
                            </button>

                            {status === 'error' && (
                                <p className="text-red-500 text-center text-sm">
                                    Hubo un error al enviar el mensaje. Por favor intente nuevamente.
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}
