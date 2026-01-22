"use client";
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, CheckCircle, Clock } from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    email: string;
    service: string;
    message: string;
    createdAt: any;
    status: 'new' | 'read' | 'contacted';
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Lead[];
            setLeads(leadsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAs = async (id: string, status: 'contacted' | 'read') => {
        await updateDoc(doc(db, 'leads', id), { status });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando mensajes...</div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <Mail className="text-blue-600" /> Bandeja de Entrada
                </h1>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {leads.length} Mensajes Totales
                </span>
            </div>

            <div className="space-y-4">
                {leads.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                        <Mail size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No hay mensajes nuevos aún.</p>
                    </div>
                ) : (
                    leads.map(lead => (
                        <div
                            key={lead.id}
                            className={`p-6 rounded-xl border transition-all ${lead.status === 'new'
                                    ? 'bg-white border-blue-200 shadow-md border-l-4 border-l-blue-500'
                                    : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100'
                                }`}
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{lead.name}</h3>
                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                        <span className="text-blue-600">{lead.email}</span> •
                                        <span>{lead.service}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Clock size={16} />
                                    {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                                </div>
                            </div>

                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg mb-4 text-sm leading-relaxed">
                                {lead.message}
                            </p>

                            <div className="flex justify-end gap-3">
                                {lead.status !== 'contacted' && (
                                    <button
                                        onClick={() => markAs(lead.id, 'contacted')}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                    >
                                        <CheckCircle size={16} /> Marcar como Atendido
                                    </button>
                                )}
                                {lead.status === 'contacted' && (
                                    <span className="flex items-center gap-2 px-4 py-2 text-green-600 text-sm font-medium">
                                        <CheckCircle size={16} /> Atendido
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
