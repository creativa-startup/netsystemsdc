import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BlogSection() {
    // Mock data for now
    const posts = [
        {
            id: 1,
            title: 'La Importancia del Mantenimiento Preventivo en 2026',
            excerpt: 'Descubra cómo evitar tiempos de inactividad costosos con estrategias proactivas.',
            date: '21 Ene, 2026',
            category: 'Mantenimiento'
        },
        {
            id: 2,
            title: 'Tendencias en Infraestructura Cloud Híbrida',
            excerpt: '¿Por qué las empresas están adoptando modelos híbridos para mayor seguridad?',
            date: '18 Ene, 2026',
            category: 'Cloud'
        },
        {
            id: 3,
            title: 'Optimización de Costos en Licencias de Software',
            excerpt: 'Estrategias para gestionar su portafolio de software corporativo eficientemente.',
            date: '10 Ene, 2026',
            category: 'Gestión'
        }
    ];

    return (
        <section id="blog" className="py-24 bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                            Novedades & Recursos
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Artículos técnicos y noticias para mantener su empresa actualizada.
                        </p>
                    </div>
                    <Link href="/blog" className="hidden md:flex items-center gap-2 text-blue-600 font-medium hover:gap-3 transition-all">
                        Ver todo el blog <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <article key={post.id} className="bg-white dark:bg-black rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
                            <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse-slow relative">
                                {/* Placeholder for blog image */}
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    Imagen del Post
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="text-xs font-semibold text-blue-600 mb-3">{post.category}</div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                    <span>{post.date}</span>
                                    <Link href={`/blog/${post.id}`} className="text-blue-600 hover:underline">
                                        Leer más
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-blue-600 font-medium">
                        Ver todo el blog <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
