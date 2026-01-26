"use client";
import LeadInbox from '@/components/admin/LeadInbox';

export default function AdminLeadsPage() {
    return (
        <div className="p-8 h-full custom-scrollbar overflow-y-auto">
            <LeadInbox />
        </div>
    );
}
