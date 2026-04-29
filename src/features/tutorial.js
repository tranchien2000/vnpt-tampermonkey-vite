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
   * Tạo tooltip và highlight ring
   */
  createOverlay() {
    // Highlight ring (thay vì overlay đen)
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'vnpt-tutorial-spotlight';
    this.spotlight.style.cssText = `
      position: fixed;
      border: 3px solid #1a73e8;
      border-radius: 8px;
      box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999999;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      animation: vnpt-pulse 2s ease-in-out infinite;
    `;

    // Tooltip với arrow
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'vnpt-tutorial-tooltip';
    this.tooltip.style.cssText = `
      position: fixed;
      background: white;
      border-radius: 12px;
      padding: 16px;
      max-width: 320px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      z-index: 10000000;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    // Arrow element
    this.arrow = document.createElement('div');
    this.arrow.className = 'vnpt-tutorial-arrow';
    this.arrow.style.cssText = `
      position: absolute;
      width: 12px;
      height: 12px;
      background: white;
      transform: rotate(45deg);
      box-shadow: -2px -2px 4px rgba(0, 0, 0, 0.05);
      z-index: -1;
    `;
    this.tooltip.appendChild(this.arrow);

    // Inject animation keyframes
    if (!document.getElementById('vnpt-tutorial-styles')) {
      const style = document.createElement('style');
      style.id = 'vnpt-tutorial-styles';
      style.textContent = `
        @keyframes vnpt-pulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.2), 0 4px 12px rgba(0, 0, 0, 0.15); }
          50% { box-shadow: 0 0 0 8px rgba(26, 115, 232, 0.3), 0 4px 12px rgba(0, 0, 0, 0.15); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(this.spotlight);
    document.body.appendChild(this.tooltip);
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
   * Hiển thị tooltip với arrow
   */
  showTooltip(target, step) {
    const rect = target.getBoundingClientRect();
    const progress = `${this.currentStep + 1}/${TUTORIAL_STEPS.length}`;

    // Re-append arrow (bị xóa khi innerHTML)
    const arrowBackup = this.arrow;

    this.tooltip.innerHTML = `
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 10px; color: #1a73e8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">${progress}</span>
          <button id="tutorial-skip" style="background: none; border: none; color: #999; cursor: pointer; font-size: 16px; padding: 0; width: 20px; height: 20px; line-height: 1;">✕</button>
        </div>
        <h3 style="margin: 0 0 6px 0; font-size: 14px; color: #202124; font-weight: 600;">${step.title}</h3>
        <p style="margin: 0; font-size: 12px; color: #5f6368; line-height: 1.4;">${step.content}</p>
      </div>
      <div style="display: flex; gap: 6px; justify-content: flex-end;">
        ${this.currentStep > 0 ? '<button id="tutorial-prev" style="padding: 6px 12px; border: 1px solid #dadce0; background: white; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; color: #5f6368;">← Trước</button>' : ''}
        <button id="tutorial-next" style="padding: 6px 12px; border: none; background: #1a73e8; color: white; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;">Tiếp →</button>
      </div>
    `;

    // Restore arrow
    this.tooltip.appendChild(arrowBackup);

    // Position tooltip with arrow
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
    // Re-append arrow
    const arrowBackup = this.arrow;

    this.tooltip.innerHTML = `
      <div style="text-align: center;">
        <h3 style="margin: 0 0 12px 0; font-size: 18px; color: #202124; font-weight: 600;">${step.title}</h3>
        <div style="margin-bottom: 16px; font-size: 12px; color: #5f6368; line-height: 1.5;">
          ${step.content}
        </div>
        <button id="tutorial-finish" style="padding: 10px 28px; border: none; background: #1a73e8; color: white; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;">Bắt đầu sử dụng! 🚀</button>
      </div>
    `;

    // Restore arrow (hidden for center)
    this.tooltip.appendChild(arrowBackup);
    this.arrow.style.display = 'none';

    // Center position
    this.tooltip.style.top = '50%';
    this.tooltip.style.left = '50%';
    this.tooltip.style.transform = 'translate(-50%, -50%)';

    const finishBtn = this.tooltip.querySelector('#tutorial-finish');
    if (finishBtn) finishBtn.onclick = () => this.complete();
  }

  /**
   * Position tooltip relative to target với arrow
   */
  positionTooltip(rect, position) {
    const padding = 16;
    const arrowSize = 12;
    let top, left, arrowTop, arrowLeft, arrowRotate;

    // Reset transform
    this.tooltip.style.transform = 'none';

    switch (position) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + rect.width / 2 - this.tooltip.offsetWidth / 2;
        arrowTop = -arrowSize / 2;
        arrowLeft = this.tooltip.offsetWidth / 2 - arrowSize / 2;
        arrowRotate = '45deg';
        break;
      case 'top':
        top = rect.top - this.tooltip.offsetHeight - padding;
        left = rect.left + rect.width / 2 - this.tooltip.offsetWidth / 2;
        arrowTop = this.tooltip.offsetHeight - arrowSize / 2;
        arrowLeft = this.tooltip.offsetWidth / 2 - arrowSize / 2;
        arrowRotate = '225deg';
        break;
      case 'left':
        top = rect.top + rect.height / 2 - this.tooltip.offsetHeight / 2;
        left = rect.left - this.tooltip.offsetWidth - padding;
        arrowTop = this.tooltip.offsetHeight / 2 - arrowSize / 2;
        arrowLeft = this.tooltip.offsetWidth - arrowSize / 2;
        arrowRotate = '135deg';
        break;
      case 'right':
        top = rect.top + rect.height / 2 - this.tooltip.offsetHeight / 2;
        left = rect.right + padding;
        arrowTop = this.tooltip.offsetHeight / 2 - arrowSize / 2;
        arrowLeft = -arrowSize / 2;
        arrowRotate = '315deg';
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
        arrowTop = -arrowSize / 2;
        arrowLeft = 20;
        arrowRotate = '45deg';
    }

    // Ensure tooltip stays in viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + this.tooltip.offsetWidth > viewportWidth - 10) {
      left = viewportWidth - this.tooltip.offsetWidth - 10;
    }
    if (top < 10) top = 10;
    if (top + this.tooltip.offsetHeight > viewportHeight - 10) {
      top = viewportHeight - this.tooltip.offsetHeight - 10;
    }

    this.tooltip.style.top = top + 'px';
    this.tooltip.style.left = left + 'px';
    this.arrow.style.top = arrowTop + 'px';
    this.arrow.style.left = arrowLeft + 'px';
    this.arrow.style.transform = `rotate(${arrowRotate})`;
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
    if (this.spotlight) this.spotlight.remove();
    if (this.tooltip) this.tooltip.remove();
    const styles = document.getElementById('vnpt-tutorial-styles');
    if (styles) styles.remove();
    this.isActive = false;
  }
}
