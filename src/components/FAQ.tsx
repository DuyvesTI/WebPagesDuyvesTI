"use client";

import React, { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "¿En qué se diferencian de otras agencias tradicionales o de bajo costo?",
      answer: "A diferencia de las agencias que usan plantillas repetidas y lentas, nosotros creamos tu página desde cero. Esto significa que tu sitio web cargará al instante, tendrá un diseño único pensado para tus clientes y estará listo para ganar los primeros lugares en Google.",
    },
    {
      question: "¿Se pagan mensualidades por la página web?",
      answer: "No. Solo cobramos por el desarrollo del proyecto. Una vez finalizado, tú eres el dueño absoluto del código fuente y del sitio web. No cobramos mensualidades absurdas por tener tu sitio en comodato, a diferencia del modelo de negocio de nuestra competencia.",
    },
    {
      question: "¿Cuánto tarda el desarrollo del proyecto?",
      answer: "Los tiempos varían según el alcance: las Landings Premium pueden estar listas entre 2 y 3 semanas. Las Webs Corporativas multi-página demoran entre 3 y 5 semanas. Durante este periodo, serás parte del proceso y te mantendremos informado paso a paso.",
    },
    {
      question: "¿Mi página estará optimizada para SEO (Google)?",
      answer: "Sí, todas nuestras páginas están preparadas para aparecer en Google desde el primer día. Cuidamos todos los detalles técnicos y de velocidad para que los motores de búsqueda le den preferencia a tu negocio sobre tu competencia.",
    },
    {
      question: "¿Ofrecen soporte luego de terminar el sitio?",
      answer: "Absolutamente. Te damos 30 días de periodo de garantía y soporte técnico sin costo adicional, para asegurar que todo funcione a la perfección tras el despliegue de tu página en producción. Adicionalmente, podemos ofrecerte un plan de mantención mensual si lo prefieres.",
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 relative bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-widest text-[#FF6A13] uppercase mb-3">
            Transparencia Total
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight">
             Preguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/50">Frecuentes</span>
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-foreground/30 bg-foreground/[0.04]' 
                  : 'border-foreground/10 bg-foreground/[0.02] hover:bg-foreground/[0.04]'
              }`}
            >
              <button 
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex justify-between items-center focus:outline-none"
              >
                <span className="font-bold text-lg text-foreground pr-8">{faq.question}</span>
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-foreground/5">
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 text-[#FF6A13] ${openIndex === index ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-foreground/70 leading-relaxed text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
