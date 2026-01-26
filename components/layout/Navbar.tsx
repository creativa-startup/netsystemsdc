"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useGlobalConfig } from '@/context/GlobalConfigContext';

import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getContrastColor } from '@/lib/colors';

export default function Navbar({ previewData }: { previewData?: any }) {
    const { config } = useGlobalConfig();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [navData, setNavData] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        if (previewData) {
            setNavData(previewData);
            return;
        }

        const unsub = onSnapshot(doc(db, 'settings', 'landing'), (snap) => {
            if (snap.exists() && snap.data().navbar) {
                setNavData(snap.data().navbar);
            }
        });
        return () => unsub();
    }, [previewData]);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const links = navData?.links || [
        { label: 'Soluciones', href: '#solutions' },
        { label: 'Catálogo', href: '#catalog' },
        { label: 'Blog', href: '#blog' }
    ];

    const cta = navData?.cta || { label: 'Solicitar Consultoría', href: '#contact' };

    // Helper to fix anchors when not on home page
    const getHref = (href: string) => {
        if (href.startsWith('#')) {
            if (pathname === '/') return href;
            return `/${href}`;
        }
        return href;
    };

    const bgColor = navData?.backgroundColor;
    // Calculate contrast if bg is defined and hex, otherwise default to black text (assuming light/glass bg)
    const contrastRaw = (bgColor && bgColor.startsWith('#')) ? getContrastColor(bgColor) : '#000000';
    const textColor = contrastRaw === '#ffffff' ? '#f3f4f6' : '#111827';
    // For mobile menu bg: use solid color if defined, else white/black default
    const mobileMenuBg = bgColor || '#ffffff'; // Fallback to white if transparent

    return (
        <header
            className="fixed top-0 w-full z-50 transition-colors backdrop-blur-md"
            style={{
                backgroundColor: bgColor || 'rgba(255, 255, 255, 0.9)'
            }}
        >
            <div className="container mx-auto px-6 lg:px-[100px] h-20 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl tracking-tighter transition-colors flex items-center gap-2">
                    {/* Logo Icon */}
                    {config.logoIconUrl && (
                        <div className="rounded-full overflow-hidden shadow-sm">
                            <img
                                src={config.logoIconUrl}
                                alt="Brand Icon"
                                className="w-auto object-cover"
                                style={{ height: `${(config.logoSize || 32)}px`, width: `${(config.logoSize || 32)}px` }}
                            />
                        </div>
                    )}

                    {config.logoType === 'image' && config.logoUrl ? (
                        <img
                            src={config.logoUrl}
                            alt="Logo"
                            className="w-auto object-contain"
                            style={{ height: `${config.logoSize || 32}px` }}
                        />
                    ) : (
                        <span
                            className="font-bold tracking-tighter" // Removed text-primary to allow override if needed, or keep? Usually logo is brand color.
                            // User asked for "textos del navbar". Logo is brand. Let's keep brand color unless bg is brand color?
                            // For simplicity, let's keep logo as Primary Color (brand) always, unless contrast issue?
                            // I'll keep text-primary for logo. 
                            style={{
                                color: 'var(--color-primary)', // Ensure primary var usage
                                fontFamily: config.fontFamily,
                                fontSize: `${(config.logoSize || 32) * 0.8}px`
                            }}
                        >
                            {config.logoText || 'NetSystemsDc'}
                        </span>
                    )}
                </Link>

                {/* Right Side Group */}
                <div className="flex items-center gap-8">
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {links.map((item: any, i: number) => (
                            <Link
                                key={i}
                                href={getHref(item.href)}
                                className="text-sm font-bold transition-colors hover:text-blue-600 dark:hover:text-blue-400"
                                style={{ color: textColor }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href={getHref(cta.href)}
                            className="hidden md:block bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20"
                            style={{
                                backgroundColor: 'var(--color-primary)',
                                color: 'var(--color-primary-text)'
                            }}
                        >
                            {cta.label}
                        </Link>
                        <button
                            className="md:hidden p-2 transition-colors"
                            onClick={toggleMenu}
                            style={{ color: textColor }}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div
                    className="md:hidden absolute top-20 left-0 w-full border-b border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5"
                    style={{ backgroundColor: mobileMenuBg }}
                >
                    {links.map((item: any) => (
                        <Link
                            key={item.label}
                            href={getHref(item.href)}
                            className="text-lg font-bold p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors hover:text-blue-600"
                            style={{ color: textColor }}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {item.label}
                        </Link>
                    ))}
                    <Link
                        href={getHref(cta.href)}
                        className="w-full px-5 py-3 rounded-xl text-center font-bold transition-all shadow-lg"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: 'var(--color-primary-text)'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {cta.label}
                    </Link>
                </div>
            )}
        </header>
    );
}
