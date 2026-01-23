import { Facebook, Instagram, MessageCircle, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getRRSSContent } from '@/lib/content';

export default async function Footer() {
    const rrss = await getRRSSContent();

    return (
        <footer className="bg-gray-50 dark:bg-gray-950 pt-20 pb-10 border-t border-gray-100 dark:border-gray-900">
            <div className="container mx-auto px-6 lg:px-[100px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="font-bold text-2xl tracking-tighter text-blue-700 dark:text-blue-500">
                            NetSystemsDc
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Más de 23 años brindando soluciones tecnológicas integrales para asegurar la continuidad de su negocio.
                        </p>
                        <div className="flex items-center gap-4">
                            {rrss.facebook && (
                                <a href={rrss.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:text-blue-600 hover:shadow-md transition-all">
                                    <Facebook size={20} />
                                </a>
                            )}
                            {rrss.instagram && (
                                <a href={rrss.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:text-pink-600 hover:shadow-md transition-all">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {rrss.whatsapp && (
                                <a
                                    href={rrss.whatsapp.startsWith('http') ? rrss.whatsapp : `https://wa.me/${rrss.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:text-green-600 hover:shadow-md transition-all"
                                >
                                    <MessageCircle size={20} />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-wider text-xs">Empresa</h4>
                        <ul className="space-y-4">
                            <li><Link href="#solutions" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Soluciones</Link></li>
                            <li><Link href="#catalog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Catálogo</Link></li>
                            <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Blog</Link></li>
                            <li><Link href="#contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors">Contacto</Link></li>
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-wider text-xs">Servicios</h4>
                        <ul className="space-y-4">
                            <li className="text-gray-600 dark:text-gray-400">Infraestructura IT</li>
                            <li className="text-gray-600 dark:text-gray-400">Seguridad de Redes</li>
                            <li className="text-gray-600 dark:text-gray-400">Servicios Cloud</li>
                            <li className="text-gray-600 dark:text-gray-400">Soporte Técnico</li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-bold mb-6 text-gray-900 dark:text-white uppercase tracking-wider text-xs">Contacto</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                <MapPin size={18} className="text-blue-600 mt-1 shrink-0" />
                                <span className="text-sm">Bogotá, Colombia</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <Phone size={18} className="text-blue-600 shrink-0" />
                                <span className="text-sm">+57 321 456 7890</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <Mail size={18} className="text-blue-600 shrink-0" />
                                <span className="text-sm">contacto@netsystemsdc.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-xs">
                        © {new Date().getFullYear()} NetSystemsDc. Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-gray-500 text-xs hover:text-blue-600">Privacidad</Link>
                        <Link href="/terms" className="text-gray-500 text-xs hover:text-blue-600">Términos</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
