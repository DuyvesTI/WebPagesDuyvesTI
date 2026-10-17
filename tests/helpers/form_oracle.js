/**
 * tests/helpers/form_oracle.js
 * Authoritative Form validation, phone normalization, honeypot detection, and draft serialization.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHILEAN_PHONE_REGEX = /^(?:\+?56)?(?:\s?9)?\s*(\d{4})\s*(\d{4})$/;

function normalizeChileanPhone(input) {
  if (!input || typeof input !== 'string') return null;
  const digitsOnly = input.replace(/\D/g, '');

  // Case 1: 56912345678 (11 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('569')) {
    const main = digitsOnly.slice(3);
    return `+56 9 ${main.slice(0, 4)} ${main.slice(4)}`;
  }
  // Case 2: 912345678 (9 digits, starts with 9)
  if (digitsOnly.length === 9 && digitsOnly.startsWith('9')) {
    const main = digitsOnly.slice(1);
    return `+56 9 ${main.slice(0, 4)} ${main.slice(4)}`;
  }
  // Case 3: 12345678 (8 digits)
  if (digitsOnly.length === 8) {
    return `+56 9 ${digitsOnly.slice(0, 4)} ${digitsOnly.slice(4)}`;
  }

  return null; // Invalid Chilean phone
}

function validateField(fieldName, value) {
  const trimmed = typeof value === 'string' ? value.trim() : '';

  switch (fieldName) {
    case 'name':
      if (!trimmed) return { valid: false, error: 'El nombre es obligatorio' };
      if (trimmed.length < 2) return { valid: false, error: 'El nombre debe tener al menos 2 caracteres' };
      if (trimmed.length > 100) return { valid: false, error: 'El nombre no puede exceder 100 caracteres' };
      return { valid: true, error: null };

    case 'email':
      if (!trimmed) return { valid: false, error: 'El correo electrónico es obligatorio' };
      if (!EMAIL_REGEX.test(trimmed)) return { valid: false, error: 'Formato de correo electrónico inválido' };
      return { valid: true, error: null };

    case 'phone':
      if (!trimmed) return { valid: false, error: 'El teléfono de contacto es obligatorio' };
      const normalizedPhone = normalizeChileanPhone(trimmed);
      if (!normalizedPhone) return { valid: false, error: 'Número inválido. Use formato chileno: +56 9 1234 5678' };
      return { valid: true, error: null, normalized: normalizedPhone };

    case 'company':
      if (trimmed && trimmed.length > 100) return { valid: false, error: 'El nombre de empresa no puede exceder 100 caracteres' };
      return { valid: true, error: null };

    case 'message':
      if (!trimmed) return { valid: false, error: 'El mensaje o detalle del proyecto es obligatorio' };
      if (trimmed.length < 10) return { valid: false, error: 'El mensaje debe tener al menos 10 caracteres' };
      if (trimmed.length > 1000) return { valid: false, error: 'El mensaje no puede exceder 1000 caracteres' };
      return { valid: true, error: null };

    case 'plan':
      if (!trimmed) return { valid: false, error: 'Debe seleccionar un plan o tipo de proyecto' };
      return { valid: true, error: null };

    case 'organization_fax_hp':
      // Honeypot: must be empty string
      if (trimmed.length > 0) return { valid: false, isBot: true, error: 'Bot detected' };
      return { valid: true, isBot: false, error: null };

    default:
      return { valid: true, error: null };
  }
}

function validateFormPayload(payload = {}, submissionTime = Date.now()) {
  const errors = {};
  let isValid = true;
  let isBot = false;

  // Honeypot check
  if (payload.organization_fax_hp && payload.organization_fax_hp.trim().length > 0) {
    isBot = true;
  }

  // Time delta gate check (under 2500ms is considered bot behavior)
  if (payload.render_timestamp) {
    const elapsed = submissionTime - Number(payload.render_timestamp);
    if (elapsed < 2500) {
      isBot = true;
    }
  }

  // Validate required fields
  const requiredFields = ['name', 'email', 'phone', 'message'];
  for (const field of requiredFields) {
    const result = validateField(field, payload[field]);
    if (!result.valid) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  // Validate optional company
  if (payload.company) {
    const result = validateField('company', payload.company);
    if (!result.valid) {
      errors.company = result.error;
      isValid = false;
    }
  }

  return {
    isValid: isValid && !isBot,
    isBot,
    errors,
    normalizedPhone: payload.phone ? normalizeChileanPhone(payload.phone) : null
  };
}

function serializeDraft(formData = {}) {
  // Exclude honeypot, timestamps, and sensitive tokens
  const draft = {
    name: formData.name || '',
    email: formData.email || '',
    phone: formData.phone || '',
    company: formData.company || '',
    plan: formData.plan || '',
    message: formData.message || '',
    savedAt: Date.now()
  };
  return JSON.stringify(draft);
}

function deserializeDraft(draftJson) {
  if (!draftJson) return null;
  try {
    const data = JSON.parse(draftJson);
    if (typeof data !== 'object' || data === null) return null;
    return data;
  } catch (e) {
    return null;
  }
}

module.exports = {
  EMAIL_REGEX,
  CHILEAN_PHONE_REGEX,
  normalizeChileanPhone,
  validateField,
  validateFormPayload,
  serializeDraft,
  deserializeDraft
};
