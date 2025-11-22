// Jest setup file
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

// Polyfill crypto.randomUUID for Node.js
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
  writable: true,
  configurable: true
});

// Polyfill structuredClone for Node.js < 17
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value.toString();
  },
  removeItem(key) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

// Mock window.location
delete window.location;
window.location = {
  hostname: 'localhost',
  href: 'http://localhost/',
  origin: 'http://localhost',
  pathname: '/',
  search: '',
  hash: ''
};

// Mock navigator.clipboard
import { jest } from '@jest/globals';
global.navigator.clipboard = {
  writeText: jest.fn(() => Promise.resolve())
};

// Mock alert, confirm, prompt
global.alert = () => {};
global.confirm = () => true;
global.prompt = () => null;

// Mock File and Blob APIs
class MockBlob {
  constructor(parts, options) {
    this.parts = parts || [];
    this.options = options || {};
    this.type = this.options.type || '';
    this.size = this.parts.reduce((acc, part) => acc + (part.length || 0), 0);
  }

  text() {
    return Promise.resolve(this.parts.join(''));
  }

  // Make it compatible with FileReader
  toString() {
    return this.parts.join('');
  }
}

class MockFile extends MockBlob {
  constructor(parts, name, options) {
    super(parts, options);
    this.name = name;
    this.lastModified = Date.now();
  }
}

global.Blob = MockBlob;
global.File = MockFile;

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.error = null;
    this.readyState = 0;
    this.onload = null;
    this.onerror = null;
  }

  readAsText(blob) {
    setTimeout(() => {
      try {
        this.result = blob.parts.join('');
        this.readyState = 2;
        if (this.onload) {
          this.onload({ target: this });
        }
      } catch (error) {
        this.error = error;
        this.readyState = 2;
        if (this.onerror) {
          this.onerror({ target: this });
        }
      }
    }, 0);
  }
};

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = () => 'blob:mock-url';
global.URL.revokeObjectURL = () => {};

