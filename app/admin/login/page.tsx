"use client";
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            router.push('/admin');
        } catch (err: any) {
            console.error(err);
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        }
    };

    return (
        <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
            <div className="mx-auto w-full flex justify-center mb-8">
                <img src="/images/logo-creativa.png" alt="Creativa Logo" className="h-16 w-auto" />
            </div>

            {/* <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Admin Center</h1> */}
            <p className="text-gray-500 dark:text-gray-400 mb-8">Acceso exclusivo para personal autorizado</p>

            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}

            <button
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl font-medium transition-all shadow-sm"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                Continuar con Google
            </button>
        </div>
    );
}
