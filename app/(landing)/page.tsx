import HeroSection from '@/components/landing/HeroSection';
import SolutionsGrid from '@/components/landing/SolutionsGrid';
import Catalog from '@/components/landing/Catalog';
import BlogSection from '@/components/landing/BlogSection';
import ContactSection from '@/components/landing/ContactSection';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
    return (
        <>
            <HeroSection />
            <SolutionsGrid />
            <Catalog />
            <BlogSection />
            <ContactSection />
        </>
    );
}
