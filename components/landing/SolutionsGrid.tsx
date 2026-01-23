import { Settings, Server, Code, CheckCircle, Shield, Zap, Cloud, Database, Lock, Cpu, Network, HardDrive, Wifi, Globe } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getSolutionsMeta } from '@/lib/content';

const iconMap: Record<string, any> = {
    Settings, Server, Code, CheckCircle, Shield, Zap, Cloud, Database, Lock, Cpu, Network, HardDrive, Wifi, Globe
};

async function getSolutions() {
    try {
        const querySnapshot = await getDocs(collection(db, 'solutions'));
        const solutions: any[] = [];
        querySnapshot.forEach((doc) => {
            solutions.push({ id: doc.id, ...doc.data() });
        });
        return solutions;
    } catch (error) {
        console.error("Error fetching solutions:", error);
        return [];
    }
}

export default async function SolutionsGrid() {
    const solutions = await getSolutions();
    const meta = await getSolutionsMeta();

    return (
        <section id="solutions" className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                        {meta.title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {meta.description}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {solutions.map((solution) => {
                        const Icon = iconMap[solution.icon] || Settings;

                        return (
                            <div
                                key={solution.id}
                                className="group p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                                    <Icon size={32} strokeWidth={1.5} />
                                </div>

                                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                    {solution.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    {solution.description}
                                </p>

                                <ul className="space-y-3">
                                    {solution.features?.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                                            <CheckCircle size={16} className="text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
