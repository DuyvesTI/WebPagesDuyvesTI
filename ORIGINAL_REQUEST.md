# Original User Request

## Initial Request — 2026-09-11T00:23:15Z

<USER_REQUEST>
Rediseñar y optimizar la plataforma web de DuyvesTI (https://duyvesti.vercel.app/) para captar clientes del segmento PyMEs y Startups con un lenguaje claro, cercano y orientado a resultados de negocio (sin tecnicismos innecesarios).

Working directory: ~/teamwork_projects/duyvesti_relaunch
Integrity mode: development

## Requirements

### R1. Estrategia de Mensaje y Diseño UX/UI (Agente de Diseño)
- Reestructurar el copywriting de la landing page eliminando términos técnicos intimidantes y destacando la propuesta de valor: "Paga una sola vez, sé el dueño total de tu web y olvídate de arriendos mensuales abusivos".
- Diseñar un cotizador/asistente interactivo en 3 pasos que guíe al cliente a elegir su solución ideal.
- Desarrollar una interfaz mobile-first accesible (WCAG AA), con paleta de colores optimizada y transiciones suaves de tema oscuro/claro.

### R2. Desarrollo Frontend, Velocidad y SEO (Agente de Desarrollo)
- Implementar la solución en Next.js y Tailwind CSS optimizado para alcanzar puntuación Lighthouse >= 95 en móviles.
- Construir un formulario de contacto y cotización reactivo con validaciones instantáneas y respaldo automatizado.
- Configurar marcado semántico estructurado Schema.org (LocalBusiness y FAQPage) para indexación en Google.

### R3. Aseguramiento de Calidad y Pruebas (Agente QA)
- Validar el correcto funcionamiento e interactividad en navegadores Chrome, Safari, Firefox y Edge bajo resoluciones móviles y de escritorio.
- Verificar accesibilidad completa por teclado, contraste de colores y ausencia total de errores de consola o parpadeos de carga.

### R4. Ciberseguridad y Privacidad (Agente de Ciberseguridad)
- Configurar encabezados HTTP seguros (HSTS, CSP, X-Content-Type-Options, X-Frame-Options) alcanzando calificación A+ en auditorías de seguridad.
- Implementar protección anti-spam silenciosa (Honeypot / Cloudflare Turnstile) y sanitización estricta de formularios.
- Redactar e integrar la Política de Privacidad y Tratamiento de Datos comprensible para dueños de empresas.

## Acceptance Criteria

### Experiencia y Claridad
- [ ] La propuesta de valor y planes en CLP se entienden claramente en menos de 5 segundos de lectura.
- [ ] El cotizador interactivo recomienda el plan adecuado de forma fluida.

### Rendimiento y Calidad Técnica
- [ ] Google Lighthouse >= 95 en Rendimiento, Accesibilidad, Prácticas Recomendadas y SEO.
- [ ] Tiempo de carga (LCP) inferior a 1.2 segundos en conexión móvil estándar.
- [ ] Cero errores de JavaScript en consola durante toda la navegación.

### Seguridad
- [ ] Calificación de encabezados de seguridad de grado A o superior en auditorías web.
- [ ] Formularios blindados contra inyecciones y envíos automatizados de bots.
</USER_REQUEST>
