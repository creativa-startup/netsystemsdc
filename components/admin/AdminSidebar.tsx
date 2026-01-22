"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Settings, FileText, Globe, LogOut, Layers } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/admin/login');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const links = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/content', label: 'Gestor de Contenido', icon: Layers },
        { href: '/admin/leads', label: 'Bandeja de Leads', icon: MessageSquare },
        { href: '/admin/seo', label: 'Gestor SEO', icon: Globe },
        { href: '/admin/blog', label: 'Blog', icon: FileText },
        // { href: '/admin/settings', label: 'Configuración', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
            <div className="border-b border-gray-800 flex justify-start px-6 py-6">
                <img src="/images/logo-creativa.png" alt="Creativa Logo" className="h-10 w-auto" />
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {links.map(link => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
