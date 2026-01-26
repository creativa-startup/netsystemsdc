"use client";
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGlobalConfig } from '@/context/GlobalConfigContext';

const ALLOWED_EMAILS = [
    'netsystemsdc@gmail.com',
    'renatomasa@gmail.com',
    'startup@creativa.rocks'
];

export default function LoginPage() {
    const { config } = useGlobalConfig();
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;

            if (email && ALLOWED_EMAILS.includes(email)) {
                router.push('/admin');
            } else {
                await signOut(auth);
                setError('Acceso denegado. Este correo no está autorizado.');
            }
        } catch (err: any) {
            console.error(err);
            setError('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
            {/* Dynamic Background Image */}
            {config.loginBackgroundImage ? (
                <div
                    className="absolute inset-0 z-0"
                    style={{
                        backgroundImage: `url(${config.loginBackgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gray-50 dark:bg-black z-0" />
            )}

            <div className="w-full max-w-md p-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/50 dark:border-gray-800/50 text-center relative z-10 animate-in zoom-in-95 duration-500">
                <div className="mx-auto w-full flex justify-center mb-8">
                    {config.logoType === 'image' && config.logoUrl ? (
                        <img src={config.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                    ) : (
                        <span
                            className="text-3xl font-black text-gray-900 dark:text-white tracking-tight"
                            style={{ fontFamily: config.fontFamily, color: 'var(--color-primary)' }}
                        >
                            {config.logoText || 'NetSystemsDC'}
                        </span>
                    )}
                </div>

                <p className="text-gray-500 dark:text-gray-400 mb-8">Acceso exclusivo para personal autorizado</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 px-4 rounded-xl font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
                    <span>{loading ? 'Iniciando sesión...' : 'Continuar con Google'}</span>
                </button>
            </div>
        </div>
    );
}
