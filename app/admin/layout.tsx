"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

const ALLOWED_EMAILS = [
    'netsystemsdc@gmail.com',
    'renatomasa@gmail.com',
    'startup@creativa.rocks'
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                if (ALLOWED_EMAILS.includes(authUser.email || '')) {
                    if (pathname === '/admin/login') {
                        router.push('/admin');
                    }
                    setUser(authUser);
                } else {
                    await signOut(auth);
                    setUser(null);
                    if (pathname !== '/admin/login') {
                        router.push('/admin/login');
                    }
                }
            } else {
                setUser(null);
                if (pathname !== '/admin/login') {
                    router.push('/admin/login');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-black">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>;
    }

    // If on login page, render without sidebar
    if (pathname === '/admin/login') {
        return <main className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center p-4">
            {children}
        </main>;
    }

    // Protected Admin content
    if (!user) return null; // Should redirect via useEffect

    return (
        <div className="min-h-screen bg-zinc-950 flex font-sans antialiased text-zinc-200">
            {/* Sidebar global for all admin pages */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen flex flex-col bg-zinc-950">
                {/* Global Header */}
                <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <div className="text-sm font-bold tracking-widest text-zinc-500 uppercase">
                            Admin <span className="text-zinc-700">/</span> <span className="text-zinc-300">
                                {pathname === '/admin' ? 'Dashboard' : pathname?.split('/').pop()?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </header>

                {children}

                {/* Footer simple inside admin */}
                <footer className="p-6 border-t border-zinc-900 text-center mt-auto">
                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
                        NetSystemsDc © {new Date().getFullYear()} — Powered by Creativa
                    </p>
                </footer>
            </main>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #27272a;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #3f3f46;
                }
            `}</style>
        </div>
    );
}
