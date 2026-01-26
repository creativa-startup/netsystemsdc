"use client";
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle2, Clock, Inbox, User, Briefcase, MessageCircle, TrendingUp, MapPin } from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    service: string;
    message: string;
    createdAt: any;
    status: 'new' | 'read' | 'contacted' | 'cliente';
    value?: number;
}

export default function LeadInbox() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'new' | 'contacted'>('all');

    const [deletingId, setDeletingId] = useState<string | null>(null);



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

    const markAs = async (id: string, status: 'contacted' | 'read' | 'cliente') => {
        try {
            await updateDoc(doc(db, 'leads', id), {
                status,
                updatedAt: serverTimestamp()
            });
        } catch (e) {
            console.error("Error updating lead status:", e);
        }
    };

    const deleteLead = async (id: string) => {
        if (deletingId !== id) {
            setDeletingId(id);
            setTimeout(() => setDeletingId(null), 3000);
            return;
        }

        try {
            await deleteDoc(doc(db, 'leads', id));
            setDeletingId(null);
        } catch (e) {
            console.error("Error deleting lead:", e);
            alert("Error al eliminar el lead.");
        }
    };

    const updateValue = async (id: string, value: string) => {
        const num = parseFloat(value);
        if (isNaN(num)) return;
        await updateDoc(doc(db, 'leads', id), { value: num });
    };

    const filteredLeads = leads.filter(l => {
        if (filter === 'all') return true;
        if (filter === 'new') return l.status === 'new';
        if (filter === 'contacted') return l.status === 'contacted';
        return true;
    });

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-blue-500" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                        <Inbox className="text-blue-500" /> Centro de Leads
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Gestión de prospectos recibidos desde la web.</p>
                </div>

                <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    {['all', 'new', 'contacted'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${filter === f
                                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                : 'text-zinc-500 hover:text-zinc-300 border-transparent'}`}
                        >
                            {f === 'all' ? 'Todos' : f === 'new' ? 'Nuevos' : 'Atendidos'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
                    {filteredLeads.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
                            <Inbox size={48} className="text-zinc-800 mb-4" />
                            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">Sin registros</p>
                        </div>
                    ) : (
                        filteredLeads.map((lead) => (
                            <div
                                key={lead.id}
                                className={`flex flex-col bg-zinc-900/50 border transition-all rounded-3xl group relative overflow-hidden hover:scale-[1.02] duration-300 ${lead.status === 'new'
                                    ? 'border-blue-500/30 bg-zinc-900 shadow-xl shadow-blue-900/10'
                                    : 'border-zinc-800 hover:border-zinc-700'}`}
                            >
                                {lead.status === 'new' && (
                                    <div className="absolute top-4 right-4 z-10">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                    </div>
                                )}

                                <div className="p-6 space-y-4 flex-1">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-blue-500 border border-zinc-800 shadow-inner">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-sm font-black text-zinc-100 uppercase tracking-tight truncate" title={lead.name}>{lead.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded border border-zinc-700 uppercase tracking-wider truncate max-w-full">
                                                    {lead.service}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase truncate">
                                            <Mail size={12} className="text-zinc-600 flex-shrink-0" /> <span className="truncate">{lead.email}</span>
                                        </div>
                                        {lead.phone && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase truncate">
                                                <Phone size={12} className="text-zinc-600 flex-shrink-0" /> {lead.phone}
                                            </div>
                                        )}
                                        {lead.city && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase truncate">
                                                <MapPin size={12} className="text-zinc-600 flex-shrink-0" /> {lead.city}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/50 text-xs text-zinc-400 leading-relaxed italic relative">
                                        <div className="absolute -left-px top-4 bottom-4 w-0.5 bg-blue-500/20 rounded-full" />
                                        <p className="line-clamp-3">"{lead.message}"</p>
                                    </div>

                                    {/* Value Input */}
                                    <div className="flex items-center gap-2 bg-zinc-950 rounded-lg border border-zinc-800 px-3 py-1.5 w-full">
                                        <span className="text-green-500 text-xs font-bold">$</span>
                                        <input
                                            type="number"
                                            placeholder="Valor 0.00"
                                            defaultValue={lead.value || ''}
                                            onBlur={(e) => updateValue(lead.id, e.target.value)}
                                            className="bg-transparent text-xs font-bold text-zinc-300 w-full outline-none placeholder:text-zinc-700"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50 grid grid-cols-2 gap-2">
                                    {lead.phone && (
                                        <a
                                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="col-span-2 flex items-center justify-center gap-2 py-2.5 bg-green-600/10 hover:bg-green-600 text-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-green-500/20 group/wa"
                                        >
                                            <MessageCircle size={14} className="group-hover/wa:scale-110 transition-transform" /> WhatsApp
                                        </a>
                                    )}

                                    <button
                                        onClick={() => markAs(lead.id, lead.status === 'cliente' ? 'contacted' : 'cliente')}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${lead.status === 'cliente'
                                            ? 'bg-zinc-800 border-zinc-700 text-zinc-500'
                                            : 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-600 hover:text-white'}`}
                                    >
                                        <TrendingUp size={14} /> {lead.status === 'cliente' ? 'Venta' : 'Cerrar'}
                                    </button>

                                    <button
                                        onClick={() => deleteLead(lead.id)}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${deletingId === lead.id
                                            ? 'bg-red-500 text-white border-red-500 col-span-2' // Expand on delete confirm
                                            : 'hover:bg-red-500/10 text-zinc-600 hover:text-red-500 border-transparent hover:border-red-500/20'}`}
                                    >
                                        <Trash2 size={14} /> {deletingId === lead.id ? '¿Confirmar?' : 'Borrar'}
                                    </button>
                                </div>
                                <div className="px-6 pb-4 text-[9px] font-black text-zinc-700 uppercase tracking-widest text-center">
                                    {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function Loader2({ ...props }) {
    return <Clock {...props} className="animate-spin" />;
}
