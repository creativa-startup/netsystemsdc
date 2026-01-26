"use client";
import ContentManager from '@/components/admin/ContentManager';

export default function AdminContentPage() {
    return (
        <div className="p-8 h-full custom-scrollbar overflow-y-auto">
            <ContentManager />
        </div>
    );
}
