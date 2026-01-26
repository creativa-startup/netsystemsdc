"use client";
import { useState, useEffect, useRef } from 'react';
import {
    collection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, doc, setDoc, getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MessageCircle, X, Send, User, Loader2, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [welcomeMsg, setWelcomeMsg] = useState('¡Hola! Soy el asistente virtual de NetSystemsDC. ¿En qué puedo ayudarte hoy para impulsar tu negocio?');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load session from localStorage
    useEffect(() => {
        const savedChatId = localStorage.getItem('ns_chat_id');
        const savedEmail = localStorage.getItem('ns_chat_email');
        const savedName = localStorage.getItem('ns_chat_name');
        if (savedChatId && savedEmail) {
            setChatId(savedChatId);
            setEmail(savedEmail);
            setName(savedName || '');
            setIsRegistered(true);
        }

        // Listen for global visibility setting and welcome message
        const unsub = onSnapshot(doc(db, 'content', 'settings'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setIsVisible(data.showChat !== false);
                if (data.chatWelcomeMessage) setWelcomeMsg(data.chatWelcomeMessage);
            }
        });
        return () => unsub();
    }, []);

    // Listen for messages OR deletion
    useEffect(() => {
        if (!chatId) return;

        // 1. Listen for messages
        const q = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribeMessages = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
            setTimeout(() => {
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 100);
        });

        // 2. Listen for document existence (reset on deletion)
        const unsubscribeExists = onSnapshot(doc(db, 'chats', chatId), (snap) => {
            if (!snap.exists()) {
                console.log("Chat session remote deleted, resetting...");
                localStorage.removeItem('ns_chat_id');
                setChatId(null);
                setMessages([]);
                setIsRegistered(false);
            }
        });

        return () => {
            unsubscribeMessages();
            unsubscribeExists();
        };
    }, [chatId]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.includes('@')) return;

        setLoading(true);
        try {
            const newChatId = `chat_${Date.now()}_${email.replace(/[^a-zA-Z0-9]/g, '')}`;
            const chatRef = doc(db, 'chats', newChatId);
            const initialMsg = welcomeMsg;

            await setDoc(chatRef, {
                userEmail: email,
                userName: name,
                createdAt: serverTimestamp(),
                lastMessage: initialMsg,
                status: 'active',
                adminUnread: true,
                updatedAt: serverTimestamp()
            });

            // Send initial message automatically
            await addDoc(collection(db, 'chats', newChatId, 'messages'), {
                text: initialMsg,
                sender: 'bot', // Initial message is from bot/system
                timestamp: serverTimestamp()
            });

            localStorage.setItem('ns_chat_id', newChatId);
            localStorage.setItem('ns_chat_email', email);
            localStorage.setItem('ns_chat_name', name);
            setChatId(newChatId);
            setIsRegistered(true);
        } catch (error) {
            console.error("Error starting chat:", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chatId) return;

        const text = newMessage;
        setNewMessage('');

        try {
            // Check if chat session still exists
            const chatSnap = await getDoc(doc(db, 'chats', chatId));
            if (!chatSnap.exists()) {
                // Admin deleted the chat, reset session
                localStorage.removeItem('ns_chat_id');
                setChatId(null);
                setIsRegistered(false);
                alert("La sesión de chat ha expirado o fue finalizada.");
                return;
            }

            // UI Update: Optimistic add (optional, but let's stick to firestore listener for simplicity)

            await addDoc(collection(db, 'chats', chatId, 'messages'), {
                text,
                sender: 'user',
                timestamp: serverTimestamp()
            });

            // Update main chat doc
            await setDoc(doc(db, 'chats', chatId), {
                lastMessage: text,
                adminUnread: true,
                updatedAt: serverTimestamp()
            }, { merge: true });

            // Trigger AI Agent
            setIsBotTyping(true);

            try {
                const functions = getFunctions(undefined, 'us-central1');
                const chatAgentFn = httpsCallable(functions, 'chatAgent');

                await chatAgentFn({
                    chatId,
                    message: text,
                    userInfo: { name, email }
                });

                setIsBotTyping(false);
            } catch (err) {
                console.error("AI Agent Error (Client Side):", err);
                setIsBotTyping(false);
            }

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-80 md:w-96 rounded-xl overflow-hidden flex flex-col h-[550px] shadow-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                        {/* Header */}
                        <div
                            className="text-white p-4 flex items-center justify-between border-b border-white/10"
                            style={{ backgroundColor: 'var(--color-primary)' }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/10">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Soporte NetSystems</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                                        <span className="text-xs text-white/80">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/70 hover:text-white"
                            >
                                <Minus size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-zinc-50 dark:bg-zinc-950" ref={scrollRef}>
                            {!isRegistered ? (
                                <div className="h-full flex flex-col justify-center items-center px-6">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-white shadow-lg"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        <User size={32} />
                                    </div>

                                    <div className="text-center mb-8">
                                        <h5 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-2">Bienvenido al Chat</h5>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Por favor, completa tus datos para iniciar la conversación.
                                        </p>
                                    </div>

                                    <form onSubmit={handleRegister} className="w-full space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Nombre</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Correo Electrónico</label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
                                            />
                                        </div>
                                        <button
                                            disabled={loading}
                                            className="w-full py-3 mt-4 text-white rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95"
                                            style={{ backgroundColor: 'var(--color-primary)' }}
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Iniciar Chat'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((m) => {
                                        const isBot = m.sender === 'bot' || m.sender === 'model' || m.sender === 'admin';
                                        return (
                                            <div
                                                key={m.id}
                                                className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] p-3 text-sm rounded-lg shadow-sm ${isBot
                                                        ? 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200'
                                                        : 'text-white'
                                                        }`}
                                                    style={!isBot ? { backgroundColor: 'var(--color-primary)' } : undefined}
                                                >
                                                    <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {isBotTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 inline-flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></div>
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        {isRegistered && (
                            <form onSubmit={sendMessage} className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Escribe tu mensaje..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-none rounded-lg px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-zinc-400 dark:text-white"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim()}
                                        className="p-2 text-white rounded-lg transition-all disabled:opacity-50 hover:opacity-90 active:scale-95"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Static Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    <MessageCircle size={24} />
                    {/* Simple red dot for unread if needed, removed logic for now to keep it clean or add back strictly if requested */}
                </button>
            )}
        </div>
    );
}
