"use client";
import DashboardHome from '@/components/admin/DashboardHome';

export default function AdminDashboard() {
    return (
        <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden custom-scrollbar h-full">
            <div className="max-w-[1400px] mx-auto">
                <DashboardHome />
            </div>
        </div>
    );
}
