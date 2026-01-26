"use client";
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { useGlobalConfig } from '@/context/GlobalConfigContext';
import { getContrastColor } from '@/lib/colors';

export default function Blog() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecentPosts = async () => {
            try {
                const q = query(
                    collection(db, 'blog_posts'),
                    where('status', '==', 'published')
                    // Removed orderBy to avoid index error for now, sorting in client
                    // orderBy('date', 'desc'),
                    // limit(3) 
                );
                const snap = await getDocs(q);
                const fetchedPosts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

                // Client-side sort and limit
                fetchedPosts.sort((a, b) => {
                    const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000).getTime() : new Date(a.date).getTime();
                    const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000).getTime() : new Date(b.date).getTime();
                    return dateB - dateA;
                });

                setPosts(fetchedPosts.slice(0, 3));
            } catch (error) {
                console.error("Error fetching recent blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentPosts();
    }, []);

    if (loading) return null; // Or a skeleton

    const { config } = useGlobalConfig();
    const bg = config.page_bg || '#ffffff';
    const contrast = getContrastColor(bg);
    const textColor = contrast === '#ffffff' ? '#ffffff' : '#111827';
    const mutedColor = contrast === '#ffffff' ? '#9ca3af' : '#4b5563';
    const brand = config.primaryColor || '#3b82f6';
    const cardBg = contrast === '#ffffff' ? '#18181b' : '#ffffff';
    const cardBorder = contrast === '#ffffff' ? '#27272a' : '#f3f4f6';


    return (
        <section id="blog" className="py-24 transition-colors" style={{ backgroundColor: bg }}>
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="flex items-end justify-between mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ color: textColor }}>
                            Novedades & Recursos
                        </h2>
                        <p className="max-w-xl text-lg" style={{ color: mutedColor }}>
                            Artículos técnicos y noticias para mantener su empresa actualizada.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="hidden md:flex items-center gap-2 font-bold hover:gap-3 transition-all"
                        style={{ color: brand }}
                    >
                        Ver todo el blog <ArrowRight size={20} />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {posts.length > 0 ? posts.map(post => {
                        // Date formatting
                        let displayDate = 'Reciente';
                        if (post.date) {
                            if (post.date.seconds) {
                                displayDate = new Date(post.date.seconds * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
                            } else {
                                displayDate = String(post.date);
                            }
                        }

                        return (
                            <article key={post.id} className="group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-white/5 flex flex-col"
                                style={{ backgroundColor: cardBg }}
                            >
                                <Link href={`/blog/${post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${post.slug || post.id}`} className="block relative h-56 overflow-hidden">
                                    {post.image_url ? (
                                        <Image
                                            src={post.image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-zinc-800 text-gray-400">
                                            Sin Imagen
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-black backdrop-blur-md shadow-sm">
                                            {post.category || 'General'}
                                        </span>
                                    </div>
                                </Link>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: mutedColor }}>
                                        <Calendar size={14} /> {displayDate}
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 line-clamp-2 transition-colors hover:opacity-80"
                                        style={{ color: textColor }}
                                    >
                                        <Link href={`/blog/${post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${post.slug || post.id}`}>
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <div className="text-sm mb-6 line-clamp-2 flex-1 leading-relaxed opacity-80"
                                        style={{ color: mutedColor }}
                                        dangerouslySetInnerHTML={{ __html: (post.seo_data?.metaDescription || post.title) }}
                                    />

                                    <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800" style={{ borderColor: cardBorder }}>
                                        <Link
                                            href={`/blog/${post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${post.slug || post.id}`}
                                            className="inline-flex items-center gap-2 font-bold text-sm hover:underline"
                                            style={{ color: brand }}
                                        >
                                            Leer Artículo <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        );
                    }) : (
                        <div className="col-span-3 text-center py-20 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 opacity-50">
                            <p>No hay artículos recientes.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center md:hidden">
                    <Link href="/blog" className="inline-flex items-center gap-2 font-bold" style={{ color: brand }}>
                        Ver todo el blog <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
