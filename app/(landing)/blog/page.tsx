import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

export const revalidate = 60;

async function getPosts() {
    try {
        const postsRef = collection(db, 'blog_posts');
        // Filter by status, sort client-side to avoid index error
        const q = query(postsRef, where('status', '==', 'published'));
        const snapshot = await getDocs(q);

        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];

        // Sort by date desc
        return posts.sort((a, b) => {
            const dateA = a.date?.seconds ? new Date(a.date.seconds * 1000).getTime() : new Date(a.date).getTime();
            const dateB = b.date?.seconds ? new Date(b.date.seconds * 1000).getTime() : new Date(b.date).getTime();
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
}

export default async function BlogIndex() {
    const posts = await getPosts();

    return (
        <div className="pt-24 pb-20 bg-gray-50 dark:bg-black min-h-screen">
            <div className="container mx-auto px-6 lg:px-[100px]">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                        Nuestro Blog
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Insights, noticias y guías técnicas sobre infraestructura IT y transformación digital.
                    </p>
                </div>

                {/* Grid */}
                {posts.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-8">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${post.slug || post.id}`}
                                className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
                            >
                                <div className="relative h-60 w-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                                    {post.image_url ? (
                                        <Image
                                            src={post.image_url}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                            Sin Imagen
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-3">
                                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                            {post.category || 'General'}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 text-sm flex-1">
                                        {post.excerpt || post.content?.substring(0, 100) + '...'}
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-4 mt-auto">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} />
                                            {/* Handle Timestamp or String date */}
                                            {post.date?.seconds
                                                ? new Date(post.date.seconds * 1000).toLocaleDateString()
                                                : (post.date || 'Sin fecha')}
                                        </div>
                                        <span className="text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                                            Leer más →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <p className="text-xl text-gray-500">No hay artículos publicados aún.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
