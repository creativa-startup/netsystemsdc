"use client";

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-black/80 dark:border-gray-800">
            <div className="container mx-auto px-6 lg:px-[100px] h-20 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl tracking-tighter text-blue-700 dark:text-blue-500">
                    NetSystemsDc
                </Link>

                {/* Right Side Group */}
                <div className="flex items-center gap-8">
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#solutions" className="text-sm font-medium hover:text-blue-600 transition-colors">
                            Soluciones
                        </Link>
                        <Link href="#catalog" className="text-sm font-medium hover:text-blue-600 transition-colors">
                            Catálogo
                        </Link>
                        <Link href="/blog" className="text-sm font-medium hover:text-blue-600 transition-colors">
                            Blog
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20">
                            Solicitar Consultoría
                        </button>
                        <button
                            className="md:hidden p-2 text-gray-600"
                            onClick={toggleMenu}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-black border-b border-gray-100 dark:border-gray-800 p-4 flex flex-col gap-4 shadow-xl animate-in slide-in-from-top-5">
                    <Link
                        href="#solutions"
                        className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Soluciones
                    </Link>
                    <Link
                        href="#catalog"
                        className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Catálogo
                    </Link>
                    <Link
                        href="#blog"
                        className="text-lg font-medium p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Blog
                    </Link>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-center font-medium transition-all shadow-lg shadow-blue-600/20">
                        Solicitar Consultoría
                    </button>
                </div>
            )}
        </header>
    );
}
