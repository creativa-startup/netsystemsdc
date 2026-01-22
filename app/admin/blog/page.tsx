"use client";
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function BlogAdminPage() {
    // Mock data
    const posts = [
        { id: 1, title: 'La Importancia del Mantenimiento Preventivo', status: 'published', date: '21/01/2026' },
        { id: 2, title: 'Tendencias en Infraestructura Cloud', status: 'draft', date: '18/01/2026' },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <FileText className="text-purple-600" /> Blog
                </h1>
                <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                    <Plus size={20} /> Nuevo Post
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-4 font-medium">Título</th>
                            <th className="px-6 py-4 font-medium">Estado</th>
                            <th className="px-6 py-4 font-medium">Fecha</th>
                            <th className="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {posts.map(post => (
                            <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{post.title}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'published'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                        }`}>
                                        {post.status === 'published' ? 'Publicado' : 'Borrador'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500">{post.date}</td>
                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                        <Edit size={18} />
                                    </button>
                                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
