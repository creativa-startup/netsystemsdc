"use client";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Save, LayoutTemplate, Loader2, Upload, Grid, BookOpen, Monitor, Edit, Trash2, Plus, Globe } from 'lucide-react';

interface ContentSection {
    title: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    bgImage?: string;
    titleColor?: string;
    titleSize?: string;
    subtitleColor?: string;
    catalogLink?: string;
}

interface Solution {
    id?: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
}

export default function ContentManagerPage() {
    const [activeTab, setActiveTab] = useState<'hero' | 'solutions' | 'catalog' | 'rrss'>('hero');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const [heroData, setHeroData] = useState<ContentSection>({
        title: '', subtitle: '', ctaText: '', bgImage: '',
        titleColor: '#ffffff', titleSize: 'text-5xl md:text-7xl', subtitleColor: '#d1d5db'
    });
    const [uniqueSolutionsData, setSolutionsData] = useState<ContentSection>({ title: '', description: '' });
    const [catalogData, setCatalogData] = useState<ContentSection>({ title: '', description: '', ctaText: '', catalogLink: '' });
    const [rrssData, setRrssData] = useState({ facebook: '', instagram: '', whatsapp: '' });

    // Solutions CRUD state
    const [solutionsList, setSolutionsList] = useState<Solution[]>([]);
    const [editingSolutionId, setEditingSolutionId] = useState<string | null>(null);
    const [currentSolution, setCurrentSolution] = useState<Solution>({
        title: '',
        description: '',
        icon: 'Settings',
        features: []
    });
    const [featuresInput, setFeaturesInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const heroSnap = await getDoc(doc(db, 'content', 'hero'));
                if (heroSnap.exists()) {
                    const data = heroSnap.data() as any;
                    setHeroData({
                        ...data,
                        titleColor: data.titleColor || '#ffffff',
                        titleSize: data.titleSize || 'text-5xl md:text-7xl',
                        subtitleColor: data.subtitleColor || '#d1d5db'
                    });
                } else {
                    setHeroData({
                        title: '23 Años Liderando Soluciones Integrales',
                        subtitle: 'Continuidad de Negocio Garantizada. Transformamos tu infraestructura tecnológica para el futuro.',
                        ctaText: 'Solicitar Consultoría',
                        bgImage: '/images/Ejemplo Frontend.webp',
                        titleColor: '#ffffff',
                        titleSize: 'text-5xl md:text-7xl',
                        subtitleColor: '#d1d5db'
                    });
                }

                const solSnap = await getDoc(doc(db, 'content', 'solutions_meta'));
                if (solSnap.exists()) setSolutionsData(solSnap.data() as any);
                else setSolutionsData({
                    title: 'Soluciones Integrales',
                    description: 'Optimizamos cada aspecto de su infraestructura tecnológica con servicios especializados.'
                });

                const catSnap = await getDoc(doc(db, 'content', 'catalog'));
                if (catSnap.exists()) {
                    setCatalogData({
                        ...catSnap.data() as any,
                        catalogLink: (catSnap.data() as any).catalogLink || ''
                    });
                } else {
                    setCatalogData({
                        title: 'Catálogo Técnico & Lista de Precios',
                        description: 'Acceda a nuestra documentación técnica detallada y listas de precios actualizadas.',
                        ctaText: 'Ver Catálogo',
                        catalogLink: ''
                    });
                }

                const rrssSnap = await getDoc(doc(db, 'content', 'rrss'));
                if (rrssSnap.exists()) setRrssData(rrssSnap.data() as any);
                else setRrssData({ facebook: '', instagram: '', whatsapp: '' });

            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        fetchSolutions();
    }, []);

    // Fetch solutions from Firestore
    const fetchSolutions = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'solutions'));
            const solutions: Solution[] = [];
            querySnapshot.forEach((doc) => {
                solutions.push({ id: doc.id, ...doc.data() } as Solution);
            });
            setSolutionsList(solutions);
        } catch (error) {
            console.error("Error fetching solutions:", error);
        }
    };

    // Save or update solution
    const handleSaveSolution = async () => {
        if (!currentSolution.title || !currentSolution.description) {
            setMessage('Por favor completa título y descripción');
            return;
        }

        setSaving(true);
        setMessage('');

        try {
            const solutionData = {
                ...currentSolution,
                features: featuresInput.split('\n').filter(f => f.trim() !== '')
            };

            if (editingSolutionId) {
                // Update existing
                await updateDoc(doc(db, 'solutions', editingSolutionId), solutionData);
                setMessage('Solución actualizada correctamente');
            } else {
                // Create new
                await addDoc(collection(db, 'solutions'), solutionData);
                setMessage('Solución creada correctamente');
            }

            // Reset form
            setCurrentSolution({ title: '', description: '', icon: 'Settings', features: [] });
            setFeaturesInput('');
            setEditingSolutionId(null);

            // Refresh list
            fetchSolutions();
        } catch (error) {
            console.error("Error saving solution:", error);
            setMessage('Error al guardar solución');
        } finally {
            setSaving(false);
        }
    };

    // Load solution for editing
    const handleEditSolution = (solution: Solution) => {
        setCurrentSolution(solution);
        setFeaturesInput(solution.features.join('\n'));
        setEditingSolutionId(solution.id || null);
        setMessage('');
    };

    // Delete solution
    const handleDeleteSolution = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar esta solución?')) return;

        setSaving(true);
        try {
            await deleteDoc(doc(db, 'solutions', id));
            setMessage('Solución eliminada correctamente');
            fetchSolutions();
        } catch (error) {
            console.error("Error deleting solution:", error);
            setMessage('Error al eliminar solución');
        } finally {
            setSaving(false);
        }
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setCurrentSolution({ title: '', description: '', icon: 'Settings', features: [] });
        setFeaturesInput('');
        setEditingSolutionId(null);
        setMessage('');
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);

        try {
            const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);
            setHeroData({ ...heroData, bgImage: url });
            setMessage('Imagen subida correctamente. No olvides guardar.');
        } catch (error) {
            console.error("Upload failed", error);
            setMessage('Error al subir imagen.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            if (activeTab === 'hero') await setDoc(doc(db, 'content', 'hero'), heroData);
            if (activeTab === 'solutions') await setDoc(doc(db, 'content', 'solutions_meta'), uniqueSolutionsData);
            if (activeTab === 'catalog') await setDoc(doc(db, 'content', 'catalog'), catalogData);
            if (activeTab === 'rrss') await setDoc(doc(db, 'content', 'rrss'), rrssData);

            setMessage('¡Contenido actualizado correctamente!');
        } catch (error) {
            console.error("Error saving:", error);
            setMessage('Error al guardar cambios.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" size={32} /></div>;

    return (
        <div className="grid grid-cols-[25%_75%] gap-6 h-[calc(100vh-100px)]">
            {/* Column 2: Submenu (Vertical Tabs) */}
            <aside className="flex-shrink-0">
                <nav className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm sticky top-8">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-3 px-2">Secciones</h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => { setActiveTab('hero'); setMessage(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'hero'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <LayoutTemplate size={18} />
                            <span>Hero</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('solutions'); setMessage(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'solutions'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <Grid size={18} />
                            <span>Soluciones</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('catalog'); setMessage(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'catalog'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <BookOpen size={18} />
                            <span>Catálogo</span>
                        </button>
                        <button
                            onClick={() => { setActiveTab('rrss'); setMessage(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === 'rrss'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            <Globe size={18} />
                            <span>RRSS</span>
                        </button>
                    </div>
                </nav>
            </aside>

            {/* Column 3: Form Editor */}
            <main className="overflow-hidden">
                <form onSubmit={handleSave} className="h-full overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    {activeTab === 'hero' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 border-b pb-4 flex items-center gap-2">
                                <LayoutTemplate size={20} className="text-blue-600" /> Editor de Contenido
                            </h3>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Título Principal</label>
                                <input
                                    value={heroData.title}
                                    onChange={e => setHeroData({ ...heroData, title: e.target.value })}
                                    className="w-full p-3 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Ingrese el título..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subtítulo</label>
                                <textarea
                                    value={heroData.subtitle}
                                    onChange={e => setHeroData({ ...heroData, subtitle: e.target.value })}
                                    rows={3}
                                    className="w-full p-3 rounded-lg border bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Color Título</label>
                                    <input type="color" value={heroData.titleColor} onChange={e => setHeroData({ ...heroData, titleColor: e.target.value })} className="h-10 w-full rounded cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Color Subtítulo</label>
                                    <input type="color" value={heroData.subtitleColor} onChange={e => setHeroData({ ...heroData, subtitleColor: e.target.value })} className="h-10 w-full rounded cursor-pointer" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-2">Tamaño Título</label>
                                    <select
                                        value={heroData.titleSize}
                                        onChange={e => setHeroData({ ...heroData, titleSize: e.target.value })}
                                        className="w-full p-2 rounded border bg-white dark:bg-gray-800 dark:border-gray-600 text-sm"
                                    >
                                        <option value="text-3xl md:text-5xl">Pequeño (3xl-5xl)</option>
                                        <option value="text-5xl md:text-7xl">Estándar (5xl-7xl)</option>
                                        <option value="text-6xl md:text-8xl">Impacto (6xl-8xl)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Imagen de Fondo</label>
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group">
                                    <Upload size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                                    <span className="text-sm text-gray-500">Clic para subir imagen</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                                {uploading && <div className="text-xs text-blue-500 mt-2 flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> Subiendo...</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'solutions' && (
                        <div className="space-y-6 h-full flex flex-col">
                            {/* Form Section */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                    {editingSolutionId ? <Edit size={20} className="text-blue-600" /> : <Plus size={20} className="text-green-600" />}
                                    {editingSolutionId ? 'Editar Solución' : 'Nueva Solución'}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Título</label>
                                        <input
                                            value={currentSolution.title}
                                            onChange={e => setCurrentSolution({ ...currentSolution, title: e.target.value })}
                                            className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600"
                                            placeholder="Ej: Mantenimiento Preventivo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Descripción</label>
                                        <textarea
                                            value={currentSolution.description}
                                            onChange={e => setCurrentSolution({ ...currentSolution, description: e.target.value })}
                                            rows={3}
                                            className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600"
                                            placeholder="Descripción de la solución..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Icono</label>
                                        <div className="grid grid-cols-7 gap-2 p-3 bg-white dark:bg-gray-800 border rounded-lg">
                                            {['Settings', 'Server', 'Code', 'Shield', 'Zap', 'Cloud', 'Database', 'Lock', 'Cpu', 'Network', 'HardDrive', 'Wifi', 'Globe'].map((iconName) => {
                                                const IconComponent = iconName === 'Settings' ? LayoutTemplate :
                                                    iconName === 'Server' ? Grid :
                                                        iconName === 'Code' ? BookOpen :
                                                            iconName === 'Shield' ? Save :
                                                                iconName === 'Zap' ? Loader2 :
                                                                    iconName === 'Cloud' ? Upload :
                                                                        iconName === 'Database' ? Grid :
                                                                            iconName === 'Lock' ? Save :
                                                                                iconName === 'Cpu' ? Grid :
                                                                                    iconName === 'Network' ? Grid :
                                                                                        iconName === 'HardDrive' ? Grid :
                                                                                            iconName === 'Wifi' ? Grid :
                                                                                                Grid;
                                                return (
                                                    <button
                                                        key={iconName}
                                                        type="button"
                                                        onClick={() => setCurrentSolution({ ...currentSolution, icon: iconName })}
                                                        className={`p-3 rounded-lg border-2 transition-all hover:scale-110 ${currentSolution.icon === iconName
                                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-400'
                                                            }`}
                                                        title={iconName}
                                                    >
                                                        <IconComponent size={20} className={currentSolution.icon === iconName ? 'text-blue-600' : 'text-gray-600'} />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Seleccionado: {currentSolution.icon}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Beneficios (uno por línea)</label>
                                        <textarea
                                            value={featuresInput}
                                            onChange={e => setFeaturesInput(e.target.value)}
                                            rows={4}
                                            className="w-full p-3 rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-600"
                                            placeholder="Monitoreo 24/7&#10;Soporte técnico&#10;Actualizaciones incluidas"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={handleSaveSolution}
                                            disabled={saving}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                            {editingSolutionId ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        {editingSolutionId && (
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Solutions List */}
                            <div className="min-h-[200px]">
                                <h3 className="font-bold text-lg mb-4">Soluciones Guardadas ({solutionsList.length})</h3>
                                {solutionsList.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <p className="text-gray-500">No hay soluciones guardadas. Crea una nueva arriba.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {solutionsList.map((solution) => (
                                            <div
                                                key={solution.id}
                                                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-lg mb-1">{solution.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{solution.description}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Icono: {solution.icon}</span>
                                                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{solution.features.length} beneficios</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => handleEditSolution(solution)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSolution(solution.id!)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'catalog' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-4">Configuración del Catálogo</h3>
                            <div>
                                <label className="block text-sm font-medium mb-2">Título de Sección</label>
                                <input value={catalogData.title} onChange={e => setCatalogData({ ...catalogData, title: e.target.value })} className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Descripción</label>
                                <textarea value={catalogData.description} onChange={e => setCatalogData({ ...catalogData, description: e.target.value })} rows={3} className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Link del Catálogo (URL)</label>
                                <input
                                    value={catalogData.catalogLink || ''}
                                    onChange={e => setCatalogData({ ...catalogData, catalogLink: e.target.value })}
                                    className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700"
                                    placeholder="https://ejemplo.com/catalogo.pdf"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'rrss' && (
                        <div className="space-y-6">
                            <h3 className="font-bold text-lg border-b pb-4 flex items-center gap-2">
                                <Globe size={20} className="text-blue-600" /> Gestión de Redes Sociales
                            </h3>
                            <div className="grid gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Facebook</label>
                                    <input
                                        value={rrssData.facebook}
                                        onChange={e => setRrssData({ ...rrssData, facebook: e.target.value })}
                                        className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700"
                                        placeholder="URL de Facebook"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Instagram</label>
                                    <input
                                        value={rrssData.instagram}
                                        onChange={e => setRrssData({ ...rrssData, instagram: e.target.value })}
                                        className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700"
                                        placeholder="URL de Instagram"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-green-600 flex items-center gap-2">
                                        WhatsApp <span className="text-xs font-normal text-gray-500">(Enlace completo o número con código de país, ej: https://wa.me/573001234567)</span>
                                    </label>
                                    <input
                                        value={rrssData.whatsapp}
                                        onChange={e => setRrssData({ ...rrssData, whatsapp: e.target.value })}
                                        className="w-full p-3 rounded-lg border dark:bg-gray-900 dark:border-gray-700 border-green-200"
                                        placeholder="https://wa.me/573001234567 o 573001234567"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Save Button - Only for Hero, Catalog and RRSS */}
                    {(activeTab === 'hero' || activeTab === 'catalog' || activeTab === 'rrss') && (
                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="text-sm">
                                {message && <span className={`${message.includes('Error') ? 'text-red-500' : 'text-green-500'} font-medium`}>{message}</span>}
                            </div>
                            <button
                                type="submit"
                                disabled={saving || uploading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Guardar Cambios
                            </button>
                        </div>
                    )}
                </form>
            </main>
        </div>
    );
}
