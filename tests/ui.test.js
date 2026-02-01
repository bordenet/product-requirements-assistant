import { showToast, showLoading, hideLoading, copyToClipboard, formatDate, formatBytes, confirm, showDocumentPreviewModal } from '../js/ui.js';

describe('UI Module', () => {
  beforeEach(() => {
    // Set up DOM elements needed for UI functions
    document.body.innerHTML = `
      <div id="toast-container"></div>
      <div id="loading-overlay" class="hidden">
        <div id="loading-text"></div>
      </div>
    `;
  });

  describe('showToast', () => {
    test('should create toast element', () => {
      showToast('Test message', 'info', 100);

      const container = document.getElementById('toast-container');
      expect(container.children.length).toBeGreaterThan(0);
    });

    test('should show success toast with correct styling', () => {
      showToast('Success!', 'success', 100);

      const container = document.getElementById('toast-container');
      const toast = container.firstChild;
      expect(toast.className).toContain('bg-green-500');
      expect(toast.textContent).toContain('Success!');
    });

    test('should show error toast with correct styling', () => {
      showToast('Error!', 'error', 100);

      const container = document.getElementById('toast-container');
      const toast = container.firstChild;
      expect(toast.className).toContain('bg-red-500');
      expect(toast.textContent).toContain('Error!');
    });

    test('should show warning toast with correct styling', () => {
      showToast('Warning!', 'warning', 100);

      const container = document.getElementById('toast-container');
      const toast = container.firstChild;
      expect(toast.className).toContain('bg-yellow-500');
      expect(toast.textContent).toContain('Warning!');
    });

    test('should show info toast by default', () => {
      showToast('Info message', undefined, 100);

      const container = document.getElementById('toast-container');
      const toast = container.firstChild;
      expect(toast.className).toContain('bg-blue-500');
    });
  });

  describe('showLoading and hideLoading', () => {
    test('should show loading overlay', () => {
      showLoading('Loading data...');

      const overlay = document.getElementById('loading-overlay');
      const text = document.getElementById('loading-text');

      expect(overlay.classList.contains('hidden')).toBe(false);
      expect(text.textContent).toBe('Loading data...');
    });

    test('should hide loading overlay', () => {
      showLoading('Loading...');
      hideLoading();

      const overlay = document.getElementById('loading-overlay');
      expect(overlay.classList.contains('hidden')).toBe(true);
    });

    test('should use default loading text', () => {
      showLoading();

      const text = document.getElementById('loading-text');
      expect(text.textContent).toBe('Loading...');
    });
  });

  describe('copyToClipboard', () => {
    test('should copy text to clipboard using ClipboardItem with Promise', async () => {
      const writeMock = jest.fn().mockResolvedValue();
      navigator.clipboard.write = writeMock;

      const text = 'Test text to copy';
      await copyToClipboard(text);

      // The new implementation uses ClipboardItem with Promise-wrapped Blob for Safari transient activation
      expect(writeMock).toHaveBeenCalledTimes(1);
      // Verify it was called with an array containing a ClipboardItem
      expect(writeMock).toHaveBeenCalledWith(expect.any(Array));
    });

    test('should throw error if all clipboard methods fail', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock write (ClipboardItem) to fail
      navigator.clipboard.write = jest.fn().mockRejectedValue(new Error('Not allowed'));
      // Mock execCommand to also fail
      document.execCommand = jest.fn().mockReturnValue(false);

      await expect(copyToClipboard('test')).rejects.toThrow();

      consoleWarnSpy.mockRestore();
    });

    test('should fallback to execCommand when Clipboard API unavailable', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
      });
      document.execCommand = jest.fn().mockReturnValue(true);

      await copyToClipboard('test');
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('formatDate', () => {
    test('should format ISO date string', () => {
      const isoDate = '2024-01-15T10:30:00.000Z';
      const formatted = formatDate(isoDate);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('should format Date object', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const formatted = formatDate(date);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    test('should format timestamp', () => {
      const timestamp = Date.now();
      const formatted = formatDate(timestamp);

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('formatBytes', () => {
    test('should format bytes', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    test('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    test('should format megabytes', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });

    test('should format gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1 GB');
    });

    test('should handle zero', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });
  });

  describe('confirm', () => {
    test('should create confirmation modal', async () => {
      const promise = confirm('Test Title', 'Test Message');

      const modal = document.querySelector('.fixed.inset-0');
      expect(modal).toBeTruthy();
      expect(modal.textContent).toContain('Test Title');
      expect(modal.textContent).toContain('Test Message');

      // Click confirm button
      const confirmBtn = modal.querySelector('#confirm-btn');
      confirmBtn.click();

      const result = await promise;
      expect(result).toBe(true);
      expect(document.querySelector('.fixed.inset-0')).toBeFalsy();
    });

    test('should return true when confirm button clicked', async () => {
      const promise = confirm('Delete?', 'Are you sure?');

      const confirmBtn = document.querySelector('#confirm-btn');
      confirmBtn.click();

      const result = await promise;
      expect(result).toBe(true);
    });

    test('should return false when cancel button clicked', async () => {
      const promise = confirm('Delete?', 'Are you sure?');

      const cancelBtn = document.querySelector('#cancel-btn');
      cancelBtn.click();

      const result = await promise;
      expect(result).toBe(false);
    });

    test('should return false when background clicked', async () => {
      const promise = confirm('Delete?', 'Are you sure?');

      const modal = document.querySelector('.fixed.inset-0');
      modal.click();

      const result = await promise;
      expect(result).toBe(false);
    });

    test('should remove modal after interaction', async () => {
      const promise = confirm('Test', 'Message');

      expect(document.querySelector('.fixed.inset-0')).toBeTruthy();

      const confirmBtn = document.querySelector('#confirm-btn');
      confirmBtn.click();

      await promise;
      expect(document.querySelector('.fixed.inset-0')).toBeFalsy();
    });
  });

  describe('showDocumentPreviewModal', () => {
    beforeEach(() => {
      document.body.innerHTML = '<div id="toast-container"></div>';
      window.getSelection = jest.fn(() => ({
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      }));
      document.createRange = jest.fn(() => ({
        selectNodeContents: jest.fn()
      }));
    });

    test('should display modal with rendered markdown content', () => {
      global.marked = { parse: (md) => `<p>${md}</p>` };

      showDocumentPreviewModal('# Test Content', 'Preview Title', 'test.md');

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain('Preview Title');
      expect(modal.innerHTML).toContain('Test Content');

      document.querySelector('#close-preview-modal').click();
      delete global.marked;
    });

    test('should fallback to escaped HTML when marked is unavailable', () => {
      delete global.marked;

      showDocumentPreviewModal('Test **content**', 'Title', 'doc.md');

      const modal = document.querySelector('.fixed');
      expect(modal).toBeTruthy();
      expect(modal.innerHTML).toContain('Test **content**');

      modal.querySelector('#close-modal-btn').click();
    });

    test('should close modal when X button is clicked', () => {
      showDocumentPreviewModal('Content', 'Title');

      const closeBtn = document.querySelector('#close-preview-modal');
      expect(closeBtn).toBeTruthy();
      closeBtn.click();

      expect(document.querySelector('.fixed')).toBeNull();
    });

    test('should close modal when Close button is clicked', () => {
      showDocumentPreviewModal('Content', 'Title');

      const closeBtn = document.querySelector('#close-modal-btn');
      closeBtn.click();

      expect(document.querySelector('.fixed')).toBeNull();
    });

    test('should close modal when backdrop is clicked', () => {
      showDocumentPreviewModal('Content', 'Title');

      const modal = document.querySelector('.fixed');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: modal, enumerable: true });
      modal.dispatchEvent(event);

      expect(document.querySelector('.fixed')).toBeNull();
    });

    test('should close modal on Escape key', () => {
      showDocumentPreviewModal('Content', 'Title');

      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);

      expect(document.querySelector('.fixed')).toBeNull();
    });

    test('should copy formatted text when copy button is clicked', async () => {
      document.execCommand = jest.fn().mockReturnValue(true);

      showDocumentPreviewModal('Content', 'Title');

      const copyBtn = document.querySelector('#copy-formatted-btn');
      await copyBtn.click();

      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });

    test('should download markdown file when download button is clicked', () => {
      const mockUrl = 'blob:test-url';
      const mockAnchor = { href: '', download: '', click: jest.fn() };
      const originalCreateObjectURL = URL.createObjectURL;
      const originalRevokeObjectURL = URL.revokeObjectURL;
      const originalCreateElement = document.createElement.bind(document);

      URL.createObjectURL = jest.fn(() => mockUrl);
      URL.revokeObjectURL = jest.fn();
      document.createElement = jest.fn((tag) => {
        if (tag === 'a') return mockAnchor;
        return originalCreateElement(tag);
      });

      const onDownload = jest.fn();

      showDocumentPreviewModal('Content', 'Title', 'test-doc.md', onDownload);

      const downloadBtn = document.querySelector('#download-md-btn');
      downloadBtn.click();

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('test-doc.md');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
      expect(onDownload).toHaveBeenCalled();

      URL.createObjectURL = originalCreateObjectURL;
      URL.revokeObjectURL = originalRevokeObjectURL;
      document.createElement = originalCreateElement;
    });

    test('should use marked function directly if marked.parse is unavailable', () => {
      global.marked = (md) => `<strong>${md}</strong>`;

      showDocumentPreviewModal('Bold text', 'Title');

      const modal = document.querySelector('.fixed');
      expect(modal.innerHTML).toContain('<strong>');

      modal.querySelector('#close-modal-btn').click();
      delete global.marked;
    });
  });
});
