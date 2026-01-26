import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import Showcase from '@/components/home/Showcase';
import Contact from '@/components/home/Contact';
import Blog from '@/components/home/Blog';
import { getSiteSettings } from '@/lib/content';

export default function LandingPage() {
    // Static build defaults (Client components will hydrate with real data)
    const settings = {
        showBlog: true, // Render by default, let client hide if needed or just keep it
    };

    return (
        <>
            <section id="hero">
                <Hero />
            </section>
            <section id="features">
                <Features />
            </section>
            <section id="about">
                <About />
            </section>
            <section id="showcase">
                <Showcase />
            </section>
            <section id="contact">
                <Contact />
            </section>
            {settings.showBlog && (
                <section id="blog">
                    <Blog />
                </section>
            )}
        </>
    );
}
