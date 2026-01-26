"use client";
import { useState, useEffect } from 'react';
import { collection, query, limit, onSnapshot, orderBy, doc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, Search, TrendingUp, Activity, BarChart3, Clock, ArrowRight, MessageSquare, ShieldCheck, Cpu, FileText, Calendar as CalendarIcon, Filter, CheckSquare, Square } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, isWithinInterval } from 'date-fns';
import AnalyticsChart from './AnalyticsChart';

const safeToDate = (ts: any) => {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    if (ts instanceof Date) return ts;
    if (ts.seconds) return new Date(ts.seconds * 1000);
    return null;
};

export default function DashboardHome({ onNavigate }: { onNavigate?: (module: string) => void }) {
    const [stats, setStats] = useState({
        leadsCount: 0,
        chatsCount: 0,
        blogsCount: 0,
        viewsCount: 0,
        salesCount: 0,
        recentLeads: [] as any[],
        uptime: '99.9%'
    });

    const [cityStats, setCityStats] = useState<{ [key: string]: number }>({});

    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });

    const [chartData, setChartData] = useState<any[]>([]);
    const [visibleMetrics, setVisibleMetrics] = useState({
        leads: true,
        chats: true,
        sales: true,
        views: true,
        blogs: true
    });

    const [rawLeads, setRawLeads] = useState<any[]>([]);
    const [rawChats, setRawChats] = useState<any[]>([]);
    const [rawBlogs, setRawBlogs] = useState<any[]>([]);
    const [rawViews, setRawViews] = useState<any[]>([]);

    useEffect(() => {
        const unsubLeads = onSnapshot(query(collection(db, 'leads'), orderBy('createdAt', 'desc')), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawLeads(data);
            setStats(s => ({ ...s, recentLeads: data.slice(0, 5) }));
        });

        const unsubChats = onSnapshot(collection(db, 'chats'), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawChats(data);
        });

        const unsubPosts = onSnapshot(collection(db, 'posts'), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawBlogs(data);
        });

        const unsubViews = onSnapshot(doc(db, 'settings', 'stats'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setStats(s => ({ ...s, viewsCount: data.totalViews || 0 }));
                setCityStats(data.cities || {});
            }
        });

        const unsubDailyViews = onSnapshot(collection(db, 'analytics_daily'), (snap) => {
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRawViews(data);
        });

        return () => {
            unsubLeads();
            unsubChats();
            unsubPosts();
            unsubViews();
            unsubDailyViews();
        };
    }, []);

    // 6. Integrated Data Processing (Chart + Metric Cards)
    useEffect(() => {
        const start = startOfDay(new Date(dateRange.start + 'T00:00:00'));
        const end = endOfDay(new Date(dateRange.end + 'T00:00:00'));
        const interval = eachDayOfInterval({ start, end });

        let totalLeads = 0;
        let totalChats = 0;
        let totalSales = 0;
        let totalBlogs = 0;
        let totalViews = 0;
        let totalDirect = 0;
        let totalOrganic = 0;
        let totalProjectedValue = 0;

        const processedData = interval.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');

            const dayLeads = rawLeads.filter(l => {
                const date = safeToDate(l.createdAt);
                return date && format(date, 'yyyy-MM-dd') === dayStr;
            });

            const dayChats = rawChats.filter(c => {
                const date = safeToDate(c.updatedAt || c.createdAt);
                return date && format(date, 'yyyy-MM-dd') === dayStr;
            });

            // Calculate Value for this day
            const dayValue = [
                ...dayLeads,
                ...dayChats
            ].reduce((acc, curr) => acc + (curr.value || 0), 0);

            const dayBlogs = rawBlogs.filter(b => {
                const date = safeToDate(b.createdAt);
                return date && format(date, 'yyyy-MM-dd') === dayStr;
            });

            const daySales = [
                ...rawLeads.filter(l => {
                    if (l.status !== 'cliente') return false;
                    const date = safeToDate(l.updatedAt || l.createdAt);
                    return date && format(date, 'yyyy-MM-dd') === dayStr;
                }),
                ...rawChats.filter(c => {
                    if (c.status !== 'cliente') return false;
                    const date = safeToDate(c.updatedAt || c.createdAt);
                    return date && format(date, 'yyyy-MM-dd') === dayStr;
                })
            ];

            const foundViewDaily = rawViews.find(v => v.id === dayStr);
            const dayViews = foundViewDaily ? foundViewDaily.views : 0;
            const dayDirect = foundViewDaily ? (foundViewDaily.direct || 0) : 0;
            const dayOrganic = foundViewDaily ? (foundViewDaily.organic || 0) : 0;

            totalLeads += dayLeads.length;
            totalChats += dayChats.length;
            totalSales += daySales.length;
            totalBlogs += dayBlogs.length;
            totalViews += dayViews;
            totalDirect += dayDirect;
            totalOrganic += dayOrganic;
            totalProjectedValue += dayValue;

            return {
                date: dayStr,
                leads: dayLeads.length,
                chats: dayChats.length,
                sales: daySales.length,
                views: dayViews,
                blogs: dayBlogs.length
            };
        });

        setChartData(processedData);
        setStats(s => ({
            ...s,
            leadsCount: totalLeads,
            chatsCount: totalChats,
            salesCount: totalSales,
            blogsCount: totalBlogs,
            viewsCount: totalViews,
            // @ts-ignore
            directCount: totalDirect,
            // @ts-ignore
            organicCount: totalOrganic,
            // @ts-ignore
            projectedValue: totalProjectedValue
        }));
    }, [dateRange, rawLeads, rawChats, rawBlogs, rawViews]);

    const metrics = [
        { label: 'Leads Web', value: stats.leadsCount, icon: MessageSquare, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Chat en Vivo', value: stats.chatsCount, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Artículos Blog', value: stats.blogsCount, icon: FileText, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Vistas Totales', value: stats.viewsCount, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { label: 'Ventas Totales', value: stats.salesCount, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-400/10' },
        {
            label: 'Proyección',
            // @ts-ignore
            value: `$${(stats.projectedValue || 0).toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-yellow-400',
            bg: 'bg-yellow-400/10'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-sans text-zinc-100 tracking-tight">Bienvenido, Admin</h1>
                    <p className="text-zinc-500 text-sm mt-1 font-medium">Aquí tienes un resumen de lo que está sucediendo hoy en NetSystemsDc.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 gap-3">
                        <CalendarIcon size={14} className="text-blue-500" />
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-300 outline-none uppercase"
                            />
                            <span className="text-zinc-600 text-xs">—</span>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                className="bg-transparent border-none text-[10px] font-bold text-zinc-300 outline-none uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl hover:border-zinc-700 transition-all hover:scale-[1.02] cursor-default">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${m.bg} ${m.color}`}>
                                <m.icon size={22} />
                            </div>
                            {/* Proyeccion icon distinction or logic */}
                            <TrendingUp size={16} className={m.label === 'Proyección' ? "text-yellow-500" : "text-emerald-500"} />
                        </div>
                        <div className="text-3xl font-bold text-zinc-100 tracking-tight">{m.value}</div>
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-600 mt-2">{m.label}</div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-[1fr_450px] gap-6">
                {/* Column 1: Chart & Leads */}
                <div className="space-y-6">
                    {/* Analytics Chart Section */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col p-6 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                                <BarChart3 size={18} className="text-blue-500" /> Evolución Cronológica
                            </h3>
                            <div className="flex flex-wrap gap-4">
                                {Object.entries(visibleMetrics).map(([key, isVisible]) => (
                                    <button
                                        key={key}
                                        onClick={() => setVisibleMetrics(prev => ({ ...prev, [key]: !isVisible }))}
                                        className="flex items-center gap-2 group cursor-pointer"
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isVisible ? 'bg-blue-500 border-blue-500' : 'border-zinc-700 bg-zinc-950'
                                            }`}>
                                            {isVisible ? <CheckSquare size={10} className="text-white" /> : <div className="w-1.5 h-1.5 bg-zinc-800 rounded-sm" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isVisible ? 'text-zinc-300' : 'text-zinc-600 group-hover:text-zinc-400'
                                            }`}>
                                            {key === 'leads' ? 'Leads' : key === 'chats' ? 'Chats' : key === 'sales' ? 'Ventas' : key === 'blogs' ? 'Blogs' : 'Vistas'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>


                        <AnalyticsChart data={chartData} visibleMetrics={visibleMetrics} />
                    </div>


                    {/* Recent Activity / Leads */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className="font-bold text-zinc-200 flex items-center gap-2">
                                <Activity size={18} className="text-emerald-500" /> Leads Recientes
                            </h3>
                            <button
                                onClick={() => onNavigate?.('leads')}
                                className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 group"
                            >
                                Ver todos <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex-1 divide-y divide-zinc-800">
                            {stats.recentLeads.length > 0 ? stats.recentLeads.map((lead, i) => (
                                <div
                                    key={i}
                                    onClick={() => onNavigate?.('leads')}
                                    className="p-6 hover:bg-zinc-950 transition-colors flex items-center justify-between gap-4 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-zinc-500 text-xs group-hover:bg-blue-500/10 group-hover:text-blue-400 transition-colors">
                                            {lead.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">{lead.name}</div>
                                            <div className="text-xs text-zinc-500">{lead.service}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-600 uppercase">
                                        {lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString() : 'Hoy'}
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center p-12 text-zinc-600 italic text-sm">
                                    No hay leads registrados recientemente.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Column 2: Quick Info Box */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 text-zinc-300 p-8 rounded-3xl relative overflow-hidden group border border-zinc-800">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <TrendingUp size={200} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            <TrendingUp size={20} className="text-zinc-500" /> Principales Ciudades
                        </h3>
                        <div className="space-y-3 mb-6">
                            {Object.entries(cityStats)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 5)
                                .map(([city, count], i) => {
                                    const total = Object.values(cityStats).reduce((acc, curr) => acc + curr, 0);
                                    const percentage = Math.round((count / total) * 100);

                                    return (
                                        <div key={city} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-zinc-400">{city}</span>
                                                <span className="text-zinc-500">{count} visitas</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            {Object.keys(cityStats).length === 0 && (
                                <div className="text-zinc-600 text-sm italic">Esperando datos geográficos...</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-emerald-500 p-8 rounded-3xl text-white relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <Search size={200} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Tráfico Orgánico</h3>
                        <p className="text-emerald-100 text-sm leading-relaxed mb-6">
                            Visitantes que llegan desde buscadores.
                        </p>
                        <div className="text-4xl font-bold mb-1 font-sans">
                            {/* @ts-ignore */}
                            {stats.organicCount || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/60">
                            Esta semana
                        </div>
                    </div>

                    <div className="bg-cyan-500 p-8 rounded-3xl text-white relative overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                            <ArrowRight size={200} />
                        </div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                            Tráfico Directo
                        </h3>
                        <p className="text-cyan-100 text-sm leading-relaxed mb-6">
                            Visitantes que escriben tu URL directamente.
                        </p>
                        <div className="text-4xl font-bold mb-1 font-sans">
                            {/* @ts-ignore */}
                            {stats.directCount || 0}
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-100/60">
                            Esta semana
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}
