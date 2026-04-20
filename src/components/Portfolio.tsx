"use client";

import React from "react";

export default function Portfolio() {
  const projects = [
    {
      id: 1,
      name: "Gamfire Chile",
      category: "Web Corporativa B2B",
      description: "Plataforma digital para equipamiento técnico e industrial con sistema dinámico de catálogos.",
      tech: ["Next.js", "Tailwind", "SEO Técnico"],
      gradient: "from-red-900/80 to-neutral-950",
      accent: "text-red-400",
    },
    {
      id: 2,
      name: "Nexus FinTech",
      category: "SaaS Dashboard (Ejemplo)",
      description: "Panel financiero interactivo en tiempo real con gráficos envolventes para una startup de inversiones.",
      tech: ["React 19", "TypeScript", "PostgreSQL"],
      gradient: "from-blue-900/80 to-neutral-950",
      accent: "text-blue-400",
    },
    {
      id: 3,
      name: "LogisTrack",
      category: "Aplicación Web (Ejemplo)",
      description: "Sistema de ruteo interno para trazabilidad de envíos marítimos con geolocalización en vivo.",
      tech: ["Supabase", "Next.js", "Maps API"],
      gradient: "from-emerald-900/80 to-neutral-950",
      accent: "text-emerald-400",
    },
    {
      id: 4,
      name: "Estudio Horizon",
      category: "Landing Cinemática (Ejemplo)",
      description: "Portafolio arquitectónico focalizado en la experiencia visual de alta gama y carga ultra-rápida.",
      tech: ["Framer Motion", "Tailwind", "React"],
      gradient: "from-orange-900/80 to-neutral-950",
      accent: "text-[#FF6A13]",
    },
  ];

  return (
    <section id="portafolio" className="py-24 relative bg-foreground/[0.01]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-[#FF6A13] uppercase mb-3">
              Casos de Éxito
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Ingeniería <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">en Acción</span>
            </h3>
          </div>
          <p className="text-lg text-foreground/60 max-w-md">
            Explora una selección de los ecosistemas digitales que construimos. Rendimiento absoluto y diseño impecable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="group relative rounded-3xl overflow-hidden bg-background border border-foreground/10 hover:border-foreground/20 transition-colors duration-500 min-h-[400px] flex flex-col justify-end"
            >
              {/* Imagen/Gradiente de fondo de Placeholder */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-700`} />
              
              {/* Ruido o textura (opcional) para darle estilo al placeholder */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />

              {/* Contenido principal que entra por hover o está fijado abajo */}
              <div className="relative z-10 p-8 sm:p-10 w-full bg-gradient-to-t from-background via-background/90 to-transparent pt-32">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold uppercase tracking-wider py-1 px-3 bg-foreground/10 backdrop-blur-md rounded-full ${project.accent}`}>
                    {project.category}
                  </span>
                </div>
                
                <h4 className="text-3xl font-bold text-foreground mb-3 group-hover:-translate-y-1 transition-transform duration-300">
                  {project.name}
                </h4>
                
                <p className="text-foreground/70 text-lg mb-6 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {project.tech.map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-sm font-medium text-foreground/60 px-2 py-1 border border-foreground/10 rounded-md bg-background/50"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
