/**
 * tests/stress_whatsapp_chat.js
 * Empirical verification harness for WhatsApp Interactive Chat Cloud (Gamfire Pattern).
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const chatModule = require('../src/js/whatsapp-chat.js');

console.log('='.repeat(72));
console.log('  Testing WhatsApp Interactive Chat Cloud Controller');
console.log('='.repeat(72));

// Test 1: Verify index.html contains necessary markup
console.log('\n[1] Verifying index.html WhatsApp Chat Cloud markup...');
const htmlPath = path.join(PROJECT_ROOT, 'src/index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

assert.ok(htmlContent.includes('id="whatsapp-chat-cloud"'), 'Must contain #whatsapp-chat-cloud element');
assert.ok(htmlContent.includes('id="whatsapp-fab"'), 'Must contain #whatsapp-fab element');
assert.ok(htmlContent.includes('class="wa-chat-header"'), 'Must contain .wa-chat-header');
assert.ok(htmlContent.includes('class="wa-chat-body"'), 'Must contain .wa-chat-body');
assert.ok(htmlContent.includes('class="wa-chat-footer"'), 'Must contain .wa-chat-footer');
assert.ok(htmlContent.includes('class="wa-chip"'), 'Must contain quick reply chips');
assert.ok(htmlContent.includes('id="wa-chat-input"'), 'Must contain chat input');
assert.ok(htmlContent.includes('id="wa-chat-send-btn"'), 'Must contain send button');
assert.ok(htmlContent.includes('whatsapp-chat.js'), 'Must load whatsapp-chat.js script');
console.log('✔ Markup test passed!');

// Test 2: Verify WhatsAppChatController logic with simulated DOM
console.log('\n[2] Testing Controller State & Messaging Logic...');

class MockElement {
  constructor(id, tag = 'div', attrs = {}) {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.attributes = { ...attrs };
    this._classes = new Set();
    this.classList = {
      add: (c) => this._classes.add(c),
      remove: (c) => this._classes.delete(c),
      contains: (c) => this._classes.has(c)
    };
    this.style = {};
    this.listeners = new Map();
    this.value = '';
    this.textContent = '';
  }

  getAttribute(name) {
    return this.attributes[name] !== undefined ? this.attributes[name] : null;
  }

  setAttribute(name, val) {
    this.attributes[name] = String(val);
  }

  removeAttribute(name) {
    delete this.attributes[name];
  }

  addEventListener(event, cb) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(cb);
  }

  trigger(event, data = {}) {
    const list = this.listeners.get(event) || [];
    for (const cb of list) {
      cb({
        preventDefault: () => {},
        stopPropagation: () => {},
        target: this,
        ...data
      });
    }
  }

  contains(other) {
    return other === this;
  }

  focus() {
    this.focused = true;
  }
}

// Setup mock DOM elements
const elements = {
  'whatsapp-fab': new MockElement('whatsapp-fab', 'a', { 'aria-expanded': 'false' }),
  'whatsapp-chat-cloud': new MockElement('whatsapp-chat-cloud', 'div', { 'aria-hidden': 'true', hidden: '' }),
  'wa-chat-close-btn': new MockElement('wa-chat-close-btn', 'button'),
  'wa-chat-form': new MockElement('wa-chat-form', 'form'),
  'wa-chat-input': new MockElement('wa-chat-input', 'input'),
  'wa-chat-send-btn': new MockElement('wa-chat-send-btn', 'button'),
  'wa-bubble-time': new MockElement('wa-bubble-time', 'span')
};

const docListeners = new Map();
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelectorAll: (selector) => {
    if (selector === '.wa-chip') return [];
    return [];
  },
  querySelector: (selector) => {
    if (selector === '.whatsapp-fab-badge') return new MockElement('badge');
    return null;
  },
  addEventListener: (event, cb) => {
    if (!docListeners.has(event)) docListeners.set(event, []);
    docListeners.get(event).push(cb);
  }
};

let openedUrl = null;
global.window = {
  open: (url) => { openedUrl = url; }
};

const controller = new chatModule.WhatsAppChatController({
  phone: '56929750390',
  defaultMessage: 'Hola por defecto'
});

// Test Open
controller.open();
assert.strictEqual(controller.isOpen, true, 'Controller must be open');
assert.strictEqual(elements['whatsapp-chat-cloud'].classList.contains('is-open'), true, 'Cloud must have is-open class');
assert.strictEqual(elements['whatsapp-chat-cloud'].getAttribute('aria-hidden'), 'false', 'aria-hidden must be false');
assert.strictEqual(elements['whatsapp-fab'].getAttribute('aria-expanded'), 'true', 'aria-expanded must be true');

// Test Close
controller.close();
assert.strictEqual(controller.isOpen, false, 'Controller must be closed');
assert.strictEqual(elements['whatsapp-chat-cloud'].classList.contains('is-open'), false, 'Cloud must remove is-open class');
assert.strictEqual(elements['whatsapp-chat-cloud'].getAttribute('aria-hidden'), 'true', 'aria-hidden must be true');
assert.strictEqual(elements['whatsapp-fab'].getAttribute('aria-expanded'), 'false', 'aria-expanded must be false');

// Test Send Message with Custom Text
controller.sendMessage('Quiero cotizar un sitio web para mi PYME');
assert.ok(openedUrl.startsWith('https://wa.me/56929750390?text='), 'Target must be official wa.me link');
assert.ok(openedUrl.includes('Quiero%20cotizar'), 'Message must be URI-encoded');

// Test Send Message with Fallback Default
controller.sendMessage('');
assert.ok(openedUrl.includes('Hola%20por%20defecto'), 'Empty message must use default fallback');

console.log('✔ Controller logic test passed!');
console.log('\nAll WhatsApp Chat Cloud tests passed with 100% success!');
