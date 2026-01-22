import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 dark:bg-black/80 dark:border-gray-800">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl tracking-tighter text-blue-700 dark:text-blue-500">
                    NetSystemsDc
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#solutions" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Soluciones
                    </Link>
                    <Link href="#catalog" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Catálogo
                    </Link>
                    <Link href="#blog" className="text-sm font-medium hover:text-blue-600 transition-colors">
                        Blog
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="hidden md:block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20">
                        Solicitar Consultoría
                    </button>
                    <button className="md:hidden p-2 text-gray-600">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
}
