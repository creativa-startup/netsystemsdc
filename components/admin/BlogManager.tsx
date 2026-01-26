"use client";
import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
    Plus, Edit2, Trash2, FileText, Search, Filter,
    Loader2, Eye, Calendar, MoreVertical, Tag, Layout, BarChart, ChevronLeft, Sparkles, Image as ImageIcon, Globe, Save, Upload
} from 'lucide-react';

export default function BlogManager() {
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [subTab, setSubTab] = useState<'all' | 'drafts' | 'performance'>('all');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Editor State
    const [activePost, setActivePost] = useState<any>(null); // If editing

    useEffect(() => {
        if (view === 'list') fetchPosts();
    }, [view, subTab]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            let q = query(collection(db, 'blog_posts'), orderBy('date', 'desc'));
            if (subTab === 'drafts') {
                q = query(collection(db, 'blog_posts'), where('status', '==', 'draft'), orderBy('date', 'desc'));
            }

            const snap = await getDocs(q);
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error("Blog fetch error:", e);
            // Mock data if empty
            setPosts([
                { id: '1', title: 'Infraestructura IT en 2026', category: 'Tecnología', date: '2026-01-22', status: 'published', views: 1250, impressions: 5000 },
                { id: '2', title: 'Seguridad en la Nube', category: 'Ciberseguridad', date: '2026-01-15', status: 'draft', views: 0, impressions: 0 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setActivePost(null); // New post
        setView('editor');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este artículo?')) return;
        try {
            await deleteDoc(doc(db, 'blog_posts', id));
            setPosts(posts.filter(p => p.id !== id));
        } catch (e) {
            console.error(e);
            alert("Error al eliminar");
        }
    };

    if (view === 'editor') {
        return (
            <BlogEditor
                post={activePost}
                onBack={() => setView('list')}
                onSave={() => { setView('list'); fetchPosts(); }}
            />
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Subnav */}
            <div className="flex flex-col space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
                            <FileText className="text-purple-500" /> Gestor de Blog
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">Gestiona tu contenido editorial y noticias.</p>
                    </div>
                    <button
                        onClick={handleCreateNew}
                        className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-xl shadow-purple-900/20"
                    >
                        <Plus size={20} /> Nuevo Artículo
                    </button>
                </div>

                {/* Sub-navigation Tabs */}
                <div className="flex items-center gap-1 border-b border-zinc-800">
                    <button
                        onClick={() => setSubTab('all')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${subTab === 'all' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Todos los Artículos
                    </button>
                    <button
                        onClick={() => setSubTab('drafts')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${subTab === 'drafts' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Borradores
                    </button>
                    <button
                        onClick={() => setSubTab('performance')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${subTab === 'performance' ? 'border-purple-500 text-purple-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        Rendimiento (SEO)
                    </button>
                </div>
            </div>

            {/* List View */}
            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-purple-500" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.map((post) => (
                        <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center group">
                            {/* Thumbnail */}
                            <div className="w-full md:w-48 aspect-video bg-zinc-950 rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                                {post.image_url ? (
                                    <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                                        <Calendar size={12} /> {post.date}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-zinc-100 mb-2 truncate group-hover:text-purple-400 transition-colors">{post.title}</h3>
                                <div className="flex items-center gap-6 text-xs font-medium text-zinc-500">
                                    <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views || 0} Vistas</span>
                                    <span className="flex items-center gap-1.5"><Layout size={14} /> {post.impressions || 0} Impresiones</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 md:self-center self-end">
                                <button
                                    onClick={() => { setActivePost(post); setView('editor'); }}
                                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors tooltip" title="Editar"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <a
                                    href={`/blog/${post.category ? post.category.toLowerCase().replace(/\s+/g, '-') : 'general'}/${post.slug || post.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                                    title="Ver en Web"
                                >
                                    <Globe size={18} />
                                </a>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Eliminar"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            No hay artículos en esta sección.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Editor Component
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { setDoc, addDoc } from 'firebase/firestore';
import { generateBlogContent } from '@/app/actions/generateContent';

function BlogEditor({ post, onBack, onSave }: { post: any, onBack: () => void, onSave: () => void }) {
    const [title, setTitle] = useState(post?.title || '');
    const [content, setContent] = useState(post?.content_html || '');
    const [imageUrl, setImageUrl] = useState(post?.image_url || '');
    const [category, setCategory] = useState(post?.category || 'Tecnología');
    const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');

    // SEO Fields
    const [slug, setSlug] = useState(post?.slug || '');
    const [metaTitle, setMetaTitle] = useState(post?.seo_data?.metaTitle || '');
    const [metaDescription, setMetaDescription] = useState(post?.seo_data?.metaDescription || '');

    // AI Prompt State
    const [promptInput, setPromptInput] = useState('');

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false); // AI State

    // Auto-generate slug from title if empty
    useEffect(() => {
        if (!slug && title) {
            setSlug(title.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '')
            );
        }
    }, [title, slug]);

    const handleGenerate = async () => {
        if (!promptInput) return alert("Escribe una instrucción para la IA primero");
        setGenerating(true);

        const result = await generateBlogContent(promptInput);

        if (result.error) {
            alert("Error IA: " + result.error);
        } else {
            try {
                // Attempt to parse content as JSON
                const parsedContent = JSON.parse(result.content);
                if (parsedContent.content) setContent(parsedContent.content);
                if (parsedContent.slug) setSlug(parsedContent.slug);
                if (parsedContent.metaTitle) setMetaTitle(parsedContent.metaTitle);
                if (parsedContent.metaDescription) setMetaDescription(parsedContent.metaDescription);
            } catch (e) {
                // If not JSON, treat as plain text content
                if (result.content) {
                    setContent(result.content);
                    // Try to guess SEO fields if they are missing in a plain text response (fallback)
                    if (!metaTitle) setMetaTitle(title.substring(0, 60));
                    if (!metaDescription) setMetaDescription(result.content.substring(0, 150));
                }
            }
            // Also check for direct properties on the result object, in case the AI function returns structured data directly
            if (result.slug) setSlug(result.slug);
            if (result.metaTitle) setMetaTitle(result.metaTitle);
            if (result.metaDescription) setMetaDescription(result.metaDescription);
        }

        setGenerating(false);
    };

    const handleSavePost = async () => {
        if (!title) return alert("El título es obligatorio");
        if (!slug) return alert("El slug es obligatorio");

        setSaving(true);
        try {
            const postData = {
                title,
                slug,
                content_html: content,
                image_url: imageUrl,
                category,
                status,
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                author: 'Admin', // Hardcoded for now
                seo_data: { metaTitle, metaDescription }
            };

            if (post?.id) {
                // Update
                await setDoc(doc(db, 'blog_posts', post.id), postData, { merge: true });
            } else {
                // Create
                await addDoc(collection(db, 'blog_posts'), postData);
            }
            onSave();
        } catch (error) {
            console.error("Save error:", error);
            alert("Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-5 duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between sticky top-0 bg-zinc-950/80 backdrop-blur-md z-20 py-4 border-b border-zinc-800">
                <button onClick={onBack} className="text-sm font-bold text-zinc-500 hover:text-white flex items-center gap-2 transition-colors">
                    <ChevronLeft size={16} /> Volver
                </button>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-zinc-500">{status === 'published' ? '🟢 Publicado' : '🟠 Borrador'}</span>

                    {/* Preview Button */}
                    {slug && (
                        <a
                            href={`/blog/${category.toLowerCase().replace(/\s+/g, '-')}/${slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                            title="Ver Previsualización"
                        >
                            <Globe size={18} />
                        </a>
                    )}

                    <button
                        onClick={() => setStatus(status === 'published' ? 'draft' : 'published')}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition-all"
                    >
                        {status === 'published' ? 'Cambiar a Borrador' : 'Publicar Ahora'}
                    </button>
                    <button
                        onClick={handleSavePost}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-900/40"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Guardar
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
                {/* Main Content */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Título del Artículo</label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ej: Estrategias de SEO para 2026..."
                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-5 text-2xl font-bold text-white focus:border-purple-500 outline-none placeholder:text-zinc-700 transition-all"
                        />
                    </div>

                    {/* AI Prompt Section */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={64} className="text-purple-500" />
                        </div>
                        <label className="text-xs font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Asistente Gemini AI
                        </label>
                        <div className="flex gap-4">
                            <textarea
                                value={promptInput}
                                onChange={e => setPromptInput(e.target.value)}
                                placeholder="Dale instrucciones a la IA: 'Escribe un artículo sobre...'"
                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:border-purple-500 outline-none resize-none h-12 py-3"
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all disabled:opacity-50 flex flex-col items-center justify-center min-w-[120px]"
                            >
                                {generating ? <Loader2 className="animate-spin mb-1" size={16} /> : <Sparkles className="mb-1" size={16} />}
                                {generating ? 'Generando...' : 'Generar IA'}
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-600 px-1">
                            Tip: Sé específico con el tono, la audiencia y los puntos clave que quieres cubrir.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Contenido (Editor Markdown/HTML)</label>
                        <div className="relative group">
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="El contenido generado aparecerá aquí..."
                                className="w-full min-h-[600px] bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 text-zinc-300 focus:border-purple-500 outline-none font-mono text-sm leading-relaxed resize-y"
                            />
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="px-2 py-1 bg-black/50 text-xs text-zinc-400 rounded">Markdown Supported</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-800 pb-4">
                            <ImageIcon size={14} /> Multimedia
                        </h3>

                        <div className="space-y-3">
                            <label className="text-xs font-medium text-zinc-400">Imagen de Portada</label>
                            <div className="aspect-video bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden relative group">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                                        <ImageIcon size={24} />
                                        <span className="text-[10px]">Sin imagen</span>
                                    </div>
                                )}

                                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            if (!e.target.files?.[0]) return;
                                            const file = e.target.files[0];
                                            setUploading(true);
                                            try {
                                                const storageRef = ref(storage, `blog/covers/${Date.now()}_${file.name}`);
                                                await uploadBytes(storageRef, file);
                                                const url = await getDownloadURL(storageRef);
                                                setImageUrl(url);
                                            } catch (error) {
                                                console.error("Upload failed", error);
                                                alert("Error al subir imagen");
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                    />
                                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                                        {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                                        {uploading ? 'Subiendo...' : 'Cambiar'}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 border-b border-zinc-800 pb-4">
                            <Tag size={14} /> Organización
                        </h3>
                        <div className="space-y-3">
                            <label className="text-xs font-medium text-zinc-400">Categoría</label>
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none focus:border-purple-500"
                            >
                                <option>Tecnología</option>
                                <option>Ciberseguridad</option>
                                <option>Cloud Computing</option>
                                <option>Infraestructura</option>
                                <option>Noticias</option>
                            </select>
                        </div>

                        {/* SEO Fields in Sidebar */}
                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Configuración SEO</h3>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">URL Slug</label>
                                <input
                                    value={slug}
                                    onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-mono"
                                    placeholder="mi-articulo-increible"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Meta Title</label>
                                <input
                                    value={metaTitle}
                                    onChange={e => setMetaTitle(e.target.value)}
                                    maxLength={60}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300"
                                    placeholder="Título para Google (60 chars)"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Meta Description</label>
                                <textarea
                                    value={metaDescription}
                                    onChange={e => setMetaDescription(e.target.value)}
                                    maxLength={160}
                                    rows={3}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 resize-none"
                                    placeholder="Descripción corta para resultados de búsqueda..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO Suggestions Mock */}
                    <div className="bg-gradient-to-b from-blue-900/10 to-transparent border border-blue-900/20 rounded-3xl p-6 space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                            <Sparkles size={14} /> Sugerencias SEO
                        </h3>
                        <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                            <li>Palabra clave recomendada: <strong>"soluciones cloud ecuador"</strong>.</li>
                            <li>La longitud del título es óptima.</li>
                            <li>Agrega al menos 1 enlace interno.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
