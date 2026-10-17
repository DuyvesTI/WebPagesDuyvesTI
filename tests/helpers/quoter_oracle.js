/**
 * tests/helpers/quoter_oracle.js
 * Authoritative Quoter calculation and state transition engine.
 */

const PLAN_CATALOG = {
  // Support standard pricing and promo pricing from PROJECT.md and requirements_spec.md
  standard: {
    landing: { id: 'landing', name: 'Landing Page de Conversión', price: 180000, days: 5 },
    corporate: { id: 'corporate', name: 'Sitio Web Corporativo PyME', price: 320000, days: 10 },
    custom: { id: 'custom', name: 'Plataforma / App Web a Medida', price: 580000, days: 20 }
  },
  promo: {
    landing: { id: 'landing', name: 'Landing Emprendedor', price: 149990, days: 5 },
    corporate: { id: 'corporate', name: 'Web PyME', price: 299990, days: 10 },
    custom: { id: 'custom', name: 'Startup', price: 499990, days: 20 }
  }
};

const ADDON_CATALOG = {
  whatsapp_crm: { id: 'whatsapp_crm', name: 'Integración CRM / WhatsApp Business', price: 35000 },
  payment_gateway: { id: 'payment_gateway', name: 'Pasarela de Pagos (Webpay/Fintoc)', price: 75000 },
  seo_local: { id: 'seo_local', name: 'SEO Local Avanzado + Google Business', price: 45000 },
  catalog: { id: 'catalog', name: 'Catálogo Interactivo con Filtros', price: 60000 },
  support_pack: { id: 'support_pack', name: 'Pack Soporte y Capacitación (30 días)', price: 30000 }
};

function formatCLP(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '$0 CLP';
  const parts = Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${parts} CLP`;
}

function calculateQuote({ projectType, addons = [], tier = 'standard', fullPaymentDiscount = 0 }) {
  if (!projectType) {
    throw new Error('Project type is required');
  }

  const catalog = PLAN_CATALOG[tier] || PLAN_CATALOG.standard;
  const plan = catalog[projectType];
  if (!plan) {
    throw new Error(`Unknown project type: ${projectType}`);
  }

  let addonsTotal = 0;
  const resolvedAddons = [];

  for (const addonKey of addons) {
    const addon = ADDON_CATALOG[addonKey];
    if (addon) {
      addonsTotal += addon.price;
      resolvedAddons.push(addon);
    }
  }

  const subtotal = plan.price + addonsTotal;
  const discountAmount = fullPaymentDiscount > 0 ? Math.round(subtotal * (fullPaymentDiscount / 100)) : 0;
  const totalPrice = subtotal - discountAmount;

  const upfrontPayment = Math.round(totalPrice * 0.5);
  const deliveryPayment = totalPrice - upfrontPayment;

  const summaryText = `Cotización personalizada seleccionada: ${plan.name} (${formatCLP(totalPrice)}) con adicionales: ${
    resolvedAddons.length > 0 ? resolvedAddons.map(a => a.name).join(', ') : 'Ninguno'
  }`;

  return {
    planId: plan.id,
    planName: plan.name,
    deliveryDays: plan.days,
    basePrice: plan.price,
    addons: resolvedAddons,
    addonsTotal,
    subtotal,
    discountAmount,
    totalPrice,
    upfrontPayment,
    deliveryPayment,
    formattedTotal: formatCLP(totalPrice),
    formattedUpfront: formatCLP(upfrontPayment),
    formattedDelivery: formatCLP(deliveryPayment),
    summaryText
  };
}

module.exports = {
  PLAN_CATALOG,
  ADDON_CATALOG,
  formatCLP,
  calculateQuote
};
