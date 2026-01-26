"use client";

import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import Showcase from '@/components/home/Showcase';
import Contact from '@/components/home/Contact';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface MiniLandingPreviewProps {
    colorState: {
        primary: string;
        hero_overlay: string;
        features_bg: string;
        about_bg: string;
        showcase_bg: string;
        contact_bg: string;
    };
    baseData: {
        hero: any;
        features: any;
        about: any;
        showcase: any;
        contact: any;
        navbar: any;
        footer: any;
    };
}

export default function MiniLandingPreview({ colorState, baseData }: MiniLandingPreviewProps) {
    const { getContrastColor } = require('@/lib/colors'); // Require to avoid SSR issues if simple import fails, though import is fine normally.

    // Prepare override data based on colorState
    const heroContrast = getContrastColor(colorState.hero_overlay);
    const heroData = {
        ...baseData.hero,
        overlayColor: colorState.hero_overlay,
        // Force calculated text colors for preview to demonstrate auto-contrast
        // logic unless we add specific text color pickers later.
        titleColor: heroContrast,
        subtitleColor: heroContrast === '#ffffff' ? '#d1d5db' : '#4b5563'
    };

    const featuresMeta = {
        ...baseData.features,
        title: baseData.features?.title || 'Features Preview',
        description: baseData.features?.description || 'Description preview...',
        backgroundColor: colorState.features_bg,
        titleColor: getContrastColor(colorState.features_bg),
        textColor: getContrastColor(colorState.features_bg) === '#ffffff' ? '#d1d5db' : '#4b5563'
    };

    const aboutData = {
        ...baseData.about,
        title: baseData.about?.title || 'About Preview',
        backgroundColor: colorState.about_bg,
        titleColor: getContrastColor(colorState.about_bg),
        textColor: getContrastColor(colorState.about_bg) === '#ffffff' ? '#d1d5db' : '#4b5563'
    };

    const showcaseData = {
        ...baseData.showcase,
        title: baseData.showcase?.title || 'Showcase Preview',
        backgroundColor: colorState.showcase_bg,
        titleColor: getContrastColor(colorState.showcase_bg),
        textColor: getContrastColor(colorState.showcase_bg) === '#ffffff' ? '#d1d5db' : '#4b5563'
    };

    const contactData = {
        ...baseData.contact,
        title: baseData.contact?.title || 'Contact Preview',
        backgroundColor: colorState.contact_bg,
        titleColor: getContrastColor(colorState.contact_bg),
        textColor: getContrastColor(colorState.contact_bg) === '#ffffff' ? '#d1d5db' : '#4b5563'
    };

    // Navbar and Footer don't have overrides in this iteration yet (unless we added them to presets for background?), 
    // but we pass baseData so they render correctly in preview (avoiding firebase listener inside preview)
    const navbarData = baseData.navbar || {};
    const footerData = baseData.footer || {};

    return (
        <div
            className="w-full h-full bg-white dark:bg-black rounded-xl shadow-2xl relative overflow-hidden"
            style={{
                '--color-primary': colorState.primary,
                '--color-primary-text': getContrastColor(colorState.primary)
            } as React.CSSProperties}
        >
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
                <div className="w-[100%] origin-top-left scale-[1] md:w-[200%] md:scale-[0.5]">
                    <Navbar previewData={navbarData} />
                    <Hero previewData={heroData} />
                    <Features previewData={{ meta: featuresMeta }} />
                    <About previewData={aboutData} />
                    <Showcase previewData={showcaseData} />
                    <Contact previewData={contactData} />
                    <Footer previewData={footerData} />
                </div>
            </div>
        </div>
    );
}
