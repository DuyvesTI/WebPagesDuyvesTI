export default function Services() {
    const services = [
        {
            title: "Diseño Web Responsivo",
            description: "Sitios web que se adaptan perfectamente a dispositivos móviles, tablets y computadoras de escritorio.",
            icon: "📱"
        },
        {
            title: "Desarrollo a Medida",
            description: "Soluciones personalizadas construidas con tecnologías modernas como Next.js y React para máximo rendimiento.",
            icon: "⚡"
        },
        {
            title: "SEO & Optimización",
            description: "Mejoramos la visibilidad de tu negocio en Google con prácticas de optimización de motores de búsqueda.",
            icon: "🔍"
        },
        {
            title: "Puesta en Producción",
            description: "Nos encargamos de toda la configuración, instalación y puesta al aire con tu dominio. Te entregamos la web lista y funcionando en Internet.",
            icon: "🚀"
        }
    ];

    return (
        <section id="servicios" className="py-24 bg-[var(--card-bg)]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        Nuestros <span className="text-brand-orange">Servicios</span>
                    </h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto">
                        Llevamos tu negocio al siguiente nivel con tecnología de punta y diseño centrado en el usuario.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="p-8 rounded-2xl bg-[var(--card-bg)] border border-foreground/10 hover:border-brand-orange/50 hover:bg-foreground/5 transition-all group"
                        >
                            <div className="text-4xl mb-6 bg-brand-navy w-16 h-16 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-black/50">
                                {service.icon}
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-brand-orange transition-colors">
                                {service.title}
                            </h3>
                            <p className="text-foreground/60 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
