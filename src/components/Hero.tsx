import Link from 'next/link';

export default function Hero() {
    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
            {/* Background gradients/blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-yellow/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
                    Desarrollo de <span className="text-brand-orange">Website</span>
                </h1>
                <p className="mt-4 text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
                    Nuestros servicios de desarrollo web están listos para ayudarte a tener una <span className="text-foreground font-medium">presencia en línea profesional y atractiva</span>.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="#contacto"
                        className="px-8 py-4 bg-brand-yellow text-brand-navy font-bold text-lg rounded-full hover:bg-yellow-400 hover:scale-105 transition-all shadow-lg shadow-brand-yellow/20"
                    >
                        CONTÁCTAME
                    </Link>
                    <Link
                        href="#servicios"
                        className="px-8 py-4 border border-foreground/20 text-foreground font-medium text-lg rounded-full hover:bg-foreground/10 transition-all"
                    >
                        Ver Servicios
                    </Link>
                </div>

                {/* Floating elements decoration (abstract code/tech feel) */}
                <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto opacity-50">
                    <div className="p-4 rounded-xl bg-foreground/5 backdrop-blur-sm border border-foreground/10">
                        <div className="h-2 w-12 bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-20 bg-gray-700 rounded"></div>
                    </div>
                    <div className="p-4 rounded-xl bg-foreground/5 backdrop-blur-sm border border-foreground/10 transform -translate-y-4">
                        <div className="h-8 w-8 rounded-full bg-brand-orange/20 mx-auto flex items-center justify-center text-brand-orange">
                            &lt;/&gt;
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-foreground/5 backdrop-blur-sm border border-foreground/10">
                        <div className="h-2 w-16 bg-gray-600 rounded mb-2"></div>
                        <div className="h-2 w-10 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
