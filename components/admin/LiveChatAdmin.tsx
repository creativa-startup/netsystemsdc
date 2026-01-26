"use client";
import { useState, useEffect, useRef } from 'react';
import {
    collection, query, orderBy, onSnapshot,
    addDoc, serverTimestamp, doc, updateDoc,
    deleteDoc, getDocs, where, limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Send, User, Search, MessageSquare,
    Clock, Loader2, CheckCircle2, MoreVertical,
    UserCircle, Trash2, TrendingUp, Filter,
    MapPin, Phone, Mail, Sparkles, AlertCircle, Maximize2, Minimize2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Chat {
    id: string;
    userEmail: string;
    userName?: string;
    lastMessage: string;
    status: 'active' | 'closed' | 'cliente';
    adminUnread: boolean;
    updatedAt: any;
    value?: number;
    tags?: string[];
}

interface LeadData {
    name: string;
    email: string;
    phone: string;
    interest: string;
    notes: string;
    city?: string;
    status: string;
}

export default function LiveChatAdmin() {
    // State
    const [chats, setChats] = useState<Chat[]>([]);
    const [filteredChats, setFilteredChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentLead, setCurrentLead] = useState<LeadData | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'ai' | 'closed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isMaximized, setIsMaximized] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Load Chats
    useEffect(() => {
        const q = query(collection(db, 'chats'), orderBy('updatedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const chatsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Chat[];
            setChats(chatsData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // 2. Filter Chats
    useEffect(() => {
        let result = chats;

        // Search
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            result = result.filter(c =>
                (c.userEmail?.toLowerCase().includes(lower)) ||
                (c.userName?.toLowerCase().includes(lower)) ||
                (c.lastMessage?.toLowerCase().includes(lower))
            );
        }

        // Tabs
        if (activeTab === 'pending') {
            result = result.filter(c => c.adminUnread);
        } else if (activeTab === 'closed') {
            result = result.filter(c => c.status === 'closed' || c.status === 'cliente');
        }
        // 'ai' filter could be based on tags or if last msg was bot, for now simplified
        // We could filter chats where no admin has replied yet? 
        // For now, let's assume 'active' is default for AI handled until admin steps in?

        setFilteredChats(result);
    }, [chats, searchTerm, activeTab]);

    // 3. Select Chat & Load Messages + Lead Data
    useEffect(() => {
        if (!selectedChatId) {
            setCurrentLead(null);
            setMessages([]);
            return;
        }

        // A. Load Messages
        const qMessages = query(
            collection(db, 'chats', selectedChatId, 'messages'),
            orderBy('timestamp', 'asc')
        );
        const unsubMsg = onSnapshot(qMessages, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);

            // Mark as read explicitly if admin selects it
            if (msgs.length > 0) {
                updateDoc(doc(db, 'chats', selectedChatId), { adminUnread: false });
            }

            // Scroll
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        });

        // B. Fetch Lead Data (Try to find by Email)
        const chat = chats.find(c => c.id === selectedChatId);
        if (chat && chat.userEmail) {
            // Query leads collection
            const fetchLead = async () => {
                const qLead = query(collection(db, 'leads'), where('email', '==', chat.userEmail), limit(1));
                const snap = await getDocs(qLead);
                if (!snap.empty) {
                    const data = snap.docs[0].data() as LeadData;
                    setCurrentLead({ ...data, city: 'IP: 192.168.x.x (Simulado)' }); // Mocking IP/City for now
                } else {
                    setCurrentLead(null);
                }
            };
            fetchLead();
        }

        return () => unsubMsg();
    }, [selectedChatId, chats]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChatId) return;

        const text = newMessage;
        setNewMessage('');

        await addDoc(collection(db, 'chats', selectedChatId, 'messages'), {
            text,
            sender: 'admin',
            timestamp: serverTimestamp()
        });

        await updateDoc(doc(db, 'chats', selectedChatId), {
            lastMessage: text,
            adminUnread: false,
            updatedAt: serverTimestamp()
        });
    };

    // Helper to get message styles
    const getMessageStyle = (sender: string) => {
        if (sender === 'admin') return 'bg-blue-600 text-white rounded-tr-none ml-auto shadow-md';
        if (sender === 'bot' || sender === 'model') return 'bg-purple-50 text-purple-900 border border-purple-100 rounded-tl-none mr-auto';
        return 'bg-gray-100 text-gray-800 rounded-tl-none mr-auto'; // User
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

    const selectedChat = chats.find(c => c.id === selectedChatId);

    return (
        <div className={`bg-white flex font-sans text-slate-800 ${isMaximized ? 'fixed inset-0 z-50 h-screen' : 'h-[calc(100vh-64px)]'}`}>


            {/* COLUMN 1: SIDEBAR (30%) */}
            <div className="w-[30%] border-r border-gray-100 bg-gray-50/50 flex flex-col min-w-[300px]">
                {/* Header / Search */}
                <div className="p-4 border-b border-gray-100 space-y-4 bg-white">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-slate-800 text-sm tracking-wide flex items-center gap-2">
                            <MessageSquare size={16} className="text-blue-600" /> Chats Activos
                        </h2>
                        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setActiveTab('all')} className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                            <button onClick={() => setActiveTab('pending')} className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'pending' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pend.</button>
                            <button onClick={() => setActiveTab('closed')} className={`p-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${activeTab === 'closed' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Fin.</button>
                        </div>
                    </div>

                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Buscar por usuario o mensaje..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-100 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {filteredChats.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`w-full p-4 border-b border-gray-50 hover:bg-slate-50 transition-all flex gap-3 text-left relative group ${selectedChatId === chat.id ? 'bg-blue-50/50' : ''}`}
                        >
                            {chat.adminUnread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}

                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-slate-500 border border-gray-100 group-hover:border-gray-200 overflow-hidden">
                                {chat.status === 'cliente' ? <CheckCircle2 size={18} className="text-green-500" /> : <User size={18} />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-bold truncate ${selectedChatId === chat.id ? 'text-blue-700' : 'text-slate-700'}`}>
                                        {chat.userName || chat.userEmail || 'Visitante'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {chat.updatedAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] text-slate-500 truncate max-w-[140px] group-hover:text-slate-600 transition-colors">
                                        {chat.lastMessage}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* COLUMN 2: CHAT WINDOW (50% or Full) */}
            <div className={`flex flex-col bg-slate-50/50 transition-all duration-300 ${isMaximized ? 'fixed inset-0 z-50 w-full h-full bg-white' : 'w-[50%] relative h-full'}`}>
                {selectedChat ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white z-10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">{selectedChat.userName || selectedChat.userEmail}</h3>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest">{selectedChat.status === 'active' ? 'En Conversación' : selectedChat.status}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsMaximized(!isMaximized)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-slate-500 hover:text-blue-600 transition-colors"
                                    title={isMaximized ? "Minimizar" : "Maximizar"}
                                >
                                    {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                {isMaximized && (
                                    <button
                                        onClick={() => setIsMaximized(false)}
                                        className="p-2 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-500 transition-colors"
                                        title="Cerrar Vista Completa"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <div className="w-px h-6 bg-gray-200 mx-1"></div>
                                <button className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50" ref={scrollRef}>
                            {messages.map((m) => {
                                const isBot = m.sender === 'bot' || m.sender === 'model';
                                const isAdmin = m.sender === 'admin';

                                return (
                                    <div key={m.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative ${getMessageStyle(m.sender)}`}>
                                            {isBot && (
                                                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-600 opacity-70">
                                                    <Sparkles size={10} /> AI Assistant
                                                </div>
                                            )}
                                            {m.text}
                                            <span className={`text-[9px] opacity-40 absolute bottom-1 right-2 group-hover:opacity-80 transition-opacity ${isAdmin ? 'text-white' : 'text-slate-500'}`}>
                                                {m.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder="Escribe un mensaje..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                                    <Send size={16} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                        <MessageSquare size={48} className="mb-4 opacity-50" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-70">Selecciona un chat</p>
                    </div>
                )}
            </div>

            {/* COLUMN 3: LEAD DATA PANEL (20%) */}
            <div className="w-[20%] border-l border-gray-200 bg-white flex flex-col min-w-[250px]">
                <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <UserCircle size={14} /> Datos del Lead
                    </h3>
                </div>

                {selectedChat ? (
                    currentLead ? (
                        <div className="p-6 space-y-6 overflow-y-auto">
                            {/* Profile Card */}
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-white mb-3 shadow-lg shadow-blue-500/20">
                                    {currentLead.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="text-lg font-bold text-slate-800">{currentLead.name}</h2>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase">
                                        {currentLead.interest || 'Interés General'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Mail size={14} className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Email</p>
                                        <p className="text-xs text-slate-700 truncate" title={currentLead.email}>{currentLead.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <Phone size={14} className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Teléfono</p>
                                        <p className="text-xs text-slate-700 truncate">{currentLead.phone || 'No registrado'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <MapPin size={14} className="text-slate-400" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Ubicación</p>
                                        <p className="text-xs text-slate-700 truncate">{currentLead.city || 'Desconocida'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            <div className="bg-gradient-to-b from-indigo-50 to-purple-50 border border-indigo-100 p-4 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-50"><Sparkles size={40} className="text-indigo-100" /></div>
                                <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Sparkles size={12} /> Resumen IA
                                </h4>
                                <p className="text-xs text-slate-600 leading-relaxed italic">
                                    "{currentLead.notes || 'El usuario ha mostrado interés pero aún no ha proporcionado detalles específicos.'}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center space-y-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                <AlertCircle size={24} />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-slate-500">Sin Datos de Lead</h5>
                                <p className="text-xs text-slate-400 mt-2">
                                    Este usuario aún no ha sido registrado como Lead.
                                </p>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center opacity-10">
                        <UserCircle size={48} />
                    </div>
                )}
            </div>
        </div>
    );
}
