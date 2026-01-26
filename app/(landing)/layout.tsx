import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/home/ChatWidget';
import DynamicBackground from '@/components/layout/DynamicBackground';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <DynamicBackground />
            <Navbar />
            <main className="min-h-screen">
                {children}
            </main>
            <Footer />
            <ChatWidget />
        </>
    );
}
