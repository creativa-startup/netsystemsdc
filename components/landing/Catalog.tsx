import { FileText, Download } from 'lucide-react';
import Link from 'next/link';
import { getCatalogContent } from '@/lib/content';

export default async function Catalog() {
    const content = await getCatalogContent();

    return (
        <section id="catalog" className="py-20 bg-blue-600 dark:bg-blue-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/2 -translate-y-1/2">
                <FileText size={400} />
            </div>

            <div className="container mx-auto px-6 lg:px-[100px] relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2 space-y-6">
                        <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                            {content.title}
                        </h2>
                        <p className="text-blue-100 text-lg max-w-md">
                            {content.description}
                        </p>
                    </div>

                    <div className="md:w-1/2 flex flex-col justify-center items-center md:items-end gap-6">
                        {content.catalogLink && (
                            <Link
                                href={content.catalogLink}
                                target="_blank"
                                className="w-full max-w-md bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-center transition-all shadow-xl flex items-center justify-center gap-3 group"
                            >
                                <FileText size={24} className="group-hover:scale-110 transition-transform" />
                                {content.ctaText || 'Descargar Catálogo Completo'}
                                <Download size={20} className="animate-bounce" />
                            </Link>
                        )}

                        <div className="grid gap-4 w-full max-w-md">
                            <Link
                                href="/catalog/technical"
                                className="flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">Catálogo Técnico</div>
                                        <div className="text-sm text-blue-200">Especificaciones y Datasheets</div>
                                    </div>
                                </div>
                                <div className="text-white/50 group-hover:text-white transition-colors">
                                    <Download size={24} />
                                </div>
                            </Link>

                            <Link
                                href="/catalog/prices"
                                className="flex items-center justify-between p-6 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/20 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg">Precios de Licencias</div>
                                        <div className="text-sm text-blue-200">Software y SaaS</div>
                                    </div>
                                </div>
                                <div className="text-white/50 group-hover:text-white transition-colors">
                                    <Download size={24} />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
