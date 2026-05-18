"use client";

import React, { useState, useEffect } from "react";

export default function Portfolio() {
  // Estado para simular la consola del Migrador ADO -> Jira
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[ADO] Conectando a colección 'DefaultCollection'...",
  ]);
  const [logIndex, setLogIndex] = useState(0);

  const logsSequence = [
    "[ADO] Conectando a colección 'DefaultCollection'...",
    "[ADO] Conexión establecida con servidor local.",
    "[Jira] Validando API Token en Jira Cloud... OK",
    "[Jira] Acceso verificado para miguel.duy@cloud",
    "[Migrador] Iniciando mapeo de estados...",
    "[Migrador] 'Resolved' ➔ 'In Review' [Mapeado]",
    "[Migrador] 'Active' ➔ 'In Progress' [Mapeado]",
    "[Proceso] Migrando Work Item #124: 'Añadir pasarela de pago'",
    "[Proceso] WI #124 importado exitosamente.",
    "[Proceso] Migrando Work Item #125: 'Fix de seguridad en Auth'",
    "[Proceso] WI #125 importado exitosamente con comentarios.",
    "[Proceso] Sincronizando historial de adjuntos...",
    "[Éxito] Migración completada: 148 items procesados.",
    "[Consola] Esperando nuevos parámetros..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % logsSequence.length;
        // Reiniciar logs o agregar el siguiente
        if (nextIndex === 0) {
          setConsoleLogs([logsSequence[0]]);
        } else {
          setConsoleLogs((prevLogs) => {
            // Mantener solo los últimos 5 logs para evitar desbordamiento
            const updated = [...prevLogs, logsSequence[nextIndex]];
            if (updated.length > 5) updated.shift();
            return updated;
          });
        }
        return nextIndex;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="portafolio" className="py-24 relative overflow-hidden bg-background">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Cabecera de la sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold tracking-widest text-[#FF6A13] uppercase mb-3">
              Casos de Éxito
            </h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
              Ingeniería y <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Soluciones Reales</span>
            </h3>
          </div>
          <p className="text-lg text-foreground/60 max-w-md">
            Desarrollamos soluciones tecnológicas complejas y de alta gama. Aquí tienes una muestra de sistemas de software reales que hemos diseñado y programado.
          </p>
        </div>

        {/* Grid de Proyectos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TARJETA 1: Migrador ADO -> Jira */}
          <div className="group relative rounded-3xl overflow-hidden bg-foreground/[0.01] dark:bg-background border border-foreground/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col min-h-[520px] shadow-sm hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)]">
            
            {/* Visualizador interactivo superior (Mini Consola y Flujo) */}
            <div className="relative h-64 bg-slate-950 flex flex-col p-4 font-mono text-[11px] text-blue-400 select-none overflow-hidden border-b border-foreground/10">
              
              {/* Encabezado de la simulación */}
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="text-[10px] text-foreground/40 ml-1.5">migrador_ado_jira.py</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase animate-pulse">
                  MIGRANDO
                </span>
              </div>

              {/* Diagrama de Flujo Visual */}
              <div className="flex items-center justify-center gap-4 py-3 bg-blue-950/20 rounded-lg border border-blue-500/10 mb-3 relative">
                {/* Bloque ADO */}
                <div className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400 text-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="font-bold text-[9px] text-white">Azure DevOps</div>
                  <div className="text-[8px] text-blue-300">On-Premise</div>
                </div>

                {/* Línea de conexión animada */}
                <div className="flex-1 h-[2px] bg-blue-950 relative overflow-hidden min-w-[30px]">
                  <div className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[shimmer_1.5s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    animation: 'shimmer 1.5s infinite linear'
                  }} />
                </div>

                {/* Bloque Jira */}
                <div className="px-2 py-1 rounded bg-indigo-900/40 border border-indigo-400 text-center z-10 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <div className="font-bold text-[9px] text-white">Jira Cloud</div>
                  <div className="text-[8px] text-indigo-300">SaaS Atlassian</div>
                </div>
              </div>

              {/* Logs simulados de consola */}
              <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto text-emerald-400/90 pr-1">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-l border-emerald-500/30 pl-2">
                    <span className="text-foreground/30 mr-1.5">&gt;</span>
                    {log}
                  </div>
                ))}
              </div>

              {/* Gradiente inferior para efecto de profundidad */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
            </div>

            {/* Contenido descriptivo */}
            <div className="p-8 flex-1 flex flex-col justify-between relative bg-background">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider py-1 px-3 bg-blue-500/10 text-blue-500 rounded-full mb-4">
                  DevOps e Integración
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-blue-500 transition-colors">
                  Migrador ADO ➔ Jira Cloud
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                  Software especializado para la migración automatizada de incidencias (Work Items) desde servidores locales de Azure DevOps hacia Jira Cloud. Resuelve de forma inteligente el mapeo de flujos, asignación de usuarios y resguardo de adjuntos e historial de comentarios.
                </p>
              </div>

              {/* Tecnologías */}
              <div className="flex flex-wrap gap-1.5">
                {["Python / Node", "API REST", "DevOps", "JSON Mapping"].map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] font-medium text-foreground/60 px-2 py-0.5 border border-foreground/10 rounded bg-foreground/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* TARJETA 2: RedactAI - Tachado Inteligente */}
          <div className="group relative rounded-3xl overflow-hidden bg-foreground/[0.01] dark:bg-background border border-foreground/10 hover:border-emerald-500/30 transition-all duration-500 flex flex-col min-h-[520px] shadow-sm hover:shadow-[0_12px_40px_rgba(16,185,129,0.08)]">
            
            {/* Visualizador interactivo superior (Mini Documento con Escáner y Tachado) */}
            <div className="relative h-64 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden border-b border-foreground/10">
              
              {/* Documento simulado */}
              <div className="w-48 h-52 bg-white rounded shadow-2xl p-4 flex flex-col gap-2 relative overflow-hidden select-none">
                
                {/* Filas simuladas de texto */}
                <div className="w-8 h-2 bg-slate-300 rounded"></div>
                <div className="w-full h-1 bg-slate-200 rounded"></div>
                
                {/* Fila confidencial a tachar 1 */}
                <div className="relative py-0.5">
                  <div className="w-3/4 h-3 bg-slate-100 rounded text-[6px] text-slate-800 font-bold px-1 flex items-center">
                    Miguel Duyvestein
                  </div>
                  {/* Bloque de tachado animado */}
                  <div className="absolute inset-0 bg-slate-950 rounded flex items-center justify-center animate-[pulse_2s_infinite]" />
                </div>

                <div className="w-full h-1 bg-slate-200 rounded"></div>
                <div className="w-5/6 h-1 bg-slate-200 rounded"></div>

                {/* Fila confidencial a tachar 2 */}
                <div className="relative py-0.5">
                  <div className="w-2/3 h-3 bg-slate-100 rounded text-[5px] text-slate-800 font-bold px-1 flex items-center">
                    RUT: 18.245.981-K
                  </div>
                  {/* Bloque de tachado animado */}
                  <div className="absolute inset-0 bg-slate-950 rounded flex items-center justify-center animate-[pulse_2s_infinite_delayed]" style={{ animationDelay: "0.5s" }} />
                </div>

                <div className="w-full h-1 bg-slate-200 rounded"></div>
                
                {/* Lente de Escáner Digital (Línea verde de Visión Artificial) */}
                <div className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_8px_#10b981] animate-[scan_3s_infinite_linear]" style={{
                  animation: 'scan 3s infinite ease-in-out'
                }} />
              </div>

              {/* Overlay de información técnica */}
              <div className="absolute top-2 right-3 font-mono text-[9px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                CV / OCR activo
              </div>
            </div>

            {/* Contenido descriptivo */}
            <div className="p-8 flex-1 flex flex-col justify-between relative bg-background">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider py-1 px-3 bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
                  Visión Artificial e IA
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-500 transition-colors">
                  RedactAI - Tachador de PDFs
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                  Motor inteligente basado en visión computacional y OCR para la detección y tachado automático de datos sensibles (RUT, nombres, firmas) en documentos PDF. Diseñado para garantizar la privacidad de la información (PII) a gran escala.
                </p>
              </div>

              {/* Tecnologías */}
              <div className="flex flex-wrap gap-1.5">
                {["Python", "OpenCV", "Tesseract OCR", "PyMuPDF"].map((tag, i) => (
                  <span 
                    key={i} 
                    className="text-[11px] font-medium text-foreground/60 px-2 py-0.5 border border-foreground/10 rounded bg-foreground/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* TARJETA 3: CTA - Tu proyecto a medida */}
          <div className="group relative rounded-3xl overflow-hidden bg-foreground/[0.02] border border-dashed border-foreground/20 hover:border-[#FF6A13]/50 transition-all duration-500 flex flex-col min-h-[520px] shadow-sm hover:shadow-[0_12px_40px_rgba(255,106,19,0.05)] justify-between p-8">
            
            {/* Visualizador superior interactivo de wireframe */}
            <div className="h-48 rounded-2xl bg-foreground/[0.01] border border-foreground/5 flex flex-col items-center justify-center p-6 relative overflow-hidden group-hover:bg-foreground/[0.02] transition-colors duration-500">
              
              {/* Esfera brillante naranja */}
              <div className="absolute w-24 h-24 bg-[#FF6A13]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              
              {/* Ícono de Add / Idea */}
              <div className="relative w-16 h-16 rounded-full bg-background border-2 border-dashed border-foreground/20 flex items-center justify-center group-hover:border-[#FF6A13] group-hover:rotate-90 transition-all duration-500 shadow-sm">
                <span className="text-2xl font-bold text-foreground/40 group-hover:text-[#FF6A13] transition-colors">+</span>
              </div>

              <div className="mt-4 font-bold text-xs uppercase tracking-widest text-foreground/50 group-hover:text-foreground transition-colors">
                Tu Solución de Software
              </div>
            </div>

            {/* Contenido descriptivo CTA */}
            <div className="flex-1 flex flex-col justify-between mt-6">
              <div>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#FF6A13] transition-colors">
                  ¿Tienes un desafío técnico para tu empresa?
                </h4>
                <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                  Nos apasiona resolver problemas complejos. Ya sea una integración de sistemas, procesamiento inteligente de datos o una plataforma web de alto rendimiento sin mensualidades absurdas.
                </p>
              </div>

              {/* Botón de conversión */}
              <div>
                <a 
                  href="#contacto" 
                  className="inline-flex items-center justify-center w-full py-4 px-6 rounded-2xl bg-foreground text-background dark:bg-white dark:text-black font-extrabold text-sm hover:bg-[#FF6A13] hover:text-white dark:hover:bg-[#FF6A13] dark:hover:text-white transition-all duration-300 shadow-md group-hover:translate-y-[-2px]"
                >
                  Conversemos del Proyecto
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">➔</span>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Estilos CSS Inline para las animaciones específicas sin requerir cambios en globales.css */}
      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
      `}</style>
    </section>
  );
}
