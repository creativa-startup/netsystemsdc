"use client";
import { Facebook, Instagram, MessageCircle, Phone, Mail, MapPin, Linkedin, Music } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { useGlobalConfig } from '@/context/GlobalConfigContext';
import { getContrastColor } from '@/lib/colors';

export default function Footer({ previewData }: { previewData?: any }) {
    const { config } = useGlobalConfig();
    const [landingSettings, setLandingSettings] = useState<any>(null);

    useEffect(() => {
        // If previewing specific footer data (e.g. from editor), used it.
        // But for global page_bg awareness, we might still need landing settings.
        // For simplicity, let's just listen to DB if not previewing, or partial override.
        if (previewData) {
            // If previewData is passed, it simulates the footer object.
            // We won't have page_bg unless we fetch it or it's mocked.
            // Let's listen to settings anyway for page_bg fallback?
            // or just set landingSettings to match structure if previewData is just footer?
            // Actually, standard preview usage usually passes the whole object or component specific.
            // Let's assume previewData is FOOTER data.
        }

        const unsub = onSnapshot(doc(db, 'settings', 'landing'), (snap) => {
            if (snap.exists()) {
                setLandingSettings(snap.data());
            }
        });
        return () => unsub();
    }, []);

    const footerData = previewData || landingSettings?.footer || {};
    const pageBg = landingSettings?.page_bg || '#ffffff'; // Verify default

    // Logic: If footer has explicit bg, use it. If transparent/none, use pageBg for contrast.
    const footerBg = footerData.backgroundColor;
    const hasExplicitFooterBg = footerBg && footerBg !== 'transparent' && footerBg !== '';
    const effectiveBg = hasExplicitFooterBg ? footerBg : pageBg;

    // Calculate Contrast
    // getContrastColor(hex) returns '#ffffff' (for dark bg) or '#000000' (for light bg).
    // We want text color.
    const contrastColor = getContrastColor(effectiveBg);
    const textColor = contrastColor === '#ffffff' ? '#f3f4f6' : '#1f2937'; // gray-100 or gray-800
    const textMuted = contrastColor === '#ffffff' ? 'rgba(243, 244, 246, 0.6)' : 'rgba(31, 41, 55, 0.6)';

    // Fallbacks
    const description = footerData?.description || "Más de 23 años brindando soluciones tecnológicas integrales para asegurar la continuidad de su negocio.";
    const copyright = footerData?.copyright || `© ${new Date().getFullYear()} NetSystemsDc. Todos los derechos reservados.`;
    const social = footerData?.social || {};
    const columns = footerData?.columns || [
        {
            title: 'Empresa',
            links: [
                { label: 'Soluciones', href: '#solutions' },
                { label: 'Catálogo', href: '#catalog' },
                { label: 'Blog', href: '/blog' },
                { label: 'Contacto', href: '#contact' }
            ]
        },
        {
            title: 'Servicios',
            links: [
                { label: 'Infraestructura IT', href: '#' },
                { label: 'Seguridad de Redes', href: '#' },
                { label: 'Servicios Cloud', href: '#' },
                { label: 'Soporte Técnico', href: '#' }
            ]
        },
        {
            title: 'Contacto',
            links: [
                { label: 'contacto@netsystemsdc.com', href: 'mailto:contacto@netsystemsdc.com' },
                { label: '+51 999 999 999', href: 'tel:+51999999999' },
                { label: 'Lima, Perú', href: '#' }
            ]
        }
    ];


    return (
        <footer
            className="pt-20 pb-10 border-t border-gray-100 dark:border-gray-900 transition-colors"
            style={{
                backgroundColor: hasExplicitFooterBg ? footerBg : 'transparent',
                // If transparent, we rely on page background.
            }}
        >
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="font-bold text-2xl tracking-tighter transition-colors flex items-center gap-2" style={{ color: textColor }}>
                            {config.logoIconUrl && (
                                <div className="rounded-full overflow-hidden shadow-sm relative">
                                    <img
                                        src={config.logoIconUrl}
                                        alt="Brand Icon"
                                        className="object-cover"
                                        style={{ height: `${(config.logoSize || 32)}px`, width: `${(config.logoSize || 32)}px` }}
                                    />
                                </div>
                            )}
                            {config.logoText || 'NetSystemsDc'}
                        </Link>
                        <p className="text-sm leading-relaxed transition-colors" style={{ color: textMuted }}>
                            {description}
                        </p>
                        <div className="flex items-center gap-4">
                            {social.linkedin && (
                                <a href={social.linkedin} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg border border-white/10 hover:shadow-md transition-all hover:scale-110"
                                    style={{ color: textColor, borderColor: textMuted }}
                                >
                                    <Linkedin size={20} />
                                </a>
                            )}
                            {social.facebook && (
                                <a href={social.facebook} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg border border-white/10 hover:shadow-md transition-all hover:scale-110"
                                    style={{ color: textColor, borderColor: textMuted }}
                                >
                                    <Facebook size={20} />
                                </a>
                            )}
                            {social.tiktok && (
                                <a href={social.tiktok} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg border border-white/10 hover:shadow-md transition-all hover:scale-110"
                                    style={{ color: textColor, borderColor: textMuted }}
                                >
                                    <Music size={20} />
                                </a>
                            )}
                            {social.instagram && (
                                <a href={social.instagram} target="_blank" rel="noopener noreferrer"
                                    className="p-2 rounded-lg border border-white/10 hover:shadow-md transition-all hover:scale-110"
                                    style={{ color: textColor, borderColor: textMuted }}
                                >
                                    <Instagram size={20} />
                                </a>
                            )}
                            {social.whatsapp && (
                                <a
                                    href={social.whatsapp.startsWith('http') ? social.whatsapp : `https://wa.me/${social.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg border border-white/10 hover:shadow-md transition-all hover:scale-110"
                                    style={{ color: textColor, borderColor: textMuted }}
                                >
                                    <MessageCircle size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Dynamic Columns */}
                    {columns.map((col: any, idx: number) => (
                        <div key={idx}>
                            <h4 className="font-bold mb-6 uppercase tracking-wider text-xs" style={{ color: textColor }}>{col.title}</h4>
                            <ul className="space-y-4">
                                {(col.links || []).map((link: any, linkIdx: number) => (
                                    <li key={linkIdx}>
                                        <Link
                                            href={link.href}
                                            className="transition-colors text-sm hover:underline"
                                            style={{ color: textMuted }}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4" style={{ borderColor: textMuted }}>
                    <p className="text-xs text-center" style={{ color: textMuted }}>
                        {copyright}
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-xs hover:underline" style={{ color: textMuted }}>Privacidad</Link>
                        <Link href="/terms" className="text-xs hover:underline" style={{ color: textMuted }}>Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
