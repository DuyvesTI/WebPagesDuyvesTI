export default function Footer() {
    return (
        <footer id="contacto" className="bg-black/40 border-t border-white/10 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white">
                    <div>
                        <h3 className="text-xl font-bold mb-4">
                            <span className="text-brand-orange">Duyves</span>TI
                        </h3>
                        <p className="text-gray-400 text-sm">
                            Desarrollamos soluciones web profesionales y atractivas para tu negocio.
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-yellow">Contacto</h3>
                        <ul className="space-y-2 text-gray-300 text-sm">
                            <li className="flex items-center gap-2">
                                <span>📧</span>
                                <a href="mailto:duyvesTI@gmail.com" className="hover:text-white transition-colors">duyvesTI@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-2">
                                <span>📱</span>
                                <a href="tel:+56929750390" className="hover:text-white transition-colors">+56 9 29750390</a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-brand-yellow">Síguenos</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/duyvesti" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-brand-orange transition-colors">
                                Instagram
                            </a>
                            {/* Add more social links here */}
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-gray-500">
                    &copy; {new Date().getFullYear()} DuyvesTI. Todos los derechos reservados.
                </div>
            </div>
        </footer>
    );
}
