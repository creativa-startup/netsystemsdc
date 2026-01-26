"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ChartData {
    date: string;
    leads: number;
    chats: number;
    sales: number;
    views: number;
    blogs: number;
}

interface AnalyticsChartProps {
    data: ChartData[];
    visibleMetrics: {
        leads: boolean;
        chats: boolean;
        sales: boolean;
        views: boolean;
        blogs: boolean;
    };
}

const METRIC_CONFIG = {
    leads: { color: '#3b82f6', label: 'Leads' },
    chats: { color: '#a855f7', label: 'Chats' },
    sales: { color: '#fbbf24', label: 'Ventas' },
    views: { color: '#f43f5e', label: 'Vistas' },
    blogs: { color: '#10b981', label: 'Blogs' }
};

export default function AnalyticsChart({ data, visibleMetrics }: AnalyticsChartProps) {
    return (
        <div className="h-[350px] w-full bg-zinc-950/20 rounded-2xl border border-zinc-900/50 p-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        {Object.entries(METRIC_CONFIG).map(([key, config]) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(str) => {
                            // Parse "YYYY-MM-DD" manually to avoid timezone shifts
                            if (!str) return '';
                            const [year, month, day] = str.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                        }}
                    />
                    <YAxis
                        stroke="#71717a"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#09090b',
                            borderColor: '#27272a',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#f4f4f5'
                        }}
                        itemStyle={{ padding: '2px 0' }}
                    />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 ml-1">{value}</span>}
                    />

                    {visibleMetrics.leads && (
                        <Area
                            type="monotone"
                            dataKey="leads"
                            name="Leads"
                            stroke={METRIC_CONFIG.leads.color}
                            fillOpacity={1}
                            fill="url(#gradient-leads)"
                            strokeWidth={2}
                        />
                    )}
                    {visibleMetrics.chats && (
                        <Area
                            type="monotone"
                            dataKey="chats"
                            name="Chats"
                            stroke={METRIC_CONFIG.chats.color}
                            fillOpacity={1}
                            fill="url(#gradient-chats)"
                            strokeWidth={2}
                        />
                    )}
                    {visibleMetrics.sales && (
                        <Area
                            type="monotone"
                            dataKey="sales"
                            name="Ventas"
                            stroke={METRIC_CONFIG.sales.color}
                            fillOpacity={1}
                            fill="url(#gradient-sales)"
                            strokeWidth={2}
                        />
                    )}
                    {visibleMetrics.views && (
                        <Area
                            type="monotone"
                            dataKey="views"
                            name="Vistas"
                            stroke={METRIC_CONFIG.views.color}
                            fillOpacity={1}
                            fill="url(#gradient-views)"
                            strokeWidth={2}
                        />
                    )}
                    {visibleMetrics.blogs && (
                        <Area
                            type="monotone"
                            dataKey="blogs"
                            name="Blogs"
                            stroke={METRIC_CONFIG.blogs.color}
                            fillOpacity={1}
                            fill="url(#gradient-blogs)"
                            strokeWidth={2}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
