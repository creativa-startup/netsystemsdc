import Image from 'next/image';
import { getHeroContent } from '@/lib/content';

export default async function HeroSection() {
    const content = await getHeroContent();

    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gray-900 text-white">
            {/* Background with overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={content.bgImage}
                    alt="Infrastructure Background"
                    fill
                    className="object-cover opacity-30"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-gray-900/90" />
            </div>

            <div className="container mx-auto px-6 lg:px-[100px] relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Expertos en Infraestructura IT
                    </div>

                    <h1
                        className={`font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-gray-400 ${content.titleSize || 'text-5xl md:text-7xl'}`}
                        style={{
                            color: content.titleColor ? content.titleColor : undefined,
                            // Override gradient if custom color is set, or keep gradient?
                            // Request said "change text color". If user sets color, we should likely force it.
                            // However, bg-clip-text might interfere. Let's make it conditional or style override.
                            backgroundImage: content.titleColor ? 'none' : undefined,
                            WebkitTextFillColor: content.titleColor ? content.titleColor : undefined
                        }}
                    >
                        {content.title}
                    </h1>

                    <p
                        className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed"
                        style={{ color: content.subtitleColor || '#d1d5db' }}
                    >
                        {content.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                            {content.ctaText}
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-600 hover:border-gray-400 hover:bg-white/5 text-white rounded-full font-medium text-lg transition-all">
                            Ver Catálogo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
