/**
 * @file tutorial.js
 * @desc Onboarding tutorial cho first-time users
 */

import { Storage } from '../utils/storage.js';
import { showToast } from '../ui/toast.js';

const TUTORIAL_KEY = 'vnpt_tutorial_completed';
const TUTORIAL_VERSION = '1.8.18';

const TUTORIAL_STEPS = [
  {
    target: '#vnpt-toggle-btn',
    title: '👋 Chào mừng đến với VNPT PRO!',
    content: 'Đây là nút mở/đóng widget. Click để bắt đầu!',
    position: 'left',
    action: 'click'
  },
  {
    target: '#vnpt-btn-scan',
    title: '📊 Quét dữ liệu',
    content: 'Click đây để lấy dữ liệu từ form web vào bảng. Hoặc dùng phím tắt Ctrl+Shift+S',
    position: 'bottom'
  },
  {
    target: '#vnpt-btn-fill-back',
    title: '📝 Điền dữ liệu',
    content: 'Điền dữ liệu từ bảng lên form web. Phím tắt: Ctrl+Shift+F',
    position: 'bottom'
  },
  {
    target: '#vnpt-btn-ai-mode',
    title: '🤖 AI Scanner',
    content: 'Quét PDF, ảnh, email bằng Gemini AI. Cần API key (miễn phí tại Google AI Studio)',
    position: 'bottom'
  },
  {
    target: '#vnpt-inline-calc',
    title: '🧮 Calc Widget',
    content: 'Tính thuế VAT tự động. Nhập giá trị → Kết quả tự động → Click 🔄 để đồng bộ',
    position: 'top'
  },
  {
    target: '#vnpt-btn-more',
    title: '⚙️ Cài đặt',
    content: 'Mở menu để: Đăng nhập Cloud, cấu hình Gemini API, thay đổi kích thước widget',
    position: 'left'
  },
  {
    target: '#vnpt-btn-restore-last',
    title: '⏪ Khôi phục',
    content: 'Khôi phục dữ liệu từ 20 bản lưu gần nhất. Tự động backup khi dọn dẹp',
    position: 'left'
  },
  {
    target: '#vnpt-btn-pin',
    title: '📌 Ghim widget',
    content: 'Thu gọn widget, tự động mở khi hover. Tiết kiệm không gian màn hình!',
    position: 'bottom'
  },
  {
    target: null,
    title: '🎉 Hoàn tất!',
    content: `
      <div style="text-align: center;">
        <p style="font-size: 14px; margin-bottom: 12px;">Bạn đã sẵn sàng sử dụng VNPT PRO!</p>
        <p style="font-size: 12px; color: #666;">
          💡 Nhấn nút <strong>💡 Tips</strong> bất cứ lúc nào để xem hướng dẫn chi tiết
        </p>
        <p style="font-size: 12px; color: #666; margin-top: 8px;">
          📚 Đọc <a href="https://github.com/tranchien2000/vnpt-tampermonkey-vite#readme" target="_blank" style="color: #1a73e8;">README</a> để biết thêm
        </p>
      </div>
    `,
    position: 'center'
  }
];

export class Tutorial {
  constructor() {
    this.currentStep = 0;
    this.overlay = null;
    this.spotlight = null;
    this.tooltip = null;
    this.isActive = false;
  }

  /**
   * Kiểm tra xem user đã hoàn thành tutorial chưa
   */
  static shouldShow() {
    const completed = Storage.get(TUTORIAL_KEY);
    return !completed || completed !== TUTORIAL_VERSION;
  }

  /**
   * Đánh dấu tutorial đã hoàn thành
   */
  static markCompleted() {
    Storage.set(TUTORIAL_KEY, TUTORIAL_VERSION);
  }

  /**
   * Reset tutorial (để test hoặc show lại)
   */
  static reset() {
    Storage.remove(TUTORIAL_KEY);
  }

  /**
   * Bắt đầu tutorial
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.showStep(0);
  }

  /**
   * Tạo overlay và spotlight
   */
  createOverlay() {
    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'vnpt-tutorial-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 9999998;
      transition: opacity 0.3s;
    `;

    // Spotlight
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'vnpt-tutorial-spotlight';
    this.spotlight.style.cssText = `
      position: fixed;
      border: 3px solid #1a73e8;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(26, 115, 232, 0.5);
      z-index: 9999999;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'vnpt-tutorial-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 12px;
      padding: 20px;
      max-width: 360px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      z-index: 10000000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);
    document.body.appendChild(this.tooltip);

    // Click overlay để skip
    this.overlay.onclick = () => this.skip();
  }

  /**
   * Hiển thị step
   */
  showStep(index) {
    if (index >= TUTORIAL_STEPS.length) {
      this.complete();
      return;
    }

    const step = TUTORIAL_STEPS[index];
    this.currentStep = index;

    // Center step (no target)
    if (!step.target) {
      this.spotlight.style.display = 'none';
      this.showCenterTooltip(step);
      return;
    }

    // Wait for target element
    const target = document.querySelector(step.target);
    if (!target) {
      console.warn(`[Tutorial] Target not found: ${step.target}`);
      setTimeout(() => this.showStep(index), 500);
      return;
    }

    // Highlight target
    this.highlightElement(target);

    // Show tooltip
    this.showTooltip(target, step);

    // Auto-advance on action
    if (step.action === 'click') {
      const handler = () => {
        target.removeEventListener('click', handler);
        setTimeout(() => this.next(), 300);
      };
      target.addEventListener('click', handler);
    }
  }

  /**
   * Highlight element với spotlight
   */
  highlightElement(element) {
    const rect = element.getBoundingClientRect();
    const padding = 8;

    this.spotlight.style.display = 'block';
    this.spotlight.style.top = (rect.top - padding) + 'px';
    this.spotlight.style.left = (rect.left - padding) + 'px';
    this.spotlight.style.width = (rect.width + padding * 2) + 'px';
    this.spotlight.style.height = (rect.height + padding * 2) + 'px';

    // Scroll into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Hiển thị tooltip
   */
  showTooltip(target, step) {
    const rect = target.getBoundingClientRect();
    const progress = `${this.currentStep + 1}/${TUTORIAL_STEPS.length}`;

    this.tooltip.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; color: #1a73e8; font-weight: 700;">${progress}</span>
          <button id="tutorial-skip" style="background: none; border: none; color: #666; cursor: pointer; font-size: 18px; padding: 0; width: 24px; height: 24px;">✕</button>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #202124;">${step.title}</h3>
        <p style="margin: 0; font-size: 13px; color: #5f6368; line-height: 1.5;">${step.content}</p>
      </div>
      <div style="display: flex; gap: 8px; justify-content: flex-end;">
        ${this.currentStep > 0 ? '<button id="tutorial-prev" style="padding: 8px 16px; border: 1px solid #dadce0; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; color: #5f6368;">← Trước</button>' : ''}
        <button id="tutorial-next" style="padding: 8px 16px; border: none; background: #1a73e8; color: white; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">Tiếp →</button>
      </div>
    `;

    // Position tooltip
    this.positionTooltip(rect, step.position);

    // Event listeners
    const skipBtn = this.tooltip.querySelector('#tutorial-skip');
    const prevBtn = this.tooltip.querySelector('#tutorial-prev');
    const nextBtn = this.tooltip.querySelector('#tutorial-next');

    if (skipBtn) skipBtn.onclick = () => this.skip();
    if (prevBtn) prevBtn.onclick = () => this.prev();
    if (nextBtn) nextBtn.onclick = () => this.next();
  }

  /**
   * Hiển thị center tooltip (final step)
   */
  showCenterTooltip(step) {
    this.tooltip.innerHTML = `
      <div style="text-align: center;">
        <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #202124;">${step.title}</h3>
        <div style="margin-bottom: 20px; font-size: 13px; color: #5f6368; line-height: 1.6;">
          ${step.content}
        </div>
        <button id="tutorial-finish" style="padding: 12px 32px; border: none; background: #1a73e8; color: white; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">Bắt đầu sử dụng! 🚀</button>
      </div>
    `;

    // Center position
    this.tooltip.style.top = '50%';
    this.tooltip.style.left = '50%';
    this.tooltip.style.transform = 'translate(-50%, -50%)';

    const finishBtn = this.tooltip.querySelector('#tutorial-finish');
    if (finishBtn) finishBtn.onclick = () => this.complete();
  }

  /**
   * Position tooltip relative to target
   */
  positionTooltip(rect, position) {
    const padding = 16;
    let top, left;

    switch (position) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2;
        this.tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'top':
        top = rect.top - this.tooltip.offsetHeight - padding;
        left = rect.left + rect.width / 2;
        this.tooltip.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - this.tooltip.offsetWidth - padding;
        this.tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + padding;
        this.tooltip.style.transform = 'translateY(-50%)';
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
        this.tooltip.style.transform = 'none';
    }

    this.tooltip.style.top = top + 'px';
    this.tooltip.style.left = left + 'px';
  }

  /**
   * Next step
   */
  next() {
    this.showStep(this.currentStep + 1);
  }

  /**
   * Previous step
   */
  prev() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * Skip tutorial
   */
  skip() {
    if (confirm('Bỏ qua hướng dẫn? Bạn có thể xem lại bằng cách click nút 💡 Tips')) {
      this.cleanup();
      Tutorial.markCompleted();
    }
  }

  /**
   * Complete tutorial
   */
  complete() {
    this.cleanup();
    Tutorial.markCompleted();
    showToast('🎉 Chúc bạn làm việc hiệu quả với VNPT PRO!', '#34a853', 3000);
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.overlay) this.overlay.remove();
    if (this.spotlight) this.spotlight.remove();
    if (this.tooltip) this.tooltip.remove();
    this.isActive = false;
  }
}
