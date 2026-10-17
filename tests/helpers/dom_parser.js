/**
 * tests/helpers/dom_parser.js
 * High-performance, zero-dependency HTML parser & DOM query engine for DuyvesTI E2E tests.
 * Supports tag, id, class, attribute selectors, text extraction, and JSON-LD parsing.
 */

class DOMElement {
  constructor(tagName = '', attributes = {}, rawContent = '') {
    this.tagName = tagName.toLowerCase();
    this.attributes = attributes;
    this.rawContent = rawContent;
    this.children = [];
    this.parentNode = null;
  }

  getAttribute(name) {
    if (!name) return null;
    const lower = name.toLowerCase();
    for (const key of Object.keys(this.attributes)) {
      if (key.toLowerCase() === lower) {
        return this.attributes[key];
      }
    }
    return null;
  }

  hasAttribute(name) {
    return this.getAttribute(name) !== null;
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  get classList() {
    const cls = this.className.trim();
    return cls ? cls.split(/\s+/) : [];
  }

  hasClass(cls) {
    return this.classList.includes(cls);
  }

  get textContent() {
    // Strip all HTML tags from rawContent
    return this.rawContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  get innerHTML() {
    return this.rawContent;
  }

  containsText(text) {
    if (typeof text !== 'string') return false;
    return this.textContent.toLowerCase().includes(text.toLowerCase());
  }

  matchesSelector(selector) {
    if (!selector) return false;
    const sel = selector.trim();

    // ID selector: #foo
    if (sel.startsWith('#')) {
      return this.id === sel.slice(1);
    }

    // Class selector: .foo
    if (sel.startsWith('.')) {
      return this.hasClass(sel.slice(1));
    }

    // Attribute selector: [attr] or [attr="val"] or [attr='val'] or [attr*="val"]
    if (sel.startsWith('[') && sel.endsWith(']')) {
      const inside = sel.slice(1, -1).trim();
      const eqIdx = inside.indexOf('=');
      if (eqIdx === -1) {
        return this.hasAttribute(inside);
      }
      const attrName = inside.slice(0, eqIdx).trim();
      let expectedVal = inside.slice(eqIdx + 1).trim();
      if ((expectedVal.startsWith('"') && expectedVal.endsWith('"')) ||
          (expectedVal.startsWith("'") && expectedVal.endsWith("'"))) {
        expectedVal = expectedVal.slice(1, -1);
      }
      if (attrName.endsWith('*')) {
        const realAttr = attrName.slice(0, -1).trim();
        const val = this.getAttribute(realAttr);
        return typeof val === 'string' && val.includes(expectedVal);
      }
      return this.getAttribute(attrName) === expectedVal;
    }

    // Tag selector with optional attribute or class, e.g. "section#hero" or "div.card" or "input[name='email']"
    const tagMatch = sel.match(/^([a-zA-Z0-9_-]+)(.*)$/);
    if (tagMatch) {
      const tag = tagMatch[1].toLowerCase();
      const rest = tagMatch[2].trim();
      if (this.tagName !== tag && tag !== '*') return false;
      if (!rest) return true;
      return this.matchesSelector(rest);
    }

    return false;
  }

  querySelector(selector) {
    const list = this.querySelectorAll(selector);
    return list.length > 0 ? list[0] : null;
  }

  querySelectorAll(selector) {
    if (!selector) return [];
    if (selector.includes(',')) {
      const subSelectors = selector.split(',').map(s => s.trim()).filter(Boolean);
      const combined = [];
      for (const sub of subSelectors) {
        for (const el of this.querySelectorAll(sub)) {
          if (!combined.includes(el)) combined.push(el);
        }
      }
      return combined;
    }
    const results = [];
    const parts = selector.trim().split(/\s+/);

    if (parts.length === 1) {
      const single = parts[0];
      const traverse = (node) => {
        for (const child of node.children) {
          if (child.matchesSelector(single)) {
            results.push(child);
          }
          traverse(child);
        }
      };
      traverse(this);
      return results;
    }

    // Descendant combinator: "header nav a"
    const traverseDescendants = (currentNodes, remainingParts) => {
      if (remainingParts.length === 0) return currentNodes;
      const nextPart = remainingParts[0];
      const nextNodes = [];
      for (const node of currentNodes) {
        const matching = node.querySelectorAll(nextPart);
        for (const m of matching) {
          if (!nextNodes.includes(m)) nextNodes.push(m);
        }
      }
      return traverseDescendants(nextNodes, remainingParts.slice(1));
    };

    return traverseDescendants([this], parts);
  }
}

class DOMDocument extends DOMElement {
  constructor(html = '') {
    super('document', {}, html);
    this.rawHtml = html;
    this._parse();
  }

  _parse() {
    const tagRegex = /<([a-zA-Z0-9:-]+)((?:\s+[^>]*?)?)\s*(?:\/>|>([\s\S]*?)<\/\1>|>)/gi;
    const voidTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr'
    ]);

    // Parse attributes helper
    const parseAttrs = (attrStr) => {
      const attrs = {};
      if (!attrStr) return attrs;
      const attrRegex = /([a-zA-Z0-9_:-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
      let m;
      while ((m = attrRegex.exec(attrStr)) !== null) {
        const key = m[1];
        const val = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] !== undefined ? m[4] : ''));
        attrs[key] = val;
      }
      return attrs;
    };

    // Lightweight recursive tag extractor
    const extractTags = (htmlStr, parent) => {
      const regex = /<([a-zA-Z0-9:-]+)((?:\s+[^>]*?)?)\s*(?:\/>|>)/g;
      let match;
      let cursor = 0;

      while ((match = regex.exec(htmlStr)) !== null) {
        const tagName = match[1].toLowerCase();
        const attrStr = match[2];
        const matchIndex = match.index;
        const tagLength = match[0].length;
        const attrs = parseAttrs(attrStr);

        if (voidTags.has(tagName) || match[0].endsWith('/>')) {
          const el = new DOMElement(tagName, attrs, '');
          el.parentNode = parent;
          parent.children.push(el);
          cursor = matchIndex + tagLength;
          continue;
        }

        // Find closing tag taking nesting into account
        const openTag = `<${match[1]}`;
        const closeTag = `</${match[1]}>`;
        let depth = 1;
        let searchIndex = matchIndex + tagLength;
        let closeIndex = -1;

        while (depth > 0) {
          const nextOpen = htmlStr.toLowerCase().indexOf(openTag.toLowerCase(), searchIndex);
          const nextClose = htmlStr.toLowerCase().indexOf(closeTag.toLowerCase(), searchIndex);

          if (nextClose === -1) break;

          if (nextOpen !== -1 && nextOpen < nextClose) {
            // Check if nextOpen is an actual start tag (followed by space, >, or />)
            const afterOpen = htmlStr[nextOpen + openTag.length];
            if (/\s|>|\//.test(afterOpen)) {
              depth++;
            }
            searchIndex = nextOpen + openTag.length;
          } else {
            depth--;
            if (depth === 0) {
              closeIndex = nextClose;
            }
            searchIndex = nextClose + closeTag.length;
          }
        }

        const innerContent = closeIndex !== -1 ? htmlStr.slice(matchIndex + tagLength, closeIndex) : '';
        const el = new DOMElement(tagName, attrs, innerContent);
        el.parentNode = parent;
        parent.children.push(el);

        // Recursively parse children inside innerContent if it's not script or style
        if (tagName !== 'script' && tagName !== 'style' && innerContent.includes('<')) {
          extractTags(innerContent, el);
        }

        regex.lastIndex = closeIndex !== -1 ? closeIndex + closeTag.length : matchIndex + tagLength;
      }
    };

    extractTags(this.rawHtml, this);
  }

  getElementById(id) {
    const list = this.querySelectorAll(`#${id}`);
    return list.length > 0 ? list[0] : null;
  }

  extractJsonLd() {
    const scripts = this.querySelectorAll('script');
    const jsonLdObjects = [];
    for (const s of scripts) {
      if (s.getAttribute('type') === 'application/ld+json') {
        try {
          const parsed = JSON.parse(s.rawContent.trim());
          jsonLdObjects.push(parsed);
        } catch (e) {
          // Record syntax error in jsonld for verification
          jsonLdObjects.push({ __error: e.message, raw: s.rawContent });
        }
      }
    }
    return jsonLdObjects;
  }
}

function parseHTML(htmlString) {
  return new DOMDocument(htmlString || '');
}

module.exports = {
  DOMElement,
  DOMDocument,
  parseHTML
};
