export default function Services() {
    const services = [
        {
            title: "Diseño Web Responsivo",
            description: "Sitios web optimizados para celulares y PC, listos para captar clientes en tu localidad y todo el país.",
            icon: "📱"
        },
        {
            title: "Web de Alto Rendimiento",
            description: "Páginas súper rápidas y seguras, diseñadas a la medida de tu presupuesto para que nunca fallen frente a la competencia.",
            icon: "⚡"
        },
        {
            title: "Visibilidad en Google (SEO)",
            description: "Hacemos que tu local o emprendimiento aparezca primero cuando tus clientes busquen tus servicios en Internet.",
            icon: "🔍"
        },
        {
            title: "Puesta en Marcha Simple",
            description: "Nos encargamos de todo: hosting, dominio y configuración. Te lo entregamos llave en mano para que tú solo te preocupes de tu negocio.",
            icon: "🚀"
        }
    ];

    return (
        <section id="servicios" className="py-24 bg-[var(--card-bg)]/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                        Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A13] to-orange-300">Servicios</span>
                    </h2>
                    <p className="text-foreground/60 max-w-2xl mx-auto">
                        Ayudamos a la comunidad de emprendedores a dar el salto digital con tecnologías modernas, diseño exclusivo y resultados garantizados.
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
