/**
 * tests/helpers/test_context.js
 * Test environment context, artifact discovery, and unified DOM/HTTP assertion helpers.
 */

const fs = require('node:fs');
const path = require('node:path');
const { parseHTML } = require('./dom_parser.js');

const PROJECT_ROOT = path.resolve(__dirname, '../../');

class TestContext {
  static get projectRoot() {
    return PROJECT_ROOT;
  }

  static hasFile(relPath) {
    const fullPath = path.join(PROJECT_ROOT, relPath);
    return fs.existsSync(fullPath);
  }

  static readFile(relPath) {
    const fullPath = path.join(PROJECT_ROOT, relPath);
    if (!fs.existsSync(fullPath)) return null;
    return fs.readFileSync(fullPath, 'utf-8');
  }

  static hasIndexHtml() {
    return this.hasFile('src/index.html') || this.hasFile('index.html');
  }

  static getIndexHtml() {
    return this.readFile('src/index.html') || this.readFile('index.html');
  }

  static getIndexDom() {
    const html = this.getIndexHtml();
    return html ? parseHTML(html) : null;
  }

  static hasPrivacyHtml() {
    return this.hasFile('src/privacy.html') || this.hasFile('privacy.html');
  }

  static getPrivacyHtml() {
    return this.readFile('src/privacy.html') || this.readFile('privacy.html');
  }

  static getPrivacyDom() {
    const html = this.getPrivacyHtml();
    return html ? parseHTML(html) : null;
  }

  static hasServer() {
    return this.hasFile('server.js');
  }

  static hasQuoterJs() {
    return this.hasFile('src/js/quoter.js');
  }

  static hasFormJs() {
    return this.hasFile('src/js/form.js');
  }

  static hasThemeJs() {
    return this.hasFile('src/js/theme.js');
  }

  static hasNavJs() {
    return this.hasFile('src/js/nav.js');
  }

  static hasSchemaJs() {
    return this.hasFile('src/js/schema.js');
  }

  static loadQuoterModule() {
    if (!this.hasQuoterJs()) return null;
    const p = path.join(PROJECT_ROOT, 'src/js/quoter.js');
    delete require.cache[require.resolve(p)];
    return require(p);
  }

  static loadFormModule() {
    if (!this.hasFormJs()) return null;
    const p = path.join(PROJECT_ROOT, 'src/js/form.js');
    delete require.cache[require.resolve(p)];
    return require(p);
  }

  static async probeHttpServer(baseUrl = 'http://127.0.0.1:3000') {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1000);
      const res = await fetch(baseUrl, { signal: controller.signal });
      clearTimeout(timeout);
      return { available: true, status: res.status, headers: Object.fromEntries(res.headers.entries()) };
    } catch (e) {
      return { available: false, error: e.message };
    }
  }
}

module.exports = {
  TestContext
};
