"use client";

import React from "react";

export default function Process() {
  const steps = [
    {
      id: "01",
      title: "Descubrimiento & Estrategia",
      description:
        "Analizamos a fondo tu negocio, tus competidores y tus clientes ideales. Organizamos la información de tu empresa de forma estratégica para que tus clientes encuentren lo que buscan rápido y se comuniquen contigo, sin dejar nada al azar.",
    },
    {
      id: "02",
      title: "Diseño Visual Atractivo",
      description:
        "Desarrollamos interfaces hechas a medida (nada de plantillas prefabricadas). Cuidamos cada detalle visual para que tu empresa transmita confianza y profesionalismo desde el primer segundo.",
    },
    {
      id: "03",
      title: "Desarrollo y Programación de Alta Calidad",
      description:
        "A diferencia de las alternativas lentas, nosotros creamos tu página desde cero con tecnología moderna. Tu sitio web cargará rapidísimo, no se caerá y estará preparado desde su base para aparecer en los primeros lugares de Google.",
    },
    {
      id: "04",
      title: "Lanzamiento y Puesta en Producción",
      description:
        "Nos encargamos de toda la configuración técnica para que tu web esté al aire. Conectamos tu dominio, configuramos el alojamiento y desplegamos tu proyecto con los más altos estándares de rendimiento, para que no tengas que preocuparte de nada técnico.",
    },
  ];

  return (
    <section id="proceso" className="py-24 relative overflow-hidden bg-background">
      {/* Elemento de iluminación decorativo Premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] sm:w-[900px] sm:h-[900px] bg-[var(--orange)]/5 rounded-full blur-[100px] sm:blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <h2 className="text-sm font-bold tracking-widest uppercase mb-3 drop-shadow-sm">
            <span className="text-[#FF6A13]">EL MÉTODO DUYVES</span><span className="text-foreground">TI</span>
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Proceso de Desarrollo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A13] to-orange-300">Profesional</span>
          </h3>
          <p className="text-xl text-foreground/70">
            No armamos páginas en sistemas básicos. Nuestra agencia ejecuta soluciones tecnológicas y diseño digital de primer nivel para empresas.
          </p>
        </div>

        <div className="relative border-l-2 border-foreground/10 ml-4 md:ml-10 space-y-16">
          {steps.map((step) => (
            <div key={step.id} className="relative pl-10 md:pl-16 group">
              {/* Indicador Numérico Brillante del timeline */}
              <div className="absolute -left-[17px] md:-left-[21px] top-1 flex flex-col items-center">
                <span className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-background border-2 border-[#FF6A13] text-[#FF6A13] font-bold shadow-[0_0_12px_rgba(255,106,19,0.3)] group-hover:bg-[#FF6A13] group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  {step.id}
                </span>
                
                {/* Línea difuminada decorativa que baja desde el nodo en hover */}
                <div className="w-[2px] h-32 bg-gradient-to-b from-[#FF6A13] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute top-10" />
              </div>

              {/* Tarjeta de Contenido Glassmorphism Premium */}
              <div className="bg-foreground/[0.02] border border-foreground/5 p-8 sm:p-10 rounded-3xl hover:bg-foreground/[0.04] transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(255,106,19,0.05)] backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6A13]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h4 className="text-2xl md:text-3xl font-bold text-foreground mb-4 relative z-10 transition-colors group-hover:text-[#FF6A13]">
                  {step.title}
                </h4>
                <p className="text-foreground/70 leading-relaxed text-lg relative z-10">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
