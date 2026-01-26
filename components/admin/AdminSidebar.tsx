"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Inbox, FileText, Settings, LogOut, ExternalLink, MessageSquare, Layers, Globe, FlaskConical } from 'lucide-react';

import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Mail, MessageCircle } from 'lucide-react';

import { useGlobalConfig } from '@/context/GlobalConfigContext';

export default function AdminSidebar() {
    const { config } = useGlobalConfig();
    const router = useRouter();
    const pathname = usePathname();
    const [unreadLeads, setUnreadLeads] = useState(0);
    const [unreadChats, setUnreadChats] = useState(0);

    useEffect(() => {
        // Listen for new leads
        const qLeads = query(collection(db, 'leads'), where('status', '==', 'new'));
        const unsubLeads = onSnapshot(qLeads, (snap) => setUnreadLeads(snap.size));

        // Listen for unread chats
        const qChats = query(collection(db, 'chats'), where('adminUnread', '==', true));
        const unsubChats = onSnapshot(qChats, (snap) => setUnreadChats(snap.size));

        return () => {
            unsubLeads();
            unsubChats();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/admin/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const modules = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { id: 'content', label: 'Gestor de Contenido', icon: Layers, href: '/admin/content' },
        { id: 'lab', label: 'Laboratorio Color', icon: FlaskConical, href: '/admin/lab' },
        { id: 'leads', label: 'Bandeja de Leads', icon: Mail, href: '/admin/leads' },
        { id: 'chat', label: 'Chat En Vivo', icon: MessageSquare, href: '/admin/chat' },
        { id: 'seo', label: 'Gestor SEO', icon: Globe, href: '/admin/seo' },
        { id: 'blog', label: 'Blog', icon: FileText, href: '/admin/blog' },
        { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/settings' },
    ];

    return (
        <aside className="w-64 bg-zinc-950 text-zinc-400 min-h-screen flex flex-col fixed left-0 top-0 border-r border-zinc-800 z-50">
            <div className="border-b border-zinc-800 flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-2">
                    {config.logoIconUrl && (
                        <img
                            src={config.logoIconUrl}
                            alt="Brand Icon"
                            className="w-auto object-contain"
                            style={{ height: `${(config.logoSize || 32) * 0.65}px` }}
                        />
                    )}
                    {config.logoType === 'image' && config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt="Logo"
                            className="w-auto object-contain"
                            style={{ height: `${(config.logoSize || 32) * 0.65}px` }}
                        />
                    ) : (
                        <span
                            className="font-black text-white tracking-tight leading-none"
                            style={{
                                fontFamily: config.fontFamily,
                                fontSize: `${(config.logoSize || 32) * 0.8 * 0.65}px`
                            }}
                        >
                            {config.logoText || 'NetSystemsDC'}
                        </span>
                    )}

                </div>
                <div className="flex items-center gap-3">
                    {/* Leads Notification */}
                    <Link href="/admin/leads" className="relative group cursor-pointer">
                        <Mail size={18} className={`${unreadLeads > 0 ? 'text-blue-500' : 'text-zinc-600'}`} />
                        {unreadLeads > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-600 border border-zinc-950 text-white text-[8px] font-black flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                                {unreadLeads > 9 ? '9+' : unreadLeads}
                            </span>
                        )}
                    </Link>
                    {/* Chat Notification */}
                    <Link href="/admin/chat" className="relative group cursor-pointer">
                        <MessageCircle size={18} className={`${unreadChats > 0 ? 'text-green-500' : 'text-zinc-600'}`} />
                        {unreadChats > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-[14px] bg-red-600 border border-zinc-950 text-white text-[8px] font-black flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                                {unreadChats > 9 ? '9+' : unreadChats}
                            </span>
                        )}
                    </Link>
                </div>
            </div>


            <nav className="flex-1 p-4 space-y-1">
                {modules.map(module => {
                    const isActive = pathname === module.href || (module.href !== '/admin' && pathname?.startsWith(module.href || ''));
                    const Icon = module.icon;

                    return (
                        <Link
                            key={module.id}
                            href={module.href || '#'}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-zinc-900 text-blue-400 border border-zinc-800 shadow-xl'
                                : 'hover:bg-zinc-900/50 hover:text-zinc-200 border border-transparent'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-blue-400' : 'text-zinc-600 group-hover:text-zinc-400'} />
                            <span className="font-medium text-sm">{module.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-medium"
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside >
    );
}
