import Header from '@/components/landing/Header';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="min-h-screen">
                {children}
            </main>
            <footer className="bg-gray-900 border-t border-gray-800 text-white py-12">
                <div className="container mx-auto px-4 text-center text-gray-400">
                    <p>© {new Date().getFullYear()} NetSystemsDc. Todos los derechos reservados.</p>
                </div>
            </footer>
        </>
    );
}
