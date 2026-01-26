"use client";
import LiveChatAdmin from '@/components/admin/LiveChatAdmin';
import { MessageSquare } from 'lucide-react';


export default function AdminChatPage() {
    return (
        <div className="h-full w-full animate-in fade-in duration-500">
            <LiveChatAdmin />
        </div>
    );
}
