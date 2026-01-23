import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getPost(slug: string) {
    try {
        const postsRef = collection(db, 'posts');
        // First try by 'slug' field
        const q = query(postsRef, where('slug', '==', slug), limit(1));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        }

        // Fallback: try by ID if slug might be an ID (optional, but robust)
        // Ignoring for now to strictly follow slug rule, or we could fetch all and filter if needed (inefficient).

        return null;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getPost(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="pt-24 pb-20 bg-white dark:bg-black min-h-screen">
            {/* Standard Container */}
            <div className="container mx-auto px-6 lg:px-[100px]">

                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Volver al Blog
                </Link>

                {/* Content Container - Left Aligned */}
                <div className="max-w-3xl">
                    {/* Header */}
                    <div className="mb-8 text-left">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-4 justify-start">
                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                                {post.category || 'General'}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400 justify-start">
                            <div className="flex items-center gap-2">
                                <User size={18} />
                                <span>{post.author || 'NetSystemsDc'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} />
                                <span>
                                    {post.date?.seconds
                                        ? new Date(post.date.seconds * 1000).toLocaleDateString()
                                        : (post.date || 'Sin fecha')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    {post.image && (
                        <div className="relative w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden mb-12 shadow-lg">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Body Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-loose">
                        {/* Rendering simple text/html or markdown if available. 
                            If 'content' is raw HTML coming from a CMS, we might need dangerouslySetInnerHTML.
                            Assuming simple text paragraphs for now if not rich text. 
                        */}
                        {post.content ? (
                            <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
                        ) : (
                            <p>Sin contenido...</p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}
