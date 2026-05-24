"use client";

import React, { useState, useEffect } from "react";

export default function Portfolio() {
  // Estado para simular la consola del traspaso automático de datos
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[Seguridad] Estableciendo conexión segura...",
  ]);
  const [logIndex, setLogIndex] = useState(0);

  const logsSequence = [
    "[Seguridad] Estableciendo conexión segura...",
    "[Seguridad] Conexión protegida y establecida con éxito.",
    "[Sistema] Leyendo tareas y documentos del software antiguo... OK",
    "[Validación] Verificando permisos del usuario... Autorizado",
    "[Proceso] Iniciando traspaso automático de información...",
    "[Datos] Traspasando Tarea #124: 'Seguimiento de Clientes' ➔ Guardada",
    "[Datos] Traspasando Factura #125: 'Presupuesto Anual' ➔ Guardada",
    "[Datos] Migrando historial de comentarios y archivos adjuntos...",
    "[Éxito] ¡Traspaso completado! 148 elementos procesados con total éxito.",
    "[Consola] 100% de la información respaldada y lista en el nuevo sistema.",
    "[Consola] Sistema en espera..."
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
              Soluciones Inteligentes y <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Resultados Reales</span>
            </h3>
          </div>
          <p className="text-lg text-foreground/60 max-w-md">
            Impulsamos a PyMEs, negocios locales y startups con tecnología de punta. Mira cómo ayudamos a nuestra comunidad a digitalizarse y crecer en Internet de forma inteligente.
          </p>
        </div>


        {/* Grid de Proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* TARJETA 1: Plataforma Web DuyvesTI */}
          <div className="group relative rounded-3xl overflow-hidden bg-foreground/[0.01] dark:bg-background border border-foreground/10 hover:border-[#FF6A13]/30 transition-all duration-500 flex flex-col min-h-[520px] shadow-sm hover:shadow-[0_12px_40px_rgba(255,106,19,0.08)]">
            
            {/* Visualizador interactivo superior (Mini Navegador / Esqueleto de la Web con Switcher) */}
            <div className="relative h-64 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden border-b border-foreground/10">
              
              {/* Ventana de Navegador simulada */}
              <div className="w-48 h-40 bg-slate-900 rounded-lg shadow-2xl border border-foreground/10 flex flex-col overflow-hidden relative select-none">
                
                {/* Barra de dirección de navegador */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 border-b border-foreground/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500/80"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500/80"></span>
                  <div className="flex-1 bg-slate-900 rounded px-1.5 py-0.5 text-[6px] text-foreground/40 text-center font-mono truncate ml-1.5">
                    duyvesti.com
                  </div>
                </div>
                
                {/* Contenido simulado de la página */}
                <div className="p-2.5 flex-1 flex flex-col justify-between relative bg-background transition-colors duration-1000">
                  
                  {/* Navbar simulado */}
                  <div className="flex items-center justify-between border-b border-foreground/5 pb-1">
                    <div className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded bg-[#FF6A13]" />
                      <span className="text-[6px] font-extrabold text-foreground">DuyvesTI</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-1 bg-foreground/20 rounded-full" />
                      <span className="w-2 h-1 bg-foreground/20 rounded-full" />
                      {/* Botón de cambio de tema simulado */}
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6A13]/20 flex items-center justify-center text-[5px] text-[#FF6A13] animate-pulse">
                        🌙
                      </div>
                    </div>
                  </div>

                  {/* Hero simulado */}
                  <div className="text-center py-1.5 flex-1 flex flex-col items-center justify-center gap-1">
                    <div className="w-2/3 h-1.5 bg-gradient-to-r from-[#FF6A13] to-orange-300 rounded" />
                    <div className="w-5/6 h-0.5 bg-foreground/10 rounded" />
                    <div className="w-1/2 h-0.5 bg-foreground/10 rounded" />
                  </div>

                  {/* Muestras de secciones */}
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <div className="h-4 rounded bg-foreground/[0.03] border border-foreground/5 p-0.5 flex flex-col justify-between">
                      <div className="w-4 h-0.5 bg-foreground/20 rounded" />
                      <div className="w-full h-0.5 bg-foreground/10 rounded" />
                    </div>
                    <div className="h-4 rounded bg-foreground/[0.03] border border-foreground/5 p-0.5 flex flex-col justify-between">
                      <div className="w-4 h-0.5 bg-[#FF6A13]/40 rounded" />
                      <div className="w-full h-0.5 bg-foreground/10 rounded" />
                    </div>
                  </div>

                </div>

                {/* Círculo de luz decorativo interno */}
                <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-[#FF6A13]/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Distintivo de SEO / Lighthouse 100% */}
              <div className="absolute top-2 right-3 font-mono text-[8px] text-[#FF6A13] bg-[#FF6A13]/10 px-2 py-0.5 rounded border border-[#FF6A13]/20 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#FF6A13] animate-ping"></span>
                SEO & Rendimiento 100%
              </div>
            </div>

            {/* Contenido descriptivo */}
            <div className="p-8 flex-1 flex flex-col justify-between relative bg-background">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider py-1 px-3 bg-[#FF6A13]/10 text-[#FF6A13] rounded-full mb-4">
                  Desarrollo Web de Alta Gama
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#FF6A13] transition-colors">
                  Plataforma Web DuyvesTI
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                  Nuestra propia vitrina digital construida con tecnologías de última generación. Destaca por su velocidad de carga instantánea, diseño adaptativo impecable, tema oscuro/claro automático y optimización avanzada para destacar en los buscadores de Google.
                </p>
              </div>

              {/* Tecnologías */}
              <div className="flex flex-wrap gap-1.5">
                {["Tecnología de Punta", "Carga Ultra Rápida", "Listo para Google", "Diseño Adaptable"].map((tag, i) => (
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

          {/* TARJETA 2: Sincronización y Traspaso de Datos */}
          <div className="group relative rounded-3xl overflow-hidden bg-foreground/[0.01] dark:bg-background border border-foreground/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col min-h-[520px] shadow-sm hover:shadow-[0_12px_40px_rgba(59,130,246,0.08)]">
            
            {/* Visualizador interactivo superior (Mini Consola y Flujo) */}
            <div className="relative h-64 bg-slate-950 flex flex-col p-4 font-mono text-[11px] text-blue-400 select-none overflow-hidden border-b border-foreground/10">
              
              {/* Encabezado de la simulación */}
              <div className="flex items-center justify-between border-b border-blue-500/20 pb-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80"></span>
                  <span className="text-[10px] text-foreground/40 ml-1.5">traspaso_automatico.py</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase animate-pulse">
                  SINCRONIZANDO
                </span>
              </div>

              {/* Diagrama de Flujo Visual */}
              <div className="flex items-center justify-center gap-4 py-3 bg-blue-950/20 rounded-lg border border-blue-500/10 mb-3 relative">
                {/* Bloque Izquierda */}
                <div className="px-2 py-1 rounded bg-blue-900/40 border border-blue-400 text-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="font-bold text-[9px] text-white">Sistema Antiguo</div>
                  <div className="text-[8px] text-blue-300">Servidor Local</div>
                </div>

                {/* Línea de conexión animada */}
                <div className="flex-1 h-[2px] bg-blue-950 relative overflow-hidden min-w-[30px]">
                  <div className="absolute top-0 h-full w-4 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-[shimmer_1.5s_infinite]" style={{
                    backgroundImage: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                    animation: 'shimmer 1.5s infinite linear'
                  }} />
                </div>

                {/* Bloque Derecha */}
                <div className="px-2 py-1 rounded bg-indigo-900/40 border border-indigo-400 text-center z-10 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                  <div className="font-bold text-[9px] text-white">Sistema Moderno</div>
                  <div className="text-[8px] text-indigo-300">Nube Protegida</div>
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
                  Automatización e Integración
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-blue-500 transition-colors">
                  Sincronización y Traspaso de Datos
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                  Diseñamos un sistema inteligente que traslada de forma automática miles de tareas, facturas, archivos e historiales de clientes desde software antiguos hacia plataformas modernas en la nube. Ahorró cientos de horas de digitación manual y evitó cualquier pérdida de información crítica.
                </p>
              </div>

              {/* Tecnologías */}
              <div className="flex flex-wrap gap-1.5">
                {["Conexión de Sistemas", "Respaldo Seguro", "Ahorro de Tiempo", "100% Automático"].map((tag, i) => (
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

          {/* TARJETA 3: RedactAI - Tachado Inteligente */}
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
                IA / Protección de Datos
              </div>
            </div>

            {/* Contenido descriptivo */}
            <div className="p-8 flex-1 flex flex-col justify-between relative bg-background">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider py-1 px-3 bg-emerald-500/10 text-emerald-500 rounded-full mb-4">
                  Inteligencia Artificial y Seguridad
                </span>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-emerald-500 transition-colors">
                  Protector de Datos Confidenciales
                </h4>
                <p className="text-foreground/70 text-sm leading-relaxed mb-6">
                  Desarrollamos una herramienta inteligente que "lee" contratos, facturas y PDFs escaneados para detectar y tachar automáticamente datos confidenciales (como nombres, documentos de identidad y firmas). Ideal para garantizar la privacidad y cumplir con la ley de protección de datos en segundos.
                </p>
              </div>

              {/* Tecnologías */}
              <div className="flex flex-wrap gap-1.5">
                {["Lectura Inteligente", "Seguridad Legal", "Privacidad", "Cumplimiento"].map((tag, i) => (
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

          {/* TARJETA 4: CTA - Impulsando tu PyME o Startup */}
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
                Tu Solución Digital
              </div>
            </div>

            {/* Contenido descriptivo CTA */}
            <div className="flex-1 flex flex-col justify-between mt-6">
              <div>
                <h4 className="text-2xl font-bold text-foreground mb-3 group-hover:text-[#FF6A13] transition-colors">
                  ¿Quieres hacer crecer tu PyME o Startup?
                </h4>
                <p className="text-foreground/60 text-sm leading-relaxed mb-6">
                  Nos apasiona hacerte la vida más fácil. Ya sea creando un sitio web rápido y profesional para tu negocio, una plataforma interactiva para tu startup o ayudándote a automatizar tus tareas diarias, estamos listos para impulsar a nuestra comunidad.
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

        {/* Banner de confianza tecnológica */}
        <div className="mt-16 p-6 rounded-3xl bg-foreground/[0.01] dark:bg-foreground/[0.02] border border-foreground/10 flex flex-col md:flex-row md:items-center justify-between gap-6 backdrop-blur-sm shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6A13]/10 border border-[#FF6A13]/20 flex items-center justify-center text-xl shadow-inner">
              🛡️
            </div>
            <div>
              <h4 className="text-base font-extrabold text-foreground">Garantía de Alto Rendimiento</h4>
              <p className="text-sm text-foreground/60">Construimos tu plataforma con la misma tecnología que sostiene a los líderes globales.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["Netflix", "ChatGPT", "Claude", "Spotify", "Twitch", "TikTok", "Notion"].map((brand) => (
              <span 
                key={brand} 
                className="text-xs font-bold text-foreground/80 bg-foreground/[0.03] dark:bg-white/[0.02] px-4 py-1.5 rounded-full border border-foreground/10 hover:border-[#FF6A13]/40 hover:bg-[#FF6A13]/5 transition-all select-none"
              >
                {brand}
              </span>
            ))}
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
