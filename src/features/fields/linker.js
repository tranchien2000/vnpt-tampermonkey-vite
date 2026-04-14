import { AppState } from '../../core/state.js';
import { showToast } from '../../ui/toast.js';

let _linkerCleanup = null;

/**
 * Kích hoạt chế độ Liên kết trực quan: user click vào element nào trên trang,
 * selector tốt nhất sẽ được điền vào ô f-key của row tương ứng.
 * @param {HTMLElement} row - Hàng field đang chọn
 * @param {HTMLInputElement} fKey - Ô input f-key cần cập nhật
 */
export function startFieldLinker(row, fKey) {
    if (_linkerCleanup) _linkerCleanup(); // Hủy linker đang hoạt động nếu có

    const widget = AppState.widget;
    const linkBtn = row.querySelector('.btn-field-link');

    // ── Danh sách elements đã link (xanh lá) ──
    const existingEls = [];
    let lastHoverEl = null;

    /** Tìm element thực tế trên trang từ một selector string */
    const findElBySelector = (sel) => {
        if (!sel) return null;
        return document.getElementById(sel)
            || document.querySelector(`[formcontrolname="${CSS.escape(sel)}"]`)
            || document.querySelector(`[name="${CSS.escape(sel)}"]`)
            || document.querySelector(`[placeholder="${CSS.escape(sel)}"]`);
    };

    /** Highlight các elements đã có trong f-key với màu xanh lá (existing) */
    const showExistingLinks = () => {
        const parts = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(sel => {
            const el = findElBySelector(sel);
            if (el && !widget.contains(el) && !existingEls.includes(el)) {
                el.classList.add('vnpt-link-existing');
                existingEls.push(el);
            }
        });
    };

    const clearExistingHighlights = () => {
        existingEls.forEach(el => {
            el.classList.remove('vnpt-link-existing');
            el.classList.remove('vnpt-unlink-hover'); // Dọn cả state đỏ nếu đang hover
        });
        existingEls.length = 0;
    };

    // ── Đếm số sync selectors (trừ primary key) ──
    const getSyncCount = () => {
        const parts = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        return Math.max(0, parts.length - 1);
    };

    // ── Banner live ──
    const banner = document.createElement('div');
    banner.className = 'vnpt-linking-banner';
    banner.style.pointerEvents = 'auto'; // Banner cần tương tác (nút Xong)

    const updateBanner = () => {
        const n = getSyncCount();
        const badge = n > 0
            ? `<span class="vnpt-link-count-badge">${n} link</span>`
            : '';
        banner.innerHTML = `
            🔗 <b>Liên kết đa điểm</b> ${badge}
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Click = link &nbsp; 🔴 Click lại = bỏ link</span>
            &nbsp;·&nbsp; <button class="vnpt-link-done-btn">✅ Xong</button>
            &nbsp; <kbd>Esc</kbd>
        `;
        banner.querySelector('.vnpt-link-done-btn').onclick = (e) => {
            e.stopPropagation();
            cleanup(true);
        };
    };

    // ── Kích hoạt ──
    linkBtn.classList.add('active');
    document.body.classList.add('vnpt-linking-mode');
    widget.style.opacity = '0.15';
    widget.style.pointerEvents = 'none';
    widget.style.transition = 'opacity 0.3s';

    updateBanner();
    document.body.appendChild(banner);
    showExistingLinks(); // Tô màu ngay các links đã có

    // ── Trích xuất selector tốt nhất ──
    /** @param {Element} el */
    const getBestSelector = (el) => {
        // 1. Kiểm tra chính nó (Strong Keys)
        const strongKey = el.id || el.getAttribute('formcontrolname') || el.name || el.getAttribute('placeholder');
        if (strongKey) return strongKey;

        // 2. Nếu là Label (hoặc chứa text giống label), dùng InnerText
        const isLabel = el.tagName === 'LABEL' || el.classList.contains('label') || el.classList.contains('form-label');
        if (isLabel && el.innerText.trim()) return el.innerText.trim();

        // 3. Tìm xung quanh (Siblings / Parent) để lấy Label hoặc Wrapper ID
        let p = el.parentElement;
        let depth = 0;
        while (p && depth < 3) {
            // Thử tìm label anh em hoặc trong cha
            const lbl = p.querySelector('label, .label, .label-text, span.title, .form-label');
            if (lbl && lbl.innerText.trim()) return lbl.innerText.trim();

            // Thử lấy ID của cha nếu cha có vẻ là một wrapper định danh tốt
            if (p.id && !p.id.startsWith('ng-')) return p.id;

            p = p.parentElement;
            depth++;
        }

        // 4. Fallback: Tag + Class
        const cls = el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
        return el.tagName.toLowerCase() + (cls ? '.' + cls : '');
    };

    const LINKABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'SPAN', 'DIV', 'P', 'LABEL', 'BUTTON', 'TD', 'TH', 'SECTION']);

    // ── Hover highlight ──
    const onMouseOver = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) return;
        if (!LINKABLE_TAGS.has(el.tagName)) return;

        // Dọn state ở element cũ
        if (lastHoverEl && lastHoverEl !== el) {
            lastHoverEl.classList.remove('vnpt-link-highlight');
            lastHoverEl.classList.remove('vnpt-unlink-hover');
        }

        // Nếu là existing → đỏ (báo sẽ unlink), ngược lại → xanh (sẽ link)
        if (el.classList.contains('vnpt-link-existing')) {
            el.classList.add('vnpt-unlink-hover');
        } else {
            el.classList.add('vnpt-link-highlight');
        }
        lastHoverEl = el;
    };

    // ── Click để toggle link/unlink ──
    const onClick = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) return;

        e.preventDefault();
        e.stopPropagation();

        const selector = getBestSelector(el);
        const currentParts = fKey.value.split(',').map(s => s.trim()).filter(s => s);

        if (currentParts.includes(selector)) {
            // ── UNLINK: bỏ selector khỏi danh sách ──
            const newParts = currentParts.filter(p => p !== selector);
            fKey.value = newParts.join(', ');

            el.classList.remove('vnpt-link-existing');
            el.classList.remove('vnpt-unlink-hover');
            // Sau unlink, khôi phục highlight xanh (vẫn đang hover)
            el.classList.add('vnpt-link-highlight');
            const idx = existingEls.indexOf(el);
            if (idx !== -1) existingEls.splice(idx, 1);

            fKey.dispatchEvent(new Event('input', { bubbles: true }));
            updateBanner();
            showToast(`🔓 Đã bỏ "${selector}"`, '#ea4335');
        } else {
            // ── LINK: thêm selector vào danh sách (giữ TOÀN BỘ các phần hiện có) ──
            fKey.value = [...currentParts, selector].join(', ');

            el.classList.remove('vnpt-link-highlight');
            el.classList.add('vnpt-link-existing');
            if (!existingEls.includes(el)) existingEls.push(el);
            if (lastHoverEl === el) lastHoverEl = null;

            fKey.dispatchEvent(new Event('input', { bubbles: true }));
            updateBanner();
            showToast(`+🔗 "${selector}" — Click lại để bỏ | ✅ Xong`, '#198754');
        }
    };

    // ── Esc để hủy (hoàn tác thay đổi không?) ──
    const onKeydown = (e) => {
        if (e.key === 'Escape') {
            showToast('❌ Đã kết thúc liên kết', '#ffc107');
            cleanup(true); // Vẫn lưu những gì đã chọn được
        }
    };

    // ── Cleanup & finish ──
    const cleanup = (doSync = true) => {
        // Xóa tất cả hover classes ở element đang hover
        if (lastHoverEl) {
            lastHoverEl.classList.remove('vnpt-link-highlight');
            lastHoverEl.classList.remove('vnpt-unlink-hover');
        }
        clearExistingHighlights();

        linkBtn.classList.remove('active');
        document.body.classList.remove('vnpt-linking-mode');
        widget.style.opacity = '';
        widget.style.pointerEvents = '';
        if (banner.parentNode) banner.parentNode.removeChild(banner);

        if (doSync) {
            // Dispatch 'change' một lần duy nhất khi xong → syncThisRow()
            fKey.dispatchEvent(new Event('change', { bubbles: true }));
        }

        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKeydown, true);
        _linkerCleanup = null;
    };

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeydown, true);
    _linkerCleanup = cleanup;

    const initialCount = getSyncCount();
    showToast(
        initialCount > 0
            ? `🔗 Đang có ${initialCount} link — Click thêm hoặc ✅ Xong`
            : '🔗 Click vào elements để liên kết. ✅ Xong hoặc Esc khi hoàn tất.',
        '#f57f17'
    );
}
