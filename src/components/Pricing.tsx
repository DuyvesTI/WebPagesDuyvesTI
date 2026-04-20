"use client";

import React from "react";

export default function Pricing() {
  const plans = [
    {
      name: "Landing Premium",
      price: "$149.990",
      description: "Ideal para campañas, portfolios o captación de leads con alto impacto visual.",
      features: [
        "One-Page (hasta 5 secciones)",
        "Diseño UI/UX Personalizado",
        "Animaciones sutiles e interactivas",
        "Desarrollo en React & Next.js",
        "Formulario de contacto funcional",
        "Botón de WhatsApp flotante",
        "Optimización SEO básica",
        "100% de propiedad del código"
      ],
      cta: "Empezar proyecto",
      highlighted: false,
    },
    {
      name: "Web Corporativa",
      price: "$299.990",
      description: "Para empresas establecidas que buscan autoridad, rendimiento y crecimiento.",
      features: [
        "Sitio Multi-página (hasta 6 páginas)",
        "Diseño Premium Exclusivo",
        "Framework ultra-rápido (Next.js)",
        "Dark / Light mode nativo",
        "SEO Técnico Avanzado",
        "Integración con Google Analytics",
        "Soporte post-lanzamiento (30 días)",
        "Código fuente y propiedad total"
      ],
      cta: "El más elegido",
      highlighted: true,
    },
    {
      name: "App Web a Medida",
      price: "Cotizar",
      description: "Soluciones de software personalizadas, plataformas SaaS o e-commerce complejos.",
      features: [
        "Arquitectura escalable a medida",
        "Integración de Bases de Datos",
        "Panel de Administración",
        "Autenticación de Usuarios",
        "Conexión con APIs de terceros",
        "Pruebas de calidad automáticas",
        "Despliegue en AWS o Vercel",
        "Soporte continuo opcional"
      ],
      cta: "Hablar con un experto",
      highlighted: false,
    },
  ];

  return (
    <section id="planes" className="py-24 relative overflow-hidden bg-background">
      {/* Luces de fondo dramáticas */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <h2 className="text-sm font-bold tracking-widest text-[#FF6A13] uppercase mb-3">
            Inversión Estratégica
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Planes de Ingeniería <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A13] to-orange-400">Web</span>
          </h3>
          <p className="text-xl text-foreground/70">
            No pagues mensualidades absurdas por sitios en comodato. Paga por desarrollo de alto calibre, y <strong>sé el único dueño de tu tecnología.</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 backdrop-blur-sm transition-all duration-300 flex flex-col h-full ${
                plan.highlighted
                  ? "bg-foreground/5 border-2 border-[#FF6A13] shadow-[0_0_40px_rgba(255,106,19,0.15)] md:-translate-y-4"
                  : "bg-foreground/[0.02] border border-foreground/10 hover:border-foreground/30 hover:bg-foreground/[0.04]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF6A13] to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                  Recomendado para Empresas
                </div>
              )}

              <div className="mb-8">
                <h4 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h4>
                <p className="text-foreground/70 h-12 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-foreground tracking-tight">
                  {plan.price}
                </span>
                {plan.price !== "Cotizar" && <span className="text-foreground/60 text-lg"> CLP</span>}
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg
                      className={`w-5 h-5 mr-3 shrink-0 mt-0.5 ${plan.highlighted ? "text-[#FF6A13]" : "text-foreground/50"}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground/80 font-medium text-sm w-full">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contacto"
                className={`w-full py-4 px-6 rounded-xl font-bold text-center transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#FF6A13] text-white hover:bg-orange-600 hover:shadow-[0_0_20px_rgba(255,106,19,0.4)]"
                    : "bg-foreground/10 text-foreground hover:bg-foreground/20"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
