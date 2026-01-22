"use client";
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Wifi, WifiOff, Loader2, AlertTriangle } from 'lucide-react';

export default function ConnectionStatus() {
    const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // Try to read the SEO settings (public read)
                const docRef = doc(db, 'settings_seo', 'global');
                await getDoc(docRef);

                // Try to write a timestamp to a test doc (requires auth)
                // We assume this component runs in Admin where user is logged in
                // but even if not, reading success means DB is reachable.
                setStatus('connected');
            } catch (error: any) {
                console.error("Connection check failed:", error);
                setStatus('error');
                if (error.code === 'permission-denied') {
                    setErrorMessage('Permisos denegados. Revise firestore.rules en Firebase Console.');
                } else if (error.code === 'unavailable') {
                    setErrorMessage('Sin conexión a internet o cliente offline.');
                } else {
                    setErrorMessage(error.message || 'Error desconocido de conexión');
                }
            }
        };

        checkConnection();
    }, []);

    if (status === 'checking') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500">
                <Loader2 size={16} className="animate-spin" /> Verificando conexión a Firebase...
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                <WifiOff size={16} />
                <span className="font-bold">Error de Conexión:</span> {errorMessage}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
            <Wifi size={16} />
            <span className="font-bold">Firebase Conectado</span>
        </div>
    );
}
