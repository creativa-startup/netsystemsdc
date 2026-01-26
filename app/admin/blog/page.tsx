"use client";
import BlogManager from '@/components/admin/BlogManager';

export default function AdminBlogPage() {
    return (
        <div className="p-8 h-full custom-scrollbar overflow-y-auto">
            <BlogManager />
        </div>
    );
}
