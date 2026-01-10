import { describe, test, expect, beforeEach } from '@jest/globals';
import { showToast, showLoading, hideLoading, copyToClipboard, formatDate, formatBytes, confirm } from '../js/ui.js';

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
    test('should copy text to clipboard', async () => {
      const text = 'Test text to copy';

      await copyToClipboard(text);

      // Verify clipboard was called (mocked in jest.setup.js)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    test('should handle clipboard errors gracefully', async () => {
      // Mock clipboard to throw error
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Clipboard error'));

      // Should reject with error (caller handles the error display)
      await expect(copyToClipboard('test')).rejects.toThrow('Clipboard error');
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
});
