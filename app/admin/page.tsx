"use client";
import { Users, Search, TrendingUp, Activity } from 'lucide-react';
import ConnectionStatus from '@/components/admin/ConnectionStatus';

export default function AdminDashboard() {
    // Mock data for Analytics and Search Console
    const analyticsData = {
        activeUsers: 124,
        pageViews: '2.4k',
        bounceRate: '45%'
    };

    const topKeywords = [
        { keyword: 'mantenimiento it', clicks: 450, impressions: 8500 },
        { keyword: 'infraestructura de redes', clicks: 320, impressions: 6200 },
        { keyword: 'licencias microsoft', clicks: 210, impressions: 4100 },
        { keyword: 'soporte tecnico empresas', clicks: 180, impressions: 3800 },
        { keyword: 'netsystems dc', clicks: 150, impressions: 1200 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Inteligencia</h1>
                <ConnectionStatus />
            </div>

            {/* Real-time metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Usuarios Activos</h3>
                        <span className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <Activity size={20} />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.activeUsers}</div>
                    <div className="text-xs text-green-500 mt-2 flex items-center gap-1">
                        <TrendingUp size={12} /> +12% vs última hora
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">Vistas de Página</h3>
                        <span className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{analyticsData.pageViews}</div>
                    <div className="text-xs text-blue-500 mt-2">Últimos 7 días</div>
                </div>

                {/* More widgets... */}
            </div>

            {/* Search Console Keywords */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Search size={20} className="text-blue-500" /> Top Palabras Clave (Search Console)
                    </h2>
                    <select className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm px-3 py-1">
                        <option>Últimos 28 días</option>
                        <option>Últimos 7 días</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th className="px-6 py-3 rounded-l-lg">Palabra Clave</th>
                                <th className="px-6 py-3">Clicks</th>
                                <th className="px-6 py-3">Impresiones</th>
                                <th className="px-6 py-3 rounded-r-lg text-right">CTR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topKeywords.map((k, i) => (
                                <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{k.keyword}</td>
                                    <td className="px-6 py-4">{k.clicks}</td>
                                    <td className="px-6 py-4 text-gray-500">{k.impressions}</td>
                                    <td className="px-6 py-4 text-right font-medium text-blue-600">
                                        {((k.clicks / k.impressions) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
