"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

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
        const unsubscribe = onAuthStateChanged(auth, (authUser) => {
            if (!authUser && pathname !== '/admin/login') {
                router.push('/admin/login');
            } else if (authUser && pathname === '/admin/login') {
                router.push('/admin');
            }
            setUser(authUser);
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
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
            <AdminSidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
