# Source Code Logic Map
*Cập nhật: 19:23:10 17/4/2026*

## Thư mục: src/core

### File: src\core\constants.js

```javascript
/**
 * @file constants.js
 * @desc Tất cả hằng số dùng chung toàn dự án: localStorage keys, DEFAULT_LABELS.
 * @exports DEFAULT_LABELS    — map{id → tên nhãn tiếng Việt} dùng cho webScanner
 * @exports LOCAL_KEY_*       — localStorage keys cho VNPT Export Widget
 * @exports SK_*              — localStorage keys cho Calc & AutoFill Widget
 * @seeAlso core/defaults.js (data mặc định), core/state.js (AppState)
 */
export const DEFAULT_LABELS = {
    'tenDaiDienn, tenNguoiNhanCTS, ten': 'Tên Đại Diện',
    'chucVu ': 'Chức Vụ',
    'ngaySinhCustomer': 'Ngày Sinh KH',
    'diaChi ': 'Địa chỉ (Full)',
    'cmnd, cccd': 'CMND/CCCD',
    'ngayCapCustomer': 'Ngày Cấp CMND',
    'noiCap, noiCapId': 'Nơi Cấp',
    'sdt': 'SĐT',
    'emailDaiDien, emailNhanCTS, email': 'Email Nhận TK',
    'soDkdn': 'Mã số thuế | GPKD',
    'tenToChuc, tencty': 'Tên Tổ Chức',
    'ngayCapSoDkdnCustomer': 'Ngày Cấp ĐKKD',
    'noiCapSoDkdn, coQuanCapId, noiCapIdNew': 'Nơi cấp ĐKDN/QĐTL/GPTL',
    'goiDV': 'Gói Dịch Vụ',
    'soHopDong, inputContractGroupName': 'SỐ HỢP ĐỒNG',
    'lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A': 'Liên hệ A',
    'ngayKy, ngayKy1': 'Ngày ký',
    'thangKy, thangKy1': 'Tháng Ký',
    'namKy, namKy1': 'Năm ký',
    'ngayTiepNhan, ngayThangNamKy': 'Ngày tiếp nhận / Ngày tháng năm ký',
    'duong': 'Số nhà, tên đường',
    'xaIdNew, diaChiTruSoXaIdNew': 'Quận/Huyện - Xã/Phường',
    'tinhIdNew, tinhId, diaChiTruSoTinhIdNew': 'Tỉnh/Thành phố',
    'dvtGoi': 'Đơn vị gói',
    'soLuongGoi': 'Số lượng gói',
};

export const REQUIRED_KEYS = ['soHopDong', 'tenDaiDienn', 'cmnd', 'sdt', 'diaChi', 'tenToChuc', 'ngayCapCustomer', 'emailDaiDien', 'soDkdn', 'goiDV'];

// VNPT Docx Export Widget Keys
export const LOCAL_KEY_FIELDS = 'vnpt_docx_fields';
export const LOCAL_KEY_DEFAULT_FIELDS = 'vnpt_docx_default_fields';
export const LOCAL_KEY_POS = 'vnpt_docx_position';
export const LOCAL_KEY_SIZE = 'vnpt_docx_size';
export const LOCAL_KEY_OPENED = 'vnpt_docx_opened';
export const LOCAL_KEY_PINNED = 'vnpt_docx_pinned';
export const LOCAL_KEY_AUTO_BACKUP = 'vnpt_docx_auto_backup';

// VNPT Calc & AutoFill Widget Keys
export const SK_DATA_DEF = 'vnpt_autofill_data_default';
export const SK_DATA_CUS = 'vnpt_autofill_data_custom';
export const SK_DATA_SYNC = 'vnpt_autofill_data_sync';
export const SK_POS_CALC = 'vnpt_widget_pos';
export const SK_TAX = 'vnd_tax_rate';
export const SK_HIST_B = 'vnd_before_history';
export const SK_HIST_A = 'vnd_after_history';
export const SK_COLLAPSE = 'vnpt_widget_collapsed'; // 'calc' | 'data' | ''
export const SK_CALC_MAP = 'vnd_calc_map';
export const SK_DATATAB = 'vnpt_widget_datatab';   // 'default' | 'custom'
export const SK_TEMPLATES = 'vnpt_templates';       // [{name, url, lastUsed}]
export const SK_GEMINI_KEY = 'vnpt_gemini_api_key'; // string — Google Gemini API Key
export const SK_GEMINI_MODEL = 'vnpt_gemini_model'; // string — Model name (flash 1.5, pro, flash 2.0)
export const SK_HOTKEYS = 'vnpt_hotkeys';           // object — mapping action -> keyConfig
export const LOCAL_KEY_PROFILES = 'vnpt_docx_profiles';
export const LOCAL_KEY_ACTIVE_PROFILE_ID = 'vnpt_docx_active_profile_id';
export const SK_RAW_SCAN = 'vnpt_raw_scan_text';    // string — Lưu nội dung raw text để tránh mất khi refresh
export const SK_ADDRESS_LEARNING = 'vnpt_address_learning'; // object — mapping full_address -> corrected_street
export const SK_COL_RATIO = 'vnpt_col_ratio'; // number — tỉ lệ flex của cột label (0.2)
export const COL_RATIO_MIN = 0.08;
export const COL_RATIO_MAX = 0.6;

import pkg from '../../package.json';

export const VALIDATION_REGEX = {
    MST: /^\d{10}(-\d{3})?$/, // 10 số hoặc 10 số - 3 số
    PHONE: /^(0|\+84)[3|5|7|8|9]\d{8}$/, // Định dạng SĐT Việt Nam
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ID_CARD: /^(\d{9}|\d{12})$/ // CMND 9 số hoặc CCCD 12 số
};

export const APP_VERSION = pkg.version;

```

---

### File: src\core\defaults.js

```javascript
/**
 * @file defaults.js
 * @desc Dữ liệu mặc định cho bên B (VNPT Hà Nội).
 *       File này KHÔNG chứa logic — chỉ là data thuần.
 * @exports DEFAULT_DATA  — object{key: string} dùng làm giá trị mặc định
 * @seeAlso syncEngine.js (consumer), fieldsManager.js (consumer)
 */

import { getVNPTDateStrings } from '../utils/dateHelper.js';

const { ngay, thang, nam } = getVNPTDateStrings();

export const DEFAULT_DATA = {
    tenDoanhNghiepB: { label: "Tên doanh nghiệp B", value: "VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM", syncDir: "both" },
    diaChiB: { label: "Địa chỉ B", value: "75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội", syncDir: "both" },
    maSoThueB: { label: "Mã số thuế B", value: "0100686223", syncDir: "both" },
    stkB: { label: "Số tài khoản B", value: "1600114156", syncDir: "both" },
    diaChiStkB: { label: "Ngân hàng/Địa chỉ STK B", value: "Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)", syncDir: "both" },
    "tenB, nguoiDaiDienB, tenDaiDienB": { label: "Người đại diện B", value: "Phạm Khánh Chung", syncDir: "both" },
    "chucVuB, chucVuDaiDienB": { label: "Chức vụ B", value: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp", syncDir: "both" },
    "giayUyQuyenSoB, soGiayUyQuyenB": { label: "Giấy ủy quyền số B", value: "2628/GUQ-VNPT-HNI-VP", syncDir: "both" },
    "giayUyQuyenNgayB, ngayGiayUyQuyenB": { label: "Giấy ủy quyền ngày B", value: `1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam`, syncDir: "both" },
    GiayUyQuyenB: { label: "Nội dung Giấy ủy quyền B (full)", value: `2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam`, syncDir: "both" },
    tenDoanhNghiepB1: { label: "Tên doanh nghiệp B (phụ)", value: "Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam", syncDir: "both" },
    donViTiepNhan: { label: "Đơn vị tiếp nhận", value: "TTKD KHDN", syncDir: "both" },
    "tenTiepNhan, tenNguoiNhan": { label: "Người tiếp nhận", value: "Bùi Anh", syncDir: "both" },
    dienThoaiB: { label: "Điện thoại B", value: "02436686868", syncDir: "both" },
    diaChiTaiKhoanB: { label: "Địa chỉ tài khoản B", value: "NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ", syncDir: "both" },
    noiKy: { label: "Nơi ký", value: "Hà Nội", syncDir: "both" },
    emailB: { label: "Email B", value: "", syncDir: "both" },
    dvtGoi: { label: "Đơn vị gói", value: "Gói", syncDir: "both" },
    "lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B": { label: "Liên hệ B (AM)", value: "AM Bùi Anh", syncDir: "both" }
};

/**
 * DEFAULT_SYNC_DATA: Mapping đồng bộ mặc định giữa các trường trên trang web.
 * Khi trường key thay đổi, các trường trong value (phân tách bằng dấu phẩy) sẽ được cập nhật theo.
 */
export const DEFAULT_SYNC_DATA = {
    'soHopDong': 'soHopDong, inputContractGroupName'
};

/**
 * DEFAULT_CALC_MAP: Mapping kết quả từ bộ tính toán (Calc Widget) ra các trường trên trang web.
 */
export const DEFAULT_CALC_MAP = {
    after: ["cuocDV", "tongCong", "tongCongHD", "congCA", "giaTriHopDong", "tongGIaTriHopDong"],
    before: ["donGiaCA", "thanhTienCA", "tongThanhTien", "tongCuocTruocThue", "congGoi"],
    tax: ["tongThueGTGT", "tongThue", "thueCA", "thueVAT"],
    text: ["soTienThanhToanBangChu", "tongCongBangChu", "tongCongHDbangChu", "ghiChuGiaTriHopDong", "tongGiaTriHopDongBangChu", "ghiChuGiaTriHopDongBangChu"]
};

/**
 * DEFAULT_TAX_RATE: Thuế suất mặc định (8%).
 */
export const DEFAULT_TAX_RATE = 0.08;

/**
 * DEFAULT_HOTKEYS: Phím tắt mặc định hệ thống.
 */
export const DEFAULT_HOTKEYS = {
    'SCAN': { key: 's', altKey: true, ctrlKey: false, shiftKey: false, label: 'Quét dữ liệu' },
    'FILL': { key: 'f', altKey: true, ctrlKey: false, shiftKey: false, label: 'Điền Web' },
    'SCAN_PDF': { key: 'p', altKey: true, ctrlKey: false, shiftKey: false, label: 'Scan PDF (AI)' },
    'TOGGLE': { key: '`', altKey: false, ctrlKey: false, shiftKey: false, label: 'Đóng/Mở Widget' },
    'CLEAN': { key: 'd', altKey: true, ctrlKey: false, shiftKey: false, label: 'Dọn dẹp & Reset' },
    'SIZE_S': { key: '1', altKey: true, ctrlKey: false, shiftKey: false, label: 'Cỡ UI: S' },
    'SIZE_M': { key: '2', altKey: true, ctrlKey: false, shiftKey: false, label: 'Cỡ UI: M' },
    'SIZE_L': { key: '3', altKey: true, ctrlKey: false, shiftKey: false, label: 'Cỡ UI: L' }
};

```

---

### File: src\core\scannerFallbacks.js

```javascript
/**
 * @file scannerFallbacks.js
 * @desc Cấu hình các giá trị mặc định cho scanner khi không tìm thấy dữ liệu trên web.
 *       Tách riêng logic gán giá trị mặc định (như ngày hiện tại, số lượng mặc định) 
 *       ra khỏi logic quét DOM.
 */

/**
 * Lấy giá trị mặc định dựa trên ID của trường (field ID).
 * @param {string} id_can_tim - ID của trường cần lấy fallback.
 * @returns {string} Giá trị mặc định hoặc chuỗi rỗng.
 */
import { getVNPTDateStrings } from '../utils/dateHelper.js';

export function getScannerFallback(id_can_tim) {
    const lKey = id_can_tim.toLowerCase();
    const { ngay, thang, nam } = getVNPTDateStrings();

    const fullDate = `${ngay}/${thang}/${nam}`;

    const fallbacks = {
        'ngayky, ngayky1': ngay,
        'ngayky': ngay,
        'thangky, thangky1': thang,
        'thangky': thang,
        'namky, namky1': nam,
        'namky': nam,
        'ngaytiepnhan, ngaythangnamky': fullDate,
        'ngaytiepnhan': fullDate,
        'ngaythangnamky': fullDate,
        'soluonggoi': '1',
        'noiky': 'Hà Nội',
        'noicap': 'Cục trưởng Cục Cảnh sát QLHC về TTXH',
        'noicapsodkdn': '',
        'chucvu': 'Giám Đốc'
    };

    return fallbacks[lKey] || '';
}

```

---

### File: src\core\state.js

```javascript
/**
 * @file state.js
 * @desc Singleton AppState — lưu tham chiếu các DOM elements và trạng thái toàn cục.
 *       Sử dụng Proxy để hỗ trợ reactivity (lắng nghe thay đổi qua .on()).
 */

const internalState = {
    // VNPT Docx Widget
    widget: null,
    panel: null,
    header: null,
    bannerArea: null,
    toggleBtn: null,
    fieldsContainer: null,
    panelBody: null,

    // VNPT Calc Widget
    calcWidget: null,

    // Row reordering tracking
    draggedRowForVNPT: null,

    // VNPT Data display status
    isDefaultMode: false,
    
    // Template status
    templateBuffer: null,
    templateName: null,

    // Drag status
    hasDragged: false
};

const listeners = new Map();

/**
 * AppState Singleton Proxy
 * @property {Function} on - Đăng ký listener: AppState.on('isDefaultMode', (newVal) => { ... })
 */
export const AppState = new Proxy(internalState, {
    get(target, prop) {
        if (prop === 'on') {
            return (key, cb) => {
                if (!listeners.has(key)) listeners.set(key, []);
                listeners.get(key).push(cb);
            };
        }
        return target[prop];
    },
    set(target, prop, value) {
        const oldValue = target[prop];
        target[prop] = value;
        
        // Chỉ trigger nếu giá trị thực sự thay đổi
        if (oldValue !== value && listeners.has(prop)) {
            listeners.get(prop).forEach(cb => cb(value, oldValue));
        }
        return true;
    }
});

```

---


## Thư mục: src/features

### File: src\features\autoFillForm.js

```javascript
/**
 * @file autoFillForm.js
 * @desc Tự động điền và đồng bộ các trường cố định ngay khi trang load hoặc AJAX render form.
 *       Sử dụng MutationObserver để detect form mới, sau đó điền: chức vụ, nơi cấp CCCD,
 *       đồng bộ địa chỉ, SĐT, email, MST theo cặp field tương ứng.
 * @exports setupAutoFillForm  — khởi tạo MutationObserver + chạy fill lần đầu
 * @seeAlso utils/domHelper.js (syncSetValue), dataFillFeature.js (fill nâng cao)
 */
// src/features/autoFillForm.js
import { syncSetValue } from '../utils/domHelper.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';

const AUTO_FILL_FIELDS = [
    'chucVu', 'noiCap', 'noiCapSoDkdn',
    'ngayky', 'ngayky1', 'thangky', 'namky',
    'thangky1', 'namky1', 'noiKy'
];

const SYNC_PAIRS = [
    { src: 'duong', target: 'diaChiTruSoDuong' },
    { src: 'sdt', target: 'sdtToChuc' },
    { src: 'emailDaiDien', target: 'emailCongTy' },
    { src: 'soDkdn', target: 'maSoThue' }
];

export function setupAutoFillForm() {
    function initAutoFillForm() {
        // ===== 1. AUTO TEXT TỪ SCANNER FALLBACKS =====
        AUTO_FILL_FIELDS.forEach(id => {
            const el = document.getElementById(id);
            if (el && !el.dataset.filled) {
                el.dataset.filled = "1";
                // getScannerFallback tự xử lý in hoa/in thường do đã có .toLowerCase() bên trong
                syncSetValue(el, getScannerFallback(id));
            }
        });

        // ===== 2. ĐỒNG BỘ CÁC TRƯỜNG =====
        SYNC_PAIRS.forEach(pair => {
            const srcEl = document.getElementById(pair.src);
            const targetEl = document.getElementById(pair.target);
            if (srcEl && targetEl && !srcEl.dataset.bound) {
                srcEl.dataset.bound = "1";
                srcEl.addEventListener('change', () => syncSetValue(targetEl, srcEl.value));
            }
        });

        // ===== 3. ĐỒNG BỘ SKDT TỪ TỈNH =====
        const provinceIds = ['tinhId', 'tinhIdNew', 'diaChiTruSoTinhIdNew'];
        provinceIds.forEach(pId => {
            const pEl = document.getElementById(pId);
            const targetNoiCap = document.getElementById('noiCapSoDkdn');
            if (pEl && targetNoiCap && !pEl.dataset.skdtBound) {
                pEl.dataset.skdtBound = "1";
                const updateSkdt = () => {
                    let val = '';
                    if (pEl.tagName.toLowerCase() === 'ng-select2' || pEl.classList.contains('select2-hidden-accessible')) {
                        // Với Select2, giá trị thực tế nằm ở span hiển thị
                        const span = pEl.parentElement.querySelector('.select2-selection__rendered');
                        val = span ? (span.getAttribute('title') || span.textContent.trim()) : pEl.value;
                    } else {
                        val = pEl.value;
                    }
                    if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                        // Cắt bỏ "Tỉnh " hoặc "Thành phố "
                        const cleanProvince = val.trim().replace(/^(Tỉnh|Thành phố)\s+/i, '');
                        syncSetValue(targetNoiCap, "SKDT " + cleanProvince);
                    }
                };
                pEl.addEventListener('change', updateSkdt);
                // Với Select2 cần lắng nghe cả sự kiện đặc thù của nó nếu có
                $(pEl).on('select2:select', updateSkdt);
            }
        });
    }

    // Khởi tạo MutationObserver để luôn auto-fill kể cả khi trang tải form bằng AJAX
    let autoFillTimeout;
    const autoFillObserver = new MutationObserver((mutations) => {
        let hasFormElement = false;
        for (const m of mutations) {
            if (m.addedNodes.length > 0) {
                for (const n of m.addedNodes) {
                    if (n.nodeType === 1) {
                        hasFormElement = true;
                        break;
                    }
                }
            }
            if (hasFormElement) break;
        }

        if (hasFormElement) {
            clearTimeout(autoFillTimeout);
            autoFillTimeout = setTimeout(initAutoFillForm, 500);
        }
    });

    autoFillObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Chạy lần đầu
    initAutoFillForm();
}

```

---

### File: src\features\calc\calcHistory.js

```javascript
/**
 * @file calcHistory.js
 * @desc Quản lý việc lưu trữ (localStorage) và lịch sử (History) cho Calc Widget.
 */
import { SK_HIST_B, SK_HIST_A } from '../../core/constants.js';
import { Storage } from '../../utils/storage.js';

export function ld(k, def = null) { 
    return Storage.get(k, def);
}

export function sv(k, v) { 
    Storage.set(k, v); 
}

export function saveHist(key, val) {
    if (!val || val.replace(/\D/g, '').length < 6) return;
    let arr = ld(key, []);
    arr = arr.filter(v => v !== val);
    arr.unshift(val);
    sv(key, arr.slice(0, 10));
}

export function renderHist(key, listId) {
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = (ld(key, [])).map(v => `<option value="${v}">`).join('');
}

```

---

### File: src\features\calc\calcLogic.js

```javascript
/**
 * @file calcLogic.js
 * @desc Logic nghiệp vụ tính thuế và định dạng số cho Calc Widget.
 */
import { formatNum, parseNum, numToVN, capFirst } from '../../utils/numberHelper.js';
import { setPageField } from '../../utils/domHelper.js';

export function calculateValues(type, value, taxRate) {
    if (value === '' || value === undefined || value === null) {
        return {
            beforeNum: 0,
            taxNum: 0,
            afterNum: 0,
            beforeStr: '',
            taxStr: '',
            afterStr: '',
            textStr: ''
        };
    }

    let b = 0, t = 0, a = 0;
    
    if (type === 'before') {
        b = parseNum(value);
        t = taxRate > 0 ? Math.round(b * taxRate) : 0;
        a = b + t;
    } else if (type === 'tax') {
        t = parseNum(value);
        b = taxRate > 0 ? Math.round(t / taxRate) : 0;
        a = b + t;
    } else if (type === 'after') {
        a = parseNum(value);
        b = taxRate > 0 ? Math.round(a / (1 + taxRate)) : a;
        t = a - b;
    }
    
    const text = a === 0 ? '' : capFirst(numToVN(a)) + ' đồng';
    
    return {
        beforeNum: b,
        taxNum: t,
        afterNum: a,
        beforeStr: b === 0 ? '' : formatNum(b),
        taxStr: t === 0 ? '' : formatNum(t),
        afterStr: a === 0 ? '' : formatNum(a),
        textStr: text
    };
}

export function syncToPage(data, calcMaps) {
    const keys = ['before', 'tax', 'after', 'text'];
    const dataMap = {
        before: data.beforeStr,
        tax: data.taxStr,
        after: data.afterStr,
        text: data.textStr
    };

    keys.forEach(k => {
        const mapInfo = calcMaps[k];
        if (!mapInfo) return;

        // Hỗ trợ cả format cũ (Array) và format mới (Object {sync, syncDir})
        const targets = Array.isArray(mapInfo) ? mapInfo : (mapInfo.sync || []);
        const dir = Array.isArray(mapInfo) ? 'both' : (mapInfo.syncDir || 'both');

        // Chỉ sync xuống nếu hướng là 'both' hoặc 'down'
        if (dir === 'both' || dir === 'down') {
            targets.forEach(targetId => {
                setPageField(targetId, dataMap[k]);
            });
        }
    });
}

```

---

### File: src\features\calc\calcUI.js

```javascript
/**
 * @file calcUI.js
 * @desc Xử lý tạo DOM và gán Event Listeners cho Calc Widget.
 */
import { AppState } from '../../core/state.js';
import { SK_TAX, SK_HIST_B, SK_HIST_A, SK_COLLAPSE, SK_CALC_MAP } from '../../core/constants.js';
import { ld, sv, saveHist, renderHist } from './calcHistory.js';
import { calculateValues, syncToPage } from './calcLogic.js';
import { formatNum, parseNum } from '../../utils/numberHelper.js';
import { renderDataFillTabs } from '../dataFill/index.js';
import { makeDraggable } from '../../ui/dragDrop.js';
import { DEFAULT_CALC_MAP, DEFAULT_TAX_RATE } from '../../core/defaults.js';
import { buildFullDOMMap } from '../../utils/domHelper.js';
import { debounce } from '../../utils/common.js';

export function createCalcUI(widget, container, SK_POS_CALC) {
    let TAX_RATE = Number(localStorage.getItem(SK_TAX)) || DEFAULT_TAX_RATE;
    let collapsedSections = ld(SK_COLLAPSE) ?? { calc: false, data: true };

    // Internal helpers
    function mkBtn(label, extraClass) {
        const b = document.createElement('button');
        b.innerText = label;
        b.className = 'cw-action-btn ' + extraClass;
        return b;
    }

    function mkSecHeader(title, sectionKey, toggleCallback) {
        const hdr = document.createElement('div');
        hdr.className = 'wg-sec-header';
        const s = document.createElement('span'); s.innerText = title;
        const b = document.createElement('button');
        b.className = 'wg-toggle-btn';
        b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
        hdr.appendChild(s); hdr.appendChild(b);
        b.onclick = () => {
            collapsedSections[sectionKey] = !collapsedSections[sectionKey];
            b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
            sv(SK_COLLAPSE, collapsedSections);
            toggleCallback(collapsedSections[sectionKey]);
        };
        return hdr;
    }

    function clamp(w) {
        const vw = window.innerWidth, vh = window.innerHeight;
        const r = w.getBoundingClientRect();
        w.style.left = Math.min(Math.max(parseFloat(w.style.left), 0), vw - r.width) + 'px';
        w.style.top = Math.min(Math.max(parseFloat(w.style.top), 0), vh - 36) + 'px';
    }

    // ─── Render Title Bar (Only if NOT embedded) ───
    const titleBar = document.createElement('div');
    if (!container) {
        titleBar.className = 'cw-title-bar';
        titleBar.innerHTML = `<span class="cw-title-label">VNPT Fast</span>`;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'cw-btn-group';
        const btns = {
            fill: mkBtn('Fill', 'cw-btn-fill'),
            sync: mkBtn('Sync', 'cw-btn-sync'),
            add: mkBtn('Add', 'cw-btn-add'),
            reset: mkBtn('↺', 'cw-btn-reset')
        };
        btns.sync.onclick = () => {
            const res = updateLocal('before', els.before.value);
            doSync('before', res.beforeStr);
        };
        btns.reset.title = 'Reset Default fields';
        Object.values(btns).forEach(b => btnGroup.appendChild(b));
        titleBar.appendChild(btnGroup);
        widget.appendChild(titleBar);
    }

    // ─── Render Body ───
    const calcBody = document.createElement('div');
    calcBody.className = 'cw-body-inline';
    calcBody.innerHTML = `
    <div class="cw-inline-row">
        <input id="wg-before" name="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        <div class="cw-tax-group-inline"><input id="wg-taxRate" name="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)"><span class="cw-tax-symbol">%</span></div>
        <input id="wg-tax" name="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        <input id="wg-after" name="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        <input id="wg-text" name="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Bằng chữ">
        <button id="wg-sync-manual" class="cw-map-btn-inline" title="Đồng bộ kết quả lên trang web (🔄)">🔄</button>
    </div>`;

    if (container) container.appendChild(calcBody);
    else widget.appendChild(calcBody);

    // Data tabs (Only if NOT embedded, keeping it simple for now)
    if (!container) {
        renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections);
    }

    // ─── Event Wiring ───
    const els = {
        taxRate: document.getElementById('wg-taxRate'),
        before: document.getElementById('wg-before'),
        tax: document.getElementById('wg-tax'),
        after: document.getElementById('wg-after'),
        text: document.getElementById('wg-text')
    };

    els.taxRate.value = TAX_RATE * 100;
    renderHist(SK_HIST_B, 'wg-before-list');
    renderHist(SK_HIST_A, 'wg-after-list');

    function updateLocal(type, val, skipFormatting = false) {
        if (!els.before || !els.tax || !els.after || !els.text) return { beforeStr: '', taxStr: '', afterStr: '', textStr: '' };
        
        if (val === '') {
            els.before.value = '';
            els.tax.value = '';
            els.after.value = '';
            els.text.value = '';
            return { beforeStr: '', taxStr: '', afterStr: '', textStr: '' };
        }
        const res = calculateValues(type, val, TAX_RATE);
        
        // Khi đang gõ (oninput), nếu skipFormatting=true thì không đè value vào chính ô đang gõ 
        // để tránh nhảy con trỏ chuột.
        if (type !== 'before' || !skipFormatting) els.before.value = res.beforeStr;
        if (type !== 'tax' || !skipFormatting) els.tax.value = res.taxStr;
        if (type !== 'after' || !skipFormatting) els.after.value = res.afterStr;
        els.text.value = res.textStr;
        
        return res;
    }

    function doSync(type, val) {
        const rawVal = parseNum(val);
        if (isNaN(rawVal) || rawVal === 0) return; 
        
        buildFullDOMMap(); 
        const res = calculateValues(type, val, TAX_RATE);
        const currentMaps = ld(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
        syncToPage(res, currentMaps);
    }

    const debouncedSync = debounce((type, val) => doSync(type, val), 500);

    els.taxRate.oninput = () => { 
        TAX_RATE = Number(els.taxRate.value) / 100 || 0; 
        sv(SK_TAX, TAX_RATE); 
        updateLocal('before', els.before.value); 
        debouncedSync('before', els.before.value); 
    };

    els.before.oninput = (e) => { 
        // Lưu vị trí con trỏ
        const start = e.target.selectionStart;
        const oldLen = e.target.value.length;
        
        const res = updateLocal('before', e.target.value, true); 
        
        // Chỉ định dạng lại nếu không phải đang xóa hoặc gõ dở dang
        // Để việc sửa ở giữa chuỗi không bị nhảy con trỏ
        debouncedSync('before', e.target.value); 
    };
    els.before.onchange = () => { 
        updateLocal('before', els.before.value); // Định dạng chuẩn khi rời ô
        doSync('before', els.before.value); 
        saveHist(SK_HIST_B, els.before.value); 
        renderHist(SK_HIST_B, 'wg-before-list'); 
    };
    
    els.tax.oninput = () => { updateLocal('tax', els.tax.value, true); debouncedSync('tax', els.tax.value); };
    els.tax.onchange = () => { updateLocal('tax', els.tax.value); doSync('tax', els.tax.value); };

    els.after.oninput = () => { updateLocal('after', els.after.value, true); debouncedSync('after', els.after.value); };
    els.after.onchange = () => { 
        updateLocal('after', els.after.value);
        doSync('after', els.after.value); 
        saveHist(SK_HIST_A, els.after.value); 
        renderHist(SK_HIST_A, 'wg-after-list'); 
    };

    const syncManualBtn = document.getElementById('wg-sync-manual');
    if (syncManualBtn) {
        syncManualBtn.onclick = () => {
            const res = updateLocal('before', els.before.value);
            doSync('before', res.beforeStr);
            
            // Hiệu ứng nháy xanh khi thành công
            syncManualBtn.style.transform = 'scale(1.2) rotate(360deg)';
            syncManualBtn.style.transition = 'all 0.4s';
            setTimeout(() => {
                syncManualBtn.style.transform = '';
            }, 400);
        };
    }

    // Copy on click/focus
    [els.before, els.tax, els.after, els.text].forEach(el => {
        ['click', 'focus'].forEach(evt => el.addEventListener(evt, () => {
            if (!el.value) return;
            navigator.clipboard.writeText(el.value);
            const old = el.style.backgroundColor; el.style.backgroundColor = '#d1e7dd';
            setTimeout(() => el.style.backgroundColor = old, 300);
        }));
    });

    // ─── Drag & Dock (Only if NOT embedded) ───
    if (!container) {
        const content = Array.from(widget.children).filter(el => el !== titleBar);
        const handler = makeDraggable(widget, [titleBar], SK_POS_CALC, null, (docked) => {
            content.forEach(el => el.style.display = docked ? 'none' : '');
            titleBar.style.borderRadius = docked ? '8px' : '0';
            if (docked) widget.style.top = (window.innerHeight - (titleBar.offsetHeight || 34)) + 'px';
        });
        const savedPos = ld(SK_POS_CALC);
        if (savedPos && savedPos.docked) handler.setDocked(true);

        window.addEventListener('resize', () => {
            if (handler.isDocked()) widget.style.top = (window.innerHeight - titleBar.offsetHeight) + 'px';
            else clamp(widget);
        });

        return handler;
    }

    return null;
}

```

---

### File: src\features\calc\index.js

```javascript
/**
 * @file index.js (src/features/calc/)
 * @desc Entry point cho module Calc. Xuất hàm initCalcWidget để main.js gọi.
 */
import { createCalcUI } from './calcUI.js';
import { AppState } from '../../core/state.js';
import { SK_POS_CALC, SK_COLLAPSE } from '../../core/constants.js';
import { ld, sv } from './calcHistory.js';

export function initCalcWidget() {
    // Tìm container inline nếu có (như trong widget.js có <div id="vnpt-inline-calc"></div>)
    const inlineContainer = document.getElementById('vnpt-inline-calc');
    const toggleBtn = document.getElementById('vnpt-btn-calc-toggle');
    
    // Nếu nhúng (inline), ta dùng widget chính của AppState
    // Nếu không nhúng (chạy floating), ta mới tạo/dùng calcWidget riêng
    let widget = AppState.calcWidget || document.createElement('div');
    
    if (!inlineContainer && !AppState.calcWidget) {
        widget.id = 'vnpt-calc-widget';
        document.body.appendChild(widget);
        AppState.calcWidget = widget;
    } else if (inlineContainer) {
        widget = AppState.widget; // Gắn logic vào widget chính của AppState
    }
    
    // Logic cho nút toggle trên header
    if (inlineContainer && toggleBtn) {
        let collapsed = ld(SK_COLLAPSE) ?? { calc: false, data: true };
        
        const applyState = (isCollapsed) => {
            inlineContainer.style.display = isCollapsed ? 'none' : 'block';
            toggleBtn.classList.toggle('active', !isCollapsed);
        };
        
        applyState(collapsed.calc);
        
        toggleBtn.onclick = () => {
            collapsed.calc = !collapsed.calc;
            sv(SK_COLLAPSE, collapsed);
            applyState(collapsed.calc);
        };
    }
    
    return createCalcUI(widget, inlineContainer, SK_POS_CALC);
}

```

---

### File: src\features\calcWidgetFeature.js

```javascript
/**
 * @file calcWidgetFeature.js
 * @desc Khởi tạo và điều phối Calc & AutoFill Widget (widget phụ, nổi góc màn hình).
 *       Bao gồm: title bar, calculator thuế (trước/thuế/sau/bằng chữ), lịch sử,
 *       dock/undock, cấu hình field-mapping (⚙️), và gọi renderDataFillTabs().
 * @exports initCalcWidget  — tạo toàn bộ DOM và gán logic cho widget
 * @seeAlso dataFillFeature.js (tab data), ui/dragDrop.js (dock/drag), core/constants.js (SK_*)
 */
// src/features/calcWidgetFeature.js

import { AppState } from '../core/state.js';
import { SK_POS_CALC, SK_TAX, SK_HIST_B, SK_HIST_A, SK_COLLAPSE, SK_CALC_MAP } from '../core/constants.js';
import { makeDraggable } from '../ui/dragDrop.js';
import { formatNum, parseNum, numToVN, capFirst } from '../utils/numberHelper.js';
import { setPageField, buildFullDOMMap } from '../utils/domHelper.js';
import { renderDataFillTabs } from './dataFillFeature.js'; // We will import rendering for the bottom half
import { DEFAULT_CALC_MAP } from '../core/defaults.js';

import { Storage } from '../utils/storage.js';

let TAX_RATE = Number(Storage.get(SK_TAX)) || 0.08;
let collapsedSections = Storage.get(SK_COLLAPSE) ?? { calc: false, data: true };

// History functions
function saveHist(key, val) {
    if (!val || val.replace(/\D/g, '').length < 6) return;
    let arr = Storage.get(key, []);
    arr = arr.filter(v => v !== val);
    arr.unshift(val);
    Storage.set(key, arr.slice(0, 10));
}

function renderHist(key, listId) {
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = (Storage.get(key, [])).map(v => `<option value="${v}">`).join('');
}

function clamp(widget) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = widget.getBoundingClientRect();
    widget.style.left = Math.min(Math.max(parseFloat(widget.style.left), 0), vw - r.width) + 'px';
    widget.style.top = Math.min(Math.max(parseFloat(widget.style.top), 0), vh - 36) + 'px';
}

function mkSecHeader(title, sectionKey, toggleCallback) {
    const hdr = document.createElement('div');
    hdr.className = 'wg-sec-header';
    const s = document.createElement('span'); s.innerText = title;
    const b = document.createElement('button');
    b.className = 'wg-toggle-btn';
    b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
    hdr.appendChild(s);
    hdr.appendChild(b);

    b.onclick = () => {
        collapsedSections[sectionKey] = !collapsedSections[sectionKey];
        b.innerText = collapsedSections[sectionKey] ? '▾' : '▴';
        Storage.set(SK_COLLAPSE, collapsedSections);
        toggleCallback(collapsedSections[sectionKey]);
    };
    return hdr;
}

function updateSyncDirIcon(btn, dir) {
    const icons = {
        both: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4"></path><path d="M2 12h20"></path><path d="m6 16-4-4 4-4"></path></svg>`,
        down: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>`,
        up: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>`
    };

    btn.innerHTML = icons[dir] || icons.both;
    btn.setAttribute('data-dir', dir);

    if (dir === 'both') {
        btn.title = 'Đồng bộ 2 chiều (bảng ↔ form)';
    } else if (dir === 'down') {
        btn.title = 'Chỉ đồng bộ xuống: Bảng ➔ Form';
    } else if (dir === 'up') {
        btn.title = 'Chỉ đồng bộ lên: Form ➔ Bảng';
    }
}

export function initCalcWidget() {
    const widget = document.createElement('div');
    widget.id = 'vnpt-calc-widget';

    const savedPos = Storage.get(SK_POS_CALC);
    const startDocked = !!(savedPos && savedPos.docked);
    Object.assign(widget.style, {
        top: (savedPos && savedPos.y) ? savedPos.y + 'px' : '16px',
        left: (savedPos && savedPos.x) ? savedPos.x + 'px' : (window.innerWidth - 236) + 'px'
    });

    // ══════════════ ACTION BUTTONS ══════════════
    function mkBtn(label, extraClass) {
        const b = document.createElement('button');
        b.innerText = label;
        b.className = 'cw-action-btn ' + extraClass;
        return b;
    }

    const fillBtn = mkBtn('Fill', 'cw-btn-fill'); fillBtn.id = "vnpt-cw-fill";
    const syncBtn = mkBtn('Sync', 'cw-btn-sync'); syncBtn.id = "vnpt-cw-sync";
    syncBtn.title = 'Manual trigger for Sync Mapping';
    const addBtn = mkBtn('Add', 'cw-btn-add'); addBtn.id = "vnpt-cw-add";
    const resetBtn = mkBtn('↺', 'cw-btn-reset'); resetBtn.id = "vnpt-cw-reset";
    resetBtn.title = 'Reset Default fields back to original';

    const btnGroup = document.createElement('div');
    btnGroup.className = 'cw-btn-group';
    btnGroup.appendChild(fillBtn);
    btnGroup.appendChild(syncBtn);
    btnGroup.appendChild(addBtn);
    btnGroup.appendChild(resetBtn);

    // ══════════════ TITLE BAR ══════════════
    const titleBar = document.createElement('div');
    titleBar.className = 'cw-title-bar';
    const titleLabel = document.createElement('span');
    titleLabel.className = 'cw-title-label';
    titleLabel.innerHTML = 'VNPT Fast';
    titleBar.appendChild(titleLabel);
    titleBar.appendChild(btnGroup);
    widget.appendChild(titleBar);

    // ══════════════ SECTION: CALCULATOR ══════════════
    collapsedSections.calc = false; // Always default open for calc or use saved
    const calcBody = document.createElement('div');
    calcBody.className = 'cw-body-inline';

    calcBody.innerHTML = `
    <div class="cw-inline-row">
        <input id="wg-before" class="cw-input-inline" placeholder="Trước thuế" list="wg-before-list" title="Trước thuế">
        <datalist id="wg-before-list"></datalist>
        
        <div class="cw-tax-group-inline">
            <input id="wg-taxRate" class="cw-tax-input-inline" title="Thuế (%)">
            <span class="cw-tax-symbol">%</span>
        </div>
        
        <input id="wg-tax" class="cw-input-inline" placeholder="Tiền thuế" title="Tiền thuế">
        
        <input id="wg-after" class="cw-input-inline" placeholder="Sau thuế" list="wg-after-list" title="Sau thuế">
        <datalist id="wg-after-list"></datalist>
        
        <input id="wg-text" class="cw-input-inline cw-input-readonly-inline" placeholder="Bằng chữ" readonly title="Số tiền bằng chữ">

        <div class="cw-map-dropdown-container">
            <button id="wg-calc-map-btn" class="cw-map-btn-inline" title="Cấu hình Mapping">⚙️</button>
            <div id="wg-calc-map-wrap" class="cw-map-wrap-popup" style="display:none;">
                <div class="cw-row"><span class="cw-map-label">Trước thuế</span><input id="cw-map-before" name="cw-map-before" data-clink="before" class="cw-map-input" placeholder="Ví dụ: tong_tien"><button class="btn-sync-dir-calc" data-clink="before" data-dir="both" title="Đồng bộ 2 chiều (bảng ↔ form)"></button></div>
                <div class="cw-row"><span class="cw-map-label">Tiền thuế</span><input id="cw-map-tax" name="cw-map-tax" data-clink="tax" class="cw-map-input" placeholder="Ví dụ: thue_gtgt"><button class="btn-sync-dir-calc" data-clink="tax" data-dir="both" title="Đồng bộ 2 chiều (bảng ↔ form)"></button></div>
                <div class="cw-row"><span class="cw-map-label">Sau thuế</span><input id="cw-map-after" name="cw-map-after" data-clink="after" class="cw-map-input" placeholder="Ví dụ: tong_cong"><button class="btn-sync-dir-calc" data-clink="after" data-dir="both" title="Đồng bộ 2 chiều (bảng ↔ form)"></button></div>
                <div class="cw-row"><span class="cw-map-label">Bằng chữ</span><input id="cw-map-text" name="cw-map-text" data-clink="text" class="cw-map-input" placeholder="Ví dụ: doc_tien"><button class="btn-sync-dir-calc" data-clink="text" data-dir="both" title="Đồng bộ 2 chiều (bảng ↔ form)"></button></div>
            </div>
        </div>
    </div>
    `;
    const inlineContainer = document.getElementById('vnpt-inline-calc');
    if (inlineContainer) {
        inlineContainer.appendChild(calcBody);
    } else {
        widget.appendChild(calcBody);
    }

    // Document Append
    document.body.appendChild(widget);
    AppState.calcWidget = widget;

    // Call data fill functionality rendering to build the bottom half of the widget
    renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections);

    // ══════════════ DOCK LOGIC ══════════════
    const contentEls = Array.from(widget.children).filter(el => el !== titleBar);

    function applyDock(docked) {
        contentEls.forEach(el => { el.style.display = docked ? 'none' : ''; });
        titleBar.style.borderRadius = docked ? '8px' : '0';
        widget.style.borderRadius = docked ? '8px' : '10px';
        widget.style.boxShadow = docked
            ? '0 -3px 16px rgba(25,135,84,0.55)'
            : '0 4px 24px rgba(0,0,0,.3)';

        // Khi dock, snap top = đáy - chiều cao title bar
        if (docked) {
            widget.style.top = (window.innerHeight - (titleBar.offsetHeight || 34)) + 'px';
        }
    }

    // Make Draggable
    const dragHandle = makeDraggable(widget, [titleBar], SK_POS_CALC, null, (docked) => {
        applyDock(docked);
    });

    // Khởi tạo trạng thái dock từ localStorage
    if (startDocked) dragHandle.setDocked(true);

    // Window clamp on resize
    window.addEventListener('resize', () => {
        if (dragHandle.isDocked()) {
            widget.style.top = (window.innerHeight - titleBar.offsetHeight) + 'px';
        } else {
            clamp(widget);
        }
    });

    // ─── Post Render Wiring ───
    const taxRateEl = document.getElementById('wg-taxRate');
    const beforeEl = document.getElementById('wg-before');
    const taxEl = document.getElementById('wg-tax');
    const afterEl = document.getElementById('wg-after');
    const textEl = document.getElementById('wg-text');

    const mapBtn = document.getElementById('wg-calc-map-btn');
    const mapWrap = document.getElementById('wg-calc-map-wrap');
    let calcMaps = Storage.get(SK_CALC_MAP) ?? { ...DEFAULT_CALC_MAP };

    mapBtn.onclick = (e) => {
        // Toggle Map popup
        const isVis = mapWrap.style.display === 'flex';
        mapWrap.style.display = isVis ? 'none' : 'flex';
        // Hide popup if clicking outside
        if (!isVis) {
            const closePopup = (evt) => {
                if (!mapWrap.contains(evt.target) && evt.target !== mapBtn) {
                    mapWrap.style.display = 'none';
                    document.removeEventListener('click', closePopup);
                }
            };
            setTimeout(() => document.addEventListener('click', closePopup), 0);
        }
    };

    widget.querySelectorAll('input[data-clink]').forEach(inp => {
        const key = inp.dataset.clink;
        const btnSync = widget.querySelector(`.btn-sync-dir-calc[data-clink="${key}"]`);
        
        const mapInfo = calcMaps[key] || [];
        const isLegacy = Array.isArray(mapInfo);
        const currentSync = isLegacy ? mapInfo : (mapInfo.sync || []);
        const currentDir = isLegacy ? 'both' : (mapInfo.syncDir || 'both');

        inp.value = currentSync.join(', ');
        if (btnSync) {
            updateSyncDirIcon(btnSync, currentDir);
            btnSync.onclick = () => {
                let dir = btnSync.getAttribute('data-dir');
                if (dir === 'both') dir = 'down';
                else if (dir === 'down') dir = 'up';
                else dir = 'both';
                updateSyncDirIcon(btnSync, dir);
                saveMap();
            };
        }

        const saveMap = () => {
            const syncs = inp.value.split(',').map(s => s.trim()).filter(Boolean);
            const dir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
            calcMaps[key] = { sync: syncs, syncDir: dir };
            Storage.set(SK_CALC_MAP, calcMaps);
        };

        inp.addEventListener('input', saveMap);
    });

    taxRateEl.value = TAX_RATE * 100;
    renderHist(SK_HIST_B, 'wg-before-list');
    renderHist(SK_HIST_A, 'wg-after-list');

    function calcUpdate(before, tax, after) {
        const txt = capFirst(numToVN(after)) + ' đồng';
        textEl.value = txt;

        // Lazy build DOM map nếu calcMap có cấu hình nhưng map chưa được khởi tạo
        const hasMappings = ['before', 'tax', 'after', 'text'].some(k => {
            const m = calcMaps[k];
            if (!m) return false;
            return Array.isArray(m) ? m.length > 0 : (m.sync || []).length > 0;
        });

        if (hasMappings) {
            buildFullDOMMap();
        }

        const canSync = (k) => {
            const m = calcMaps[k];
            if (!m) return false;
            const dir = Array.isArray(m) ? 'both' : (m.syncDir || 'both');
            return dir === 'both' || dir === 'down';
        };

        const getTargets = (k) => {
            const m = calcMaps[k];
            if (!m) return [];
            return Array.isArray(m) ? m : (m.sync || []);
        };

        if (canSync('before')) getTargets('before').forEach(n => setPageField(n, formatNum(before)));
        if (canSync('tax')) getTargets('tax').forEach(n => setPageField(n, formatNum(tax)));
        if (canSync('after')) getTargets('after').forEach(n => setPageField(n, formatNum(after)));
        if (canSync('text')) getTargets('text').forEach(n => setPageField(n, txt));
    }

    function fromBefore() {
        const b = parseNum(beforeEl.value), t = Math.round(b * TAX_RATE), a = b + t;
        taxEl.value = formatNum(t); afterEl.value = formatNum(a);
        calcUpdate(b, t, a);
    }
    function fromTax() {
        const t = parseNum(taxEl.value), b = Math.round(t / TAX_RATE), a = b + t;
        beforeEl.value = formatNum(b); afterEl.value = formatNum(a);
        calcUpdate(b, t, a);
    }
    function fromAfter() {
        const a = parseNum(afterEl.value), b = Math.round(a / (1 + TAX_RATE)), t = a - b;
        beforeEl.value = formatNum(b); taxEl.value = formatNum(t);
        calcUpdate(b, t, a);
    }

    taxRateEl.addEventListener('input', () => {
        TAX_RATE = Number(taxRateEl.value) / 100 || 0;
        Storage.set(SK_TAX, TAX_RATE);
        const b = parseNum(beforeEl.value), t = Math.round(b * TAX_RATE), a = b + t;
        taxEl.value = formatNum(t); afterEl.value = formatNum(a);
        textEl.value = capFirst(numToVN(a)) + ' đồng';
        calcUpdate(b, t, a);
    });
    taxRateEl.addEventListener('change', fromBefore);
    beforeEl.addEventListener('input', () => {
        const b = parseNum(beforeEl.value), t = Math.round(b * TAX_RATE), a = b + t;
        taxEl.value = formatNum(t); afterEl.value = formatNum(a);
        textEl.value = capFirst(numToVN(a)) + ' đồng';
        calcUpdate(b, t, a);
    });
    beforeEl.addEventListener('blur', () => {
        beforeEl.value = formatNum(parseNum(beforeEl.value));
        saveHist(SK_HIST_B, beforeEl.value);
        renderHist(SK_HIST_B, 'wg-before-list');
    });
    beforeEl.addEventListener('change', () => {
        beforeEl.value = formatNum(parseNum(beforeEl.value));
        saveHist(SK_HIST_B, beforeEl.value);
        renderHist(SK_HIST_B, 'wg-before-list');
        fromBefore();
    });
    taxEl.addEventListener('input', () => {
        const t = parseNum(taxEl.value), b = Math.round(t / TAX_RATE), a = b + t;
        beforeEl.value = formatNum(b); afterEl.value = formatNum(a);
        textEl.value = capFirst(numToVN(a)) + ' đồng';
        calcUpdate(b, t, a);
    });
    taxEl.addEventListener('change', fromTax);
    
    afterEl.addEventListener('input', () => {
        const a = parseNum(afterEl.value), b = Math.round(a / (1 + TAX_RATE)), t = a - b;
        beforeEl.value = formatNum(b); taxEl.value = formatNum(t);
        textEl.value = capFirst(numToVN(a)) + ' đồng';
        calcUpdate(b, t, a);
    });
    afterEl.addEventListener('blur', () => {
        afterEl.value = formatNum(parseNum(afterEl.value));
        saveHist(SK_HIST_A, afterEl.value);
        renderHist(SK_HIST_A, 'wg-after-list');
    });
    afterEl.addEventListener('change', () => {
        afterEl.value = formatNum(parseNum(afterEl.value));
        saveHist(SK_HIST_A, afterEl.value);
        renderHist(SK_HIST_A, 'wg-after-list');
        fromAfter();
    });

    // Click directly on inputs to copy
    const inputsToCopy = [
        { el: beforeEl, key: SK_HIST_B },
        { el: taxEl, key: null },
        { el: afterEl, key: SK_HIST_A },
        { el: textEl, key: null }
    ];

    inputsToCopy.forEach(item => {
        if (!item.el) return;
        ['click', 'focus'].forEach(evtType => {
            item.el.addEventListener(evtType, (e) => {
                if (e.target.value) {
                    navigator.clipboard.writeText(e.target.value);
                    if (item.key === SK_HIST_B) { saveHist(SK_HIST_B, e.target.value); renderHist(SK_HIST_B, 'wg-before-list'); }
                    if (item.key === SK_HIST_A) { saveHist(SK_HIST_A, e.target.value); renderHist(SK_HIST_A, 'wg-after-list'); }

                    // Visual feedback
                    const oldBg = e.target.style.backgroundColor;
                    e.target.style.backgroundColor = '#d1e7dd';
                    setTimeout(() => e.target.style.backgroundColor = oldBg, 300);
                }
            });
        });
    });
}

```

---

### File: src\features\configManager.js

```javascript
/**
 * @file configManager.js
 * @desc Quản lý việc Nhập (Import) và Xuất (Export) cấu hình JSON cho VNPT Export Widget.
 *       Bao gồm: Fields data, Templates list, Widget Position & Size.
 * @exports exportConfig — Hàm xuất JSON tải về máy
 * @exports importConfig — Hàm nhập JSON từ máy người dùng
 */

import { 
    LOCAL_KEY_FIELDS, LOCAL_KEY_POS, LOCAL_KEY_SIZE, 
    SK_TEMPLATES, SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC,
    SK_CALC_MAP, SK_TAX, SK_ADDRESS_LEARNING 
} from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { loadSavedData } from './fieldsManager.js';
import { renderTemplateManager } from './templateManager.js';
import { Storage } from '../utils/storage.js';

/**
 * Xuất toàn bộ cấu hình hiện tại ra file JSON
 */
export function exportConfig() {
    const config = {
        version: '1.0',
        timestamp: Date.now(),
        fields: Storage.get(LOCAL_KEY_FIELDS) || {},
        templates: Storage.get(SK_TEMPLATES) || [],
        position: Storage.get(LOCAL_KEY_POS) || null,
        size: Storage.get(LOCAL_KEY_SIZE) || null,
        addressLearning: Storage.get(SK_ADDRESS_LEARNING) || {},
        calc: {
            default: Storage.get(SK_DATA_DEF) || null,
            custom: Storage.get(SK_DATA_CUS) || null,
            sync: Storage.get(SK_DATA_SYNC) || null,
            map: Storage.get(SK_CALC_MAP) || {},
            taxRate: Number(Storage.get(SK_TAX)) || 0.08
        }
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vnpt_config_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('📤 Đã xuất cấu hình JSON');
}

/**
 * Nhập cấu hình từ file JSON do người dùng chọn
 */
export function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const config = JSON.parse(text);

            if (!config.fields && !config.calc) {
                throw new Error('Định dạng file không hợp lệ!');
            }

            // Lưu vào Storage utility
            if (config.fields) Storage.set(LOCAL_KEY_FIELDS, config.fields);
            if (config.templates) Storage.set(SK_TEMPLATES, config.templates);
            if (config.position) Storage.set(LOCAL_KEY_POS, config.position);
            if (config.size) Storage.set(LOCAL_KEY_SIZE, config.size);
            if (config.addressLearning) Storage.set(SK_ADDRESS_LEARNING, config.addressLearning);
            
            if (config.calc) {
                if (config.calc.default) Storage.set(SK_DATA_DEF, config.calc.default);
                if (config.calc.custom) Storage.set(SK_DATA_CUS, config.calc.custom);
                if (config.calc.sync) Storage.set(SK_DATA_SYNC, config.calc.sync);
                if (config.calc.map) Storage.set(SK_CALC_MAP, config.calc.map);
                if (config.calc.taxRate !== undefined) Storage.set(SK_TAX, config.calc.taxRate);
            }

            // Cập nhật giao diện
            await loadSavedData(); // Tải lại bảng fields

            // Cập nhật giao diện Calculator nếu widget đang mở
            const calcWidget = document.getElementById('vnpt-calc-widget');
            if (calcWidget) {
                const taxRateEl = document.getElementById('wg-taxRate');
                if (taxRateEl && config.calc && config.calc.taxRate !== undefined) {
                    taxRateEl.value = config.calc.taxRate * 100;
                }
                if (config.calc && config.calc.map) {
                    calcWidget.querySelectorAll('input[data-clink]').forEach(inp => {
                        const key = inp.dataset.clink;
                        if (config.calc.map[key]) {
                            inp.value = (config.calc.map[key] || []).join(', ');
                        }
                    });
                }
            }
            
            // Tải lại danh sách templates
            const tmplContainer = document.getElementById('vnpt-template-manager');
            if (tmplContainer) {
                renderTemplateManager(tmplContainer, (arrayBuffer, name) => {
                    AppState.templateBuffer = arrayBuffer;
                    AppState.templateName = name;
                });
            }

            // Cập nhật vị trí/kích thước widget (nếu có trong AppState)
            if (config.position && AppState.widget) {
                if (config.position.right) {
                    AppState.widget.style.right = config.position.right;
                    AppState.widget.style.left = 'auto';
                } else if (config.position.left) {
                    AppState.widget.style.left = config.position.left;
                    AppState.widget.style.right = 'auto';
                }
                if (config.position.top) AppState.widget.style.top = config.position.top;
                AppState.widget.style.bottom = 'auto';
            }
            if (config.size && AppState.panel) {
                AppState.panel.style.width = config.size.width + 'px';
                AppState.panel.style.height = config.size.height + 'px';
            }

            showToast('✅ Nhập cấu hình thành công!');
        } catch (err) {
            console.error('Lỗi Import:', err);
            alert('Lỗi: ' + err.message);
        }
    };

    input.click();
}

```

---

### File: src\features\dataFill\dataFillUI.js

```javascript
import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, SK_DATATAB, SK_COLLAPSE } from '../../core/constants.js';
import { showToast } from '../../ui/toast.js';
import { storage } from '../../api/storage/index.js';
import { DEFAULT_DATA as _DEFAULT_DATA } from '../../core/defaults.js';
import { doFillData, doSyncData } from './syncEngine.js';
import { exportFullBackup, importFullBackup } from '../../utils/backupHelper.js';

function ld(k, def = null) { try { const s = localStorage.getItem(k); return s !== null ? JSON.parse(s) : def; } catch { return def; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

export function renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections) {
    let currentDataTab = ld(SK_DATATAB) ?? 'custom';
    let defaultData = ld(SK_DATA_DEF) ?? { ..._DEFAULT_DATA };
    let customData = ld(SK_DATA_CUS) ?? {};
    let syncData = ld(SK_DATA_SYNC) ?? {};

    const tabHeader = document.createElement('div');
    tabHeader.className = 'cw-tab-header';

    const tabs = {
        custom: document.createElement('div'),
        default: document.createElement('div'),
        sync: document.createElement('div')
    };
    tabs.custom.innerText = '📋 Custom'; tabs.custom.className = 'cw-tab cw-tab-custom';
    tabs.default.innerText = '📌 Default'; tabs.default.className = 'cw-tab cw-tab-default';
    tabs.sync.innerText = '🔗 Sync'; tabs.sync.className = 'cw-tab cw-tab-sync';

    function applyStyles() {
        Object.values(tabs).forEach(t => t.classList.remove('active'));
        tabs[currentDataTab].classList.add('active');
    }
    applyStyles();

    const dataWrap = document.createElement('div');
    dataWrap.style.display = collapsedSections.data ? 'none' : 'block';
    const dataHeader = mkSecHeader('📋 Cấu hình Data', 'data', (isHidden) => {
        dataWrap.style.display = isHidden ? 'none' : 'block';
        clamp(widget);
    });

    const dataBody = document.createElement('div');
    dataBody.className = 'cw-data-body';

    function renderFields() {
        dataBody.innerHTML = '';
        let active = currentDataTab === 'sync' ? syncData : (currentDataTab === 'custom' ? customData : defaultData);
        let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : (currentDataTab === 'custom' ? SK_DATA_CUS : SK_DATA_DEF);
        const keys = Object.keys(active);

        if (keys.length === 0 && currentDataTab !== 'default') {
            dataBody.innerHTML = `<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>`;
        }

        keys.forEach(k => {
            const row = document.createElement('div'); row.className = 'cw-data-row';
            let mut = currentDataTab !== 'default';
            const dataItem = active[k];
            const isObj = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'));
            const val = isObj ? dataItem.value : dataItem;
            const lbl = isObj ? (dataItem.label || k) : k;

            const kInp = document.createElement('input'); 
            kInp.type = 'text'; kInp.value = lbl; 
            kInp.id = `df-key-${k}`; kInp.name = `df-key-${k}`;
            kInp.className = 'cw-data-key' + (mut ? ' mutable' : '');
            kInp.title = k; // Technical Key is shown on hover
            kInp.readOnly = !mut;

            if (mut) {
                kInp.onchange = () => {
                    const nk = kInp.value.trim(); if (!nk || nk === k) { kInp.value = lbl; return; }
                    // Update key while preserving value (and label if it was an object)
                    if (isObj) {
                        active[nk] = { ...dataItem, label: nk };
                    } else {
                        active[nk] = val;
                    }
                    delete active[k]; 
                    sv(sk, active); renderFields();
                };
            }

            const vInp = document.createElement('input'); 
            vInp.type = 'text'; vInp.value = val ?? ''; 
            vInp.id = `df-val-${k}`; vInp.name = `df-val-${k}`;
            vInp.className = 'cw-data-val';
            vInp.oninput = () => { 
                if (isObj) {
                    active[k] = { ...dataItem, value: vInp.value };
                } else {
                    active[k] = vInp.value;
                }
                sv(sk, active); 
            };

            row.appendChild(kInp); row.appendChild(vInp);
            if (mut) {
                const del = document.createElement('button'); del.innerHTML = '✕'; del.className = 'cw-del-btn';
                del.onclick = () => { if (confirm(`Delete "${lbl}"?`)) { delete active[k]; sv(sk, active); renderFields(); } };
                row.appendChild(del);
            } else row.appendChild(document.createElement('div')).className = 'cw-pad';
            dataBody.appendChild(row);
        });
    }

    tabs.custom.onclick = () => { currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyStyles(); renderFields(); };
    tabs.default.onclick = () => { currentDataTab = 'default'; sv(SK_DATATAB, 'default'); applyStyles(); renderFields(); };
    tabs.sync.onclick = () => { currentDataTab = 'sync'; sv(SK_DATATAB, 'sync'); applyStyles(); renderFields(); };

    // JSON Import/Export logic
    const expBtn = document.createElement('button'); expBtn.innerText = '📤'; expBtn.className = 'cw-icon-btn';
    expBtn.title = "Sao lưu toàn bộ dữ liệu ra JSON";
    expBtn.onclick = () => exportFullBackup();

    const impBtn = document.createElement('button'); impBtn.innerText = '📥'; impBtn.className = 'cw-icon-btn';
    impBtn.title = "Khôi phục dữ liệu từ JSON";
    const fileInp = document.createElement('input'); fileInp.type = 'file'; fileInp.accept = '.json'; fileInp.style.display = 'none';
    fileInp.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const success = await importFullBackup(e.target.files[0]);
            if (success) {
                setTimeout(() => location.reload(), 1500);
            }
        }
    };
    impBtn.onclick = () => fileInp.click();

    dataWrap.appendChild(tabHeader); tabHeader.appendChild(tabs.custom); tabHeader.appendChild(tabs.default); tabHeader.appendChild(tabs.sync);
    dataWrap.appendChild(dataBody); widget.appendChild(dataHeader); widget.appendChild(dataWrap);
    
    // Action overrides (Fill/Sync buttons are in title bar)
    const fillB = widget.querySelector('#vnpt-cw-fill'), syncB = widget.querySelector('#vnpt-cw-sync'), addB = widget.querySelector('#vnpt-cw-add'), resB = widget.querySelector('#vnpt-cw-reset');
    if (fillB) fillB.onclick = doFillData;
    if (syncB) syncB.onclick = doSyncData;
    if (addB) addB.onclick = () => {
        if (currentDataTab === 'default') { currentDataTab = 'custom'; sv(SK_DATATAB, 'custom'); applyStyles(); }
        let active = currentDataTab === 'sync' ? syncData : customData;
        let nk = "new_field_" + Date.now(); active[nk] = "";
        sv(currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS, active);
        renderFields(); dataBody.scrollTop = dataBody.scrollHeight;
    };
    if (resB) resB.onclick = () => {
        if (confirm('Reset Default Data?')) { defaultData = {..._DEFAULT_DATA}; sv(SK_DATA_DEF, defaultData); renderFields(); }
    };
    
    renderFields();
    const right = dataHeader.querySelector('.cw-right-wrap') || document.createElement('div');
    right.className = 'cw-right-wrap'; 
    right.prepend(expBtn); 
    right.prepend(impBtn); 
    right.appendChild(fileInp); // Thêm file input vào DOM
    dataHeader.appendChild(right);
}

```

---

### File: src\features\dataFill\index.js

```javascript
/**
 * @file index.js (src/features/dataFill/)
 * @desc Entry point cho module DataFill.
 */
import { initSyncEngine } from './syncEngine.js';
export { renderDataFillTabs } from './dataFillUI.js';
export { doFillData, doSyncData } from './syncEngine.js';

export function initDataFill() {
    initSyncEngine();
}

```

---

### File: src\features\dataFill\syncEngine.js

```javascript
/**
 * @file syncEngine.js
 * @desc Logic đồng bộ dữ liệu ngầm và lắng nghe sự kiện input/change trên toàn trang web.
 *       Đã tối ưu: Debounce 250ms, Focus Guard, DOM Cache.
 */
import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC } from '../../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue, setPageFieldsSequential } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { DEFAULT_DATA as _DEFAULT_DATA, DEFAULT_SYNC_DATA } from '../../core/defaults.js';
import { Storage } from '../../utils/storage.js';
import { debounce } from '../../utils/common.js';

// Trạng thái khóa để ngăn chặn việc lắng nghe sự kiện khi đang auto-fill hàng loạt
let isAutoFilling = false;

function loadFreshenedDefaultData() {
    // Một số UI module ghi trực tiếp vào localStorage (không qua Storage wrapper),
    // nên cần đọc "fresh" và tránh dùng reference/cached object.
    const cachedRaw = Storage.get(SK_DATA_DEF);
    let cached = cachedRaw ? JSON.parse(JSON.stringify(cachedRaw)) : null;
    let fresh = JSON.parse(JSON.stringify(_DEFAULT_DATA));
    if (!cached) return fresh;

    // Overlay fresh dates onto cached default data
    const dynamicKeys = ["ngayKy, ngayKy1", "thangKy, thangKy1", "namKy, namKy1", "ngayTiepNhan, ngayThangNamKy"];
    dynamicKeys.forEach(k => {
        if (cached[k] && fresh[k]) {
            cached[k].value = fresh[k].value;
        }
    });
    return cached;
}

export async function doFillData() {
    // Ensure we read latest values even if other modules wrote storage directly
    Storage.clearCache();
    if (isAutoFilling) return;
    isAutoFilling = true;

    try {
        const defaultData = loadFreshenedDefaultData();
        const customRaw = Storage.get(SK_DATA_CUS) ?? {};
        const customData = JSON.parse(JSON.stringify(customRaw));
        const merged = { ...defaultData, ...customData };

        // Danh sách các biến NHẠY CẢM của Khách hàng (Bên A)
        // Nếu các biến này bị trống trong Custom Data, tuyệt đối không lấy Default Data của VNPT điền vào.
        const SENSITIVE_KEYS = ['tenToChuc', 'tenDaiDien', 'diaChi', 'soDkdn', 'sdt', 'email'];

        // Fill fields B (Merged)
        const keys = Object.keys(merged);
        for (const k of keys) {
            const dataItem = merged[k];
            let val = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'))
                ? dataItem.value
                : dataItem;

            const targets = k.split(',').map(s => s.trim()).filter(s => s);
            const label = (dataItem && typeof dataItem === 'object') ? dataItem.label : null;
            
            // --- KIỂM TRA BẢO VỆ DỮ LIỆU ---
            const isSensitive = SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk.toLowerCase()));
            if (isSensitive) {
                // Nếu trường này có trong Default Data nhưng lại trống trong Custom Data, 
                // và nó là trường nhạy cảm của khách hàng -> Bỏ qua không điền (tránh điền tên AM vào tên khách)
                const isBlank = !val || val.toString().trim() === '';
                if (isBlank) {
                    console.warn(`[Fill Guard] Bỏ qua điền trường nhạy cảm bị trống: ${k}`);
                    continue; 
                }
            }

            if (label && !targets.includes(label)) {
                targets.push(label);
            }

            await setPageFieldsSequential(targets, val);
        }
        showToast('✅ Auto fill complete');
    } finally {
        // Luôn mở khóa kể cả khi có lỗi xảy ra
        setTimeout(() => { isAutoFilling = false; }, 500);
    }
}

export function doSyncData() {
    Storage.clearCache();
    if (isAutoFilling) return;
    isAutoFilling = true;

    try {
        let userSyncMap = Storage.get(SK_DATA_SYNC) ?? {};
        const syncMap = { ...DEFAULT_SYNC_DATA, ...userSyncMap };

        const keys = Object.keys(syncMap);
        if (keys.length === 0) { showToast('⚠️ No sync mapping', '#ffc107'); return; }
        
        keys.forEach(src => {
            let srcEl = findPageInput(src) || getInputByLabel(src);
            if (srcEl && srcEl.value !== undefined && srcEl.value !== '') {
                let targets = syncMap[src].split(',').map(s => s.trim()).filter(s => s);
                targets.forEach(t => setPageField(t, srcEl.value));
            }
        });
        showToast('✅ Sync form complete', '#d39e00');
    } finally {
        setTimeout(() => { isAutoFilling = false; }, 500);
    }
}

// ─── Event Listener Logic ───
let isSyncing = false;
const targetElementCache = new Map(); // Cache cho các target elements (tăng tốc độ gõ phím)
let boundHandleEvents = null;

const processSync = (target, val) => {
    if (isSyncing) return;

    let userSyncMap = Storage.get(SK_DATA_SYNC) ?? {};
    const sMap = { ...DEFAULT_SYNC_DATA, ...userSyncMap };

    if (Object.keys(sMap).length === 0) return;

    let keyId = target.id;
    let keyName = target.name;
    let keyLblStr = null;

    // Tìm label tương ứng
    if (keyId) {
        const lblEl = document.querySelector(`label[for="${keyId}"]`);
        if (lblEl) keyLblStr = lblEl.textContent.trim();
    }
    if (!keyLblStr) {
        const p = target.closest('label');
        if (p) keyLblStr = Array.from(p.childNodes).find(n => n.nodeType === 3)?.textContent.trim();
    }

    let targets = sMap[keyId] || sMap[keyName] || sMap[keyLblStr];
    if (targets) {
        isSyncing = true;
        try {
            const list = targets.split(',').map(s => s.trim()).filter(s => s);
            list.forEach(t => {
                // Focus Guard: Chỉ cập nhật nếu field đích đang KHÔNG được focus
                if (t !== keyId && t !== keyName && t !== keyLblStr) {
                    // Kiểm tra cache trước
                    let targetEl = targetElementCache.get(t);
                    if (!targetEl || !document.contains(targetEl)) {
                        targetEl = findPageInput(t) || getInputByLabel(t);
                        if (targetEl) targetElementCache.set(t, targetEl);
                    }

                    if (targetEl && document.activeElement !== targetEl) {
                        syncSetValue(targetEl, val);
                    }
                }
            });
        } finally {
            isSyncing = false;
        }
    }
};

const debouncedSync = debounce((target, val) => {
    processSync(target, val);
}, 250);

export function initSyncEngine() {
    if (boundHandleEvents) return; // Prevent duplicate listeners (hot reload)

    boundHandleEvents = (e) => {
        // Nếu trang web đang trong quá trình Auto-fill tự động, bỏ qua các sự kiện input/change
        if (isAutoFilling) return;

        const target = e.target.closest('input, textarea, select, ng-select2');
        if (!target) return;

        // Bỏ qua nếu là input từ trong chính Widget của chúng ta
        if (target.closest('#vnpt-docx-widget') || target.closest('#vnpt-inline-calc')) return;

        let val = target.value;
        if (target.tagName === 'NG-SELECT2' || target.classList.contains('select2-hidden-accessible')) {
            const span = target.parentElement ? target.parentElement.querySelector('.select2-selection__rendered') : null;
            if (span && span.getAttribute('title')) {
                val = span.getAttribute('title');
            } else if (span && span.textContent) {
                val = span.textContent.trim();
            }
        }

        // Gọi xử lý đồng bộ với debounce (250ms delay)
        debouncedSync(target, val);
    };

    document.addEventListener('input', boundHandleEvents);
    document.addEventListener('change', boundHandleEvents);
}

export function cleanupSyncEngine() {
    if (!boundHandleEvents) return;
    document.removeEventListener('input', boundHandleEvents);
    document.removeEventListener('change', boundHandleEvents);
    boundHandleEvents = null;
    targetElementCache.clear();
}

```

---

### File: src\features\dataFillFeature.js

```javascript
/**
 * @file dataFillFeature.js
 * @desc Quản lý 3 tab dữ liệu (Custom / Default / Sync) trong Calc Widget.
 *       Bao gồm: render giao diện tab, CRUD dữ liệu, import/export JSON,
 *       và engine tự động đồng bộ field theo mapping khi user gõ trên trang.
 * @exports renderDataFillTabs  — render toàn bộ phần Data vào widget
 * @exports doFillData          — điền dữ liệu merged (default+custom) lên trang
 * @exports doSyncData          — trigger đồng bộ theo sync-map thủ công
 * @exports DEFAULT_DATA        — re-export từ core/defaults.js (backward compat)
 * @seeAlso core/defaults.js (data), calcWidgetFeature.js (caller), core/constants.js (keys)
 */

import { SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, SK_DATATAB, SK_COLLAPSE } from '../core/constants.js';
import { setPageField, findPageInput, getInputByLabel, syncSetValue } from '../utils/domHelper.js';
import { showToast } from '../ui/toast.js';
import { Storage } from '../utils/storage.js';
import { DEFAULT_DATA as _DEFAULT_DATA } from '../core/defaults.js';
export { DEFAULT_DATA } from '../core/defaults.js'; // re-export cho backward compat

import { doFillData, doSyncData } from './dataFill/syncEngine.js';

let customData = Storage.get(SK_DATA_CUS) ?? {};
let syncData = Storage.get(SK_DATA_SYNC) ?? {};
let currentDataTab = Storage.get(SK_DATATAB) ?? 'custom';

let defaultData = Storage.get(SK_DATA_DEF) ?? JSON.parse(JSON.stringify(_DEFAULT_DATA));


export function renderDataFillTabs(widget, mkSecHeader, clamp, collapsedSections) {
    // ══════════════ SECTION: DATA TABS ══════════════
    const tabHeader = document.createElement('div');
    tabHeader.className = 'cw-tab-header';

    const tabCustom = document.createElement('div'); tabCustom.innerText = '📋 Custom'; 
    tabCustom.className = 'cw-tab cw-tab-custom';
    const tabSync = document.createElement('div'); tabSync.innerText = '🔗 Sync';
    tabSync.className = 'cw-tab cw-tab-sync';
    const tabDefault = document.createElement('div'); tabDefault.innerText = '📌 Default';
    tabDefault.className = 'cw-tab cw-tab-default';

    function applyTabStyles() {
        tabCustom.classList.remove('active');
        tabDefault.classList.remove('active');
        tabSync.classList.remove('active');
        if (currentDataTab === 'custom') {
            tabCustom.classList.add('active');
        } else if (currentDataTab === 'default') {
            tabDefault.classList.add('active');
        } else {
            tabSync.classList.add('active');
        }
    }
    applyTabStyles();

    tabHeader.appendChild(tabCustom);
    tabHeader.appendChild(tabDefault);
    tabHeader.appendChild(tabSync);

    const dataWrap = document.createElement('div');
    dataWrap.style.display = collapsedSections.data ? 'none' : 'block';

    const dataHeader = mkSecHeader('📋 Cấu hình Data', 'data', (isHidden) => {
        dataWrap.style.display = isHidden ? 'none' : 'block';
        clamp(widget);
    });

    const importBtn = document.createElement('button'); importBtn.innerText = '📥'; importBtn.title = 'Import JSON';
    const exportBtn = document.createElement('button'); exportBtn.innerText = '📤'; exportBtn.title = 'Export JSON';
    [importBtn, exportBtn].forEach(b => b.className = 'cw-icon-btn');

    const dataToggleBtn = dataHeader.querySelector('.wg-toggle-btn');
    const rightWrap = document.createElement('div');
    rightWrap.className = 'cw-right-wrap';
    rightWrap.appendChild(importBtn);
    rightWrap.appendChild(exportBtn);
    rightWrap.appendChild(dataToggleBtn);
    dataHeader.appendChild(rightWrap);

    const dataBody = document.createElement('div');
    dataBody.className = 'cw-data-body';

    dataWrap.appendChild(tabHeader);
    dataWrap.appendChild(dataBody);

    widget.appendChild(dataHeader);
    widget.appendChild(dataWrap);

    // ─── Data fields rendering ───
    function renderDataFields() {
        dataBody.innerHTML = '';
        let activeData = currentDataTab === 'sync' ? syncData : (currentDataTab === 'custom' ? customData : defaultData);
        const keys = Object.keys(activeData);

        if (keys.length === 0 && (currentDataTab === 'custom' || currentDataTab === 'sync')) {
            dataBody.innerHTML = `<div class="cw-data-empty">Chưa có fields nào.<br>Nhấn [＋ Add] để thêm mới.</div>`;
            return;
        }

        keys.forEach(key => {
            const row = document.createElement('div');
            row.className = 'cw-data-row';

            let isMutable = currentDataTab === 'custom' || currentDataTab === 'sync';
            const dataItem = activeData[key];
            const isObj = (dataItem && typeof dataItem === 'object' && dataItem.hasOwnProperty('value'));
            const val = isObj ? dataItem.value : dataItem;
            const lbl = isObj ? (dataItem.label || key) : key;

            const keyInp = document.createElement('input');
            keyInp.type = 'text'; keyInp.value = lbl; keyInp.title = key;
            keyInp.className = 'cw-data-key' + (isMutable ? ' mutable' : '');
            
            keyInp.readOnly = !isMutable;
            if (isMutable) {
                keyInp.onchange = () => {
                    const newKey = keyInp.value.trim();
                    if (!newKey || newKey === key) { keyInp.value = lbl; return; }
                    if (activeData.hasOwnProperty(newKey)) { alert(`Nhãn "${newKey}" đã tồn tại!`); keyInp.value = lbl; return; }
                    
                    if (isObj) {
                        activeData[newKey] = { ...dataItem, label: newKey };
                    } else {
                        activeData[newKey] = val;
                    }
                    delete activeData[key];
                    let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS;
                    Storage.set(sk, activeData);
                    renderDataFields();
                };
            }

            const inp = document.createElement('input');
            inp.type = 'text'; inp.value = val ?? '';
            inp.className = 'cw-data-val';
            
            inp.oninput = () => {
                if (isObj) {
                    activeData[key] = { ...dataItem, value: inp.value };
                } else {
                    activeData[key] = inp.value;
                }
                let sk = currentDataTab === 'sync' ? SK_DATA_SYNC : (currentDataTab === 'custom' ? SK_DATA_CUS : SK_DATA_DEF);
                Storage.setDebounced(sk, activeData, 1000);
            };

            if (currentDataTab === 'sync') inp.placeholder = 'Các nhãn đích...';
            row.appendChild(keyInp); row.appendChild(inp);

            if (currentDataTab === 'custom' || currentDataTab === 'sync') {
                const del = document.createElement('button');
                del.innerHTML = '✕';
                del.className = 'cw-del-btn';
                del.onclick = () => {
                    if (confirm(`Delete "${key}"?`)) {
                        delete activeData[key];
                        if (currentDataTab === 'custom') Storage.set(SK_DATA_CUS, activeData);
                        if (currentDataTab === 'sync') Storage.set(SK_DATA_SYNC, activeData);
                        renderDataFields();
                    }
                };
                row.appendChild(del);
            } else {
                const pad = document.createElement('div');
                pad.className = 'cw-pad';
                row.appendChild(pad);
            }

            dataBody.appendChild(row);
        });

        const hint = document.createElement('div');
        hint.className = 'cw-data-hint';
        hint.innerText = `${keys.length} fields · auto-saved`;
        dataBody.appendChild(hint);
    }
    renderDataFields();

    tabCustom.onclick = () => { currentDataTab = 'custom'; Storage.set(SK_DATATAB, 'custom'); applyTabStyles(); renderDataFields(); };
    tabDefault.onclick = () => { currentDataTab = 'default'; Storage.set(SK_DATATAB, 'default'); applyTabStyles(); renderDataFields(); };
    tabSync.onclick = () => { currentDataTab = 'sync'; Storage.set(SK_DATATAB, 'sync'); applyTabStyles(); renderDataFields(); };

    exportBtn.onclick = () => {
        const dataToExport = { defaultData, customData, syncData };
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vnpt_data_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    importBtn.onclick = () => {
        const fileInp = document.createElement('input');
        fileInp.type = 'file';
        fileInp.accept = '.json';
        fileInp.onchange = async e => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await storage.download('local', file, { type: 'text' });
                const parsed = JSON.parse(text);
                if (parsed.defaultData) { 
                    Storage.set(SK_DATA_DEF, parsed.defaultData); 
                    defaultData = loadFreshenedDefaultData(); 
                }
                if (parsed.customData) { customData = parsed.customData; Storage.set(SK_DATA_CUS, customData); }
                if (parsed.syncData) { syncData = parsed.syncData; Storage.set(SK_DATA_SYNC, syncData); }
                renderDataFields();
                showToast('✅ Import successful!');
            } catch (err) { alert('Invalid JSON file format or error reading file!'); }
        };
        fileInp.click();
    };

    widget.querySelector('#vnpt-cw-fill').onclick = doFillData;
    widget.querySelector('#vnpt-cw-sync').onclick = doSyncData;
    widget.querySelector('#vnpt-cw-add').onclick = () => {
        if (currentDataTab === 'default') {
            currentDataTab = 'custom'; Storage.set(SK_DATATAB, 'custom'); applyTabStyles();
        }
        let activeData = currentDataTab === 'sync' ? syncData : customData;
        let i = 1, newKey = "new_field";
        while (activeData.hasOwnProperty(newKey)) { newKey = "new_field_" + i; i++; }
        activeData[newKey] = "";
        Storage.set(currentDataTab === 'sync' ? SK_DATA_SYNC : SK_DATA_CUS, activeData);
        if (collapsedSections.data) {
            collapsedSections.data = false;
            Storage.set(SK_COLLAPSE, collapsedSections);
            dataWrap.style.display = 'block';
            dataHeader.querySelector('.wg-toggle-btn').innerText = '▴';
        }
        renderDataFields();
        dataBody.scrollTop = dataBody.scrollHeight;
    };
    widget.querySelector('#vnpt-cw-reset').onclick = () => {
        if (confirm('Reset [Default Data] to hardcoded values?')) {
            defaultData = { ..._DEFAULT_DATA };
            Storage.set(SK_DATA_DEF, defaultData);
            if (currentDataTab === 'default') renderDataFields();
            showToast('Reset complete', '#17a2b8');
        }
    };
}



```

---

### File: src\features\docExport.js

```javascript
/**
 * @file docExport.js
 * @desc Xu ly xuat file DOCX tu template local bang docxtemplater + PizZip.
 * @exports initDocExport - gan click handler cho nut xuat DOCX va logic ten file
 * @seeAlso templateManager.js, fieldsManager.js
 */

import { logger } from '../utils/logger.js';
import { AppState } from '../core/state.js';
import { storage } from '../api/storage/index.js';
import { DEFAULT_LABELS, REQUIRED_KEYS } from '../core/constants.js';

// Import thư viện trực tiếp để hỗ trợ cả Extension (Vite sẽ bundle vào)
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

function diagnoseTemplateBuffer(arrayBuffer) {
    if (!arrayBuffer) {
        return { ok: false, message: 'Chua co du lieu template. Hay chon mot file .docx local.' };
    }

    let buf = arrayBuffer;
    if (ArrayBuffer.isView(buf) && buf.buffer) buf = buf.buffer;

    if (!(buf instanceof ArrayBuffer)) {
        return { ok: false, message: `Template khong dung dinh dang ArrayBuffer (nhan: ${typeof arrayBuffer}). Hay chon lai file .docx.` };
    }

    if (buf.byteLength < 4) {
        return { ok: false, message: `File template (.docx) dang rong (0 byte) hoac bi hong. Kich thuoc nhan duoc: ${buf.byteLength} bytes.` };
    }

    const bytes = new Uint8Array(buf, 0, Math.min(buf.byteLength, 512));
    const isZip = bytes[0] === 0x50 && bytes[1] === 0x4B; // Magic number 'PK'
    if (isZip) return { ok: true };

    let headText = '';
    try {
        headText = new TextDecoder('utf-8').decode(bytes).toLowerCase();
    } catch {}

    if (headText.includes('<!doctype html') || headText.includes('<html')) {
        return {
            ok: false,
            message: 'CANH BAO: File nay thuc chat la mot trang web (HTML) duoc doi duoi thanh .docx. Vui long tai lai file Word chuan tu Portal.'
        };
    }

    if (headText.includes('%pdf-')) {
        return { ok: false, message: 'Loi: Day la file PDF duoc doi duoi thanh .docx. He thong chi ho tro file Word (.docx) that.' };
    }

    return {
        ok: false,
        message: 'File template khong dung dinh dang DOCX/ZIP hop le. Hay kiem tra lai file .docx local.'
    };
}

function renderDocx(arrayBuffer, dataToFill, exportFileName) {
    try {
        const diag = diagnoseTemplateBuffer(arrayBuffer);
        if (!diag.ok) {
            alert(diag.message);
            return;
        }

        let zip;
        try {
            zip = new PizZip(arrayBuffer);
        } catch (zipErr) {
            alert('Loi dinh dang: File template (.docx) rong, bi hong hoac khong phai file Word hop le. Vui long kiem tra lai file local.');
            console.error(zipErr);
            return;
        }

        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.render(dataToFill);

        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });

        const url = URL.createObjectURL(out);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        let msg = error.message;
        if (error.properties && error.properties.errors instanceof Array) {
            const details = error.properties.errors.map(e => '- ' + (e.properties.explanation || e.message)).join('\n');
            msg = 'Cau truc the (tag) trong file Word Template (.docx) dang bi loi:\n\n' + details;
        } else {
            msg = 'Loi phan mem Word sinh ra: ' + msg;
        }
        alert(msg);
        console.error('DocX Error:', error);
    }
}

function copyTxtToClipboard(template, data) {
    const result = template.replace(/@(\w+)/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });

    navigator.clipboard.writeText(result).then(() => {
        alert('Da sao chep noi dung vao Clipboard!');
    }).catch(err => {
        console.error('Loi khi copy:', err);
        alert('Loi khi sao chep vao Clipboard. Vui long thu lai!');
    });
}

export function initDocExport() {
    const filenameInput = document.getElementById('vnpt-export-filename');
    if (filenameInput) {
        filenameInput.addEventListener('input', () => {
            filenameInput.dataset.userEdited = '1';
            if (!filenameInput.value.trim()) {
                filenameInput.dataset.userEdited = '0';
            }
        });
    }

    function autoUpdateExportFileName() {
        if (!filenameInput || filenameInput.dataset.userEdited === '1') return;

        let tenToChuc = '';
        if (AppState.fieldsContainer) {
            const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
            rows.forEach(row => {
                const rawKey = row.querySelector('.f-key').value.trim();
                const k = rawKey.split(',')[0].trim();
                const v = row.querySelector('.f-val').value.trim();
                if (k === 'tenToChuc') tenToChuc = v;
            });
        }

        if (!tenToChuc) {
            const docEl = document.getElementById('tenToChuc');
            if (docEl) {
                tenToChuc = docEl.tagName.toLowerCase() === 'textarea' || docEl.tagName.toLowerCase() === 'input'
                    ? docEl.value.trim()
                    : docEl.innerText.trim();
            }
        }

        function shrinkName(name) {
            if (!name) return '';
            let s = name;

            s = s.replace(/Tong cong ty/gi, '');
            s = s.replace(/Cong ty/gi, '');
            s = s.replace(/\bCty\b/gi, '');
            s = s.replace(/Trach nhiem huu han/gi, '');
            s = s.replace(/\bTNHH\b/gi, '');
            s = s.replace(/Co phan/gi, '');
            s = s.replace(/\bCP\b/gi, '');
            s = s.replace(/Mot thanh vien/gi, '');
            s = s.replace(/\bMTV\b/gi, '');
            s = s.replace(/Chi nhanh/gi, '');
            s = s.replace(/Viet Nam/gi, 'VN');

            s = s.replace(/\s+/g, ' ').trim();
            s = s.replace(/^[-,\s]+|[-,\s]+$/g, '');

            if (s.length > 50) s = s.substring(0, 47) + '...';
            return s.replace(/[<>:"/\\|?*]/g, '');
        }

        const shortTen = shrinkName(tenToChuc);
        const tplName = AppState.templateName ? AppState.templateName.replace(/\.docx$/i, '') : '';

        const parts = [];
        if (tplName) parts.push(tplName);
        if (shortTen) parts.push(shortTen);

        if (parts.length > 0) {
            filenameInput.value = parts.join(' - ') + '.docx';
        } else if (!filenameInput.value) {
            filenameInput.value = 'Export_Auto.docx';
        }
    }

    setInterval(autoUpdateExportFileName, 1000);

    document.getElementById('vnpt-btn-export').addEventListener('click', function () {
        const dataToFill = {};
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        rows.forEach(row => {
            const rawKey = row.querySelector('.f-key').value.trim();
            const k = rawKey.split(',')[0].trim();
            const v = row.querySelector('.f-val').value;
            if (k) dataToFill[k] = v;
        });

        if (Object.keys(dataToFill).length === 0) {
            alert('Ban chua quet du lieu hoac chua co bien nao.');
            return;
        }

        const missingFields = [];
        REQUIRED_KEYS.forEach(key => {
            if (!dataToFill[key] || !dataToFill[key].trim()) {
                const label = DEFAULT_LABELS[key] || key;
                missingFields.push(label);
            }
        });

        if (missingFields.length > 0) {
            const confirmMsg = `Canh bao: Ban con cac truong sau chua dien du lieu:\n\n- ${missingFields.join('\n- ')}\n\nBan co chac chan muon tiep tuc xuat file khong?`;
            if (!confirm(confirmMsg)) return;
        }

        let exportFileName = document.getElementById('vnpt-export-filename').value.trim() || 'HopDong_Auto.docx';
        if (!exportFileName.toLowerCase().endsWith('.docx')) exportFileName += '.docx';

        if (AppState.templateBuffer) {
            renderDocx(AppState.templateBuffer, dataToFill, exportFileName);
            return;
        }

        const fileInput = document.getElementById('vnpt-template-file');
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            file.arrayBuffer()
                .then(buf => renderDocx(buf, dataToFill, exportFileName))
                .catch(err => alert(`Loi doc file: ${err.message}`));
            return;
        }

        alert('Vui long chon template local: chon tu danh sach da luu hoac tai file .docx tu may tinh.');
    });

    const btnExportTxt = document.getElementById('vnpt-btn-export-txt');
    if (btnExportTxt) {
        btnExportTxt.addEventListener('click', () => {
            const txtTemplateArea = document.getElementById('vnpt-raw-scan-input');
            const template = txtTemplateArea ? txtTemplateArea.value : '';
            if (!template.trim()) {
                alert('Ban chua nhap noi dung Text Template!\n\nSu dung @key lam placeholder, vi du: Toi la @tenDaiDienn');
                return;
            }

            const dataToFill = {};
            const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
            rows.forEach(row => {
                const rawKey = row.querySelector('.f-key').value.trim();
                const k = rawKey.split(',')[0].trim();
                const v = row.querySelector('.f-val').value;
                if (k) dataToFill[k] = v;
            });

            if (Object.keys(dataToFill).length === 0) {
                alert('Ban chua quet du lieu hoac chua co bien nao.');
                return;
            }

            copyTxtToClipboard(template, dataToFill);
        });
    }
}

```

---

### File: src\features\fields\linker.js

```javascript
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
            &nbsp;·&nbsp; <span style="font-size:10px;opacity:0.85;">🔵 Trái = Link &nbsp; 🔴 Phải = Bỏ Link</span>
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
        const id = el.id;
        const formControl = el.getAttribute('formcontrolname') || el.getAttribute('ng-reflect-name');
        const name = el.name;
        const placeholder = el.getAttribute('placeholder');

        // Bỏ qua ID tự sinh của framework (thường chứa số hoặc prefix ng-)
        const isGenericId = id && (/^[0-9]/.test(id) || id.includes('ng-') || id.length > 20);
        
        if (id && !isGenericId) return id;
        if (formControl) return formControl;
        if (name) return name;
        if (placeholder) return placeholder;

        // 2. Nếu là Label (hoặc chứa text giống label), dùng InnerText
        const isLabel = el.tagName === 'LABEL' || el.classList.contains('label') || el.classList.contains('form-label');
        if (isLabel && el.innerText.trim()) return el.innerText.trim();

        // 3. Tìm xung quanh (Siblings / Parent) để lấy Label hoặc Wrapper ID
        // Ưu tiên tìm label có thuộc tính 'for' trỏ đến el
        if (id) {
            const labelFor = document.querySelector(`label[for="${CSS.escape(id)}"]`);
            if (labelFor && labelFor.innerText.trim()) return labelFor.innerText.trim();
        }

        let p = el.parentElement;
        let depth = 0;
        while (p && depth < 3) {
            // Thử tìm label anh em
            const prevLabel = p.querySelector('label, .label, .label-text, span.title, .form-label');
            if (prevLabel && prevLabel.innerText.trim()) return prevLabel.innerText.trim();

            // Nếu cha có title (thường là wrapper của select2 hoặc dropdown)
            const titleAttr = p.getAttribute('title');
            if (titleAttr) return titleAttr;

            // Thử lấy ID của cha nếu cha có vẻ là một wrapper định danh tốt
            if (p.id && !p.id.includes('ng-') && p.id.length < 30) return p.id;

            p = p.parentElement;
            depth++;
        }

        // 4. Fallback: Tag + Class (Rút gọn)
        const cls = el.className && typeof el.className === 'string' ? el.className.trim().split(/\s+/)[0] : '';
        return el.tagName.toLowerCase() + (cls && !cls.includes('ng-') ? '.' + cls : '');
    };

    // ── Tooltip gợi ý selector ──
    const tooltip = document.createElement('div');
    tooltip.className = 'vnpt-link-tooltip';
    tooltip.style.cssText = 'position:fixed;z-index:1000000;pointer-events:none;background:#333;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;font-family:monospace;display:none;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,0.2);';
    document.body.appendChild(tooltip);

    const LINKABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'SPAN', 'DIV', 'P', 'LABEL', 'BUTTON', 'TD', 'TH', 'SECTION', 'NG-SELECT2']);

    // ── Hover highlight ──
    const onMouseOver = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) {
            tooltip.style.display = 'none';
            return;
        }
        if (!LINKABLE_TAGS.has(el.tagName)) {
            tooltip.style.display = 'none';
            return;
        }

        // Cập nhật Tooltip
        const sel = getBestSelector(el);
        tooltip.textContent = `Target: ${sel}`;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 10) + 'px';
        tooltip.style.top = (e.clientY + 10) + 'px';

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

    // ── Click (Trái = Link, Phải = Unlink) ──
    const handleMouseInteraction = (e) => {
        const el = e.target;
        if (widget.contains(el) || banner.contains(el)) return;

        e.preventDefault();
        e.stopPropagation();

        const selector = getBestSelector(el);
        const currentParts = fKey.value.split(',').map(s => s.trim()).filter(s => s);
        const isLeftClick = e.button === 0;
        const isRightClick = e.button === 2 || e.type === 'contextmenu';

        if (isRightClick) {
            // ── UNLINK: chuột phải ──
            if (currentParts.includes(selector)) {
                const newParts = currentParts.filter(p => p !== selector);
                fKey.value = newParts.join(', ');

                el.classList.remove('vnpt-link-existing');
                el.classList.remove('vnpt-unlink-hover');
                el.classList.add('vnpt-link-highlight'); // Chuyển về trạng thái chuẩn bị link
                
                const idx = existingEls.indexOf(el);
                if (idx !== -1) existingEls.splice(idx, 1);

                fKey.dispatchEvent(new Event('input', { bubbles: true }));
                updateBanner();
                showToast(`🔓 Đã bỏ "${selector}"`, '#ea4335');
            }
        } else if (isLeftClick) {
            // ── LINK: chuột trái ──
            if (!currentParts.includes(selector)) {
                fKey.value = [...currentParts, selector].join(', ');

                el.classList.remove('vnpt-link-highlight');
                el.classList.add('vnpt-link-existing');
                if (!existingEls.includes(el)) existingEls.push(el);
                
                fKey.dispatchEvent(new Event('input', { bubbles: true }));
                updateBanner();
                showToast(`+🔗 "${selector}" — Phải để bỏ | ✅ Xong`, '#198754');
            }
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
        if (tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);

        if (doSync) {
            // Dispatch 'change' một lần duy nhất khi xong → syncThisRow()
            fKey.dispatchEvent(new Event('change', { bubbles: true }));
        }

        document.removeEventListener('mouseover', onMouseOver, true);
        document.removeEventListener('mousedown', handleMouseInteraction, true);
        document.removeEventListener('contextmenu', handleMouseInteraction, true);
        document.removeEventListener('keydown', onKeydown, true);
        _linkerCleanup = null;
    };

    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mousedown', handleMouseInteraction, true);
    document.addEventListener('contextmenu', handleMouseInteraction, true);
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

```

---

### File: src\features\fields\mode.js

```javascript
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_DEFAULT_FIELDS, DEFAULT_LABELS, SK_CALC_MAP, SK_TAX
} from '../../core/constants.js';
import { DEFAULT_DATA, DEFAULT_CALC_MAP } from '../../core/defaults.js';
import { showToast } from '../../ui/toast.js';
import { addOrUpdateFieldRow, updateSyncDirIcon } from './row.js';
import { startFieldLinker } from './linker.js';
import { loadSavedData } from './store.js';

export function updateUIForDefaultMode(isDefault) {
    const btn = document.getElementById('vnpt-btn-default');
    if (!btn) return;

    AppState.fieldsContainer.innerHTML = '';
    AppState.bannerArea.innerHTML = '';

    if (isDefault) {
        btn.classList.add('active');
        btn.innerHTML = '✅ Chế độ: Dữ liệu mặc định';
        document.getElementById('vnpt-fields-container').classList.add('vnpt-mode-default');
        showToast("📌 Chế độ Dữ liệu mặc định (Có thể sửa)", "#ea4335");

        const banner = document.createElement('div');
        banner.className = 'vnpt-default-banner';
        banner.innerHTML = `<span style="color: red;"> LƯU Ý: ĐÂY LÀ DỮ LIỆU MẶC ĐỊNH</span>`;
        AppState.bannerArea.appendChild(banner);

        const overrides = Storage.get(LOCAL_KEY_DEFAULT_FIELDS);
        
        // Chèn Mapping Calc lên đầu bảng
        renderCalcMappingInBanner();

        if (!overrides || Object.keys(overrides).length === 0) {
            // Nạp dữ liệu gốc từ DEFAULT_DATA
            Object.keys(DEFAULT_DATA).forEach(key => {
                const item = DEFAULT_DATA[key];
                const val = (item && typeof item === 'object') ? item.value : item;
                const lbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');
                
                // Lọc bỏ Calc
                if (lbl.includes('Calc:') || lbl.includes('🛠️')) return;

                const s = (item && typeof item === 'object' && item.sync) ? item.sync : '';
                const dir = (item && typeof item === 'object' && item.syncDir) ? item.syncDir : 'down';
                addOrUpdateFieldRow(key, val, lbl, s, dir);
            });
        } else {
            Object.keys(overrides).forEach(key => {
                const item = overrides[key];
                const lbl = item.label || '';

                // Lọc bỏ Calc
                if (lbl.includes('Calc:') || lbl.includes('🛠️')) return;

                addOrUpdateFieldRow(key, item.value, item.label, item.sync || '', item.syncDir || 'both');
            });
        }

        // renderCalcMappingInBanner(); // Xóa dòng này ở cuối
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '🛠 Dữ liệu mặc định VNPT';
        document.getElementById('vnpt-fields-container').classList.remove('vnpt-mode-default');
        showToast("📋 Đã quay lại Dữ liệu cá nhân");
        loadSavedData();
    }
}

export function renderCalcMappingInBanner() {
    const section = document.createElement('div');
    section.className = 'vnpt-calc-mapping-default-section';
    section.style.cssText = 'border: 1px dashed var(--vnpt-primary); border-radius: 8px; padding: 6px; margin-bottom: 8px; background: rgba(26, 115, 232, 0.03);';

    section.innerHTML = `
        <div class="vnpt-calc-mapping-body" style="display: block; margin-top: 0; padding-top: 0;">
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Trước thuế</span>
                <input data-clink="before" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_tien_truoc_thue">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Tiền thuế</span>
                <input data-clink="tax" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: thue_gtgt">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; margin-bottom: 4px; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Sau thuế</span>
                <input data-clink="after" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: tong_cong">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
            <div class="vnpt-field-row" style="background: none; border: none; padding: 0; gap: 8px;">
                <span style="min-width: 70px; font-size: 11px; font-weight: bold;">Bằng chữ</span>
                <input data-clink="text" class="cw-map-input" style="flex: 1; height: 26px; font-size: 11px;" placeholder="Ví dụ: doc_tien">
                <button class="btn-sync-dir" title="Đồng bộ 2 chiều (bảng ↔ form)" data-dir="both" style="height: 26px; width: 26px; flex-shrink: 0; padding: 0; line-height: 26px;">↔</button>
                <button class="btn-field-link" title="🔗 Link trực quan" style="height: 26px; width: 26px; flex-shrink: 0;">🔗</button>
            </div>
        </div>
    `;

    const calcMaps = Storage.get(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
    section.querySelectorAll('.vnpt-field-row').forEach(row => {
        const inp = row.querySelector('input[data-clink]');
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        const linkBtn = row.querySelector('.btn-field-link');
        const k = inp.dataset.clink;

        const mapInfo = calcMaps[k] || [];
        const isLegacy = Array.isArray(mapInfo);
        const currentSync = isLegacy ? mapInfo : (mapInfo.sync || []);
        const currentDir = isLegacy ? 'both' : (mapInfo.syncDir || 'both');

        inp.value = currentSync.join(', ');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, currentDir);
            btnSyncDir.onclick = (e) => {
                e.preventDefault();
                let dir = btnSyncDir.getAttribute('data-dir');
                if (dir === 'both') dir = 'down';
                else if (dir === 'down') dir = 'up';
                else dir = 'both';
                updateSyncDirIcon(btnSyncDir, dir);
                saveMap();
            };
        }

        // Lưu cấu hình mapping
        const saveMap = () => {
            const currentMaps = Storage.get(SK_CALC_MAP) || { ...DEFAULT_CALC_MAP };
            const syncs = inp.value.split(',').map(s => s.trim()).filter(Boolean);
            const dir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';
            currentMaps[k] = { sync: syncs, syncDir: dir };
            Storage.set(SK_CALC_MAP, currentMaps);
            showToast(`✅ Đã cập nhật mapping cho "${k}"`);
        };

        // Quan trọng: Lắng nghe cả change và input (cho Linker)
        inp.addEventListener('change', saveMap);

        linkBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Bật Linker để chọn ID trên web
            startFieldLinker(row, inp);
            
            // Linker sẽ điền ID vào inp.value. 
            // Ta cần đảm bảo sau khi điền xong thì gọi saveMap.
            // Vì Linker của chúng ta gọi dispatchEvent(new Event('change')), nên inp.onchange ở trên sẽ xử lý tốt.
        };
    });

    AppState.fieldsContainer.prepend(section);
}

```

---

### File: src\features\fields\reverseSync.js

```javascript
import { addOrUpdateFieldRow } from './row.js';
import { AppState } from '../../core/state.js';
import { debounce } from '../../utils/common.js';
import { findPageInput, getInputByLabel } from '../../utils/domHelper.js';

let boundHandleEvents = null;

const debouncedReverseSync = debounce((target, val) => {
    // Tìm key tương ứng trong AppState/Widget
    let keyId = target.id;
    let keyName = target.name || target.getAttribute('formcontrolname');
    let keyLblStr = null;

    if (keyId) {
        const lblEl = document.querySelector(`label[for="${keyId}"]`);
        if (lblEl) keyLblStr = lblEl.textContent.trim();
    }
    
    // Tìm trong AppState.fieldsContainer xem có row nào ứng với target này không
    const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
    for (const row of rows) {
        const fKey = row.querySelector('.f-key');
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        
        // Chỉ sync LÊN nếu hướng là 'both' hoặc 'up'
        if (currentDir === 'down') continue;

        const targets = fKey.value.split(',').map(x => x.trim()).filter(Boolean);
        
        const isMatch = targets.some(t => t === keyId || t === keyName || t === keyLblStr);
        if (isMatch) {
            const fVal = row.querySelector('.f-val');
            if (fVal && fVal.value === val) continue; // Bỏ qua nếu giá trị đã giống hệt (tránh loop)

            // Cập nhật vào Widget
            addOrUpdateFieldRow(targets[0], val, null, '', null, true);
        }
    }
}, 300);

export function initReverseSync() {
    if (boundHandleEvents) return;

    boundHandleEvents = (e) => {
        const target = e.target.closest('input, textarea, select, ng-select2');
        if (!target) return;

        // Bỏ qua nếu là input từ trong chính Widget của chúng ta
        if (target.closest('#vnpt-docx-widget') || target.closest('#vnpt-inline-calc')) return;

        let val = target.value;
        // Xử lý đặc thù cho Select2
        if (target.tagName === 'NG-SELECT2' || target.classList.contains('select2-hidden-accessible')) {
            const span = target.parentElement ? target.parentElement.querySelector('.select2-selection__rendered') : null;
            if (span && span.getAttribute('title')) {
                val = span.getAttribute('title');
            } else if (span && span.textContent) {
                val = span.textContent.trim();
            }
        }

        debouncedReverseSync(target, val);
    };

    document.addEventListener('input', boundHandleEvents);
    document.addEventListener('change', boundHandleEvents);
}

export function cleanupReverseSync() {
    if (!boundHandleEvents) return;
    document.removeEventListener('input', boundHandleEvents);
    document.removeEventListener('change', boundHandleEvents);
    boundHandleEvents = null;
}

```

---

### File: src\features\fields\row.js

```javascript
import { AppState } from '../../core/state.js';
import { DEFAULT_LABELS } from '../../core/constants.js';
import { setPageFieldsSequential, findPageInput } from '../../utils/domHelper.js';
import { mstService } from '../../api/mstService.js';
import { parseAddressComponents, normalizeDate } from '../../utils/stringHelper.js';
import { AddressLearning } from '../../utils/addressLearning.js';
import { debounce } from '../../utils/common.js';
import { showToast } from '../../ui/toast.js';
import { refreshRowValidation } from './validation.js';
import { startFieldLinker } from './linker.js';
// Circular dependency handled by dynamic import or just re-export in fieldsManager
const saveFieldsToLocal = () => import('./store.js').then(m => m.saveFieldsToLocal());
const syncAllFields = (keys) => import('./sync.js').then(m => m.syncAllFields(keys));

export function updateSyncDirIcon(btn, dir) {
    const icons = {
        both: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4"></path><path d="M2 12h20"></path><path d="m6 16-4-4 4-4"></path></svg>`,
        down: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="m19 12-7 7-7-7"></path></svg>`,
        up: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"></path><path d="M12 19V5"></path></svg>`
    };

    btn.innerHTML = icons[dir] || icons.both;
    btn.setAttribute('data-dir', dir);

    if (dir === 'both') {
        btn.title = 'Đồng bộ 2 chiều (Mọi thay đổi đều được cập nhật giữa Bảng và Trang web)';
    } else if (dir === 'down') {
        btn.title = 'Chỉ đồng bộ XUỐNG: Bảng dữ liệu ➔ Form Trang web';
    } else if (dir === 'up') {
        btn.title = 'Chỉ đồng bộ LÊN: Form Trang web ➔ Bảng dữ liệu';
    }
}

export function updateRowConnectionStatus(row) {
    const fKey = row.querySelector('.f-key');
    const badge = row.querySelector('.connection-badge');
    if (!fKey || !badge) return;

    const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
    const isConnected = targets.some(t => findPageInput(t) !== null);

    if (isConnected) {
        badge.innerText = '●';
        badge.className = 'connection-badge connected';
        badge.title = 'Đã tìm thấy ô nhập liệu tương ứng trên trang web';
    } else {
        badge.innerText = '○';
        badge.className = 'connection-badge disconnected';
        badge.title = 'Không tìm thấy ô nhập liệu nào khớp trên trang web';
    }
}

export function addOrUpdateFieldRow(keyText, valueText, labelText = null, syncText = '', syncDir = null, isFromWebForm = false, sourceContext = null, skipIfNotEmpty = false) {
    const container = AppState.fieldsContainer || document.getElementById('vnpt-fields-list');
    if (!container) {
        console.error('[VNPT-Debug] No container found in addOrUpdateFieldRow for:', keyText);
        return;
    }
    
    const hint = container.querySelector('.text-hint');
    if (hint) hint.remove();

    const existingInputs = container.querySelectorAll('.f-key');
    let isDuplicate = false;

    const incomingPK = keyText.split(',')[0].trim();
    
    // Tìm hàng dựa trên data-pk thay vì class f-key để tránh trùng lặp class
    const existingRow = container.querySelector(`.vnpt-field-row[data-pk="${incomingPK}"]`);

    if (existingRow) {
        const valueInput = existingRow.querySelector('.f-val');
        const labelInput = existingRow.querySelector('.f-label');
        const keyInput = existingRow.querySelector('.f-key');
        const btnSyncDir = existingRow.querySelector('.btn-sync-dir');
        const currentDir = btnSyncDir ? btnSyncDir.getAttribute('data-dir') : 'both';

        // Không cập nhật value nếu:
        // 1. Chế độ skipIfNotEmpty đang bật và value hiện tại đã có dữ liệu
        // 2. Cập nhật từ form web mà chiều sync bị chặn 'down'
        if (valueText !== null && valueInput.value !== valueText && document.activeElement !== valueInput) {
            const hasData = valueInput.value && valueInput.value.trim() !== '';
            if (skipIfNotEmpty && hasData) {
                // Bỏ qua không ghi đè
            } else if (!(isFromWebForm && currentDir === 'down')) {
                const oldVal = valueInput.value;
                valueInput.value = valueText;

                // Hiệu ứng nháy xanh nếu giá trị thực sự thay đổi và không phải rỗng
                if (oldVal !== valueText && valueText) {
                    existingRow.classList.remove('field-flash-success');
                    void existingRow.offsetWidth; // Trigger reflow
                    existingRow.classList.add('field-flash-success');
                    setTimeout(() => existingRow.classList.remove('field-flash-success'), 3000);
                }
            }
        }
        if (labelText !== null && labelText !== '' && labelInput.value !== labelText && document.activeElement !== labelInput) {
            labelInput.value = labelText;
        }
        if (syncText !== '' && keyInput.value !== (keyText + ', ' + syncText) && document.activeElement !== keyInput) {
            keyInput.value = keyText + ', ' + syncText;
        }
        if (syncDir && btnSyncDir && btnSyncDir.getAttribute('data-dir') !== syncDir) {
            updateSyncDirIcon(btnSyncDir, syncDir);
        }

        // Lưu context (địa chỉ mang tính ngữ cảnh) để hỗ trợ "học máy"
        if (sourceContext && valueInput) {
            valueInput.dataset.sourceAddress = sourceContext;
        }

        // QUAN TRỌNG: Re-validate sau khi cập nhật
        refreshRowValidation(existingRow);
        updateRowConnectionStatus(existingRow);

        isDuplicate = true;
    }

    if (!isDuplicate) {
        if (labelText === null || labelText === '') {
            labelText = DEFAULT_LABELS[keyText] || '';
        }

        const container = AppState.fieldsContainer || document.getElementById('vnpt-fields-list');
        if (!container) {
            console.error('[VNPT-Debug] Cannot find container in addOrUpdateFieldRow for key:', keyText);
            return;
        }

        const row = document.createElement('div');
        row.className = 'vnpt-field-row row-item';
        row.setAttribute('draggable', 'false');
        row.setAttribute('data-pk', incomingPK); // Gán PK duy nhất cho hàng

        let displayKey = keyText;
        if (syncText) displayKey += ', ' + syncText;

        const primaryKey = incomingPK;

        row.innerHTML = `
            <input type="checkbox" id="chk-${primaryKey}" name="chk-${primaryKey}" class="row-chk" title="Chọn" />
            <span class="connection-badge disconnected" title="Đang kiểm tra kết nối...">○</span>
            <input type="text" id="lbl-${primaryKey}" name="lbl-${primaryKey}" class="f-label" value="${labelText}" />
            <input type="text" id="key-${primaryKey}" name="key-${primaryKey}" class="f-key" value="${displayKey}" title="Biến DOCX và IDs đồng bộ" />
            <button tabindex="-1" class="btn-sync-dir" title="Đồng bộ" data-dir="${syncDir || 'both'}">↔</button>
            <button class="btn-field-link" title="Liên kết">🔗</button>
            ${primaryKey === 'soDkdn' ? `
                <div class="mst-lookup-wrapper" style="flex: 1; display: flex; position: relative;">
                    <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val f-value" value="${valueText}" placeholder="Mã số thuế..." />
                    <button class="btn-mst-lookup" title="Tra cứu">🔍</button>
                </div>
            ` : `
                <input type="text" id="val-${primaryKey}" name="val-${primaryKey}" class="f-val f-value" value="${valueText}" />
            `}
        `;
        const fVal = row.querySelector('.f-val');
        const fKey = row.querySelector('.f-key');

        if (sourceContext && fVal) {
            fVal.dataset.sourceAddress = sourceContext;
        }

        if (keyText === 'tenToChuc') fVal.style.textAlign = 'right';

        const syncThisRow = async () => {
            const btnSync = row.querySelector('.btn-sync-dir');
            const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
            if (currentDir === 'up') return;

            const val = fVal.value;
            const targets = fKey.value.split(',').map(s => s.trim()).filter(s => s);
            await setPageFieldsSequential(targets, val);
        };

        const debouncedSyncRow = debounce(syncThisRow, 250);

        fKey.addEventListener('input', function () {
            saveFieldsToLocal();
            updateRowConnectionStatus(row);
            const firstKey = this.value.split(',')[0].trim();
            fVal.style.textAlign = firstKey === 'tenToChuc' ? 'right' : '';
        });
        fKey.addEventListener('change', function () {
            syncThisRow();
        });
        row.querySelector('.f-label').addEventListener('input', () => saveFieldsToLocal());

        fVal.addEventListener('input', function () {
            saveFieldsToLocal();
            refreshRowValidation(row);
            debouncedSyncRow();
        });
        fVal.addEventListener('change', function () {
            if (primaryKey && primaryKey.toLowerCase().includes('ngay')) {
                const normalized = normalizeDate(this.value);
                if (normalized !== this.value) {
                    this.value = normalized;
                    saveFieldsToLocal();
                }
            }

            if (primaryKey === 'duong' && this.dataset.sourceAddress) {
                AddressLearning.saveLearning(this.dataset.sourceAddress, this.value);
            }

            syncThisRow();
        });

        if (primaryKey === 'soDkdn') {
            const btnLookup = row.querySelector('.btn-mst-lookup');
            const handleLookup = async (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                const mst = fVal.value.trim();
                if (!mst) {
                    showToast("⚠️ Vui lòng nhập mã số thuế", "#ffc107");
                    return;
                }

                if (btnLookup.classList.contains('loading')) return;

                btnLookup.classList.add('loading');
                try {
                    const info = await mstService.lookupMST(mst);
                    if (info) {
                        fVal.value = mst;
                        addOrUpdateFieldRow('tenToChuc', info.name);
                        addOrUpdateFieldRow('diaChi', info.address);

                        const parsed = parseAddressComponents(info.address);
                        addOrUpdateFieldRow('tinhIdNew', parsed.province);
                        addOrUpdateFieldRow('xaIdNew', parsed.ward || parsed.district);
                        addOrUpdateFieldRow('duong', parsed.street, null, '', null, false, info.address);

                        saveFieldsToLocal();
                        setTimeout(() => syncAllFields(['soDkdn', 'tenToChuc', 'diaChi', 'xaIdNew', 'xaHuyen', 'duong']), 300);

                        showToast(`✅ Đã tìm thấy: ${info.name}`, "#1a73e8");
                    } else {
                        showToast("❌ Không tìm thấy thông tin MST này", "#ea4335");
                    }
                } catch (err) {
                    console.error("[MST Lookup] Error:", err);
                    showToast("❌ Lỗi khi tra cứu MST", "#ea4335");
                } finally {
                    btnLookup.classList.remove('loading');
                }
            };

            btnLookup.addEventListener('click', handleLookup);
            fVal.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    handleLookup(e);
                }
            });
        }

        const initDir = syncDir || 'both';
        const btnSyncDir = row.querySelector('.btn-sync-dir');
        if (btnSyncDir) {
            updateSyncDirIcon(btnSyncDir, initDir);
            btnSyncDir.addEventListener('click', (e) => {
                e.preventDefault();
                let currentDir = btnSyncDir.getAttribute('data-dir');
                if (currentDir === 'both') currentDir = 'down';
                else if (currentDir === 'down') currentDir = 'up';
                else currentDir = 'both';
                updateSyncDirIcon(btnSyncDir, currentDir);
                saveFieldsToLocal();
            });
        }

        const linkBtn = row.querySelector('.btn-field-link');
        if (linkBtn) {
            linkBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startFieldLinker(row, fKey);
            });
        }

        container.appendChild(row);
        updateRowConnectionStatus(row);
        container.scrollTop = container.scrollHeight;
    }
}

```

---

### File: src\features\fields\store.js

```javascript
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { logger } from '../../utils/logger.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_POS,
    DEFAULT_LABELS, SK_DATA_DEF
} from '../../core/constants.js';
import { addOrUpdateFieldRow } from './row.js';

export function saveFieldsToLocal() {
    const key = AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS;
    const data = {};
    const container = document.getElementById('vnpt-fields-list');
    if (!container) return;

    const rows = container.querySelectorAll('.vnpt-field-row');
    rows.forEach(row => {
        const keyInput = row.querySelector('.f-key');
        const labelInput = row.querySelector('.f-label');
        const valueInput = row.querySelector('.f-val');
        const syncDirEl = row.querySelector('.btn-sync-dir');

        if (!keyInput || !labelInput || !valueInput) {
            console.warn('[VNPT] Bỏ qua hàng do thiếu input:', row);
            return;
        }
        
        const rawKeyInput = keyInput.value.trim();
        const parts = rawKeyInput.split(',').map(s => s.trim()).filter(s => s);
        const k = parts[0];
        const s = parts.slice(1).join(', ');
        
        if (k) {
            data[k] = { 
                label: labelInput.value.trim(), 
                value: valueInput.value, 
                sync: s, 
                syncDir: syncDirEl ? syncDirEl.getAttribute('data-dir') : 'both' 
            };
        }
    });
    
    Storage.setDebounced(key, data, 1000);
    if (AppState.isDefaultMode) {
        Storage.setDebounced(SK_DATA_DEF, data, 1000);
    }
}

export function loadSavedData() {
    console.log('[VNPT-Debug] loadSavedData START');
    
    const container = document.getElementById('vnpt-fields-list');
    if (!container) {
        console.warn('[VNPT-Debug] Container not found, retrying...');
        setTimeout(loadSavedData, 150);
        return;
    }

    AppState.fieldsContainer = container;
    container.innerHTML = ''; // Làm sạch bảng
    
    const savedFields = Storage.get(LOCAL_KEY_FIELDS) || {};
    const defaultEntries = Object.entries(DEFAULT_LABELS);
    
    console.log('[VNPT-Debug] Data from Storage:', Object.keys(savedFields).length, 'keys');

    // 1. Nạp các trường mặc định (Khung xương)
    defaultEntries.forEach(([keyString, label]) => {
        // Lọc bỏ các trường Calc dư thừa nếu có trong danh sách mặc định (phòng hờ)
        if (label.includes('Calc:') || label.includes('🛠️')) return;

        const primaryKey = keyString.split(',')[0].trim();
        const saved = savedFields[primaryKey];
        
        if (saved && typeof saved === 'object') {
            addOrUpdateFieldRow(keyString, saved.value || '', saved.label || label, saved.sync || '', saved.syncDir || 'both');
        } else if (saved && typeof saved === 'string') {
            addOrUpdateFieldRow(keyString, saved, label, '', 'both');
        } else {
            addOrUpdateFieldRow(keyString, '', label, '', 'both');
        }
    });

    // 2. Nạp các trường tùy biến (Người dùng tự thêm)
    const defaultPKs = new Set(defaultEntries.map(([keyString]) => keyString.split(',')[0].trim()));
    Object.keys(savedFields).forEach(primaryKey => {
        if (!defaultPKs.has(primaryKey)) {
            const saved = savedFields[primaryKey];
            const label = (saved && typeof saved === 'object') ? (saved.label || '') : '';
            
            // Xoá bỏ các trường có tiền tố "🛠️ Calc:" hoặc "Calc:" theo yêu cầu
            if (label.includes('Calc:') || label.includes('🛠️')) {
                return;
            }

            if (saved && typeof saved === 'object') {
                addOrUpdateFieldRow(primaryKey, saved.value || '', saved.label || '', saved.sync || '', saved.syncDir || 'both');
            } else if (saved) {
                addOrUpdateFieldRow(primaryKey, saved, '', '', 'both');
            }
        }
    });

    console.log('[VNPT-Debug] Render completed. Rows in DOM:', container.querySelectorAll('.vnpt-field-row').length);

    if (container.querySelectorAll('.vnpt-field-row').length === 0) {
        container.innerHTML = '<div class="text-hint">Bảng dữ liệu đang trống... hãy ấn Quét</div>';
    }
}

export function restorePosition() {
    const pos = Storage.get(LOCAL_KEY_POS);
    if (pos && AppState.widget) {
        AppState.widget.style.bottom = 'auto';
        if (pos.right) {
            AppState.widget.style.right = pos.right;
            AppState.widget.style.left = 'auto';
        } else if (pos.left) {
            AppState.widget.style.left = pos.left;
            AppState.widget.style.right = 'auto';
        }
        if (pos.top) AppState.widget.style.top = pos.top;
    }
}

export function getBackupName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const org = data['tenToChuc']?.value || '';
    const name = data['tenDaiDienn']?.value || '';
    const contract = data['soHopDong']?.value || '';
    if (!org && !name && !contract) return `Bản sao lưu ${new Date().toLocaleString()}`;
    let label = org || name;
    if (contract) label += ` - ${contract}`;
    return label;
}

export function getExportFileName() {
    const data = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
    const contract = data['soHopDong']?.value || '';
    const org = data['tenToChuc']?.value || '';
    if (!contract && !org) return `Backup_VNPT_${new Date().toLocaleDateString().replace(/\//g, '-')}`;
    const parts = [];
    if (contract) parts.push(contract);
    if (org) parts.push(org);
    return parts.join(' - ').replace(/[\\\\/:"*?<>|]/g, '_');
}

```

---

### File: src\features\fields\sync.js

```javascript
import { AppState } from '../../core/state.js';
import { setPageFieldsSequential } from '../../utils/domHelper.js';
import { showToast } from '../../ui/toast.js';
import { doFillData } from '../dataFill/syncEngine.js';

/**
 * Đồng bộ toàn bộ bảng dữ liệu lên trang web
 */
export async function syncAllFields(targetKeys = null) {
    if (!targetKeys) doFillData(); // Chỉ đồng bộ Tab Calc nếu là full sync

    let count = 0;
    const rows = Array.from(AppState.fieldsContainer.querySelectorAll('.vnpt-field-row'));
    
    // Thu thập toàn bộ dữ liệu cần sync trước khi bắt đầu loop async (để tránh DOM mutation làm chậm)
    const syncTasks = rows.map(row => {
        const btnSync = row.querySelector('.btn-sync-dir');
        const currentDir = btnSync ? btnSync.getAttribute('data-dir') : 'both';
        if (currentDir === 'up') return null;

        const rawKeyInput = row.querySelector('.f-key').value.trim();
        const primaryKey = rawKeyInput.split(',')[0].trim();
        if (targetKeys && !targetKeys.includes(primaryKey)) return null;

        const val = row.querySelector('.f-val').value;
        if (val === '') return null;

        const label = row.querySelector('.f-label').value.trim();
        const targets = rawKeyInput.split(',').map(x => x.trim()).filter(Boolean);
        if (label && !targets.includes(label)) targets.push(label);

        return { targets, val };
    }).filter(Boolean);

    // Thực hiện sync tuần tự (sequential) để tránh nghẽn browser khi xử lý nhiều dropdown AJAX cùng lúc
    for (const task of syncTasks) {
        await setPageFieldsSequential(task.targets, task.val);
        count++;
    }

    if (!targetKeys) {
        count > 0 ? showToast(`✅ Đã đồng bộ ${count} hàng dữ liệu`, '#198754') : showToast(`⚠️ Không có trường nào để đồng bộ`, '#ffc107');
    }
}

```

---

### File: src\features\fields\ui.js

```javascript
import { AppState } from '../../core/state.js';
import { logger } from '../../utils/logger.js';
import { Storage } from '../../utils/storage.js';
import {
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, SK_TAX, SK_CALC_MAP,
    SK_COL_RATIO, COL_RATIO_MIN, COL_RATIO_MAX
} from '../../core/constants.js';
import { showToast } from '../../ui/toast.js';
import {
    createInternalBackup, restoreInternalBackup, getInternalBackups, deleteInternalBackup
} from '../../utils/backupHelper.js';
import { addOrUpdateFieldRow } from './row.js';
import { saveFieldsToLocal, loadSavedData, getBackupName } from './store.js';
import { syncAllFields } from './sync.js';
import { updateUIForDefaultMode } from './mode.js';

/**
 * Khởi tạo thanh kéo chia cột (Label / Value) trong Fields List.
 */
export function initColSplitter() {
    const splitter = document.getElementById('vnpt-col-splitter');
    const container = document.getElementById('vnpt-fields-container');
    if (!splitter || !container) return;

    const savedRatio = parseFloat(Storage.get(SK_COL_RATIO)) || 0.2;
    container.style.setProperty('--label-flex', savedRatio);

    splitter.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        splitter.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const containerRect = container.getBoundingClientRect();
        const startX = e.clientX;
        const startRatio = parseFloat(container.style.getPropertyValue('--label-flex')) || 0.2;

        const onMouseMove = (moveEvt) => {
            const dx = moveEvt.clientX - startX;
            const totalWidth = containerRect.width;
            const deltaRatio = dx / totalWidth;
            const newRatio = Math.min(COL_RATIO_MAX, Math.max(COL_RATIO_MIN, startRatio + deltaRatio));
            container.style.setProperty('--label-flex', newRatio.toFixed(3));
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            splitter.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            const finalRatio = container.style.getPropertyValue('--label-flex');
            Storage.set(SK_COL_RATIO, parseFloat(finalRatio));
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    });

    splitter.addEventListener('dblclick', () => {
        container.style.setProperty('--label-flex', '0.2');
        Storage.set(SK_COL_RATIO, 0.2);
        showToast('↔ Đã reset tỉ lệ cột về mặc định', '#5f6368');
    });
}

function renderBackupHistory(container) {
    const backups = getInternalBackups();
    container.innerHTML = `<div class="backup-history-header">📋 Local History (Max 20)</div>`;

    if (backups.length === 0) {
        container.innerHTML += '<div class="backup-history-empty">Chưa có lịch sử. Dữ liệu sẽ tự lưu khi bạn Quét hoặc Dọn dẹp!</div>';
        return;
    }

    backups.forEach((b) => {
        const item = document.createElement('div');
        item.className = 'backup-history-item';
        item.style.flexDirection = 'column';
        item.style.alignItems = 'stretch';

        const timeStr = new Date(b.id * 1).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

        item.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <div class="backup-info">
                    <div class="backup-history-name" title="${b.name}">${b.name}</div>
                    <div class="backup-history-time">${timeStr}</div>
                </div>
                <div class="backup-actions">
                    <button class="btn-restore-action" title="Khôi phục">⏪</button>
                    <button class="btn-delete-action" title="Xóa bản này">🗑️</button>
                </div>
            </div>
            <div class="backup-preview-content"></div>
        `;

        const previewContent = item.querySelector('.backup-preview-content');
        
        // Tự động nạp dữ liệu khi di chuột qua (Hover)
        item.onmouseenter = () => {
            if (previewContent.innerHTML === '') {
                const fields = b.data?.fields || {};
                // Ưu tiên các trường quan trọng để preview
                const importantKeys = ['tenToChuc', 'soHopDong', 'tenDaiDienn', 'soDkdn', 'diaChi'];
                let html = '';
                
                importantKeys.forEach(k => {
                    if (fields[k] && fields[k].value) {
                        const label = fields[k].label || k;
                        html += `
                            <div class="preview-row">
                                <span class="preview-label">${label}:</span>
                                <span class="preview-val">${fields[k].value}</span>
                            </div>
                        `;
                    }
                });

                if (!html) {
                    // Nếu không có trường quan trọng, lấy 5 trường bất kỳ
                    Object.keys(fields).slice(0, 5).forEach(k => {
                        html += `
                            <div class="preview-row">
                                <span class="preview-label">${fields[k].label || k}:</span>
                                <span class="preview-val">${fields[k].value || ''}</span>
                            </div>
                        `;
                    });
                }
                
                previewContent.innerHTML = html || '<div style="text-align:center; color:#9aa0a6;">(Trống)</div>';
            }
        };

        item.querySelector('.btn-restore-action').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Khôi phục dữ liệu từ bản: \n${b.name}?`)) {
                if (restoreInternalBackup(b.id)) {
                    container.classList.remove('show');
                    if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                    else loadSavedData();
                }
            }
        };

        item.querySelector('.btn-delete-action').onclick = (e) => {
            e.stopPropagation();
            if (confirm(`Xoá vĩnh viễn bản sao lưu:\n${b.name}?`)) {
                deleteInternalBackup(b.id);
                renderBackupHistory(container);
                showToast("🗑️ Đã xoá bản sao lưu", "#ff5252");
            }
        };

        container.appendChild(item);
    });
}

export function initFieldsManager() {
    document.getElementById('vnpt-btn-toggle-id').onclick = () => {
        const wrapper = document.getElementById('vnpt-fields-container');
        if (wrapper) wrapper.classList.toggle('show-ids');
    };

    initColSplitter();

    const btnCleanData = document.getElementById('vnpt-btn-clean-data');
    if (btnCleanData) {
        btnCleanData.onclick = () => {
            const isDefault = AppState.isDefaultMode;
            const msg = isDefault
                ? "BẠN ĐANG Ở CHẾ ĐỘ MẶC ĐỊNH.\nKhôi phục toàn bộ Dữ liệu Mặc định VNPT về ban đầu?"
                : "Dữ liệu hiện tại sẽ được Xóa. Bạn có muốn SAO LƯU nhanh trước khi làm sạch không?";

            if (confirm(msg)) {
                if (!isDefault) {
                    createInternalBackup(getBackupName());
                    Storage.remove(LOCAL_KEY_FIELDS);
                    showToast("🧹 Đã làm sạch & lưu bản cũ vào History", "#1a73e8");
                } else {
                    Storage.remove(LOCAL_KEY_DEFAULT_FIELDS);
                    showToast("🔄 Đã reset dữ liệu hệ thống VNPT", "#1a73e8");
                }

                Storage.remove(SK_CALC_MAP);
                Storage.remove(SK_TAX);

                if (isDefault) {
                    // Dọn sạch và nạp lại toàn bộ (bao gồm cả Calc Mapping và Default Fields)
                    AppState.bannerArea.innerHTML = '';
                    AppState.fieldsContainer.innerHTML = '';
                    setTimeout(() => {
                        updateUIForDefaultMode(true);
                    }, 50);
                } else {
                    loadSavedData();
                }

                // Cập nhật lại thanh Banner Mapping nếu đang ở mode mặc định
                // (Vì renderCalcMappingInBanner đã được gọi bên trong updateUIForDefaultMode)
            }
        };
    }

    const btnRestore = document.getElementById('vnpt-btn-restore-last');
    const backupHistory = document.getElementById('vnpt-backup-history');

    if (btnRestore && backupHistory) {
        btnRestore.title = "Click để xem lịch sử sao lưu (Tối đa 20 bản)";

        btnRestore.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isShow = backupHistory.classList.toggle('show');
            if (isShow) {
                renderBackupHistory(backupHistory);
            }
        };

        btnRestore.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const backups = getInternalBackups();
            if (backups.length > 0) {
                const latest = backups[0];
                if (confirm(`Khôi phục nhanh bản gần nhất?\n"${latest.name}"`)) {
                    if (restoreInternalBackup(latest.id)) {
                        if (AppState.isDefaultMode) AppState.isDefaultMode = false;
                        else loadSavedData();
                        backupHistory.classList.remove('show');
                    }
                }
            } else {
                showToast("⚠️ Chưa có bản sao lưu nào", "#ffc107");
            }
        };

        document.addEventListener('click', (e) => {
            if (backupHistory.classList.contains('show') && !backupHistory.contains(e.target) && !btnRestore.contains(e.target)) {
                backupHistory.classList.remove('show');
            }
        });
    }

    document.getElementById('vnpt-btn-default').onclick = () => { AppState.isDefaultMode = !AppState.isDefaultMode; };

    AppState.on('isDefaultMode', (newVal) => updateUIForDefaultMode(newVal));

    document.getElementById('vnpt-btn-batch-del').onclick = (e) => {
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        const isDeleteMode = e.shiftKey;
        let checkedCount = 0;

        rows.forEach(row => {
            if (row.querySelector('.row-chk')?.checked) {
                if (isDeleteMode) {
                    row.remove();
                } else {
                    const fVal = row.querySelector('.f-val');
                    if (fVal) fVal.value = "";
                }
                checkedCount++;
            }
        });

        if (checkedCount === 0) {
            const fields = Storage.get(AppState.isDefaultMode ? LOCAL_KEY_DEFAULT_FIELDS : LOCAL_KEY_FIELDS) || {};
            const orgName = fields['tenToChuc']?.value || "Dữ liệu hiện tại";
            const displayName = orgName.length > 25 ? orgName.substring(0, 25) + "..." : orgName;
            if (isDeleteMode) {
                if (confirm(`Xóa TOÀN BỘ hàng dữ liệu của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu một bản vào History).`)) {
                    createInternalBackup(getBackupName());
                    rows.forEach(r => r.remove());
                    showToast(`🗑️ Đã xóa nội dung: ${displayName}`, "#ff5252");
                    saveFieldsToLocal();
                }
            } else {
                if (confirm(`Dọn dẹp TOÀN BỘ giá trị bảng của:\n"${orgName}"?\n\n(Hệ thống sẽ tự động lưu vào History).`)) {
                    createInternalBackup(getBackupName());
                    rows.forEach(row => {
                        const fVal = row.querySelector('.f-val');
                        if (fVal) fVal.value = "";
                    });
                    showToast(`🧹 Đã dọn dẹp: ${displayName}`, "#1a73e8");
                    saveFieldsToLocal();
                }
            }
        } else {
            const actionText = isDeleteMode ? "Xóa" : "Dọn giá trị";
            const icon = isDeleteMode ? "🗑️" : "🧹";
            showToast(`${icon} Đã ${actionText} ${checkedCount} trường`, isDeleteMode ? "#ff5252" : "#1a73e8");
            saveFieldsToLocal();
        }
    };

    document.getElementById('vnpt-btn-add').onclick = () => {
        const uniqueNumber = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row').length + 1;
        addOrUpdateFieldRow('bien_moi_' + uniqueNumber, '', '', '');
        saveFieldsToLocal();
    };

    const btnFillBack = document.getElementById('vnpt-btn-fill-back');
    if (btnFillBack) {
        btnFillBack.onclick = async () => {
            if (btnFillBack.classList.contains('loading')) return;
            
            btnFillBack.classList.add('loading');
            btnFillBack.disabled = true;
            try {
                await syncAllFields();
            } finally {
                btnFillBack.classList.remove('loading');
                btnFillBack.disabled = false;
            }
        };
    }
}

```

---

### File: src\features\fields\validation.js

```javascript
import { VALIDATION_REGEX, REQUIRED_KEYS } from '../../core/constants.js';

/**
 * Kiểm tra định dạng dữ liệu (MST, SĐT, Email)
 */
export function validateField(key, value, inputEl) {
    let isValid = true;
    let regex = null;

    if (key === 'soDkdn') regex = VALIDATION_REGEX.MST;
    else if (key === 'sdt') regex = VALIDATION_REGEX.PHONE;
    else if (key === 'emailDaiDien') regex = VALIDATION_REGEX.EMAIL;
    else if (key === 'cmnd' || key === 'cccd') regex = VALIDATION_REGEX.ID_CARD;

    if (regex && value.trim() !== "") {
        isValid = regex.test(value.trim());
    }

    if (!isValid) {
        inputEl.classList.add('field-error');
        inputEl.classList.add('vnpt-shake');
        setTimeout(() => inputEl.classList.remove('vnpt-shake'), 400);
    } else {
        inputEl.classList.remove('field-error');
    }
    return isValid;
}

/**
 * Làm mới trạng thái validation cho một hàng (Bắt buộc & Định dạng)
 * @param {HTMLElement} row - Hàng cần kiểm tra
 */
export function refreshRowValidation(row) {
    const fKey = row.querySelector('.f-key');
    const fVal = row.querySelector('.f-val');
    if (!fKey || !fVal) return;

    const primaryKey = fKey.value.split(',')[0].trim();
    const value = fVal.value.trim();

    // 1. Kiểm tra Bắt buộc (Required)
    if (REQUIRED_KEYS.includes(primaryKey)) {
        if (!value) {
            fVal.classList.add('field-required-empty');
        } else {
            fVal.classList.remove('field-required-empty');
        }
    } else {
        fVal.classList.remove('field-required-empty');
    }

    // 2. Kiểm tra Định dạng (MST, SĐT, Email...)
    validateField(primaryKey, fVal.value, fVal);
}

```

---

### File: src\features\fieldsManager.js

```javascript
/**
 * @file fieldsManager.js
 * @desc Quản lý bảng fields (danh sách key-value-label-sync).
 *       Refactored: Chuyển đổi sang cấu trúc module trong thư mục src/features/fields/
 */

export { startFieldLinker } from './fields/linker.js';
export { validateField, refreshRowValidation } from './fields/validation.js';
export { addOrUpdateFieldRow, updateSyncDirIcon } from './fields/row.js';
export { saveFieldsToLocal, loadSavedData, getBackupName, getExportFileName, restorePosition } from './fields/store.js';
export { syncAllFields } from './fields/sync.js';
export { updateUIForDefaultMode, renderCalcMappingInBanner } from './fields/mode.js';
export { initFieldsManager, initColSplitter } from './fields/ui.js';
export { initReverseSync, cleanupReverseSync } from './fields/reverseSync.js';

```

---

### File: src\features\hotkeys.js

```javascript
/**
 * @file hotkeys.js
 * @desc Quản lý phím tắt động cho toàn bộ ứng dụng.
 *       Hỗ trợ cấu hình phím tắt, lưu trữ và ghi nhận phím mới từ UI.
 */
import { Storage } from '../utils/storage.js';
import { SK_HOTKEYS } from '../core/constants.js';
import { DEFAULT_HOTKEYS } from '../core/defaults.js';
import { showToast } from '../ui/toast.js';

let isRecording = false;
let currentRecordingAction = null;
let recordingCallback = null;
let keydownHandler = null;

/**
 * Khởi tạo hệ thống phím tắt
 */
export function initHotkeys() {
    if (keydownHandler) return; // Prevent duplicate listeners (hot reload)

    keydownHandler = (e) => {
        // Nếu đang ở chế độ ghi phím tắt
        if (isRecording && recordingCallback) {
            handleRecording(e);
            return;
        }

        // Lấy cấu hình cũ và gộp với mặc định để không mất phím mới
        const savedHotkeys = Storage.get(SK_HOTKEYS) || {};
        const hotkeys = { ...DEFAULT_HOTKEYS, ...savedHotkeys };
        
        // Duyệt qua các action để tìm phím khớp
        for (const [action, config] of Object.entries(hotkeys)) {
            if (isMatch(e, config)) {
                e.preventDefault();
                executeAction(action);
                return;
            }
        }
    };

    window.addEventListener('keydown', keydownHandler);
}

export function cleanupHotkeys() {
    if (!keydownHandler) return;
    window.removeEventListener('keydown', keydownHandler);
    keydownHandler = null;
}

/**
 * Kiểm tra xem sự kiện phím có khớp với cấu hình không
 */
function isMatch(e, config) {
    if (!config || !config.key) return false;
    
    // So sánh phím (không phân biệt hoa thường)
    const keyMatch = e.key.toLowerCase() === config.key.toLowerCase();
    
    // So sánh các phím bổ trợ
    const altMatch = !!e.altKey === !!config.altKey;
    const ctrlMatch = !!e.ctrlKey === !!config.ctrlKey;
    const shiftMatch = !!e.shiftKey === !!config.shiftKey;
    
    return keyMatch && altMatch && ctrlMatch && shiftMatch;
}

/**
 * Thực thi hành động tương ứng
 */
function executeAction(action) {
    switch (action) {
        case 'SCAN':
            document.getElementById('vnpt-btn-scan')?.click();
            break;
        case 'FILL':
            document.getElementById('vnpt-btn-fill-back')?.click();
            break;
        case 'SCAN_PDF':
            document.getElementById('vnpt-btn-scan-pdf')?.click();
            break;
        case 'EXPORT_DOCX':
            document.getElementById('vnpt-btn-export')?.click();
            break;
        case 'COPY_TXT':
            document.getElementById('vnpt-btn-export-txt')?.click();
            break;
        case 'TOGGLE':
            document.getElementById('vnpt-toggle-btn')?.click();
            break;
        case 'CLEAN':
            document.getElementById('vnpt-btn-clean-data')?.click();
            break;
        case 'SIZE_S':
            setPanelSize('380px', '420px', 'S', 0.9);
            break;
        case 'SIZE_M':
            setPanelSize('460px', '600px', 'M', 1);
            break;
        case 'SIZE_L':
            setPanelSize('620px', '800px', 'L', 1.15);
            break;
    }
}

import { LOCAL_KEY_SIZE } from '../core/constants.js';

function setPanelSize(width, height, label, zoom = 1) {
    const panel = document.getElementById('vnpt-export-panel');
    if (panel) {
        panel.style.width = width;
        panel.style.height = height;
        panel.style.zoom = zoom;
        
        Storage.set(LOCAL_KEY_SIZE, {
            width: parseInt(width),
            height: parseInt(height),
            zoom: zoom
        });

        showToast(`Cỡ UI đã đổi thành: ${label} (Zoom: ${zoom*100}%)`);
    }
}

/**
 * Bắt đầu chế độ ghi phím tắt
 */
export function startRecording(action, callback) {
    isRecording = true;
    currentRecordingAction = action;
    recordingCallback = callback;
    showToast('Vui lòng nhấn tổ hợp phím mong muốn...', 'info');
}

/**
 * Xử lý khi đang ghi phím
 */
function handleRecording(e) {
    // Không ghi nhận nếu chỉ nhấn phím bổ trợ đơn thuần
    if (['Alt', 'Control', 'Shift', 'Meta'].includes(e.key)) return;

    e.preventDefault();
    e.stopPropagation();

    const newConfig = {
        key: e.key.toLowerCase(),
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey
    };

    // Lưu vào storage
    const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
    hotkeys[currentRecordingAction] = { 
        ...hotkeys[currentRecordingAction], 
        ...newConfig 
    };
    Storage.set(SK_HOTKEYS, hotkeys);

    // Dừng ghi
    const actionLabel = hotkeys[currentRecordingAction]?.label || currentRecordingAction;
    showToast(`Đã lưu phím tắt cho ${actionLabel}: ${getHotkeyString(newConfig)}`, 'success');
    
    if (recordingCallback) recordingCallback(newConfig);
    
    isRecording = false;
    currentRecordingAction = null;
    recordingCallback = null;
}

/**
 * Trả về chuỗi hiển thị phím tắt (vd: "Alt+S")
 */
export function getHotkeyString(config) {
    if (!config || !config.key) return 'Chưa gán';
    const parts = [];
    if (config.ctrlKey) parts.push('Ctrl');
    if (config.altKey) parts.push('Alt');
    if (config.shiftKey) parts.push('Shift');
    
    // Chuẩn hóa tên phím
    let keyName = config.key.toUpperCase();
    if (keyName === ' ') keyName = 'Space';
    
    parts.push(keyName);
    return parts.join(' + ');
}

/**
 * Xóa phím tắt
 */
export function clearHotkey(action) {
    const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
    if (hotkeys[action]) {
        hotkeys[action].key = '';
        Storage.set(SK_HOTKEYS, hotkeys);
        return true;
    }
    return false;
}

```

---

### File: src\features\mailScan\mailScanner.js

```javascript
/**
 * @file mailScanner.js
 * @desc Trích xuất nội dung email từ Gmail và Outlook.
 *       Có 2 chế độ:
 *       1. getMailData()      — Scrape DOM trực tiếp (dùng khi đang ở tab mail)
 *       2. injectMailBridge() — Inject nút "Gửi sang VNPT" lên Gmail/Outlook,
 *          khi click sẽ lưu dữ liệu qua GM_setValue để tab VNPT đọc được.
 */

import { BridgeStore } from '../../utils/bridgeStore.js';

const GM_MAIL_KEY = 'vnpt_pending_mail_data';

// ─── Storage Key Constant ──────────────────────────────────────────────────
export const MAIL_BRIDGE_KEY = GM_MAIL_KEY;

// ──────────────────────────────────────────────────────────────────────────
// 1. SCRAPE DOM — ĐƯỢC GỌI TRỰC TIẾP TRÊN TAB MAIL
// ──────────────────────────────────────────────────────────────────────────

/**
 * Cào nội dung email từ DOM của tab Gmail/Outlook hiện tại.
 * @returns {{ subject: string, body: string, sender: string, attachmentUrls: Array }}
 */
export function getMailData() {
    const host = window.location.hostname;
    let data = { subject: '', body: '', sender: '', attachmentUrls: [] };

    try {
        if (host.includes('mail.google.com')) {
            // Gmail Selectors
            const bodyEl    = document.querySelector('.a3s.aiL');
            const subjectEl = document.querySelector('h2.hP');
            const senderEl  = document.querySelector('.gD');

            data.body    = bodyEl    ? bodyEl.innerText    : '';
            data.subject = subjectEl ? subjectEl.innerText : '';
            data.sender  = senderEl  ? (senderEl.getAttribute('email') || senderEl.innerText) : '';

            // Tìm tệp đính kèm của Gmail
            document.querySelectorAll('.a98, .a7K').forEach(el => {
                const link = el.closest('a') || el.querySelector('a');
                if (link && link.href && !link.href.includes('support.google.com')) {
                    data.attachmentUrls.push({
                        url: link.href,
                        name: el.innerText.split('\n')[0].trim() || 'Tệp đính kèm'
                    });
                }
            });

        } else if (
            host.includes('outlook.live.com') ||
            host.includes('outlook.office.com') ||
            host.includes('outlook.office365.com')
        ) {
            // Outlook Selectors
            const bodyEl    = document.querySelector('[role="main"]');
            const subjectEl = document.querySelector('[data-automation-id="subject"]');
            const senderEl  = document.querySelector('[data-automation-id="from"]');

            data.body    = bodyEl    ? bodyEl.innerText    : '';
            data.subject = subjectEl ? subjectEl.innerText : '';
            data.sender  = senderEl  ? senderEl.innerText  : '';

            // Tìm tệp đính kèm của Outlook
            document.querySelectorAll('[data-automation-id="AttachmentCard"]').forEach(card => {
                const link   = card.querySelector('a');
                const nameEl = card.querySelector('[data-automation-id="attachmentName"]');
                if (link && link.href) {
                    data.attachmentUrls.push({
                        url: link.href,
                        name: nameEl ? nameEl.innerText : 'Tệp đính kèm'
                    });
                }
            });
        }
    } catch (err) {
        console.error('[VNPT] Lỗi khi bóc tách Mail:', err);
    }

    return data;
}

// ──────────────────────────────────────────────────────────────────────────
// 2. BRIDGE MODE — INJECT NÚT "GỬI SANG VNPT" VÀO GMAIL/OUTLOOK
// ──────────────────────────────────────────────────────────────────────────

const BRIDGE_BTN_ID = 'vnpt-send-to-vnpt-btn';

/**
 * Inject một nút nổi nhỏ vào Gmail hoặc Outlook.
 * Có cơ chế retry vì Gmail là SPA và DOM thay đổi liên tục.
 */
export function injectMailBridge() {
    // Đợi body sẵn sàng (Gmail SPA có thể delay render)
    _waitForBody().then(() => {
        _doInject();
        // Theo dõi và re-inject nếu Gmail router xóa mất button
        _keepAlive();
    });
}

/** Đợi document.body tồn tại (tối đa 10 giây) */
function _waitForBody() {
    return new Promise((resolve) => {
        if (document.body) { resolve(); return; }
        const obs = new MutationObserver(() => {
            if (document.body) { obs.disconnect(); resolve(); }
        });
        obs.observe(document.documentElement, { childList: true });
        setTimeout(resolve, 10000); // Fallback
    });
}

/** Re-inject button mỗi 3 giây nếu bị SPA navigation xóa */
function _keepAlive() {
    setInterval(() => {
        if (!document.getElementById(BRIDGE_BTN_ID)) {
            _doInject();
        }
    }, 3000);
}

/** Logic inject button thực sự */
function _doInject() {
    if (document.getElementById(BRIDGE_BTN_ID)) return;
    if (!document.body) return;

    const btn = document.createElement('button');
    btn.id = BRIDGE_BTN_ID;
    btn.innerHTML = '📋 Gửi sang VNPT';
    btn.title = 'Trích xuất nội dung mail này và gửi sang tab VNPT Tool';

    Object.assign(btn.style, {
        position:     'fixed',
        bottom:       '24px',
        right:        '24px',
        zIndex:       '99999',
        padding:      '10px 18px',
        background:   'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color:        '#fff',
        border:       'none',
        borderRadius: '24px',
        fontSize:     '13px',
        fontWeight:   '600',
        cursor:       'pointer',
        boxShadow:    '0 4px 20px rgba(79,70,229,0.5)',
        transition:   'all 0.2s ease',
        fontFamily:   'sans-serif',
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 8px 28px rgba(79,70,229,0.65)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.boxShadow = '0 4px 20px rgba(79,70,229,0.5)';
    });

    btn.addEventListener('click', () => {
        const data = getMailData();

        if (!data.body && !data.subject) {
            _showBridgeToast('⚠️ Không tìm thấy nội dung mail. Hãy mở một email cụ thể!', '#f59e0b');
            return;
        }

        try {
            BridgeStore.set(GM_MAIL_KEY, JSON.stringify({
                ...data,
                _timestamp: Date.now(),
                _source: window.location.hostname
            }));

            _showBridgeToast('✅ Đã gửi! Chuyển sang tab VNPT và nhấn "📧 Quét Mail".', '#10b981');

            const orig = btn.innerHTML;
            btn.innerHTML = '✅ Đã gửi!';
            btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            setTimeout(() => {
                btn.innerHTML = orig;
                btn.style.background = 'linear-gradient(135deg, #4f46e5, #7c3aed)';
            }, 2500);
        } catch (err) {
            console.error('[VNPT] Lỗi BridgeStore.set:', err);
            _showBridgeToast('❌ Lỗi ghi dữ liệu. Kiểm tra lại quyền lưu trữ.', '#ef4444');
        }
    });

    document.body.appendChild(btn);
    console.log('[VNPT] Mail Bridge đã inject lên', window.location.hostname);
}



/** Toast nhỏ gọn cho Bridge (không dùng được toast của widget vì widget không có ở đây) */
function _showBridgeToast(msg, color = '#4f46e5') {
    const el = document.createElement('div');
    Object.assign(el.style, {
        position:     'fixed',
        bottom:       '80px',
        right:        '24px',
        zIndex:       '99999',
        padding:      '10px 16px',
        background:   color,
        color:        '#fff',
        borderRadius: '10px',
        fontSize:     '13px',
        fontFamily:   'sans-serif',
        fontWeight:   '500',
        boxShadow:    '0 4px 16px rgba(0,0,0,0.25)',
        maxWidth:     '320px',
        lineHeight:   '1.5',
        transition:   'opacity 0.3s',
    });
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; }, 2200);
    setTimeout(() => { el.remove(); }, 2600);
}

```

---

### File: src\features\mockDataGenerator.js

```javascript
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { parseAddressComponents } from '../utils/stringHelper.js';

function randomDigit(length) {
    let s = '';
    for(let i=0; i<length; i++) s += Math.floor(Math.random() * 10);
    return s;
}

export function generateVNPTMockData() {
    const listNames = [
        'CÔNG TY TNHH CÔNG NGHỆ BÁO ĐỐM', 
        'CÔNG TY CP THƯƠNG MẠI VNPT XANH', 
        'DOANH NGHIỆP TƯ NHÂN HOÀNG HẢI',
        'CTY TNHH MTV DỊCH VỤ VÀ PHẦN MỀM SAO BIỂN',
        'CÔNG TY CỔ PHẦN TẬP ĐOÀN ĐẠI DƯƠNG'
    ];
    const listPeople = ['Nguyễn Văn Khôi', 'Trần Thị Thuỷ', 'Lê Hoàng Long', 'Phạm Quỳnh Anh', 'Đỗ Thành Đạt'];
    const listAddresses = [
        '12A Ngõ 45 Đường Láng, Phường Ngã Tư Sở, Quận Đống Đa, Thành phố Hà Nội', 
        '14/B Đường Lê Lợi, Phường Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
        'Số 5 Phố Tôn Đức Thắng, Phường Văn Miếu, Quận Đống Đa, Thành phố Hà Nội',
        '256 Nguyễn Công Trứ, Phường Nguyễn Thái Bình, Quận 1, Thành phố Hồ Chí Minh',
        'Tòa nhà H9, Khu đô thị Cầu Đất, Phường Vĩnh Tuy, Quận Hai Bà Trưng, Thành phố Hà Nội'
    ];
    const listOffices = [
        'Sở Kế hoạch và Đầu tư TP Hà Nội',
        'Sở Kế hoạch và Đầu tư TP Hồ Chí Minh',
        'Cục cảnh sát QLHC về TTXH',
        'CA Thành phố Hà Nội'
    ];
    
    // Auto-generate fields
    const mst = `010${randomDigit(7)}`; // 10 chữ số
    const cmnd = `0${Math.floor(Math.random() * 9)}${randomDigit(10)}`; // 12 chữ số CCCD
    const name = listNames[Math.floor(Math.random() * listNames.length)];
    const repName = listPeople[Math.floor(Math.random() * listPeople.length)];
    const address = listAddresses[Math.floor(Math.random() * listAddresses.length)];
    const phone = `09${Math.floor(Math.random() * 8 + 1)}${randomDigit(7)}`;
    const email = `contact_${randomDigit(4)}@testvnpt.com.vn`;
    
    const dob = `0${Math.floor(Math.random() * 9 + 1)}/0${Math.floor(Math.random() * 9 + 1)}/19${Math.floor(Math.random() * 20 + 70)}`;
    
    // Ngày cấp CCCD (Thường là gần đây 2021-2024)
    const issueDate = `${Math.floor(Math.random() * 20 + 10)}/05/202${Math.floor(Math.random() * 4 + 1)}`;
    
    // Ngày cấp ĐKKD (Random nhưng không phải năm nay - Lấy từ 2010 đến 2023)
    const randomPastYear = Math.floor(Math.random() * 14) + 2010; 
    const businessIssueDate = `${Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${randomPastYear}`;

    addOrUpdateFieldRow('tenToChuc', name);
    addOrUpdateFieldRow('soDkdn', mst);
    addOrUpdateFieldRow('diaChi', address);
    
    addOrUpdateFieldRow('nguoiDaiDien', repName);
    addOrUpdateFieldRow('tenCustomer', repName); // KH cá nhân
    
    addOrUpdateFieldRow('chucVu', 'Giám đốc');
    addOrUpdateFieldRow('sdt', phone);
    addOrUpdateFieldRow('sdtCustomer', phone);
    
    addOrUpdateFieldRow('email', email);
    addOrUpdateFieldRow('emailDaiDien', email);
    addOrUpdateFieldRow('emailCustomer', email);
    
    addOrUpdateFieldRow('cmnd', cmnd);
    addOrUpdateFieldRow('cccd', cmnd);
    addOrUpdateFieldRow('cmndCustomer', cmnd);
    addOrUpdateFieldRow('cccdCustomer', cmnd);
    
    addOrUpdateFieldRow('ngaySinhCustomer', dob);
    addOrUpdateFieldRow('ngayCapCustomer', issueDate);
    addOrUpdateFieldRow('ngayCapSoDkdnCustomer', businessIssueDate);
    addOrUpdateFieldRow('ngayCap', issueDate);
    
    addOrUpdateFieldRow('noiCapCustomer', listOffices[2]);
    addOrUpdateFieldRow('noiCap', listOffices[0]);
    addOrUpdateFieldRow('noiCapSoDkdnCustomer', listOffices[0]);

    // Parse thử địa chỉ thông minh
    const parsedAddr = parseAddressComponents(address);
    if(parsedAddr.province) addOrUpdateFieldRow('tinhIdNew', parsedAddr.province);
    if(parsedAddr.district || parsedAddr.ward) addOrUpdateFieldRow('xaIdNew', parsedAddr.ward || parsedAddr.district);
    if(parsedAddr.street) addOrUpdateFieldRow('duong', parsedAddr.street);
    
    saveFieldsToLocal();
}

```

---

### File: src\features\pdfScan\geminiOcr.js

```javascript
/**
 * @file geminiOcr.js
 * @desc Gọi API Google Gemini trực tiếp từ client.
 *       Bao gồm lấy cấu trúc dữ liệu mong muốn với Prompt Engineering JSON Mode
 */
import { REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';

/**
 * Lời nhắc hệ thống yêu cầu AI trả về dữ liệu đúng chuẩn
 */
const getSystemPrompt = () => {
    // Xây dựng danh sách tên trường gợi ý
    let fieldsHint = '';
    for (const [key, label] of Object.entries(DEFAULT_LABELS)) {
        // Chỉ mượn keys chính
        const pKey = key.split(',')[0].trim();
        if (REQUIRED_KEYS.includes(pKey)) {
            fieldsHint += `    "${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là chuyên gia trích xuất dữ liệu từ Hợp đồng/Phụ lục VNPT.
Nhiệm vụ: Đọc kỹ tài liệu và trích xuất thông tin của BÊN A (KHÁCH HÀNG). 
TUYỆT ĐỐI KHÔNG lấy thông tin của Bên B (VNPT).

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
  "fields": {
${fieldsHint}    "ngayKy": "dd/MM/yyyy"
  },
  "rawFullText": "Toàn bộ nội dung văn bản đã được OCR"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc số GPKD.
2. "noiCapSoDkdn": Luôn trả về định dạng "SKDT {Tỉnh}" (VD: "SKDT TP.HCM"). Nếu là cá nhân có CCCD, lấy nơi cấp theo CCCD.
3. Định dạng ngày: Luôn là dd/MM/yyyy. Nếu chỉ có tháng/năm, hãy để trống ngày.
4. Ưu tiên lấy thông tin ở các trang có chữ ký/dấu mộc nếu có mâu thuẫn.
5. Nếu không tìm thấy trường thông tin, trả về "".
6. "tenToChuc": Nếu là cá nhân, điền Họ và tên của người đó. Nếu là hộ kinh doanh, lấy tên hộ kinh doanh.
7. "diaChi": Ưu tiên lấy địa chỉ thường trú hoặc địa chỉ trụ sở chính. 
8. "goiDV": Trích xuất gói cước dịch vụ (VD: Fiber150, HomeNet2, ...).
9. "soHopDong": Tìm số hợp đồng thường nằm ở góc trên bên phải hoặc tiêu đề.

VÍ DỤ TRÍCH XUẤT:
Văn bản: "...Bên A: Công ty TNHH Giải Pháp AI. MST: 0312345678. Đại diện: Ông Trần Văn B. CMND: 123456789 cấp ngày 01/01/2010 tại CA TP.HCM..."
Kết quả: {
  "fields": {
    "tenToChuc": "Công ty TNHH Giải Pháp AI",
    "soDkdn": "0312345678",
    "tenDaiDienn": "Trần Văn B",
    "cmnd": "123456789",
    "ngayCapCustomer": "01/01/2010"
  },
  "rawFullText": "..."
}`;
};
import { callGemini } from '../../api/gemini.js';

/**
 * @param {string} base64Data Chuỗi base64 của file
 * @param {string} apiKey Khóa API Google Gemini
 * @param {string} modelName Tên mô hình (ví dụ: gemini-2.0-flash)
 * @param {string} mimeType Định dạng file (application/pdf, image/png, etc.)
 * @returns {Promise<Object>} JSON đã parse
 */
export function extractWithGemini(base64Data, apiKey, modelName = 'gemini-2.0-flash', mimeType = 'application/pdf', multipleFiles = null) {
    const options = {
        apiKey,
        model: modelName,
        systemInstruction: getSystemPrompt(),
        userText: "Đọc tài liệu hợp đồng này và trích xuất thành JSON. Nếu có nhiều trang, hãy kết nối thông tin với nhau để lấy ra thông tin đầy đủ nhất."
    };

    if (multipleFiles && Array.isArray(multipleFiles)) {
        options.filesData = multipleFiles;
    } else if (base64Data) {
        options.fileData = { mimeType, base64: base64Data };
    }

    return callGemini(options);
}

/**
 * Helper biến File thành thẻ Base64
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        const mimeType = file.type || 'application/octet-stream';

        reader.onload = () => {
            const b64 = reader.result.split(',')[1];
            resolve({
                base64: b64,
                mimeType
            });
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

```

---

### File: src\features\pdfScan\index.js

```javascript
/**
 * @file index.js
 * @desc Entry point điều phối phân tích AI và Queue UI.
 *       Móc nối File -> API -> UI Confirm -> Thêm vào bảng.
 */
import { AppState } from '../../core/state.js';
import { Storage } from '../../utils/storage.js';
import { SK_GEMINI_KEY, SK_GEMINI_MODEL, SK_RAW_SCAN, REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';
import { fileToBase64, extractWithGemini } from './geminiOcr.js';
import { showPdfConfirmDialog, showPdfLoading, hidePdfLoading } from './pdfScanUI.js';
import { addOrUpdateFieldRow, saveFieldsToLocal, syncAllFields } from '../fieldsManager.js';
import { showToast } from '../../ui/toast.js';
import { createInternalBackup, generateBackupName } from '../../utils/backupHelper.js';
import { extractFieldsFromText, extractFieldsLocally } from '../rawScan/rawScan.js';
import { MAIL_BRIDGE_KEY } from '../mailScan/mailScanner.js';
import { BridgeStore } from '../../utils/bridgeStore.js';
import { scrapeScreenText } from '../screenScan/screenScanner.js';
import { downloadAsBase64 } from '../../utils/fileHelper.js';
import { extractQRCodeFromImage, parseCCCD_QR } from '../../utils/qrHelper.js';
import { parseAddressComponents } from '../../utils/stringHelper.js';

let fileQueue = [];

function renderQueue(queueList, placeholder) {
    queueList.innerHTML = '';
    if (fileQueue.length === 0) {
        placeholder.style.display = 'flex';
        return;
    }
    placeholder.style.display = 'none';
    
    fileQueue.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'ai-queue-item';
        
        if (item.mimeType && item.mimeType.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = `data:${item.mimeType};base64,${item.base64}`;
            el.appendChild(img);
        } else {
            const span = document.createElement('span');
            span.className = 'file-icon';
            span.textContent = '📄';
            el.appendChild(span);
        }

        const rmBtn = document.createElement('button');
        rmBtn.className = 'btn-remove-item';
        rmBtn.innerHTML = '✖';
        rmBtn.onclick = (e) => {
            e.stopPropagation();
            fileQueue.splice(index, 1);
            renderQueue(queueList, placeholder);
        };
        el.appendChild(rmBtn);
        queueList.appendChild(el);
    });
}

function clearQueue(queueList, placeholder, rawInput) {
    fileQueue = [];
    rawInput.value = '';
    renderQueue(queueList, placeholder);
}

function applyQRDataToFields(parsed, sourceName) {
    showToast(`🎉 Tìm thấy QR CCCD: Đang tự động điền...`, "#1e8e3e");
    
    if (parsed.cccd) {
        addOrUpdateFieldRow('cccd', parsed.cccd);
        addOrUpdateFieldRow('cmnd', parsed.cccd);
        addOrUpdateFieldRow('cccdCustomer', parsed.cccd);
        addOrUpdateFieldRow('cmndCustomer', parsed.cccd);
    }
    if (parsed.name) {
        addOrUpdateFieldRow('tenCustomer', parsed.name);
        addOrUpdateFieldRow('nguoiDaiDien', parsed.name);
    }
    if (parsed.dob) {
        addOrUpdateFieldRow('ngaySinhCustomer', parsed.dob); 
    }
    if (parsed.gender) {
        addOrUpdateFieldRow('gioiTinhCustomer', parsed.gender);
    }
    if (parsed.address) {
        addOrUpdateFieldRow('diachiCustomer', parsed.address);
        addOrUpdateFieldRow('thuongTruCustomer', parsed.address);
        
        const addrParts = parseAddressComponents(parsed.address);
        if (addrParts.province) addOrUpdateFieldRow('tinhIdNew', addrParts.province);
        if (addrParts.district || addrParts.ward) addOrUpdateFieldRow('xaIdNew', addrParts.ward || addrParts.district);
        if (addrParts.street) addOrUpdateFieldRow('duong', addrParts.street);
    }
    if (parsed.issue_date) {
        addOrUpdateFieldRow('ngayCapCustomer', parsed.issue_date);
        addOrUpdateFieldRow('ngayCapSoDkdnCustomer', parsed.issue_date);
        addOrUpdateFieldRow('ngayCap', parsed.issue_date);
        addOrUpdateFieldRow('noiCapCustomer', 'Cục cảnh sát QLHC về TTXH');
        addOrUpdateFieldRow('noiCap', 'Cục cảnh sát quản lý hành chính về trật tự xã hội');
    }
    saveFieldsToLocal();
}

export function initPdfScan() {
    const btnAiMode = document.getElementById('vnpt-btn-ai-mode');
    const aiSection = document.getElementById('vnpt-ai-scanner-section');
    const btnProcessAI = document.getElementById('vnpt-btn-ai-process');
    const btnProcessLocal = document.getElementById('vnpt-btn-raw-process-local');
    const rawInput = document.getElementById('vnpt-raw-scan-input');
    const queueContainer = document.getElementById('vnpt-ai-queue-container');
    const queueList = document.getElementById('vnpt-ai-queue-list');
    const placeholder = document.getElementById('vnpt-ai-queue-placeholder');
    const btnShowPdf = document.getElementById('vnpt-btn-show-pdf');
    const btnClearQueue = document.getElementById('vnpt-btn-clear-queue');
    const inputPdf = document.getElementById('vnpt-pdf-input');

    if (!btnAiMode || !aiSection) return;

    btnAiMode.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = aiSection.style.display === 'none';
        aiSection.style.display = isHidden ? 'flex' : 'none';
        btnAiMode.classList.toggle('active', isHidden);
    });

    // --- KHÔI PHỤC RAW TEXT TỪ STORAGE ---
    const savedRaw = Storage.get(SK_RAW_SCAN);
    if (savedRaw && rawInput) {
        rawInput.value = savedRaw;
    }

    // --- LƯU RAW TEXT KHI THAY ĐỔI ---
    if (rawInput) {
        rawInput.addEventListener('input', () => {
            Storage.setDebounced(SK_RAW_SCAN, rawInput.value, 1000);
        });
    }

    if (btnShowPdf) {
        btnShowPdf.addEventListener('click', (e) => {
            e.preventDefault();
            if (AppState.lastPdfResults && AppState.lastPdfResults.length > 0) {
                showPdfConfirmDialog(AppState.lastPdfResults, AppState.lastPdfRawText || "", (selectedResults) => {
                    const keysToSync = selectedResults.map(res => res.key);
                    selectedResults.forEach(res => {
                        addOrUpdateFieldRow(res.key, res.value, res.label);
                    });
                    saveFieldsToLocal();

                    // Tự động điền dữ liệu xuống form trang web sau khi lưu
                    if (keysToSync.length > 0) {
                        setTimeout(() => syncAllFields(keysToSync), 300);
                    }

                    showToast(`✅ Đã cập nhật ${selectedResults.length} trường.`);
                }, (newText) => {
                    try {
                        const refreshedFields = extractFieldsLocally(newText);
                        handleExtractionResults(refreshedFields, newText, 'KẾT QUẢ QUÉT (CẬP NHẬT)');
                    } catch (err) {
                        showToast("❌ Lỗi: " + err.message, "#ef4444");
                    }
                });
            } else if (rawInput && rawInput.value.trim()) {
                // Nếu chưa có cache kết quả nhưng có text ở ô input -> Chạy local scan để mở Dialog
                const text = rawInput.value.trim();
                try {
                    const resultFields = extractFieldsLocally(text);
                    handleExtractionResults(resultFields, text, 'PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)');
                } catch (err) {
                    showToast("❌ Lỗi: " + err.message, "#f44336");
                }
            } else {
                showToast("Chưa có nội dung để hiển thị. Vui lòng nhập text hoặc chọn file.", "#ffc107");
            }
        });
    }

    if (btnClearQueue) {
        btnClearQueue.addEventListener('click', (e) => {
            e.preventDefault();
            clearQueue(queueList, placeholder, rawInput);
        });
    }

    queueContainer.addEventListener('click', () => {
        inputPdf.click();
    });

    // --- QUÉT MAIL (qua GM_setValue Bridge từ tab Gmail/Outlook) ---
    const btnScanMail = document.getElementById('vnpt-btn-scan-mail');
    const btnScanScreen = document.getElementById('vnpt-btn-scan-screen');

    if (btnScanMail) {
        btnScanMail.addEventListener('click', async () => {
            // Đọc dữ liệu mail từ GM storage (do tab Gmail/Outlook đã gửi qua)
            let rawMailJson;
            try {
                rawMailJson = await BridgeStore.get(MAIL_BRIDGE_KEY);
            } catch (err) {
                showToast('❌ Lỗi đọc dữ liệu mail. Kiểm tra lại quyền lưu trữ.', '#ef4444');
                return;
            }

            if (!rawMailJson) {
                showToast('⚠️ Chưa có mail nào được gửi!\n👉 Mở Gmail/Outlook → chọn email → nhấn nút "📋 Gửi sang VNPT".', '#f59e0b');
                return;
            }

            let data;
            try {
                data = typeof rawMailJson === 'string' ? JSON.parse(rawMailJson) : rawMailJson;
            } catch {
                showToast('❌ Dữ liệu mail bị lỗi định dạng.', '#ef4444');
                return;
            }

            // Kiểm tra dữ liệu còn mới (trong vòng 30 phút)
            const AGE_LIMIT_MS = 30 * 60 * 1000;
            if (data._timestamp && (Date.now() - data._timestamp) > AGE_LIMIT_MS) {
                showToast('⚠️ Dữ liệu mail đã quá cũ (>30 phút). Hãy gửi lại từ tab Gmail/Outlook.', '#f59e0b');
                return;
            }

            // 1. Đổ text vào ô Raw Scan
            const newContent = `TIÊU ĐỀ: ${data.subject || ''}\nNGƯỜI GỬI: ${data.sender || ''}\n\nNỘI DUNG EMAIL:\n${data.body || ''}`;
            if (rawInput.value.trim()) {
                rawInput.value += `\n\n--- MAIL MỚI ---\n${newContent}`;
            } else {
                rawInput.value = newContent;
            }
            Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu ngay lập tức khi nhận từ Mail
            showToast(`📧 Đã nhận mail từ ${data._source || 'tab mail'}.`);

            // 2. Tải tệp đính kèm (nếu có)
            if (data.attachmentUrls && data.attachmentUrls.length > 0) {
                showToast(`📂 Đang tải ${data.attachmentUrls.length} tệp đính kèm...`, '#1a73e8');
                for (const att of data.attachmentUrls) {
                    try {
                        const b64Data = await downloadAsBase64(att.url, att.name);
                        fileQueue.push({ file: { name: att.name }, ...b64Data });
                    } catch (err) {
                        console.error('[VNPT] Lỗi tải tệp:', att.name, err);
                    }
                }
                renderQueue(queueList, placeholder);
                showToast('✅ Đã nạp xong tệp đính kèm!');
            }

            // 3. Tự động kích hoạt AI
            btnProcessAI.click();
        });
    }

    if (btnScanScreen) {
        btnScanScreen.addEventListener('click', () => {
            const content = scrapeScreenText();
            if (content) {
                if (rawInput.value.trim()) {
                    rawInput.value += `\n\n--- NỘI DUNG MÀN HÌNH MỚI ---\n${content}`;
                } else {
                    rawInput.value = content;
                }
                Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu ngay lập tức khi quét màn hình
                showToast("🖥️ Đã quét toàn bộ màn hình.");
                // Tự động kích hoạt hiệu ứng quét
                btnProcessAI.click();
            } else {
                showToast("⚠️ Không thể quét nội dung màn hình", "#ffc107");
            }
        });
    }

    queueContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        queueContainer.classList.add('drag-over');
    });
    queueContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        queueContainer.classList.remove('drag-over');
    });
    queueContainer.addEventListener('drop', async (e) => {
        e.preventDefault();
        queueContainer.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            for(let file of e.dataTransfer.files) {
                const qrText = await extractQRCodeFromImage(file);
                if (qrText) {
                    const parsed = parseCCCD_QR(qrText);
                    if (parsed) {
                        applyQRDataToFields(parsed, file.name);
                        continue;
                    }
                }
                const b64 = await fileToBase64(file);
                fileQueue.push({ file, ...b64 });
            }
            renderQueue(queueList, placeholder);
        }
    });

    inputPdf.addEventListener('change', async (e) => {
        if (!e.target.files) return;
        for(let file of e.target.files) {
            const qrText = await extractQRCodeFromImage(file);
            if (qrText) {
                const parsed = parseCCCD_QR(qrText);
                if (parsed) {
                    applyQRDataToFields(parsed, file.name);
                    continue;
                }
            }
            const b64 = await fileToBase64(file);
            fileQueue.push({ file, ...b64 });
        }
        e.target.value = '';
        renderQueue(queueList, placeholder);
    });

    window.addEventListener('paste', async (e) => {
        if (aiSection.style.display === 'none') return;

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let hasFile = false;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1 || item.type.indexOf('pdf') !== -1) {
                hasFile = true;
                const file = item.getAsFile();
                if (file) {
                    const qrText = await extractQRCodeFromImage(file);
                    if (qrText) {
                        const parsed = parseCCCD_QR(qrText);
                        if (parsed) {
                            applyQRDataToFields(parsed, "Clipboard Image");
                            continue;
                        }
                    }
                    const b64 = await fileToBase64(file);
                    fileQueue.push({ file, ...b64 });
                    renderQueue(queueList, placeholder);
                    showToast("📋 Đã thêm vào hàng đợi ảnh/file.");
                }
            }
        }

        const target = e.target;
        // Nếu người dùng paste ảnh/file vào Textarea (như ô nhập text) -> chặn sự kiện kép (vừa text vừa ảnh), 
        // để code phía trên đảm nhận thêm vào Queue. Ngược lại nếu paste text tĩnh thì bỏ qua để gõ bình thường.
        if (hasFile && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            e.preventDefault();
        }
    });

    const handleExtractionResults = (resultFields, rawText, titleTemplate) => {
        const usedKeys = new Set();
        const resultsArray = [];

        // 1. Duyệt qua tất cả các nhãn mặc định (DEFAULT_LABELS) để đảm bảo hiển thị đầy đủ
        const EXCLUDED_LABELS = ['ngày ký', 'tháng ký', 'năm ký', 'số lượng gói', 'nơi ký', 'liên hệ a'];
        const EXCLUDED_KEYS = ['ngayKy', 'ngayKy1', 'thangKy', 'thangKy1', 'namKy', 'namKy1', 'soLuongGoi', 'noiKy'];

        Object.entries(DEFAULT_LABELS).forEach(([fullKey, label]) => {
            const aliases = fullKey.split(',').map(k => k.trim());
            
            // Bỏ qua các nhãn trong danh sách loại trừ HOẶC nếu tất cả bí danh đều trong list loại trừ
            const labelLower = (label || '').toLowerCase();
            const shouldExclude = EXCLUDED_LABELS.includes(labelLower) || 
                                aliases.every(alias => EXCLUDED_KEYS.includes(alias));

            if (shouldExclude) {
                // Vẫn đánh dấu vào usedKeys để bước 2 không hiển thị chúng như là "trường mới tìm thấy"
                aliases.forEach(alias => usedKeys.add(alias));
                return;
            }

            // Tìm giá trị từ resultFields bằng cách thử tất cả các bí danh
            let value = "";
            for (const alias of aliases) {
                if (resultFields[alias]) {
                    value = resultFields[alias];
                    usedKeys.add(alias);
                    break; 
                }
            }

            resultsArray.push({
                key: fullKey, 
                value: value,
                label: label,
                checked: !!value
            });
        });

        // 2. Bổ sung các trường mà AI tìm thấy nhưng không nằm trong DEFAULT_LABELS (nếu có)
        Object.keys(resultFields).forEach(key => {
            if (!usedKeys.has(key) && !EXCLUDED_KEYS.includes(key) && resultFields[key]) {
                resultsArray.push({
                    key: key,
                    value: resultFields[key],
                    label: key, 
                    checked: true
                });
            }
        });


        if (resultsArray.every(item => !item.value)) {
            showToast("⚠️ AI hoặc Regex không trích xuất được thông tin nào!", "#ffc107");
        }

        AppState.lastPdfResults = resultsArray;
        AppState.lastPdfRawText = rawText || "";

        showPdfConfirmDialog(resultsArray, rawText || "", (selectedResults) => {
            const keysToSync = selectedResults.map(res => res.key);
            selectedResults.forEach(res => {
                addOrUpdateFieldRow(res.key, res.value, res.label);
            });
            saveFieldsToLocal();

            // Tự động điền dữ liệu xuống form trang web sau khi lưu
            if (keysToSync.length > 0) {
                setTimeout(() => syncAllFields(keysToSync), 300);
            }

            showToast(`✅ Đã quét xong ${selectedResults.length} trường.`);
            
            AppState.lastPdfResults = AppState.lastPdfResults.map(orig => {
                const updated = selectedResults.find(s => s.key === orig.key);
                if (updated) {
                    return { ...orig, value: updated.value, checked: true };
                }
                return { ...orig, checked: false };
            });
        }, (newText) => {
            // onReparse: Sử dụng Regex Local để cập nhật lại từ text mới (nhanh chóng)
            try {
                const refreshedFields = extractFieldsLocally(newText);
                handleExtractionResults(refreshedFields, newText, titleTemplate);
                showToast("🔄 Đã cập nhật lại các trường từ text mới.");
            } catch (err) {
                showToast("❌ Lỗi Cập nhật: " + err.message, "#ef4444");
            }
        });
        
        const dlgHeader = document.querySelector('#vnpt-pdf-dialog h3');
        if (dlgHeader) dlgHeader.textContent = titleTemplate;
    };


    btnProcessLocal.addEventListener('click', () => {
        const text = rawInput.value.trim();
        if (!text) {
            showToast("⚠️ Vui lòng nhập nội dung văn bản!", "#ffc107");
            return;
        }
        try {
            createInternalBackup("Trước khi phân loại Local: " + generateBackupName());
            const resultFields = extractFieldsLocally(text);
            handleExtractionResults(resultFields, text, 'PHÂN LOẠI DỮ LIỆU THÔ (LOCAL)');
        } catch (err) {
            showToast("❌ Lỗi: " + err.message, "#f44336");
        }
    });

    btnProcessAI.addEventListener('click', async () => {
        const apiKey = Storage.get(SK_GEMINI_KEY);
        const apiModel = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.5-flash';

        if (!apiKey) {
            const wantGuide = confirm("Chưa cài đặt Gemini API Key!\n\nAI Scanner yêu cầu mã Google AI Studio.\n\nNhấn 'OK' để xem hướng dẫn nhé!");
            if (wantGuide) {
                window.open('https://github.com/tranchien2000/vnpt-tampermonkey-vite/blob/main/docs/GEMINI_API_GUIDES.md', '_blank');
            }
            return;
        }

        if (fileQueue.length === 0 && !rawInput.value.trim()) {
            showToast("⚠️ Hàng đợi trống. Vui lòng chọn file hoặc dán nội dung", "#ffc107");
            return;
        }

        rawInput.classList.add('ai-scanning-glow');
        btnProcessAI.disabled = true;
        btnProcessAI.textContent = "⏳ ĐANG QUÉT...";
        
        try {
            createInternalBackup("Trước khi AI Scan: " + generateBackupName());
            let resultFieldsObj = {};
            let rawText = "";

            if (fileQueue.length > 0) {
                // Multimodal request
                const ocrResult = await extractWithGemini(null, apiKey, apiModel, null, fileQueue);
                resultFieldsObj = ocrResult.fields || {};
                rawText = ocrResult.rawTextSnippet || ocrResult.rawFullText || "";
                
                // Hiển thị nội dung vừa quét được vào Input (user kiểm tra chéo)
                if (rawInput.value.trim()) {
                    rawInput.value += `\n\n--- KẾT QUẢ ĐỌC FILE ---\n${rawText}`;
                } else {
                    rawInput.value = rawText;
                }
                Storage.set(SK_RAW_SCAN, rawInput.value); // Lưu nội dung AI vừa đọc được
            } else {
                // Thuần text request
                const text = rawInput.value.trim();
                resultFieldsObj = await extractFieldsFromText(text, apiKey, apiModel);
                rawText = text;
            }

            handleExtractionResults(resultFieldsObj, rawText, 'PHÂN LOẠI DỮ LIỆU THÔ (AI)');

            // Xoá hàng đợi sau khi quét xong vì đã render raw text ra textbox
            if (fileQueue.length > 0) {
                fileQueue = [];
                renderQueue(queueList, placeholder);
            }

        } catch (e) {
            console.error("Lỗi AI Scan Pipeline:", e);
            alert("Lỗi xử lý quét AI:\n" + e);
        } finally {
            rawInput.classList.remove('ai-scanning-glow');
            btnProcessAI.disabled = false;
            btnProcessAI.textContent = "✨ BẮT ĐẦU QUÉT AI";
        }
    });

}

```

---

### File: src\features\pdfScan\pdfScanUI.js

```javascript
/**
 * @file pdfScanUI.js
 * @desc Hiển thị Dialog / Modal Check thông tin sau khi nhận kết quả từ AI Gemini
 */

export function showPdfLoading() {
    let loader = document.getElementById('vnpt-pdf-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'vnpt-pdf-loader';
        loader.className = 'vnpt-pdf-overlay';
        loader.innerHTML = `
            <div class="vnpt-pdf-loading-box">
                <div class="loader-spinner"></div>
                <div style="margin-top: 15px; font-weight: 800; font-size: 13px; color: #1a73e8;">Đang nhờ AI đọc Hợp đồng...</div>
                <div style="margin-top: 4px; font-size: 11px; color: #5f6368;">Tùy thuộc độ lớn file, thường mất 5 - 10s...</div>
            </div>
        `;
        document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
}

export function hidePdfLoading() {
    const loader = document.getElementById('vnpt-pdf-loader');
    if (loader) loader.style.display = 'none';
}

/**
 * Hiển thị popup xác nhận kết quả scan
 * @param {Array} results [{key, label, value}, ...]
 * @param {string} rawText Văn bản thô AI trích xuất được
 * @param {Function} onConfirm Callback array được tích chọn
 * @param {Function} onReparse Callback khi nhấn nút phân loại lại từ text thô (truyền vào text mới)
 */
export function showPdfConfirmDialog(results, rawText, onConfirm, onReparse) {
    let dialog = document.getElementById('vnpt-pdf-dialog');
    if (dialog) dialog.remove();

    dialog = document.createElement('div');
    dialog.id = 'vnpt-pdf-dialog';
    dialog.className = 'vnpt-pdf-overlay';

    // Render TR rows with Inputs for editing
    const tbodyHtml = results.map((res, i) => `
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${i}" ${res.checked ? 'checked' : ''} />
            </td>
            <td><strong title="${res.key}">${res.label}</strong></td>
            <td>
                <input type="text" class="pdf-val-input" data-index="${i}" value="${res.value}" placeholder="..." />
            </td>
        </tr>
    `).join('');

    dialog.innerHTML = `
        <div class="vnpt-pdf-dialog-box" style="width: 1000px; height: 85vh;">
            <div class="pdf-dlg-header">
                <h3>🔍 KIỂM TRA & XÁC NHẬN KẾT QUẢ AI</h3>
            </div>
            
            <div class="pdf-dlg-cols" style="gap: 16px;">
                <!-- Cột trái: Nội dung gốc (Cho phép Edit) -->
                <div class="pdf-col-left" style="display: flex; flex-direction: column; padding: 0; background: #fff;">
                    <div style="font-weight: 800; color: #1a73e8; margin-bottom: 0; border-bottom: 2px solid var(--vnpt-primary-light); padding: 12px 14px; background: rgba(26, 115, 232, 0.05); border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
                        <span>VĂN BẢN GỐC (CÓ THỂ SỬA)</span>
                        <span style="font-size: 10px; opacity: 0.7; font-weight: 600;">EDITOR</span>
                    </div>
                    <textarea id="pdf-raw-text-edit" style="flex: 1; border: none; background: #fcfdfe; padding: 15px; resize: none; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 12.5px; line-height: 1.6; color: #2c3e50; outline: none; border-bottom: 1px solid #eee;">${rawText || ""}</textarea>
                    

                </div>

                <!-- Cột phải: Các trường nhận diện được -->
                <div class="pdf-col-right">
                    <div class="pdf-dlg-body">
                        <table class="pdf-result-table">
                            <thead>
                                <tr>
                                    <th width="40"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                                    <th width="120">Trường</th>
                                    <th>Giá trị AI trích xuất (Có thể sửa)</th>
                                </tr>
                            </thead>
                            <tbody>${tbodyHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368;">
                    <strong>Mẹo:</strong> Bạn có thể sửa nội dung bên trái rồi nhấn "Cập nhật" để AI/Regex nhận diện lại nếu dữ liệu thô bị sai/thiếu.
                </div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">Hủy bỏ(Esc)</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">Lưu vào bảng(Enter)</button>
                <button class="pdf-btn-reparse" id="pdf-btn-reparse">CẬP NHẬT</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Bắt event
    const btnCancel = dialog.querySelector('#pdf-btn-cancel');
    const btnConfirm = dialog.querySelector('#pdf-btn-confirm');
    const btnReparse = dialog.querySelector('#pdf-btn-reparse');
    const checkAll = dialog.querySelector('#pdf-check-all');
    const rowChks = dialog.querySelectorAll('.pdf-row-chk');
    const valInputs = dialog.querySelectorAll('.pdf-val-input');
    const rawTextEdit = dialog.querySelector('#pdf-raw-text-edit');

    // Chức năng Check all
    if (checkAll) {
        checkAll.addEventListener('change', (e) => {
            rowChks.forEach(chk => chk.checked = e.target.checked);
        });
    }

    const closeDialog = () => {
        window.removeEventListener('keydown', handleDialogKeys);
        dialog.remove();
    };

    const handleDialogKeys = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
        } else if (e.key === 'Enter') {
            // Nhấn Enter để lưu, nhưng bỏ qua nếu đang ở ô Textarea (để xuống dòng)
            if (e.target && e.target.id === 'pdf-raw-text-edit') {
                return;
            }
            e.preventDefault();
            btnConfirm.click();
        }
    };

    window.addEventListener('keydown', handleDialogKeys);

    btnCancel.onclick = closeDialog;

    btnReparse.onclick = () => {
        if (onReparse) {
            const currentText = rawTextEdit.value;
            onReparse(currentText);
        }
    };

    btnConfirm.onclick = () => {
        try {
            const selected = [];
            const rows = dialog.querySelectorAll('.pdf-row-auto');
            rows.forEach(row => {
                const chk = row.querySelector('.pdf-row-chk');
                const valInput = row.querySelector('.pdf-val-input');
                if (chk && chk.checked && valInput) {
                    const idx = parseInt(chk.getAttribute('data-index'));
                    if (results[idx]) {
                        selected.push({
                            ...results[idx],
                            value: valInput.value
                        });
                    }
                }
            });

            closeDialog();
            if (onConfirm) onConfirm(selected);
        } catch (err) {
            console.error("[VNPT] Lỗi khi xác nhận kết quả:", err);
            alert("Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
        }
    };
}

```

---

### File: src\features\profileManager.js

```javascript
/**
 * @file profileManager.js
 * @desc Quản lý các cấu hình mặc định (Side B) cho từng chi nhánh VNPT khác nhau.
 */
import { Storage } from '../utils/storage.js';
import { LOCAL_KEY_PROFILES, LOCAL_KEY_ACTIVE_PROFILE_ID, LOCAL_KEY_DEFAULT_FIELDS } from '../core/constants.js';
import { DEFAULT_DATA } from '../core/defaults.js';

/**
 * Khởi tạo dữ liệu Profile nếu chưa có
 */
export function initProfiles() {
    const profiles = Storage.get(LOCAL_KEY_PROFILES);
    if (!profiles || profiles.length === 0) {
        const defaultProfile = {
            id: 'hanoi_default',
            name: 'VNPT Hà Nội (Mặc định)',
            data: DEFAULT_DATA
        };
        Storage.set(LOCAL_KEY_PROFILES, [defaultProfile]);
        Storage.set(LOCAL_KEY_ACTIVE_PROFILE_ID, 'hanoi_default');
    }
}

/**
 * Lấy danh sách Profile
 */
export function getProfiles() {
    return Storage.get(LOCAL_KEY_PROFILES) || [];
}

/**
 * Lấy ID Profile đang hoạt động
 */
export function getActiveProfileId() {
    return Storage.get(LOCAL_KEY_ACTIVE_PROFILE_ID);
}

/**
 * Chuyển sang Profile khác
 */
export function switchProfile(id) {
    const profiles = getProfiles();
    const target = profiles.find(p => p.id === id);
    if (!target) return false;

    Storage.set(LOCAL_KEY_ACTIVE_PROFILE_ID, id);
    
    // Khi đổi profile, ta ghi đè dữ liệu mặc định hiện tại bằng dữ liệu của profile đó
    // Lưu ý: LOCAL_KEY_DEFAULT_FIELDS là nơi fieldsManager đọc khi ở Default Mode
    Storage.set(LOCAL_KEY_DEFAULT_FIELDS, target.data);
    
    return true;
}

/**
 * Tạo profile mới từ dữ liệu Default Mode hiện tại
 */
export function createProfileFromCurrent(name) {
    const profiles = getProfiles();
    const currentData = Storage.get(LOCAL_KEY_DEFAULT_FIELDS) || DEFAULT_DATA;
    
    const newProfile = {
        id: 'p_' + Date.now(),
        name: name,
        data: currentData
    };
    
    profiles.push(newProfile);
    Storage.set(LOCAL_KEY_PROFILES, profiles);
    return newProfile.id;
}

/**
 * Xóa profile
 */
export function deleteProfile(id) {
    if (id === 'hanoi_default') return false; // Không cho xóa bản gốc
    
    let profiles = getProfiles();
    profiles = profiles.filter(p => p.id !== id);
    Storage.set(LOCAL_KEY_PROFILES, profiles);
    
    if (getActiveProfileId() === id) {
        switchProfile('hanoi_default');
    }
    return true;
}

/**
 * Nhập danh sách profile mới (từ Cloud)
 */
export function importProfiles(newProfiles) {
    if (!Array.isArray(newProfiles)) return;
    
    // Hợp nhất (hoặc ghi đè tùy chọn - ở đây ta ghi đè danh sách local)
    Storage.set(LOCAL_KEY_PROFILES, newProfiles);
    
    // Nếu active profile bị xóa hoặc không còn tồn tại, chuyển về mặc định
    const activeId = getActiveProfileId();
    if (!newProfiles.find(p => p.id === activeId)) {
        switchProfile('hanoi_default');
    }
}

```

---

### File: src\features\rawScan\index.js

```javascript
// Logics have been merged into pdfScan/index.js (AI Scanner module)
export function initRawScan() {
    // Không làm gì cả để backward compatibility với main.js
}

```

---

### File: src\features\rawScan\rawScan.js

```javascript
/**
 * @file rawScan.js
 * @desc Xử lý việc phân loại văn bản thô bằng AI Gemini.
 */
import { callGemini } from '../../api/gemini.js';
import { REQUIRED_KEYS, DEFAULT_LABELS } from '../../core/constants.js';
import { classifyTextLocally } from '../../utils/localClassifier.js';

/**
 * Lời nhắc hệ thống chuyên dụng cho văn bản thô (Raw Text)
 */
const getRawTextSystemPrompt = () => {
    let fieldsHint = '';
    for (const [key, label] of Object.entries(DEFAULT_LABELS)) {
        const pKey = key.split(',')[0].trim();
        if (REQUIRED_KEYS.includes(pKey)) {
            fieldsHint += `    "${pKey}": "${label}",\n`;
        }
    }

    return `Bạn là một chuyên gia trích xuất dữ liệu từ văn bản thô (tin nhắn, email, ghi chú).
Nhiệm vụ: Tìm thông tin của KHÁCH HÀNG (BÊN A) từ văn bản được cung cấp. Bỏ qua thông tin của nhân viên VNPT hoặc Bên B.

CHỈ TRẢ VỀ JSON THUẦN TÚY.
Cấu trúc JSON yêu cầu:
{
${fieldsHint}    "ngayKy": "Ngày ký hợp đồng"
}

QUY TẮC TRÍCH XUẤT:
1. "soDkdn": Lấy Mã số thuế (10 hoặc 13 số) hoặc Số GPKD. Xóa dấu chấm/khoảng cách.
2. "sdt": Lấy số điện thoại di động/cố định. Định dạng chỉ gồm chữ số.
3. "ngay...": Tất cả các trường ngày tháng phải đưa về định dạng dd/MM/yyyy.
4. "diaChi": Gộp toàn bộ số nhà, đường, phường, quận, tỉnh thành một chuỗi duy nhất.
5. "noiCapSoDkdn": Trả về định dạng "SKDT {Tỉnh}" (ví dụ: "SKDT Hà Nội").
6. Nếu không tìm thấy thông tin cho một trường, trả về "".
7. Tuyệt đối không tự bịa ra thông tin không có trong văn bản.

VÍ DỤ:
Văn bản: "Khách hàng Nguyễn Văn A, MST 0101234567, địa chỉ số 1 Tràng Tiền, Hoàn Kiếm, HN. SĐT 0987654321 ký ngày 12 tháng 4 năm 2024"
Kết quả: {
  "tenDaiDienn": "Nguyễn Văn A",
  "soDkdn": "0101234567",
  "diaChi": "số 1 Tràng Tiền, Hoàn Kiếm, Hà Nội",
  "sdt": "0987654321",
  "ngayKy": "12/04/2024"
}`;
};

/**
 * Thực hiện trích xuất thông tin từ đoạn text thô (Dùng AI Gemini).
 */
export async function extractFieldsFromText(rawText, apiKey, modelName = 'gemini-2.0-flash') {
    if (!rawText || !rawText.trim()) throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");

    return callGemini({
        apiKey,
        model: modelName,
        systemInstruction: getRawTextSystemPrompt(),
        userText: `Hãy phân loại thông tin từ đoạn văn bản sau đây: \n\n${rawText}`
    });
}

/**
 * Thực hiện trích xuất thông tin từ đoạn text thô (Dùng Regex Local).
 */
export function extractFieldsLocally(rawText) {
    if (!rawText || !rawText.trim()) throw new Error("Vui lòng nhập nội dung văn bản cần phân loại.");
    return classifyTextLocally(rawText);
}

```

---

### File: src\features\screenScan\screenScanner.js

```javascript
/**
 * @file screenScanner.js
 * @desc Quét toàn bộ văn bản hiển thị trên tab hiện tại, loại bỏ dữ liệu rác.
 */

export function scrapeScreenText() {
    try {
        // Tạo một clone để không làm hỏng trang thực
        const backup = document.body.cloneNode(true);

        // Danh sách các thành phần cần loại bỏ để giảm nhiễu cho AI
        const junkSelectors = [
            'script', 'style', 'noscript', 'iframe', 'svg',
            'nav', 'footer', 'header:not(article header)', 
            'aside', '.sidebar', '.menu', '.banner',
            '#vnpt-docx-widget', '#vnpt-inline-calc', '.vnpt-pdf-overlay', // Các thành phần của chính chúng ta
            '[aria-hidden="true"]'
        ];

        junkSelectors.forEach(selector => {
            const elements = backup.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Lấy text và làm sạch khoảng trắng thừa
        let text = backup.innerText || "";
        
        // Normalize: Xóa các dòng trắng thừa và khoảng trắng dư
        text = text.split('\n')
                   .map(line => line.trim())
                   .filter(line => line.length > 0)
                   .join('\n');

        return text;
    } catch (err) {
        console.error("Lỗi khi quét màn hình:", err);
        return "";
    }
}

```

---

### File: src\features\templateManager.js

```javascript
/**
 * @file templateManager.js
 * @desc Quan ly danh sach template DOCX local luu trong IndexedDB.
 * @exports loadTemplates         - doc danh sach template tu localStorage
 * @exports saveLocalTemplate     - luu file local vao IDB + cap nhat metadata
 * @exports renderTemplateManager - render/refresh UI danh sach template vao container
 * @seeAlso api/storage/idb.js, widget.js, docExport.js
 */

import { SK_TEMPLATES } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { idbSave, idbLoad, idbDelete } from '../api/storage/idb.js';
import { Storage } from '../utils/storage.js';

const LOCAL_TEMPLATE_TYPES = new Set(['local', 'local_base64', 'local_idb', 'firebase']);

export function loadTemplates() {
    try {
        const list = Storage.get(SK_TEMPLATES) || [];
        const validList = list.filter(t => t && (LOCAL_TEMPLATE_TYPES.has(t.type) || t.type === 'firebase'));
        if (validList.length !== list.length) saveTemplates(validList);
        return validList;
    } catch {
        return [];
    }
}

function saveTemplates(list) {
    Storage.set(SK_TEMPLATES, list.filter(t => t && LOCAL_TEMPLATE_TYPES.has(t.type)));
}

/**
 * Doc file local, luu vao IndexedDB va localStorage (metadata)
 */
export async function saveLocalTemplate(file, container, onSelectTemplate) {
    const defaultName = file.name.replace(/\.docx$/i, '');
    const name = prompt('Dat ten bien nho cho file nay:', defaultName);
    if (!name || !name.trim()) return;

    try {
        // Ưu tiên dùng file.arrayBuffer() thay vì adapter để tránh lỗi chuyển đổi trong môi trường build
        const arrayBuffer = await file.arrayBuffer();
        
        // Chèn đoạn kiểm tra Magic Number ngay khi lưu để phát hiện file hỏng sớm
        const bytes = new Uint8Array(arrayBuffer, 0, 2);
        if (bytes[0] !== 0x50 || bytes[1] !== 0x4B) {
            throw new Error("File chon khong phai dinh dang Word (.docx) hop le hoặc bi khoa/hong.");
        }

        await idbSave(name.trim(), arrayBuffer);

        const list = loadTemplates();
        const filtered = list.filter(t => t.name !== name.trim() && t.fileName !== file.name);
        filtered.unshift({
            name: name.trim(),
            type: 'local_idb',
            fileName: file.name,
            lastUsed: Date.now()
        });
        saveTemplates(filtered);

        renderTemplateManager(container, onSelectTemplate, name.trim());

        if (onSelectTemplate) onSelectTemplate(arrayBuffer, name.trim());
    } catch (err) {
        showToast(`Loi luu file: ${err.message}`, '#dc3545');
    }
}

import { storage as storageManager } from '../api/storage/index.js';

export function renderTemplateManager(container, onSelectTemplate, currentActiveName = null) {
    let mainWrap = container.querySelector('.vnpt-template-manager-inner');
    let localListWrapper;
    let sharedListWrapper;
    let btnWrap;

    if (!mainWrap) {
        container.innerHTML = '';
        mainWrap = document.createElement('div');
        mainWrap.className = 'vnpt-template-manager-inner';

        const headerRow = document.createElement('div');
        headerRow.className = 'tmpl-header-row';

        const title = document.createElement('span');
        title.className = 'vnpt-title-main';

        btnWrap = document.createElement('div');
        btnWrap.className = 'vnpt-btn-wrap';

        headerRow.appendChild(title);
        headerRow.appendChild(btnWrap);
        mainWrap.appendChild(headerRow);

        localListWrapper = document.createElement('div');
        localListWrapper.className = 'vnpt-local-list-container';
        mainWrap.appendChild(localListWrapper);

        container.appendChild(mainWrap);
    } else {
        localListWrapper = mainWrap.querySelector('.vnpt-local-list-container');
        btnWrap = mainWrap.querySelector('.vnpt-btn-wrap');
    }

    if (btnWrap) btnWrap.innerHTML = '';

    const titleEl = mainWrap.querySelector('.vnpt-title-main');
    renderLocalTemplates(localListWrapper, titleEl, onSelectTemplate, currentActiveName, container);
}

async function renderSharedTemplates(wrapper, onSelectTemplate, currentActiveName) {
    const { FirebaseService } = await import('../api/firebaseService.js');
    const shared = await FirebaseService.getSharedTemplates();

    if (!shared || shared.length === 0) {
        wrapper.innerHTML = '<div style="font-size:10px;color:#999;font-style:italic;padding:4px 12px;">Không có mẫu dùng chung.</div>';
        return;
    }

    wrapper.innerHTML = '';
    shared.forEach(tpl => {
        const row = createSharedTemplateRow(tpl, onSelectTemplate, currentActiveName);
        wrapper.appendChild(row);
    });
}

function createSharedTemplateRow(tpl, onSelectTemplate, currentActiveName) {
    const row = document.createElement('div');
    row.className = 'tmpl-row-item';
    if (tpl.name === currentActiveName) {
        row.classList.add('active');
    }

    row.title = tpl.description || tpl.name;
    row.onclick = async () => {
        try {
            showToast(`⏳ Đang tải ${tpl.name}...`);
            const arrayBuffer = await storageManager.download('firebase', tpl.path, { type: 'arraybuffer' });
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            showToast(`✅ Đã tải xong: ${tpl.name}`);
            const container = document.getElementById('vnpt-template-manager');
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`Lỗi tải template: ${err.message}`, '#dc3545');
        }
    };

    const badge = document.createElement('span');
    badge.textContent = 'CLOUD';
    badge.className = 'tmpl-badge-cloud';

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.className = 'tmpl-name-text';

    row.appendChild(badge);
    row.appendChild(nameEl);
    return row;
}

function renderLocalTemplates(wrapper, titleEl, onSelectTemplate, currentActiveName, container) {
    const templates = loadTemplates();
    titleEl.innerHTML = 'Mẫu văn bản' + (currentActiveName ? ` <span style="color:#2e7d32;">(Đang dùng: ${currentActiveName})</span>` : '');

    if (templates.length === 0) {
        wrapper.innerHTML = '<div style="font-size:10px;color:#999;font-style:italic;padding:12px;text-align:center;width:100%;">Chua co mau nao. Hay chon file .docx tu may tinh de luu vao day.</div>';
        return;
    }

    wrapper.innerHTML = '';
    templates.forEach((tpl, idx) => {
        const row = createTemplateRow(tpl, idx, onSelectTemplate, currentActiveName, container);
        wrapper.appendChild(row);
    });
}

function createTemplateRow(tpl, idx, onSelectTemplate, currentActiveName, container) {
    const row = document.createElement('div');
    row.className = 'tmpl-row-item';
    if (tpl.name === currentActiveName) {
        row.classList.add('active');
    }

    row.title = tpl.fileName || tpl.name;
    row.tabIndex = 0;
    row.onclick = () => {
        row.focus();
        selectTemplate(tpl, onSelectTemplate, container);
    };

    const nameEl = document.createElement('span');
    nameEl.textContent = tpl.name;
    nameEl.className = 'tmpl-name-text';

    row.appendChild(nameEl);

    const renameBtn = document.createElement('button');
    renameBtn.innerHTML = '✎';
    renameBtn.className = 'tmpl-btn-rename';
    renameBtn.onclick = e => {
        e.stopPropagation();
        const newName = prompt('Doi ten template:', tpl.name);
        if (!newName || !newName.trim() || newName.trim() === tpl.name) return;

        const list = loadTemplates();
        const itemIdx = list.findIndex(t => t.name === tpl.name);
        if (itemIdx >= 0) {
            list[itemIdx].name = newName.trim();
            saveTemplates(list);
            renderTemplateManager(container, onSelectTemplate, currentActiveName === tpl.name ? newName.trim() : currentActiveName);
        }
    };
    row.appendChild(renameBtn);

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '✕';
    delBtn.className = 'tmpl-btn-del';
    delBtn.onclick = async e => {
        e.stopPropagation();
        if (!confirm(`Xoa bieu mau "${tpl.name}"?`)) return;

        const list = loadTemplates();
        const itemIdx = list.findIndex(t => t.name === tpl.name);
        if (itemIdx >= 0) {
            const item = list[itemIdx];
            list.splice(itemIdx, 1);
            saveTemplates(list);
            if (item.type === 'local_idb') await idbDelete(item.name).catch(() => null);
            renderTemplateManager(container, onSelectTemplate, currentActiveName === item.name ? null : currentActiveName);
        }
    };
    row.appendChild(delBtn);

    return row;
}

function selectTemplate(tpl, onSelectTemplate, container) {
    const list = loadTemplates();
    const found = list.find(t => t.name === tpl.name && t.type === tpl.type);
    if (found) {
        found.lastUsed = Date.now();
        saveTemplates(list);
    }

    if (tpl.type === 'local_idb') {
        idbLoad(tpl.name).then(arrayBuffer => {
            if (!arrayBuffer) throw new Error('Khong tim thay du lieu template da luu');
            if (onSelectTemplate) onSelectTemplate(arrayBuffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        }).catch(err => {
            showToast(`Loi nap template local: ${err.message}`, '#dc3545');
        });
        return;
    }

    if (tpl.type === 'local_base64' && tpl.data) {
        try {
            const binaryString = window.atob(tpl.data.split(',')[1]);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            if (onSelectTemplate) onSelectTemplate(bytes.buffer, tpl.name);
            renderTemplateManager(container, onSelectTemplate, tpl.name);
        } catch (err) {
            showToast(`Loi nap Base64: ${err.message}`, '#dc3545');
        }
        return;
    }

    showToast('Template nay khong con duoc ho tro. Hay chon lai file local.', '#dc3545');
}

```

---

### File: src\features\webScanner.js

```javascript
/**
 * @file webScanner.js
 * @desc Quét các trường (fields) trên trang web và đồng bộ vào bảng fields của widget.
 *       Bao gồm: nút "Quét" lấy values từ DOM theo DEFAULT_LABELS keys,
 *       và listener input/change để tự động cập nhật khi user gõ trực tiếp trên web.
 * @exports initWebScanner  — gán click/input/change listeners cho nút Quét
 * @seeAlso core/constants.js (DEFAULT_LABELS), fieldsManager.js (addOrUpdateFieldRow)
 */
import { DEFAULT_LABELS } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';
import { AppState } from '../core/state.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { RemoteConfig } from '../api/remoteConfig.js';
import { buildFullDOMMap, findPageInput, invalidateDOMMap } from '../utils/domHelper.js';
import { capitalizeName, formatPhoneNumber, normalizeDate } from '../utils/stringHelper.js';
import { createInternalBackup, generateBackupName } from '../utils/backupHelper.js';
import { debounce } from '../utils/common.js';

let isBound = false;
let clickHandler = null;
let inputHandler = null;
let changeHandler = null;
let keydownHandler = null;
let mutationObserver = null;

/**
 * Lấy giá trị hiển thị (text/title) của một element.
 * Tự động xử lý Select, Ng-Select2 và Input thông thường.
 */
function getElValueText(el) {
    if (!el) return '';
    const tag = el.tagName.toLowerCase();

    if (tag === 'select') {
        return el.options[el.selectedIndex]?.text || '';
    }

    if (tag === 'ng-select2') {
        const span = el.querySelector('.select2-selection__rendered');
        return span ? (span.getAttribute('title') || span.textContent.trim()) : '';
    }

    // Với Input thông thường hoặc các element khác có thuộc tính title
    return (el.value || el.getAttribute('title') || '').trim();
}

/**
 * Quét tất cả các thành phần địa chỉ trên trang và trả về chuỗi đã nối chuẩn.
 * @param {boolean} forceRefresh - Nếu true, bắt buộc quét lại DOM.
 * @returns {string} Chuỗi địa chỉ đầy đủ.
 */
function scanFullAddress(forceRefresh = false) {
    if (forceRefresh) buildFullDOMMap(true); // Chỉ ép buộc khi cần thiết (VD: bấm nút Quét)
    const labels = RemoteConfig.getLabels();
    const keyString = Object.keys(labels).find(k => k.includes('diaChi'));
    if (!keyString) return '';

    const labelText = labels[keyString];
    const ids = keyString.split(',').map(s => s.trim());
    let addressObj = { detail: '', ward: '', district: '', province: '' };

    // 1. Quét theo ID/Name/FormControlName
    ids.forEach(id => {
        const el = findPageInput(id, labelText);
        if (el) {
            let val = getElValueText(el);
            if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                if (id === 'diaChi' || id === 'duong') {
                    // Nếu lấy từ trường 'duong', bóc tách lấy phần street để tránh lặp lại các thành phần hành chính
                    const strippedVal = (id === 'duong' && val.includes(',')) 
                                        ? parseAddressComponents(val).street 
                                        : val;
                    
                    // Ưu tiên giữ lại nội dung dài nhất (chi tiết nhất)
                    if (!addressObj.detail || strippedVal.length > addressObj.detail.length) {
                        addressObj.detail = strippedVal;
                    }
                }
                else if (id.includes('tinh')) addressObj.province = val;
                else if (id.includes('xaIdNew') || id.includes('huyen') || id.includes('quan')) addressObj.district = val;
                else if (id.includes('xa') || id.includes('phuong')) addressObj.ward = val;
            }
        }
    });

    // 2. Nhận diện Thông minh theo tiền tố Title (Nếu còn thiếu)
    if (!addressObj.ward || !addressObj.district || !addressObj.province) {
        document.querySelectorAll('ng-select2').forEach(s2 => {
            const span = s2.querySelector('.select2-selection__rendered');
            if (!span) return;
            const title = (span.getAttribute('title') || span.textContent || '').trim();
            if (!title || title === '--- Chọn ---' || title.includes('Chọn')) return;

            if ((title.startsWith('Xã') || title.startsWith('Phường') || title.startsWith('Thị trấn')) && !addressObj.ward) addressObj.ward = title;
            else if ((title.startsWith('Quận') || title.startsWith('Huyện') || title.startsWith('Thị xã')) && !addressObj.district) addressObj.district = title;
            else if ((title.startsWith('Tỉnh') || title.startsWith('Thành phố')) && !addressObj.province) addressObj.province = title;
        });
    }

    // 3. Nối chuỗi
    let parts = [];
    if (addressObj.detail) parts.push(addressObj.detail);
    if (addressObj.ward) parts.push(addressObj.ward);
    if (addressObj.district) parts.push(addressObj.district);
    if (addressObj.province) {
        let p = addressObj.province;
        if (!p.startsWith('Tỉnh') && !p.startsWith('Thành phố')) p = 'Tỉnh ' + p;
        parts.push(p);
    }
    if (parts.length > 0) parts.push("");

    return parts.filter(p => !!p).join(', ');
}

/**
 * Tìm tên Tỉnh/Thành phố trên trang web
 * @returns {string} Tên tỉnh/thành phố hoặc rỗng
 */
function getProvinceName() {
    let rawVal = '';
    const provinceIds = ['tinhIdNew', 'tinhId', 'diaChiTruSoTinhIdNew'];
    for (const id of provinceIds) {
        const el = findPageInput(id);
        if (el) {
            rawVal = getElValueText(el);
            if (rawVal && rawVal !== '--- Chọn ---' && !rawVal.includes('Chọn')) break;
        }
    }

    if (!rawVal || rawVal === '--- Chọn ---') {
        // Chỉ quét lại nếu chưa có
        const s2List = document.querySelectorAll('ng-select2');
        for (const s2 of s2List) {
            const span = s2.querySelector('.select2-selection__rendered');
            const title = (span?.getAttribute('title') || span?.textContent || '').trim();
            if (title && (title.startsWith('Tỉnh') || title.startsWith('Thành phố')) && !title.includes('Chọn')) {
                rawVal = title;
                break;
            }
        }
    }

    if (rawVal) {
        // Cắt bỏ "Tỉnh " hoặc "Thành phố " theo yêu cầu USER
        return rawVal.trim().replace(/^(Tỉnh|Thành phố)\s+/i, '');
    }
    return '';
}

export function initWebScanner() {
    if (isBound) return; // Prevent duplicate listeners (hot reload)
    isBound = true;

    const btnScan = document.getElementById('vnpt-btn-scan');
    if (!btnScan) {
        isBound = false;
        return;
    }

    btnScan.addEventListener('click', clickHandler = function () {
        // Bỏ tính năng backup tự động/clean khi quét theo yêu cầu: quét chỉ + thêm
        // createInternalBackup(generateBackupName());

        if (AppState.isDefaultMode) {
            Object.keys(DEFAULT_DATA).forEach(key => {
                addOrUpdateFieldRow(key, DEFAULT_DATA[key], DEFAULT_LABELS[key] || '');
            });
            saveFieldsToLocal();
            showToast("Đã nạp lại dữ liệu mặc định từ hệ thống.");
            return;
        }

        let foundCount = 0;
        buildFullDOMMap();

        const labels = RemoteConfig.getLabels();
        let fullAddressScanned = ''; // Lưu địa chỉ đầy đủ để làm ngữ cảnh cho "duong"

        Object.keys(labels).forEach(keyString => {
            const labelText = labels[keyString];
            const ids = keyString.split(',').map(s => s.trim());
            const isAddressField = ids.includes('diaChi');
            const isNoiCapDkdn = ids.includes('noiCapSoDkdn');

            let val = '';
            if (isAddressField) {
                val = scanFullAddress(false); // Map đã được build ở dòng 135
                if (val) {
                    foundCount++;
                    fullAddressScanned = val;
                }
            } else if (isNoiCapDkdn) {
                // Tự động tính toán Nơi cấp ĐKDN từ Tỉnh
                const province = getProvinceName();
                if (province) {
                    val = "SKDT " + province;
                    foundCount++;
                }
            } else {
                ids.forEach(id => {
                    if (val) return;
                    const el = findPageInput(id, labelText);
                    if (el) {
                        val = getElValueText(el);
                        if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                            foundCount++;
                        } else {
                            val = ''; // Reset nếu là text rác "Chọn..."
                        }
                    }
                });
            }

            val = val || getScannerFallback(keyString);
            if (val && typeof val === 'string') {
                const primaryId = ids[0];
                if (['sdt'].includes(primaryId)) val = formatPhoneNumber(val);
                else if (['ngaySinhCustomer', 'ngayCapCustomer', 'ngayCapSoDkdnCustomer', 'ngayKy', 'ngayTiepNhan'].includes(primaryId)) val = normalizeDate(val);
            }
            const sourceContext = ids.includes('duong') ? fullAddressScanned : null;

            // Chế độ "Quét + Thêm": Chỉ cập nhật nếu giá trị mới không rỗng,
            // và quan trọng là hàm addOrUpdateFieldRow sẽ được báo hiệu để không ghi đè giá trị cũ nếu đã có dữ liệu.
            addOrUpdateFieldRow(keyString, val, null, '', null, false, sourceContext, true); 
        });

        saveFieldsToLocal();

        if (foundCount > 0) {
            this.style.background = '#1e8e3e'; this.style.color = '#fff'; this.innerText = 'Đã quét xong';
            setTimeout(() => { this.style.background = ''; this.style.color = ''; this.innerText = 'Quét dữ liệu'; }, 1000);
        } else {
            showToast("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.");
        }
    });

    // --- ĐỒNG BỘ THỜI GIAN THỰC ---
    let labelLookupCache = null;
    let lastLabelsVersion = 0;

    /**
     * Tạo bản đồ lookup nhanh từ ID/FCN sang matchedKey
     */
    function getLabelLookup() {
        const labels = RemoteConfig.getLabels();
        // Giả sử RemoteConfig có version hoặc ta check hash nếu cần, 
        // ở đây tạm thời check nếu cache chưa có.
        if (labelLookupCache) return labelLookupCache;

        const lookup = new Map();
        Object.keys(labels).forEach(matchedKey => {
            const ids = matchedKey.split(',').map(s => s.trim());
            ids.forEach(id => lookup.set(id, matchedKey));
        });
        labelLookupCache = lookup;
        return lookup;
    }

    function handleSyncEvent(e) {
        // Bỏ qua nếu sự kiện từ chính widget
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        // Xử lý phím Enter
        if (e.type === 'keydown' && e.key !== 'Enter') return;

        const el = e.target.closest('input, textarea, select, ng-select2');
        if (!el) return;

        const targetId = el.id;
        const targetFcn = el.getAttribute('formcontrolname');

        const lookup = getLabelLookup();
        const matchedKey = (targetId && lookup.get(targetId)) || (targetFcn && lookup.get(targetFcn));

        if (matchedKey !== undefined) {
            let val = undefined;
            if (matchedKey.includes('diaChi')) {
                // Sử dụng map hiện tại (đã được xây dựng hoặc lazy build)
                val = scanFullAddress(false);

                // --- BỔ SUNG: Cập nhật luôn noiCapSoDkdn trong Widget khi Tỉnh thay đổi ---
                const idLower = (targetId || targetFcn || '').toLowerCase();
                if (idLower.includes('tinh') || idLower.includes('province') || idLower.includes('city')) {
                    const province = getProvinceName();
                    if (province) {
                        const skdtVal = "SKDT " + province;
                        const skdtKey = Array.from(lookup.values()).find(k => k.includes('noiCapSoDkdn'));
                        if (skdtKey) {
                            addOrUpdateFieldRow(skdtKey, skdtVal, null, '', null, true);
                        }
                    }
                }
            } else {
                val = getElValueText(el);
            }

            if (val !== undefined) {
                // Cập nhật vào Widget ngay lập tức
                addOrUpdateFieldRow(matchedKey, val, null, '', null, true);
                saveFieldsToLocal();

                // Debug log (ẩn)
                console.debug(`[Sync] Updated ${matchedKey} with value: "${val}"`);
            }
        }
    }

    // Đặc trị cho Tỉnh (Real-time OnChange) vì Select2 đôi khi không bubble event
    function setupProvinceSync() {
        const provinceIds = ['tinhId', 'tinhIdNew', 'diaChiTruSoTinhIdNew'];
        provinceIds.forEach(pId => {
            const el = document.getElementById(pId);
            if (el && !el.dataset.widgetSyncBound) {
                el.dataset.widgetSyncBound = "1";
                const updateWidgetSkdt = () => {
                    const province = getProvinceName();
                    if (province) {
                        const skdtVal = "SKDT " + province;
                        const lookup = getLabelLookup();
                        const skdtKey = Array.from(lookup.values()).find(k => k.includes('noiCapSoDkdn'));
                        if (skdtKey) {
                            addOrUpdateFieldRow(skdtKey, skdtVal, null, '', null, true);
                            saveFieldsToLocal();
                        }
                    }
                };
                el.addEventListener('change', updateWidgetSkdt);
                // Với Select2 (VNPT) cần listener đặc thù qua jQuery nếu có
                if (typeof $ !== 'undefined') {
                    $(el).on('select2:select change', updateWidgetSkdt);
                }
            }
        });
    }

    // Debounce cho Sync Event và Observer
    const debouncedHandleSync = debounce(handleSyncEvent, 300);
    const debouncedOnMutation = debounce((mutations) => {
        let shouldInvalidate = false;
        if (mutations) {
            for (const m of mutations) {
                if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
                    shouldInvalidate = true;
                    break;
                }
            }
        } else {
            shouldInvalidate = true;
        }
        if (shouldInvalidate) {
            invalidateDOMMap();
            setupProvinceSync();
        }
    }, 1000);

    inputHandler = debouncedHandleSync;
    changeHandler = handleSyncEvent; // Change thì sync ngay
    keydownHandler = handleSyncEvent;

    document.addEventListener('input', inputHandler);
    document.addEventListener('change', changeHandler);
    document.addEventListener('keydown', keydownHandler);

    // Chạy setupProvinceSync định kỳ hoặc qua MutationObserver để bắt các form load chậm
    setupProvinceSync();
    mutationObserver = new MutationObserver((mutations) => debouncedOnMutation(mutations));
    mutationObserver.observe(document.body, { childList: true, subtree: true });
}

export function cleanupWebScanner() {
    if (!isBound) return;
    isBound = false;

    const btnScan = document.getElementById('vnpt-btn-scan');
    if (btnScan && clickHandler) btnScan.removeEventListener('click', clickHandler);
    clickHandler = null;

    if (inputHandler) document.removeEventListener('input', inputHandler);
    if (changeHandler) document.removeEventListener('change', changeHandler);
    if (keydownHandler) document.removeEventListener('keydown', keydownHandler);
    inputHandler = null;
    changeHandler = null;
    keydownHandler = null;

    if (mutationObserver) mutationObserver.disconnect();
    mutationObserver = null;
}

```

---


## Thư mục: src/api

### File: src\api\firebaseConfig.js

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/lite";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe6R5U0MsHw9aBNl25AZP3ZemFXDKEK9w",
  authDomain: "vnpt-cloud-sync.firebaseapp.com",
  projectId: "vnpt-cloud-sync",
  storageBucket: "vnpt-cloud-sync.firebasestorage.app",
  messagingSenderId: "1034099532877",
  appId: "1:1034099532877:web:3bcbe2ab0ea8fae524e804",
  measurementId: "G-650CYB84PL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

```

---

### File: src\api\firebaseService.js

```javascript
import { auth, db } from './firebaseConfig.js';
import { encrypt, decrypt } from '../utils/crypto.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore/lite";

export const FirebaseService = {
  /**
   * Đăng ký tài khoản mới
   */
  async signUp(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  /**
   * Đăng nhập
   */
  async signIn(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  /**
   * Đăng xuất
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * Theo dõi trạng thái đăng nhập
   */
  onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Đẩy 1 profile lên Cloud
   */
  async pushProfile(profile) {
    const user = auth.currentUser;
    if (!user) throw new Error("Chưa đăng nhập Firebase");

    const profileRef = doc(db, `users/${user.uid}/profiles`, profile.id);
    await setDoc(profileRef, {
      ...profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Lấy tất cả profiles từ Cloud
   */
  async pullProfiles() {
    const user = auth.currentUser;
    if (!user) return [];

    const profilesCol = collection(db, `users/${user.uid}/profiles`);
    const q = query(profilesCol);
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data());
  },

  /**
   * Sao lưu API Keys
   */
  async backupKeys(keys) {
    const user = auth.currentUser;
    if (!user) return;

    const encryptedKeys = {};
    for (const [key, val] of Object.entries(keys)) {
      encryptedKeys[key] = encrypt(val);
    }

    const secretRef = doc(db, `users/${user.uid}/secrets`, "api_keys");
    await setDoc(secretRef, {
      ...encryptedKeys,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Khôi phục API Keys
   */
  async restoreKeys() {
    const user = auth.currentUser;
    if (!user) return null;

    const secretRef = doc(db, `users/${user.uid}/secrets`, "api_keys");
    const snap = await getDoc(secretRef);
    if (!snap.exists()) return null;

    const cloudKeys = snap.data();
    const decryptedKeys = {};
    for (const [key, val] of Object.entries(cloudKeys)) {
      if (key === 'updatedAt') continue;
      decryptedKeys[key] = decrypt(val);
    }
    return decryptedKeys;
  },

  /**
   * Cập nhật cài đặt người dùng (ví dụ: workspace)
   */
  async updateUserSettings(settings) {
    const user = auth.currentUser;
    if (!user) return;

    const settingsRef = doc(db, `users/${user.uid}/settings`, "general");
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: serverTimestamp()
    }, { merge: true });
  },

  /**
   * Lấy cài đặt người dùng
   */
  async getUserSettings() {
    const user = auth.currentUser;
    if (!user) return null;

    const settingsRef = doc(db, `users/${user.uid}/settings`, "general");
    const snap = await getDoc(settingsRef);
    return snap.exists() ? snap.data() : null;
  },

  /**
   * Đẩy cấu hình tổng quát lên Cloud (Mapping, Hotkeys, Text Template)
   */
  async pushGlobalConfig(config) {
      const user = auth.currentUser;
      if (!user) return;

      const configRef = doc(db, `users/${user.uid}/settings`, "config");
      await setDoc(configRef, {
          ...config,
          updatedAt: serverTimestamp()
      }, { merge: true });
  },

  /**
   * Khôi phục cấu hình tổng quát từ Cloud
   */
  async pullGlobalConfig() {
      const user = auth.currentUser;
      if (!user) return null;

      const configRef = doc(db, `users/${user.uid}/settings`, "config");
      const snap = await getDoc(configRef);
      return snap.exists() ? snap.data() : null;
  },

  /**
   * Lấy danh sách template dùng chung từ Cloud
   */
  async getSharedTemplates() {
    try {
      const userSettings = await this.getUserSettings();
      const workspaceId = userSettings?.workspace || 'global';

      const templatesCol = collection(db, "shared_templates");
      const q = query(
        templatesCol, 
        where("active", "==", true),
        where("workspace", "==", workspaceId)
      );
      const snapshot = await getDocs(q);
      let list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Nếu không phải global, thì lẫy thêm cả global
      if (workspaceId !== 'global') {
          const qGlobal = query(templatesCol, where("active", "==", true), where("workspace", "==", "global"));
          const snapGlobal = await getDocs(qGlobal);
          const globalList = snapGlobal.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          list = [...list, ...globalList];
      }

      return list;
    } catch (err) {
      console.error("FirebaseService.getSharedTemplates error:", err);
      return [];
    }
  },

  /**
   * Lấy các cấu hình từ xa (Selectors, App Config)
   */
  async getRemoteConfigs() {
    try {
      const configRef = doc(db, "settings", "remote_configs");
      const snap = await getDoc(configRef);
      if (snap.exists()) return snap.data();
      return null;
    } catch (err) {
      console.error("FirebaseService.getRemoteConfigs error:", err);
      return null;
    }
  }
};

```

---

### File: src\api\gemini.js

```javascript
/**
 * @file gemini.js
 * @desc Utility để kết nối với Google Gemini API.
 *       Hỗ trợ cả text-only và multimodal (image/pdf).
 */
import { TokenTracker } from '../utils/tokenTracker.js';

/**
 * Gọi API Gemini để xử lý nội dung.
 * @param {Object} options - Các tùy chọn gọi API
 * @param {string} options.apiKey - Gemini API Key
 * @param {string} options.model - Tên mô hình (ví dụ: gemini-2.0-flash)
 * @param {string} options.systemInstruction - Chỉ dẫn hệ thống (System Prompt)
 * @param {string} options.userText - Văn bản người dùng gửi
 * @param {Object} [options.fileData] - Dữ liệu file (nếu có multimodal)
 * @param {string} options.fileData.mimeType - Mime type của file
 * @param {string} options.fileData.base64 - Chuỗi base64 của file
 * @returns {Promise<Object>} JSON response từ AI
 */
export async function callGemini({ apiKey, model, systemInstruction, userText, fileData, filesData }) {
    return new Promise((resolve, reject) => {
        if (!apiKey) return reject("Vui lòng nhập API Key Gemini trong Cài đặt.");

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const requestData = {
            system_instruction: {
                parts: [{ text: systemInstruction }]
            },
            contents: [
                {
                    parts: [
                        { text: userText }
                    ]
                }
            ],
            generation_config: {
                response_mime_type: "application/json",
            }
        };

        // Nếu có file data (multimodal cũ)
        if (fileData && fileData.base64) {
            requestData.contents[0].parts.push({
                inline_data: {
                    mime_type: fileData.mimeType,
                    data: fileData.base64
                }
            });
        }

        // Hàng đợi nhiều hình ảnh / file (multimodal multi-parts)
        if (filesData && Array.isArray(filesData)) {
            filesData.forEach(file => {
                if (file.base64) {
                    requestData.contents[0].parts.push({
                        inline_data: {
                            mime_type: file.mimeType,
                            data: file.base64
                        }
                    });
                }
            });
        }

        const handleResponse = (textResponse) => {
            if (textResponse) {
                try {
                    // Xóa block markdown code nếu AI vô tình trả về
                    let cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
                    resolve(JSON.parse(cleanJson));
                } catch (e) {
                    console.error("Lỗi parse JSON từ Gemini", e, textResponse);
                    reject("AI trả về kết quả không đúng cấu hình JSON.");
                }
            } else {
                reject("AI không trả về kết quả hợp lệ.");
            }
        };

        // Ưu tiên GM_xmlhttpRequest để bypass CORS trong Userscript
        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: "POST",
                url: apiUrl,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(requestData),
                timeout: 30000,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const resObj = JSON.parse(response.responseText);
                            const textResponse = resObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                            if (resObj?.usageMetadata?.totalTokenCount) {
                                TokenTracker.addUsage(resObj.usageMetadata.totalTokenCount);
                            }
                            handleResponse(textResponse);
                        } catch (e) {
                            reject("Lỗi Parse kết quả từ Gemini API.");
                        }
                    } else {
                        reject(`API Gemini lỗi (${response.status}): ${response.responseText}`);
                    }
                },
                ontimeout: () => reject("Quá hạn thời gian gọi API (30s)"),
                onerror: (e) => reject("Lỗi kết nối đến Google Gemini API.")
            });
        } else {
            // Môi trường dev (Vite dev server)
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
                .then(r => r.json())
                .then(resObj => {
                    if (resObj.error) return reject(resObj.error.message);
                    const textResponse = resObj?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (resObj?.usageMetadata?.totalTokenCount) {
                        TokenTracker.addUsage(resObj.usageMetadata.totalTokenCount);
                    }
                    handleResponse(textResponse);
                })
                .catch(e => reject(e.message));
        }
    });
}

/**
 * Kiểm tra kết nối tới Gemini API.
 */
export async function testGeminiConnection(apiKey, model) {
    if (!apiKey) throw new Error("Vui lòng nhập API Key.");

    const requestData = {
        contents: [{ parts: [{ text: "Ping" }] }],
        generation_config: {
            max_output_tokens: 5,
            response_mime_type: "text/plain"
        }
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
        const parseError = (responseText) => {
            try {
                const errObj = JSON.parse(responseText);
                return errObj.error?.message || responseText;
            } catch (e) { return responseText; }
        };

        if (typeof GM_xmlhttpRequest !== 'undefined') {
            GM_xmlhttpRequest({
                method: "POST",
                url: apiUrl,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify(requestData),
                timeout: 10000,
                onload: (response) => {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(true);
                    } else {
                        const msg = parseError(response.responseText);
                        reject(`API Error ${response.status}: ${msg}`);
                    }
                },
                onerror: (e) => reject("Lỗi kết nối mạng hoặc CORS."),
                ontimeout: () => reject("Hết thời gian chờ (10s).")
            });
        } else {
            fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
                .then(async r => {
                    if (r.ok) return resolve(true);
                    const txt = await r.text();
                    reject(`API Error ${r.status}: ${parseError(txt)}`);
                })
                .catch(e => reject(e.message));
        }
    });
}

```

---

### File: src\api\mstService.js

```javascript
/**
 * @file mstService.js
 * @desc Dịch vụ tra cứu mã số thuế doanh nghiệp qua API VietQR.
 */

export const mstService = {
    /**
     * Tra cứu thông tin doanh nghiệp theo MST.
     * @param {string} mst - Mã số thuế cần tra cứu.
     * @returns {Promise<{name: string, address: string, representative: string, status: string}|null>}
     */
    async lookupMST(mst) {
        if (!mst || mst.length < 10) return null;

        const url = `https://api.vietqr.io/v2/business/${mst}`;
        
        try {
            const response = await fetch(url);
            const result = await response.json();

            if (result.code === '00' && result.data) {
                const { name, address, representative, status } = result.data;
                return {
                    name: name || '',
                    address: address || '',
                    representative: representative || '',
                    status: status || ''
                };
            }
            return null;
        } catch (error) {
            console.error('[MST Service] Error fetching MST:', error);
            return null;
        }
    }
};

```

---

### File: src\api\remoteConfig.js

```javascript
import { FirebaseService } from './firebaseService.js';
import { DEFAULT_LABELS, APP_VERSION } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

const KEY_REMOTE_LABELS = 'vnpt_remote_labels';
const KEY_LAST_FETCH = 'vnpt_remote_last_fetch';
const KEY_REMOTE_INFO = 'vnpt_remote_info';
const FETCH_INTERVAL = 3600000; // 1 hour

// URL trỏ tới file version.config.json trên repo của bạn
const UPDATE_METADATA_URL = 'https://raw.githubusercontent.com/tranchien2000/vnpt-tampermonkey-vite/main/version.json';

export const RemoteConfig = {
  activeLabels: { ...DEFAULT_LABELS },
  info: {
    latestVersion: APP_VERSION,
    updateUrl: '',
    message: ''
  },

  /**
   * Khởi tạo và đồng bộ labels từ Cloud & GitHub
   */
  async init() {
    // 1. Load từ cache trước
    const cached = Storage.get(KEY_REMOTE_LABELS);
    if (cached) {
      this.activeLabels = { ...DEFAULT_LABELS, ...cached };
    }

    const cachedInfo = Storage.get(KEY_REMOTE_INFO);
    if (cachedInfo) {
      this.info = { ...this.info, ...cachedInfo };
    }

    // 2. Kiểm tra xem có cần fetch mới không
    const lastFetch = Storage.get(KEY_LAST_FETCH) || 0;
    if (Date.now() - lastFetch > FETCH_INTERVAL) {
      await this.refresh();
    }
  },

  /**
   * Fetch bản mới nhất từ Firebase (Selectors) & GitHub (Version)
   */
  async refresh() {
    try {
      // 1. Lấy Selectors từ Firebase (đã có sẵn)
      const config = await FirebaseService.getRemoteConfigs();
      if (config && config.selectors) {
        this.activeLabels = { ...DEFAULT_LABELS, ...config.selectors };
        Storage.set(KEY_REMOTE_LABELS, config.selectors);
      }

      // 2. Lấy Thông tin Update từ GitHub
      // Dùng GM_xmlhttpRequest nếu có, hoặc fetch thông thường
      const response = await fetch(`${UPDATE_METADATA_URL}?t=${Date.now()}`);
      if (response.ok) {
        const githubInfo = await response.json();
        if (githubInfo) {
          this.info = {
            latestVersion: githubInfo.version || APP_VERSION,
            updateUrl: githubInfo.updateUrl || '',
            message: githubInfo.message || ''
          };
          Storage.set(KEY_REMOTE_INFO, this.info);
          console.log("[RemoteConfig] Update info fetched from GitHub:", this.info.latestVersion);
        }
      }

      Storage.set(KEY_LAST_FETCH, Date.now());
    } catch (err) {
      console.error("[RemoteConfig] Failed to fetch remote config:", err);
    }
  },

  /**
   * Lấy danh sách labels hiện hành (Gộp Local + Cloud)
   */
  getLabels() {
    return this.activeLabels;
  },

  /**
   * Kiểm tra xem có bản cập nhật mới không
   */
  hasUpdate() {
    try {
        const v1 = APP_VERSION.split('.').map(Number);
        const v2 = this.info.latestVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            if (num2 > num1) return true;
            if (num2 < num1) return false;
        }
    } catch (e) {}
    return false;
  }
};

```

---

### File: src\api\storage\firebaseAdapter.js

```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import app from "../firebaseConfig.js";

const storage = getStorage(app);

export const firebaseAdapter = {
  /**
   * Upload data to Firebase Storage
   * @param {File|Blob|ArrayBuffer} data 
   * @param {object} options 
   * @param {string} options.path - Destination path in storage
   * @param {string} options.contentType - Optional content type
   * @returns {Promise<string>} Download URL
   */
  async upload(data, options = {}) {
    if (!options.path) throw new Error("Path is required for Firebase Storage upload");
    
    const storageRef = ref(storage, options.path);
    const metadata = options.contentType ? { contentType: options.contentType } : {};
    
    await uploadBytes(storageRef, data, metadata);
    return await getDownloadURL(storageRef);
  },

  /**
   * Download data from Firebase Storage
   * @param {string} source - The path or URL of the file
   * @param {string} type - 'blob', 'arraybuffer', etc (handled via fetch)
   * @returns {Promise<any>}
   */
  async download(source, type = 'blob') {
    let url = source;
    if (!source.startsWith('http')) {
      const storageRef = ref(storage, source);
      url = await getDownloadURL(storageRef);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download from ${url}`);

    switch (type.toLowerCase()) {
      case 'blob': return await response.blob();
      case 'arraybuffer': return await response.arrayBuffer();
      case 'text': return await response.text();
      case 'json': return await response.json();
      default: return await response.blob();
    }
  }
};

```

---

### File: src\api\storage\idb.js

```javascript
// src/api/storage/idb.js
const DB_NAME = 'vnpt_templates_db';
const STORE_NAME = 'buffers';

let dbInstance = null;

function getDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        request.onsuccess = e => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function idbSave(key, arrayBuffer) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(arrayBuffer, key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

export async function idbLoad(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result); // result is arrayBuffer
        req.onerror = () => reject(req.error);
    });
}

export async function idbDelete(key) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

```

---

### File: src\api\storage\index.js

```javascript
import { localAdapter } from './localAdapter.js';
import { firebaseAdapter } from './firebaseAdapter.js';

const adapters = {
  local: localAdapter,
  firebase: firebaseAdapter
};

export const storage = {
  /**
   * Get adapter by name
   * @param {string} type 
   * @returns {object}
   */
  getAdapter(type) {
    const adapter = adapters[type];
    if (!adapter) throw new Error(`Storage adapter not found: ${type}`);
    return adapter;
  },

  /**
   * Unified upload
   * @param {string} type - 'local' or 'firebase'
   * @param {any} data 
   * @param {object} options 
   */
  async upload(type, data, options = {}) {
    return await this.getAdapter(type).upload(data, options);
  },

  /**
   * Unified download
   * @param {string} type - 'local' or 'firebase'
   * @param {any} source 
   * @param {object} options 
   */
  async download(type, source, options = {}) {
    return await this.getAdapter(type).download(source, options.type || 'arraybuffer');
  }
};

```

---

### File: src\api\storage\localAdapter.js

```javascript
/**
 * Local storage adapter using FileReader
 */
export const localAdapter = {
  /**
   * Read a file and return its content in the specified format
   * @param {File|Blob} file 
   * @param {string} type - 'arraybuffer', 'base64', 'text', 'dataurl'
   * @returns {Promise<any>}
   */
  download(file, type = 'arraybuffer') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        let result = e.target.result;
        if (type === 'base64' && typeof result === 'string') {
          // Remove data URL header if present
          result = result.split(',')[1] || result;
        }
        resolve(result);
      };
      
      reader.onerror = (err) => reject(err);

      switch (type.toLowerCase()) {
        case 'arraybuffer':
          reader.readAsArrayBuffer(file);
          break;
        case 'base64':
        case 'dataurl':
          reader.readAsDataURL(file);
          break;
        case 'text':
          reader.readAsText(file);
          break;
        default:
          reject(new Error(`Unsupported read type: ${type}`));
      }
    });
  },

  /**
   * For local, upload just means reading the file to a serializable format
   * @param {File} file 
   * @returns {Promise<string>} base64 data
   */
  async upload(file) {
    return this.download(file, 'base64');
  }
};

```

---


## Thư mục: src/utils

### File: src\utils\addressLearning.js

```javascript
/**
 * @file addressLearning.js
 * @desc Tiện ích quản lý việc "học" bóc tách địa chỉ từ dữ liệu thực tế.
 */
import { Storage } from './storage.js';
import { SK_ADDRESS_LEARNING } from '../core/constants.js';

/**
 * Chuẩn hóa địa chỉ để tăng tỷ lệ khớp (loại bỏ khoảng trắng thừa, lowercase, xóa dấu kết thúc)
 * @param {string} address 
 * @returns {string}
 */
function normalizeForMatch(address) {
    if (!address) return '';
    return address.toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[.,\s]+$/, ''); // Xóa dấu phẩy, chấm, khoảng trắng ở cuối
}

export const AddressLearning = {
    /**
     * Lưu kết quả học được từ người dùng
     * @param {string} fullAddress - Địa chỉ gốc ban đầu
     * @param {string} correctedStreet - Kết quả bóc tách phần đường mà người dùng đã sửa
     */
    saveLearning(fullAddress, correctedStreet) {
        if (!fullAddress || !correctedStreet) return;

        const normalizedFull = normalizeForMatch(fullAddress);
        const normalizedStreet = correctedStreet.trim();

        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        
        // Nếu đã khớp từ trước và giống hệt giá trị đang định lưu thì bỏ qua
        if (data[normalizedFull] === normalizedStreet) return;

        data[normalizedFull] = normalizedStreet;
        Storage.setDebounced(SK_ADDRESS_LEARNING, data, 1000);
        console.debug(`[AddressLearning] Learned: "${normalizedFull}" -> "${normalizedStreet}"`);
    },

    /**
     * Lấy giá trị đã học được cho địa chỉ cụ thể
     * @param {string} fullAddress 
     * @returns {string|null}
     */
    getLearnedStreet(fullAddress) {
        if (!fullAddress) return null;

        const normalized = normalizeForMatch(fullAddress);
        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        
        return data[normalized] || null;
    },

    /**
     * Xóa dữ liệu học của một địa chỉ cụ thể (nếu cần)
     * @param {string} fullAddress 
     */
    forgetLearning(fullAddress) {
        if (!fullAddress) return;
        const normalized = normalizeForMatch(fullAddress);
        const data = Storage.get(SK_ADDRESS_LEARNING, {});
        if (data[normalized]) {
            delete data[normalized];
            Storage.set(SK_ADDRESS_LEARNING, data);
        }
    }
};

```

---

### File: src\utils\backupHelper.js

```javascript
/**
 * @file backupHelper.js
 * @desc Hỗ trợ xuất/nhập toàn bộ cấu hình dự án ra file JSON.
 */
import { 
    LOCAL_KEY_FIELDS, LOCAL_KEY_DEFAULT_FIELDS, LOCAL_KEY_AUTO_BACKUP,
    SK_DATA_DEF, SK_DATA_CUS, SK_DATA_SYNC, 
    SK_TAX, SK_CALC_MAP, SK_TEMPLATES 
} from '../core/constants.js';
import { Storage } from './storage.js';
import { showToast } from '../ui/toast.js';

/**
 * Trải phẳng dữ liệu: Biến các key gộp "A, B" thành các key riêng lẻ "A", "B".
 * @param {Object} obj 
 * @returns {Object}
 */
function flattenData(obj) {
    if (!obj) return obj;
    const result = {};
    Object.keys(obj).forEach(key => {
        const val = obj[key];
        const parts = key.split(',').map(s => s.trim()).filter(s => s);
        parts.forEach(p => {
            // Nếu giá trị là object (label, value), giữ nguyên hoặc chỉ lấy value tùy nhu cầu
            // Ở đây giữ nguyên object để đảm bảo cấu hình đầy đủ
            result[p] = val;
        });
    });
    return result;
}

/**
 * Xuất toàn bộ dữ liệu ra file JSON.
 * @param {string} customFileName - Tên file tùy chỉnh (không bắt buộc)
 */
export function exportFullBackup(customFileName = '') {
    const data = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        backup: {
            fields: Storage.get(LOCAL_KEY_FIELDS),
            defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS),
            dataDefault: flattenData(Storage.get(SK_DATA_DEF)),
            dataCustom: flattenData(Storage.get(SK_DATA_CUS)),
            dataSync: Storage.get(SK_DATA_SYNC),
            taxRate: Storage.get(SK_TAX),
            calcMap: Storage.get(SK_CALC_MAP),
            templates: Storage.get(SK_TEMPLATES)
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    let fileName = customFileName;
    if (!fileName) {
        fileName = `vnpt_full_backup_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
    } else {
        // Đảm bảo có đuôi .json
        if (!fileName.toLowerCase().endsWith('.json')) fileName += '.json';
    }

    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`✅ Đã xuất file: ${fileName}`);
}

/**
 * Nhập dữ liệu từ file JSON.
 * @param {File} file 
 * @returns {Promise<boolean>}
 */
export async function importFullBackup(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.backup) throw new Error("File không đúng định dạng backup.");

                const b = data.backup;
                if (b.fields) Storage.set(LOCAL_KEY_FIELDS, b.fields);
                if (b.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, b.defaultFields);
                if (b.dataDefault) Storage.set(SK_DATA_DEF, b.dataDefault);
                if (b.dataCustom) Storage.set(SK_DATA_CUS, b.dataCustom);
                if (b.dataSync) Storage.set(SK_DATA_SYNC, b.dataSync);
                if (b.taxRate) Storage.set(SK_TAX, b.taxRate);
                if (b.calcMap) Storage.set(SK_CALC_MAP, b.calcMap);
                if (b.templates) Storage.set(SK_TEMPLATES, b.templates);

                showToast("✅ Đã nhập dữ liệu thành công! Vui lòng tải lại trang hoặc widget.", "#1e8e3e");
                resolve(true);
            } catch (err) {
                showToast("❌ Lỗi: File sao lưu không hợp lệ.", "#ff5252");
                resolve(false);
            }
        };
        reader.readAsText(file);
    });
}

/**
 * Tạo bản sao lưu nội bộ vào localStorage (Lưu 10 bản gần nhất).
 * @param {string} name - Tên định danh bản sao lưu
 */
export function createInternalBackup(name = '') {
    let backups = Storage.get(LOCAL_KEY_AUTO_BACKUP);
    if (!Array.isArray(backups)) backups = [];
    
    const newEntry = {
        id: Date.now().toString(),
        name: name || `Bản sao lưu ${new Date().toLocaleString()}`,
        timestamp: new Date().toISOString(),
        data: {
            fields: Storage.get(LOCAL_KEY_FIELDS),
            defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS)
        }
    };

    // Đưa lên đầu mảng
    backups.unshift(newEntry);
    
    // Giới hạn 20 bản theo yêu cầu người dùng
    const limitedBackups = backups.slice(0, 20);
    
    Storage.set(LOCAL_KEY_AUTO_BACKUP, limitedBackups);
    console.log(`✅ Field backup created: ${newEntry.name}`);
}

/**
 * Lấy tên gợi ý cho bản sao lưu: [Tên Đại Diện] - [Số HĐ]
 * Thêm helper này vào đây để dùng chung.
 */
export function generateBackupName() {
    const data = Storage.get(LOCAL_KEY_FIELDS) || {};
    const name = data['tenDaiDienn']?.value || '';
    const contract = data['soHopDong']?.value || '';
    if (!name && !contract) return `Quét dữ liệu - ${new Date().toLocaleTimeString()}`;
    return `${name} - ${contract}`;
}

/**
 * Lấy danh sách các bản sao lưu nội bộ.
 * @returns {Array}
 */
export function getInternalBackups() {
    const backups = Storage.get(LOCAL_KEY_AUTO_BACKUP);
    if (backups && !Array.isArray(backups)) {
        // Nếu là dữ liệu cũ kiểu object, xóa đi để khởi tạo lại mảng
        Storage.remove(LOCAL_KEY_AUTO_BACKUP);
        return [];
    }
    return Array.isArray(backups) ? backups : [];
}

/**
 * Khôi phục dữ liệu từ một bản sao lưu nội bộ cụ thể.
 * @param {string} backupId - ID của bản sao lưu cần khôi phục
 * @returns {boolean}
 */
export function restoreInternalBackup(backupId) {
    const backups = getInternalBackups();
    const entry = backups.find(b => b.id === backupId);
    
    if (!entry || !entry.data) {
        showToast("⚠️ Không tìm thấy bản sao lưu hợp lệ!", "#ffc107");
        return false;
    }

    const data = entry.data;
    if (data.fields) Storage.set(LOCAL_KEY_FIELDS, data.fields);
    if (data.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, data.defaultFields);

    showToast(`✅ Đã khôi phục các trường: ${entry.name}`, "#1e8e3e");
    return true;
}

/**
 * Xoá một bản sao lưu nội bộ cụ thể.
 * @param {string} backupId 
 * @returns {boolean}
 */
export function deleteInternalBackup(backupId) {
    let backups = getInternalBackups();
    const originalLength = backups.length;
    backups = backups.filter(b => b.id !== backupId);
    
    if (backups.length !== originalLength) {
        Storage.set(LOCAL_KEY_AUTO_BACKUP, backups);
        return true;
    }
    return false;
}

```

---

### File: src\utils\bridgeStore.js

```javascript
/**
 * Cross-context storage bridge for mail->VNPT transfer.
 * - Tampermonkey: uses GM_setValue/GM_getValue (sync)
 * - Chrome extension: uses chrome.storage.local (async)
 */

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
}

export const BridgeStore = {
  /**
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    try {
      if (typeof GM_getValue !== 'undefined') {
        return GM_getValue(key, null);
      }
    } catch {
      // ignore and fallback
    }

    if (hasChromeStorage()) {
      const obj = await chrome.storage.local.get(key);
      return obj?.[key] ?? null;
    }

    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? raw : null;
    } catch {
      return null;
    }
  },

  /**
   * @param {string} key
   * @param {any} value
   * @returns {Promise<boolean>}
   */
  async set(key, value) {
    try {
      if (typeof GM_setValue !== 'undefined') {
        GM_setValue(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      }
    } catch {
      // ignore and fallback
    }

    if (hasChromeStorage()) {
      await chrome.storage.local.set({ [key]: value });
      return true;
    }

    try {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};


```

---

### File: src\utils\common.js

```javascript
/**
 * @file common.js
 * @desc Các hàm tiện ích dùng chung (debounce, v.v.)
 */

/**
 * Hàm chống rung (debounce)
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Hàm tạm dừng (sleep)
 * @param {number} ms 
 * @returns {Promise<void>}
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

```

---

### File: src\utils\crypto.js

```javascript
/**
 * @file crypto.js
 * @desc Cung cấp các hàm mã hóa/giải mã đơn giản để bảo vệ API Keys khi lưu trên Cloud.
 *       Sử dụng kết hợp ID máy (nếu có thể) hoặc một salt cố định.
 */

// Một key đơn giản để obfuscate dữ liệu (có thể cải tiến bằng cách lấy fingerprint trình duyệt)
const APP_SALT = "VNPT_PRO_SECRET_2026";

/**
 * Mã hóa chuỗi sang Base64 đã được biến đổi
 */
export function encrypt(text) {
    if (!text) return "";
    try {
        const xor = (str) => {
            return str.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ APP_SALT.charCodeAt(i % APP_SALT.length))
            ).join('');
        };
        return btoa(xor(text));
    } catch (e) {
        console.error("Encryption error:", e);
        return text;
    }
}

/**
 * Giải mã chuỗi
 */
export function decrypt(encoded) {
    if (!encoded) return "";
    try {
        const xor = (str) => {
            return str.split('').map((char, i) => 
                String.fromCharCode(char.charCodeAt(0) ^ APP_SALT.charCodeAt(i % APP_SALT.length))
            ).join('');
        };
        return xor(atob(encoded));
    } catch (e) {
        console.error("Decryption error:", e);
        return encoded;
    }
}

```

---

### File: src\utils\dateHelper.js

```javascript
/**
 * @file dateHelper.js
 * @desc Các hàm bổ trợ xử lý ngày tháng năm.
 */

export function getToday() {
    return new Date();
}

export function formatDay(d = new Date()) {
    return String(d.getDate()).padStart(2, '0');
}

export function formatMonth(d = new Date()) {
    return String(d.getMonth() + 1).padStart(2, '0');
}

export function formatYear(d = new Date()) {
    return String(d.getFullYear());
}

export function getVNPTDateStrings() {
    const d = new Date();
    return {
        ngay: formatDay(d),
        thang: formatMonth(d),
        nam: formatYear(d)
    };
}

```

---

### File: src\utils\domHelper.js

```javascript
import { findBestMatch, cleanProvinceName, parseAddressComponents } from './stringHelper.js';
import { sleep } from './common.js';

// ─── DOM Map ───
let FullDOMMap = {
    byId: new Map(),
    byName: new Map(),
    byPlaceholder: new Map(),
    byLabel: new Map(),
    allInputs: []
};

let LabelCache = [];
let lastLabelUpdate = 0;
let cachedAddressGroup = null; // Cache address group

/**
 * Xóa bộ nhớ đệm DOM khi trang thay đổi cấu trúc lớn.
 */
export function clearDOMCache() {
    FullDOMMap.byId.clear();
    FullDOMMap.byName.clear();
    FullDOMMap.byPlaceholder.clear();
    FullDOMMap.byLabel.clear();
    FullDOMMap.allInputs = [];
    cachedAddressGroup = null;
}

/**
 * Đánh dấu cache DOM map là đã lỗi thời.
 */
export function invalidateDOMMap() {
    lastMapBuild = 0;
}

/**
 * Cập nhật lại danh sách labels từ DOM.
 */
export function refreshLabelsCache() {
    LabelCache = Array.from(document.querySelectorAll('label, .label, .label-text, span.title, .form-label'));
    lastLabelUpdate = Date.now();
    return LabelCache;
}

let lastMapBuild = 0;
const MAP_BUILD_COOLDOWN = 3000; // 3 seconds cooldown

/**
 * Xây dựng bản đồ toàn bộ DOM để truy vấn nhanh O(1).
 * Nên gọi hàm này trước khi thực hiện Quét hàng loạt.
 * @param {boolean} force - Nếu true, bắt buộc xây dựng lại bất kể cooldown
 */
export function buildFullDOMMap(force = false) {
    const now = Date.now();
    // Nếu force=true hoặc lastMapBuild=0 (đã bị invalidate), ta sẽ build lại.
    // Nếu không, chỉ build nếu quá cooldown.
    if (!force && lastMapBuild !== 0 && now - lastMapBuild < MAP_BUILD_COOLDOWN && FullDOMMap.allInputs.length > 0) {
        return;
    }

    const start = performance.now();
    lastMapBuild = now;
    clearDOMCache();

    // 1. Lấy tất cả các control nhập liệu (Bao gồm ng-select2 của Angular)
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, ng-select2'));
    FullDOMMap.allInputs = inputs;

    inputs.forEach(el => {
        if (el.id) FullDOMMap.byId.set(el.id, el);
        if (el.name) FullDOMMap.byName.set(el.name, el);

        const placeholder = el.getAttribute('placeholder');
        if (placeholder) FullDOMMap.byPlaceholder.set(placeholder.trim(), el);

        const fcn = el.getAttribute('formcontrolname');
        if (fcn) FullDOMMap.byName.set(fcn, el);
    });

    // 2. Lấy và ánh xạ Label
    const labels = refreshLabelsCache();
    labels.forEach(lbl => {
        const text = lbl.innerText.trim();
        if (!text) return;

        let targetEl = null;
        if (lbl.htmlFor) {
            targetEl = document.getElementById(lbl.htmlFor);
        }

        if (!targetEl) {
            // Tìm trong phạm vi gần (cha hoặc anh em)
            let p = lbl.parentElement;
            let depth = 0;
            while (p && depth < 2) {
                targetEl = p.querySelector('input, textarea, select');
                if (targetEl) break;
                p = p.parentElement;
                depth++;
            }
        }

        if (targetEl) {
            FullDOMMap.byLabel.set(text, targetEl);
        }
    });

    const end = performance.now();
    const duration = end - start;
    if (duration > 10) {
        console.debug(`[DOM] Build map in ${duration.toFixed(2)}ms for ${inputs.length} inputs and ${labels.length} labels.`);
    }
}

export function triggerCustom(el) {
    if (!el) return;

    // 1. Gửi các sự kiện Native chuẩn (Bao gồm cả Bubbles)
    const eventOptions = { bubbles: true, cancelable: true, composed: true };
    el.dispatchEvent(new Event('focus', eventOptions));
    el.dispatchEvent(new Event('input', eventOptions));
    el.dispatchEvent(new Event('change', eventOptions));

    // 2. Xử lý đặc thù cho thẻ SELECT (Select2 / ng-select2)
    if (el.tagName === 'SELECT') {
        // Gửi event đặc thù của thư viện Select2
        el.dispatchEvent(new CustomEvent('select2:select', { ...eventOptions, detail: { data: { id: el.value } } }));

        // Tìm và báo hiệu cho component cha (Angular ng-select2)
        let parentComp = el.closest('ng-select2, .select2-container, .form-group');
        if (parentComp) {
            parentComp.dispatchEvent(new Event('change', eventOptions));
            parentComp.dispatchEvent(new Event('input', eventOptions));
        }

        // 3. jQuery Fallback (Nếu trang web dùng jQuery, Select2 cần jQuery để trigger phụ thuộc)
        try {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(el).trigger === 'function') {
                $(el).trigger('change');
                $(el).trigger('select2:select');
            }
        } catch (e) {
            // Trình duyệt có thể chặn nếu CSP gắt, bỏ qua
        }
    }

    el.dispatchEvent(new Event('blur', eventOptions));
}

/**
 * Làm nổi bật phần tử trên trang khi được tương tác.
 */
function highlightElement(el, type = 'success') {
    if (!el) return;
    const color = type === 'success' ? '#28a745' : '#dc3545';
    const originalTransition = el.style.transition;
    const originalOutline = el.style.outline;
    const originalBoxShadow = el.style.boxShadow;

    el.style.transition = 'all 0.3s ease';
    el.style.outline = `2px solid ${color}`;
    el.style.boxShadow = `0 0 10px ${color}`;

    setTimeout(() => {
        el.style.outline = originalOutline;
        el.style.boxShadow = originalBoxShadow;
        setTimeout(() => { el.style.transition = originalTransition; }, 300);
    }, 1000);
}

export function syncSetValue(el, value) {
    if (!el || value === undefined || value === null) return false;

    let isSuccess = false;
    const actualEl = el.tagName === 'NG-SELECT2' ? el.querySelector('select') || el : el;

    // --- Xử lý đặc biệt cho SELECT (Dropdown) ---
    if (el.tagName === 'SELECT' || el.tagName === 'NG-SELECT2') {
        const selectEl = actualEl;
        const options = Array.from(selectEl.options || []);
        const optionTexts = options.map(o => o.text.trim());

        let searchVal = value.toString().trim();

        // 1. Thử khớp chính xác Value (Trường hợp dữ liệu nguồn đã là mã ID)
        let foundOption = options.find(o => o.value === searchVal);

        // 2. Nếu không khớp value, thử logic bóc tách Tỉnh/Huyện/Xã từ địa chỉ Full
        if (!foundOption && searchVal.includes(',')) {
            const parsedData = parseAddressComponents(searchVal);
            const addressGroup = getVNPTAddressGroup();
            
            // Xác định xem element hiện tại đóng vai trò gì trong bộ địa chỉ
            const wrapperEl = el.closest('ng-select2') || el;
            const idAttr = (wrapperEl.id || wrapperEl.getAttribute('formcontrolname') || wrapperEl.name || '').toLowerCase();
            
            if (addressGroup && (wrapperEl === addressGroup.tinh || el === addressGroup.tinh)) {
                searchVal = parsedData.province;
            } else if (addressGroup && (wrapperEl === addressGroup.xaIdNew || el === addressGroup.xaIdNew)) {
                searchVal = parsedData.ward || parsedData.district;
            } else if (idAttr.includes('tinh')) {
                searchVal = parsedData.province;
            } else if (idAttr.includes('xa') || idAttr.includes('huyen') || idAttr.includes('quan')) {
                searchVal = parsedData.ward || parsedData.district;
            }
        }

        // --- Logic so khớp Fuzzy ---
        if (!foundOption) {
            let bestText = findBestMatch(searchVal, optionTexts, 0.75);
            if (!bestText) {
                const cleanName = cleanProvinceName(searchVal);
                const cleanOptions = optionTexts.map(t => cleanProvinceName(t));
                const matchedClean = findBestMatch(cleanName, cleanOptions, 0.65);
                if (matchedClean) bestText = optionTexts[cleanOptions.indexOf(matchedClean)];
            }

            if (bestText) foundOption = options.find(o => o.text.trim() === bestText);
        }

        if (foundOption) {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(selectEl).val === 'function') {
                $(selectEl).val(foundOption.value).trigger('change').trigger('change.select2').trigger('select2:select');
            }
            selectEl.value = foundOption.value;
            isSuccess = true;
        } else if (value && !value.toString().includes(',')) {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(selectEl).val === 'function') {
                $(selectEl).val(value).trigger('change').trigger('change.select2');
            }
            selectEl.value = value;
        }

        triggerCustom(selectEl);
        if (isSuccess) highlightElement(el, 'success');
        return isSuccess;

    } else {
        // --- Xử lý cho INPUT/TEXTAREA thông thường ---
        const addressGroup = getVNPTAddressGroup();
        const idLower = (el.id || el.name || el.getAttribute('formcontrolname') || '').toLowerCase();
        
        const isDuongField = (addressGroup && el === addressGroup.duong) || idLower.includes('duong') || idLower.includes('diachichitiet');

        if (isDuongField && typeof value === 'string' && value.includes(',')) {
            value = parseAddressComponents(value).street;
        }

        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        
        if (setter) {
            setter.call(el, value);
        } else {
            el.value = value;
        }
        isSuccess = true;
        highlightElement(el, 'success');
    }

    triggerCustom(el);
    return isSuccess;
}


/**
 * Đợi dropdown có options (AJAX load xong).
 */
async function waitForOptions(el, timeout = 3000) {
    const start = Date.now();
    let selectEl = el.tagName === 'NG-SELECT2' ? el.querySelector('select') || el : el;

    // Nếu không phải là một danh sách chọn, không cần phải đợi AJAX (input thường lấy text)
    if (selectEl.tagName !== 'SELECT' && selectEl.tagName !== 'NG-SELECT2') {
        console.debug(`[waitForOptions] Phần tử không phải SELECT/NG-SELECT2 (${selectEl.tagName}), bỏ qua bước chờ options.`);
        return true;
    }

    while (Date.now() - start < timeout) {
        // Cố gắng tìm lại nội dung mới nếu DOM bị load lại
        if (!document.contains(selectEl) && el.tagName === 'NG-SELECT2') {
            selectEl = el.querySelector('select') || el;
        }

        if (selectEl.options && selectEl.options.length > 1) {
            console.debug(`[waitForOptions] Đã tìm thấy ${selectEl.options.length} options sau ${Date.now() - start}ms.`);
            return true;
        }
        await sleep(200);
    }

    console.warn(`[waitForOptions] Timeout ${timeout}ms. Element "${el.id || el.name}" (${selectEl.tagName}) chỉ có ${selectEl.options ? selectEl.options.length : 0} options.`);
    return false;
}

// Tìm input theo id, name, hoặc nhãn thẻ label (Ưu tiên khớp chính xác)
export function findPageInput(name, labelText = null) {
    if (!name && !labelText) return null;

    // Auto build map if not initialized
    if (FullDOMMap.allInputs.length === 0) {
        buildFullDOMMap();
    }

    const resolveToInput = (el) => {
        if (!el) return null;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.getAttribute('contenteditable') === 'true') {
            return el;
        }
        return el.querySelector('input, textarea, select, [contenteditable="true"]');
    };

    // 1. THỬ KHỚP CHÍNH XÁC TUYỆT ĐỐI (O(1)) - KHÔNG FUZZY CHO ID/NAME
    if (name) {
        // Tra cứu trực tiếp từ Map (Exact Match)
        let el = FullDOMMap.byId.get(name) || FullDOMMap.byName.get(name) || FullDOMMap.byPlaceholder.get(name);
        
        if (el && document.contains(el)) return resolveToInput(el);

        // Thử tìm trực tiếp bằng querySelector (Exact Match)
        const selector = `[id="${name}"], [name="${name}"], [formcontrolname="${name}"], [placeholder="${name}"]`;
        const directEl = document.querySelector(selector);
        if (directEl) return resolveToInput(directEl);
    }

    // 2. KHỚP THEO LABEL (Chính xác trước)
    if (labelText) {
        let el = FullDOMMap.byLabel.get(labelText);
        if (el && document.contains(el)) return resolveToInput(el);
    }

    // 2.5. Alias fallback đặc thù cho VNPT
    if (name && (name.includes('xaIdNew') || name.includes('huyenId'))) {
        const addressGroup = getVNPTAddressGroup();
        if (addressGroup && addressGroup.xaIdNew) return resolveToInput(addressGroup.xaIdNew);
    }

    // 3. FUZZY MATCH TRÊN LABEL (Chỉ dùng làm phương án cuối cùng và với ngưỡng cực cao)
    const targetLabel = labelText || name;
    if (targetLabel && targetLabel.length > 5) { // Chỉ fuzzy với nhãn dài để tránh nhầm ID ngắn
        const labelTexts = Array.from(FullDOMMap.byLabel.keys());
        if (labelTexts.length === 0 && LabelCache.length > 0) {
            labelTexts.push(...LabelCache.map(l => l.innerText.trim()).filter(t => t.length > 0));
        }

        // Ngưỡng cực cao (0.95) để đảm bảo "Giấy uỷ quyền số" không bao giờ khớp nhầm với "Giấy uỷ quyền"
        const bestText = findBestMatch(targetLabel, labelTexts, 0.95);
        if (bestText) {
            return resolveToInput(FullDOMMap.byLabel.get(bestText));
        }
    }

    return null;
}

export function getInputByLabel(text) {
    return findPageInput(null, text);
}

export function setPageField(name, value, labelText = null) {
    const el = findPageInput(name, labelText);
    if (el) {
        syncSetValue(el, value);
        return true;
    }
    return false;
}

/**
 * Trả về thứ tự ưu tiên của trường (Tỉnh=1, Huyện=2, Xã=3, Khác=9).
 */
function getFieldRank(name, el) {
    const id = (name || el?.id || el?.getAttribute('formcontrolname') || '').toLowerCase();

    // Nếu là ID hoặc Name chứa từ khóa
    if (id.includes('tinh') || id.includes('province') || id.includes('city')) return 1;
    if (id.includes('xaIdNew') || id.includes('huyen') || id.includes('quan') || id.includes('district') || id.includes('xa') || id.includes('phuong') || id.includes('ward')) return 2;

    // Nếu không, thử tìm label
    const labelEl = el?.id ? document.querySelector(`label[for="${el.id}"]`) : null;
    const labelText = (labelEl?.innerText || '').toLowerCase();
    if (labelText.includes('tỉnh') || labelText.includes('thành phố')) return 1;
    if (labelText.includes('huyện') || labelText.includes('quận') || labelText.includes('xã') || labelText.includes('phường')) return 2;

    return 9;
}

/**
 * Đồng bộ danh sách các trường theo thứ tự ưu tiên (Tỉnh -> Xã/Huyện) và có độ trễ.
 * @param {Array<string>} names - Danh sách các IDs/Names
 * @param {string} value - Giá trị đổ vào
 */
/**
 * Đợi một phần tử xuất hiện trong DOM (Hỗ trợ lazy load của Angular).
 */
async function waitForElement(name, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        // Luôn force rebuild map vì DOM có thể đã thay đổi
        buildFullDOMMap(true);
        const el = findPageInput(name);
        if (el && document.contains(el)) return el;
        await sleep(500);
    }
    return null;
}

/**
 * Đồng bộ danh sách các trường theo thứ tự ưu tiên (Tỉnh -> Xã/Huyện) và có độ trễ.
 * @param {Array<string>} names - Danh sách các IDs/Names
 * @param {string} value - Giá trị đổ vào
 */
export async function setPageFieldsSequential(names, value) {
    if (!names || !names.length) return;

    // --- 1. TỰ ĐỘNG MỞ RỘNG DANH SÁCH TARGETS CHO ĐỊA CHỈ FULL ---
    const lowerNames = names.map(n => n.toLowerCase());
    const isAddressRow = lowerNames.some(n => n.includes('diachi') || n.includes('địa chỉ'));
    const isFullAddressValue = typeof value === 'string' && value.includes(',');

    if (isAddressRow && isFullAddressValue) {
        // Tự động thêm các field địa chỉ phổ biến nếu chưa có trong list nhưng có trên trang
        const autoTargets = [
            'tinhIdNew', 'diaChiTruSoTinhIdNew',
            'xaIdNew', 'diaChiTruSoXaIdNew',
            'duong', 'diaChiTruSoDuong'
        ];
        autoTargets.forEach(t => {
            if (!names.includes(t) && findPageInput(t)) names.push(t);
        });
    }

    // --- 2. PHÂN LOẠI & NHÓM THEO RANK ---
    const tasks = names.map(name => {
        const el = findPageInput(name);
        return { name, el, rank: getFieldRank(name, el) };
    });

    // Lấy danh sách Rank duy nhất hiện có và sắp xếp (1 -> 2 -> 9)
    const uniqueRanks = [...new Set(tasks.map(t => t.rank))].sort((a, b) => a - b);
    let lastRankSuccess = true;

    // --- 3. THỰC THI THEO TỪNG CỤM RANK ---
    for (const rank of uniqueRanks) {
        // Nếu địa chỉ tầng trên (Tỉnh/Huyện) thất bại hoàn toàn, không điền tầng dưới
        if (rank <= 2 && !lastRankSuccess) {
            console.warn(`[Sync Sequential] Bỏ qua Rank ${rank} do cấp trên thất bại.`);
            continue;
        }

        const groupTasks = tasks.filter(t => t.rank === rank);
        let groupAnySuccess = false;

        console.debug(`[Sync Sequential] Đang xử lý nhóm Rank ${rank} với ${groupTasks.length} fields.`);

        // Điền tất cả các trường trong cùng nhóm Rank (Đồng bộ đồng thời)
        for (const task of groupTasks) {
            let currentEl = findPageInput(task.name) || task.el;

            // Đợi element Rank 2 (Xã/Huyện) vì nó thường render trễ sau khi chọn Tỉnh
            if (!currentEl && rank === 2) {
                console.debug(`[Sync Sequential] Đợi element Xã/Huyện (${task.name})...`);
                currentEl = await waitForElement(task.name, 3500); // Giảm timeout xuống chút để nhanh hơn
            }

            if (currentEl) {
                // Kích hoạt AJAX Lazy Load cho Rank 2 dropdowns
                if (rank > 1 && rank <= 2) {
                    const actualSelect = currentEl.tagName === 'NG-SELECT2' ? (currentEl.querySelector('select') || currentEl) : currentEl;
                    if (actualSelect.tagName === 'SELECT' || actualSelect.tagName === 'NG-SELECT2') {
                        const clickTarget = currentEl.tagName === 'NG-SELECT2' ? (currentEl.querySelector('.select2-selection, .select2-choice') || currentEl) : currentEl;
                        
                        // Trick để Select2/Angular hiểu là đang click để load data
                        clickTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                        clickTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                        // Chờ đợi thông minh cho đến khi dropdown có data
                        await waitForOptions(actualSelect, 3000);
                        
                        // Đóng dropdown sau khi load xong để syncSetValue làm việc sạch sẽ
                        clickTarget.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
                    }
                }

                if (task.name.toLowerCase().includes('duong')) {
                    console.log(`[Sync Sequential] Đang nhập trường 'duong' (${task.name}) với giá trị: "${value}"`);
                }

                const success = syncSetValue(currentEl, value);
                if (success) groupAnySuccess = true;
                console.debug(`[Sync Sequential] Điền ${task.name}: ${success ? 'OK' : 'FAIL'}`);
            }
        }

        lastRankSuccess = groupAnySuccess;

        // TỐI ƯU: Chỉ nghỉ nếu cần AJAX trigger cấp tiếp theo, và nghỉ ngắn hơn nếu groupAnySuccess
        if (groupAnySuccess && rank < 9) {
            // Nếu là Tỉnh (Rank 1), chờ AJAX cho Huyện/Xã (Rank 2)
            // Nếu là Huyện/Xã (Rank 2), chờ AJAX cho các field phụ thuộc khác (nếu có)
            const waitTime = rank === 1 ? 600 : 300; 
            console.debug(`[Sync Sequential] Hoàn tất Rank ${rank}, nghỉ ${waitTime}ms chờ AJAX...`);
            await sleep(waitTime);
            buildFullDOMMap(true); // Cập nhật lại Map vì DOM có thể đã thay đổi sau AJAX
        }
    }
}

export function getVNPTAddressGroup() {
    if (cachedAddressGroup) return cachedAddressGroup;

    try {
        // 1. Tìm container chứa địa chỉ dựa trên Label (Tăng độ bền vững)
        const labels = Array.from(document.querySelectorAll('label, .label, span.title'));
        const addressLabel = labels.find(l => {
            const txt = l.innerText.toLowerCase();
            return (txt.includes('địa chỉ') || txt.includes('địa chỉ trụ sở')) && !txt.includes('email');
        });

        let targetRow = null;
        if (addressLabel) {
            // Thường label nằm trong .col rồi nằm trong .row
            targetRow = addressLabel.closest('.row.row-form') || addressLabel.closest('.row');
        }

        // Fallback về hàng thứ 3 nếu không tìm thấy nhãn (Cũ)
        if (!targetRow) {
            const mainRows = Array.from(document.querySelectorAll('form .row.row-form, .row.row-form'));
            targetRow = mainRows[2];
        }

        if (!targetRow) return null;

        // 2. Lấy 2 cột con của hàng địa chỉ
        const subCols = targetRow.querySelectorAll('.col-12.col-sm-6, .col-sm-6');
        if (subCols.length < 2) return null;

        const leftCol = subCols[0];  // Tỉnh
        const rightCol = subCols[1]; // Xã/Huyện, Đường

        const findDeep = (col, selector) => col.querySelector(selector);
        const controlsInRight = Array.from(rightCol.querySelectorAll('select, ng-select2, input'));

        const xaIdNewEl = findDeep(rightCol, '[formcontrolname*="xaIdNew" i], [id*="xaIdNew" i], [formcontrolname*="huyen" i], [id*="huyenId" i], [formcontrolname*="xa" i]');
        const duongEl = findDeep(rightCol, '[formcontrolname*="duong" i], [id*="duong" i]');
        const soNhaEl = findDeep(rightCol, '[formcontrolname*="soNha" i], [id*="sonha" i]');

        let fallbackDuong = null;
        if (!duongEl && controlsInRight.length > 0) {
            // Mặc định trường cuối cùng trong cột phải thường là Đường nếu không có ID đặc biệt
            fallbackDuong = (soNhaEl && controlsInRight[controlsInRight.length - 1] === soNhaEl) 
                ? controlsInRight[controlsInRight.length - 2] 
                : controlsInRight[controlsInRight.length - 1];
        }

        cachedAddressGroup = {
            tinh: findDeep(leftCol, '[formcontrolname*="tinhIdNew" i], [id*="tinhId" i]') || leftCol.querySelector('select, ng-select2'),
            xaIdNew: xaIdNewEl || controlsInRight[0],
            duong: duongEl || fallbackDuong
        };
        
        return cachedAddressGroup;
    } catch (e) {
        return null;
    }
}

```

---

### File: src\utils\fileHelper.js

```javascript
/**
 * @file fileHelper.js
 * @desc Các hàm tiện ích xử lý tệp tin: Chuyển đổi URL/Blob sang Base64 trong môi trường Tampermonkey.
 */

/**
 * Tải một file từ URL và chuyển sang Base64 dùng GM_xmlhttpRequest (để bypass CORS).
 * @param {string} url 
 * @param {string} fileName 
 * @returns {Promise<{base64: string, mimeType: string, name: string}>}
 */
export function downloadAsBase64(url, fileName) {
    return new Promise((resolve, reject) => {
        if (typeof GM_xmlhttpRequest === 'undefined') {
            reject(new Error("GM_xmlhttpRequest không khả dụng. Hãy cài đặt trên Tampermonkey."));
            return;
        }

        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            responseType: "arraybuffer",
            onload: function(response) {
                if (response.status === 200) {
                    const mimeType = response.responseHeaders.match(/content-type:\s*([^\s;]+)/i)?.[1] || 'application/octet-stream';
                    const base64 = arrayBufferToBase64(response.response);
                    resolve({
                        base64: base64,
                        mimeType: mimeType,
                        name: fileName
                    });
                } else {
                    reject(new Error("Lỗi tải tệp: " + response.status));
                }
            },
            onerror: function(err) {
                reject(err);
            }
        });
    });
}

/**
 * Helper: Chuyển ArrayBuffer sang Base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

```

---

### File: src\utils\localClassifier.js

```javascript
/**
 * @file localClassifier.js
 * @desc Logic bóc tách dữ liệu từ văn bản thô bằng Regex (không dùng AI).
 *       Tối ưu cho mẫu Giấy đăng ký doanh nghiệp và căn cước công dân.
 */

/**
 * Các hàm helper chuẩn hóa dữ liệu
 */
const normalize = {
    // Viết hoa toàn bộ và trim
    name: (s) => s ? s.trim().toUpperCase().replace(/\s+/g, ' ') : '',
    // Làm sạch MST (chỉ giữ số)
    mst: (s) => s ? s.replace(/[^\d]/g, '').trim() : '',
    // Chuẩn hóa ngày về dd/MM/yyyy
    date: (d, m, y) => `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`,
    // Làm sạch text chung
    text: (s) => s ? s.trim().replace(/\s+/g, ' ') : ''
};

/**
 * Tìm kiếm giá trị dựa trên danh sách các mẫu (Patterns).
 * @param {string} text 
 * @param {RegExp[]} patterns 
 * @returns {string|null}
 */
function findFirstMatch(text, patterns) {
    for (const regex of patterns) {
        const match = text.match(regex);
        if (match && match[1]) return match[1].trim();
    }
    return null;
}

/**
 * Phân loại văn bản thô dựa trên các mẫu Regex phổ biến.
 * @param {string} text - Nội dung văn bản thô cần phân loại.
 * @returns {Object} Đối tượng chứa các trường dữ liệu tìm thấy.
 */
export function classifyTextLocally(text) {
    if (!text) return {};

    const results = {};
    const cleanText = text.replace(/\r/g, ''); // Đồng nhất xuống dòng

    // --- 0. KIỂM TRA ĐỊNH DẠNG QR CCCD (ĐỊNH DẠNG ĐƯỜNG ỐNG '|') ---
    // Ví dụ CCCD QR: 001090123456|012345678|NGUYỄN VĂN A|01011990|Nam|Trần Hưng Đạo, Hoàn Kiếm, Hà Nội|15102021
    if (cleanText.includes('|')) {
        const parts = cleanText.split('|').map(p => p.trim());
        // Ít nhất phải có CCCD, CMND cũ, Họ tên, Ngày sinh, Giới tính, Địa chỉ, Ngày cấp
        if (parts.length >= 6) {
            results.cmnd = normalize.mst(parts[0]);

            // Xóa rác và chuẩn hóa họ tên
            results.tenDaiDienn = normalize.name(parts[2]);

            // Ngày sinh: 01011990 -> 01/01/1990
            const rawDob = parts[3];
            if (rawDob && rawDob.length === 8 && !rawDob.includes('/')) {
                results.ngaySinhCustomer = normalize.date(rawDob.slice(0, 2), rawDob.slice(2, 4), rawDob.slice(4));
            } else if (rawDob) {
                results.ngaySinhCustomer = rawDob;
            }

            // Địa chỉ (Thường trú)
            if (parts[5]) {
                results.diaChiCustomer = normalize.text(parts[5]);
            }

            // Ngày cấp: 15102021 -> 15/10/2021
            const rawIssue = parts[6];
            if (rawIssue && rawIssue.length === 8 && !rawIssue.includes('/')) {
                results.ngayCapCustomer = normalize.date(rawIssue.slice(0, 2), rawIssue.slice(2, 4), rawIssue.slice(4));
            } else if (rawIssue) {
                results.ngayCapCustomer = rawIssue;
            }

            // Mặc định nơi cấp với CCCD gắn chip hiện đại
            results.noiCap = "Cục Cảnh sát quản lý hành chính về trật tự xã hội";

            return results;
        }
    }

    // 1. Tên tổ chức/công ty (Ưu tiên tiếng Việt -> Tiếng Anh -> Viết tắt)
    const companyPatterns = [
        /(?:Tên công ty viết bằng tiếng Việt|Tên doanh nghiệp|Tên tổ chức|Doanh nghiệp|Công ty):?\s*([\s\S]+?)(?=\n|Tên công ty|Mã số|$)/i,
        /Tên công ty viết bằng tiếng nước ngoài:?\s*([\s\S]+?)(?=\n|Tên công ty|$)/i,
        /Tên công ty viết tắt:?\s*([\s\S]+?)(?=\n|Địa chỉ|$)/i
    ];
    const companyName = findFirstMatch(cleanText, companyPatterns);
    if (companyName) results.tenToChuc = normalize.text(companyName);

    // 2. Mã số doanh nghiệp / Mã số thuế
    const mstPatterns = [
        /(?:Mã số doanh nghiệp|Mã số thuế):?\s*([\d\s.]{10,16})/i,
        /MST:?\s*([\d\s.]{10,16})/i
    ];
    const mstRaw = findFirstMatch(cleanText, mstPatterns);
    if (mstRaw) results.soDkdn = normalize.mst(mstRaw);

    // 3. Người đại diện / Tên đại diện
    const dirmPatterns = [
        /(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name):?\s*([\s\S]+?)(?=\n|Chức danh|Chức vụ|Giới tính|Sinh ngày|Date of birth|$)/i,
        /Người đại diện:?\s*([\s\S]+?)(?=\n|Chức vụ|$)/i
    ];
    let repName = findFirstMatch(cleanText, dirmPatterns);
    if (repName) {
        // Loại bỏ nhãn nếu bị bám dính do regex lỏng (đặc biệt cho mẫu song ngữ CCCD)
        repName = repName.replace(/^(?:Họ và tên|Người đại diện theo pháp luật|Tên đại diện|Full name|[\/\s]*Full name):?\s*/i, '')
            .replace(/^\/\s*/, ''); // Xóa dấu gạch chéo dư thừa
        results.tenDaiDienn = normalize.name(repName);
    }

    // 4. Chức danh / Chức vụ
    const posPatterns = [
        /(?:Chức danh|Chức vụ):?\s*([\s\S]+?)(?=\n|Sinh ngày|Giới tính|Quốc tịch|$)/i
    ];
    const pos = findFirstMatch(cleanText, posPatterns);
    if (pos) results.chucVu = normalize.text(pos);

    // 5. Ngày cấp đăng ký kinh doanh
    const ngayCapDkMatch = cleanText.match(/(?:Đăng ký|Đảng kỷ|Cấp ngày|Ngày cấp) (?:lần đầu|thay đổi):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
    if (ngayCapDkMatch) {
        results.ngayCapSoDkdnCustomer = normalize.date(ngayCapDkMatch[1], ngayCapDkMatch[2], ngayCapDkMatch[3]);
    }

    // 6. Số điện thoại
    const sdtPatterns = [
        /(?:Điện thoại|SĐT|Tel):?\s*([\d\s.-]{9,15})/i
    ];
    const sdt = findFirstMatch(cleanText, sdtPatterns);
    if (sdt) results.sdt = sdt.replace(/[\s.-]/g, '').trim();

    // 7. Email
    const emailPatterns = [
        /(?:Thư điện tử|Email):?\s*([^\s\n]+)/i
    ];
    const email = findFirstMatch(cleanText, emailPatterns);
    if (email) results.emailDaiDien = email.replace(/\(a\)/g, '@').trim();

    // 8. CMND / CCCD / Hộ chiếu
    const cccdPatterns = [
        /(?:Số định danh cá nhân|Số CMND|Số CCCD|Số Hộ chiếu|Số \/ No\.):?\s*(\d[\d\s]{8,13})/i,
        /(?:CMND|CCCD) số:?\s*(\d[\d\s]{8,13})/i
    ];
    const cccdRaw = findFirstMatch(cleanText, cccdPatterns);
    if (cccdRaw) results.cmnd = normalize.mst(cccdRaw);

    // 9. Nơi cấp (Ưu tiên nơi cấp CCCD)
    const noiCapPatterns = [
        /Nơi cấp:?\s*([\s\S]+?)(?=\n|Ngày cấp|$)/i,
        /Cục trưởng Cục Cảnh sát ([\s\S]+?)(?=\n|$)/i
    ];
    const noiCap = findFirstMatch(cleanText, noiCapPatterns);
    if (noiCap) results.noiCap = normalize.text(noiCap);

    // 10. Ngày cấp CMND/CCCD
    const ngayCapMatch = cleanText.match(/Ngày cấp:?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);
    if (ngayCapMatch) {
        results.ngayCapCustomer = normalize.date(ngayCapMatch[1], ngayCapMatch[2], ngayCapMatch[3]);
    }

    // 11. Ngày sinh
    const dobMatch = cleanText.match(/(?:Ngày, tháng, năm sinh|Sinh ngày|Ngày sinh):?\s*ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i);
    if (dobMatch) {
        results.ngaySinhCustomer = normalize.date(dobMatch[1], dobMatch[2], dobMatch[3]);
    } else {
        const dobSimpleMatch = cleanText.match(/(?:Ngày sinh|Sinh ngày):?\s*(\d{1,2})[\/\-. ](\d{1,2})[\/\-. ](\d{4})/i);
        if (dobSimpleMatch) {
            results.ngaySinhCustomer = normalize.date(dobSimpleMatch[1], dobSimpleMatch[2], dobSimpleMatch[3]);
        }
    }

    // 12. Địa chỉ
    const diaChiPatterns = [
        /(?:Địa chỉ trụ sở chính|Địa chỉ thường trú|Nơi thường trú|Địa chỉ):?\s*([\s\S]+?)(?=\n|Điện thoại|Email|SĐT|$)/i
    ];
    const diaChi = findFirstMatch(cleanText, diaChiPatterns);
    if (diaChi) results.diaChiCustomer = normalize.text(diaChi);

    return results;
}

```

---

### File: src\utils\logger.js

```javascript
export const logger = {
  info: (...args) => console.log('[Tampermonkey Script] INFO:', ...args),
  error: (...args) => console.error('[Tampermonkey Script] ERROR:', ...args),
  warn: (...args) => console.warn('[Tampermonkey Script] WARN:', ...args),
  debug: (...args) => console.debug('[Tampermonkey Script] DEBUG:', ...args)
};

```

---

### File: src\utils\migrationHelper.js

```javascript
import { Storage } from './storage.js';
import { SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS, DEFAULT_LABELS } from '../core/constants.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { logger } from './logger.js';

/**
 * @desc Đồng bộ cấu hình từ mã nguồn vào phân vùng lưu trữ LocalStorage.
 * Nếu đang ở DEV mode -> ghi đè cả value (Dễ debug).
 * Nếu không phải DEV mode -> chỉ Smart Merge (chèn key mới chưa tồn tại).
 */
export function initStorageMerge() {
    let devMode = false;
    try {
        devMode = import.meta.env.DEV;
    } catch(e) {
        devMode = false;
    }

    if (devMode) {
        logger.info('[Migration] Dev mode active - Syncing configurations...');
    }

    // 1. Merge SK_DATA_DEF (AutoFill Default Data)
    let currentDataDef = Storage.get(SK_DATA_DEF);
    if (currentDataDef) {
        let isModified = false;
        Object.keys(DEFAULT_DATA).forEach(key => {
            const hardCodeVal = DEFAULT_DATA[key];
            if (!(key in currentDataDef)) {
                // Key mới hoàn toàn -> Gắn vào
                currentDataDef[key] = hardCodeVal;
                isModified = true;
            } else if (devMode) {
                // Đang Code Dev -> Bắt buộc overwrite value cũ trong Store theo mã nguồn mới nhất
                // Note: hardCodeVal có thể là string hoặc Object { label, value }
                
                const cVal = currentDataDef[key];
                const hVal_isObj = (hardCodeVal && typeof hardCodeVal === 'object');
                const cVal_isObj = (cVal && typeof cVal === 'object');
                
                let valHasChanged = false;
                if (!hVal_isObj && !cVal_isObj) {
                    valHasChanged = (cVal !== hardCodeVal);
                } else if (hVal_isObj && cVal_isObj) {
                    valHasChanged = (cVal.value !== hardCodeVal.value || cVal.label !== hardCodeVal.label);
                } else {
                    valHasChanged = true;
                }
                
                if (valHasChanged) {
                    currentDataDef[key] = hardCodeVal;
                    isModified = true;
                }
            }
        });
        if (isModified) {
            Storage.set(SK_DATA_DEF, currentDataDef);
        }
    }

    // 2. Merge LOCAL_KEY_DEFAULT_FIELDS (VNPT Widget Form Data overrides cho Mặc Định)
    let currentFieldsDef = Storage.get(LOCAL_KEY_DEFAULT_FIELDS);
    if (currentFieldsDef) {
        let isModified = false;
        Object.keys(DEFAULT_DATA).forEach(key => {
            const item = DEFAULT_DATA[key];
            const hardCodeVal = (item && typeof item === 'object') ? item.value : item;
            const hardCodeLbl = (item && typeof item === 'object') ? item.label : (DEFAULT_LABELS[key] || '');

            if (!(key in currentFieldsDef)) {
                currentFieldsDef[key] = { label: hardCodeLbl, value: hardCodeVal, sync: '' };
                isModified = true;
            } else if (devMode) {
                const cField = currentFieldsDef[key];
                if (cField.value !== hardCodeVal || cField.label !== hardCodeLbl) {
                    currentFieldsDef[key] = { label: hardCodeLbl, value: hardCodeVal, sync: cField.sync || '' };
                    isModified = true;
                }
            }
        });
        if (isModified) {
            Storage.setDebounced(LOCAL_KEY_DEFAULT_FIELDS, currentFieldsDef, 0); // Lưu ngay lập tức
        }
    }
}

```

---

### File: src\utils\numberHelper.js

```javascript
// src/utils/numberHelper.js

export function formatNum(n) { 
    return n.toLocaleString('en-US'); 
}

export function parseNum(s) { 
    return Number(String(s).replace(/[^\d]/g, '')) || 0; 
}

export function capFirst(s) { 
    return s.charAt(0).toUpperCase() + s.slice(1); 
}

const ONES = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

function read3(n) {
    let h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10, s = '';
    if (h > 0) { 
        s += ONES[h] + ' trăm '; 
        if (t === 0 && u > 0) s += 'lẻ '; 
    }
    if (t > 1) { 
        s += ONES[t] + ' mươi '; 
        if (u === 1) s += 'mốt'; 
        else if (u === 5) s += 'lăm'; 
        else if (u > 0) s += ONES[u]; 
    } else if (t === 1) { 
        s += 'mười '; 
        if (u === 5) s += 'lăm'; 
        else if (u > 0) s += ONES[u]; 
    } else if (u > 0) { 
        if (h > 0) s += 'lẻ '; 
        s += ONES[u]; 
    }
    return s.trim();
}

export function numToVN(n) {
    if (n === 0) return 'không';
    const units = ['', 'nghìn', 'triệu', 'tỷ'];
    let s = '', i = 0;
    while (n > 0) { 
        const c = n % 1000; 
        if (c > 0) s = read3(c) + ' ' + units[i] + ' ' + s; 
        n = Math.floor(n / 1000); 
        i++; 
    }
    return s.trim();
}

```

---

### File: src\utils\qrHelper.js

```javascript
import jsQR from 'jsqr';

/**
 * Đọc ảnh từ File và dùng Canvas API để lấy ImageData, sau đó đẩy cho jsQR.
 * @param {File} file - File ảnh
 * @returns {Promise<string|null>} - Chuỗi decode được từ QR, hoặc null nếu không có/không tìm thấy
 */
export async function extractQRCodeFromImage(file) {
    if (!file || !file.type.startsWith('image/')) return null;

    try {
        const bmp = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(bmp, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // jsQR(data, width, height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert", // Có thể thử "attemptBoth" nếu cần quét các mã bị đảo màu âm bản
        });
        
        if (code && code.data) {
            return code.data;
        }
        return null;
    } catch (e) {
        console.error("[VNPT] Lỗi đọc QR Code nội bộ:", e);
        return null;
    }
}

/**
 * Bóc tách chuỗi đọc được từ CCCD Việt Nam.
 * Cấu trúc: 12_so_CCCD|9_so_CMND_cu|HO_TEN_CHU_IN_HOA|DDMMYYYY|Gioi_Tinh|Dia_Chi_Day_Du_Phan_Cach_Bang_Dau_Phay|DDMMYYYY_Ngay_Cap
 * 
 * @param {string} qrText Chuỗi văn bản phân cách bởi dấu `|`
 * @returns {Object|null}
 */
export function parseCCCD_QR(qrText) {
    if (!qrText || typeof qrText !== 'string') return null;
    const parts = qrText.split('|');
    
    // Một chuỗi QR CCCD thực tế của VN thường có ít nhất 6 hoặc 7 phần tử
    if (parts.length < 6) return null; 
    
    return {
        cccd: parts[0] || "",
        cmnd_old: parts[1] || "",
        name: parts[2] || "",
        dob: parts[3] || "",          // ddmmyyyy
        gender: parts[4] || "",       // Nam / Nữ
        address: parts[5] || "",      // Địa chỉ thường trú
        issue_date: parts[6] || ""    // ddmmyyyy
    };
}

```

---

### File: src\utils\storage.js

```javascript
/**
 * @file storage.js
 * @desc Tiện ích quản lý dữ liệu lưu trữ (Hỗ trợ localStorage và Tampermonkey GM_storage).
 *       Đã tối ưu: JSON tự động, xử lý lỗi, Debounce ghi đĩa và Cache nội bộ.
 */

const cache = new Map();
const debounceTimers = new Map();

export const Storage = {
    /**
     * Kiểm tra xem môi trường có hỗ trợ GM_setValue/getValue không
     */
    isGM: typeof GM_setValue !== 'undefined' && typeof GM_getValue !== 'undefined',

    /**
     * Lấy dữ liệu từ storage (có cache)
     * @param {string} key 
     * @param {*} defaultValue 
     * @returns {*}
     */
    get(key, defaultValue = null) {
        if (cache.has(key)) return cache.get(key);

        try {
            let data;
            if (this.isGM) {
                data = GM_getValue(key, null);
            } else {
                data = localStorage.getItem(key);
            }

            if (data === null || data === undefined) return defaultValue;
            
            let parsed;
            if (typeof data === 'string') {
                try {
                    parsed = JSON.parse(data);
                } catch (e) {
                    // Nếu không phải JSON (VD: string thuần túy từ bản cũ), trả về chính nó
                    parsed = data;
                }
            } else {
                parsed = data;
            }

            cache.set(key, parsed);
            return parsed;
        } catch (e) {
            console.warn(`[Storage] Không thể đọc key "${key}":`, e);
            return defaultValue;
        }
    },

    /**
     * Lưu dữ liệu vào storage ngay lập tức
     * @param {string} key 
     * @param {*} value 
     */
    set(key, value) {
        cache.set(key, value);
        try {
            const stringified = JSON.stringify(value);
            if (this.isGM) {
                GM_setValue(key, stringified);
            } else {
                localStorage.setItem(key, stringified);
            }
            return true;
        } catch (e) {
            console.error(`[Storage] Không thể ghi key "${key}":`, e);
            return false;
        }
    },

    /**
     * Lưu dữ liệu có delay (Debounce) để tránh ghi đĩa liên tục
     * @param {string} key 
     * @param {*} value 
     * @param {number} delay 
     */
    setDebounced(key, value, delay = 500) {
        cache.set(key, value); // Cập nhật cache ngay lập tức để UI mượt

        if (debounceTimers.has(key)) {
            clearTimeout(debounceTimers.get(key));
        }

        const timer = setTimeout(() => {
            this.set(key, value);
            debounceTimers.delete(key);
        }, delay);

        debounceTimers.set(key, timer);
    },

    /**
     * Xóa key khỏi storage
     * @param {string} key 
     */
    remove(key) {
        cache.delete(key);
        try {
            if (this.isGM) {
                GM_deleteValue(key);
            } else {
                localStorage.removeItem(key);
            }
        } catch (e) {
            console.error(`[Storage] Không thể xóa key "${key}":`, e);
        }
    },

    /**
     * Xóa toàn bộ cache (ép buộc đọc lại từ đĩa)
     */
    clearCache() {
        cache.clear();
    }
};

```

---

### File: src\utils\stringHelper.js

```javascript
/**
 * @file stringHelper.js
 * @desc Các hàm tiện ích xử lý chuỗi: Levenshtein distance, fuzzy matching.
 */

/**
 * Tính khoảng cách Levenshtein giữa 2 chuỗi.
 * @param {string} a 
 * @param {string} b 
 * @returns {number}
 */
export function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // thay thế
                    matrix[i][j - 1] + 1,     // chèn
                    matrix[i - 1][j] + 1      // xóa
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Tính độ tương đồng giữa 2 chuỗi (0 -> 1).
 * @param {string} s1 
 * @param {string} s2 
 * @returns {number}
 */
export function getSimilarity(s1, s2) {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - getLevenshteinDistance(longer, shorter)) / parseFloat(longerLength);
}

/**
 * Tìm chuỗi khớp nhất trong một danh sách.
 * @param {string} target 
 * @param {Array<string>} list 
 * @param {number} threshold 
 * @returns {string|null}
 */
export function findBestMatch(target, list, threshold = 0.7) {
    let bestMatch = null;
    let highestSimilarity = -1;

    const normalizedTarget = target.toLowerCase().trim();

    for (const item of list) {
        const normalizedItem = item.toLowerCase().trim();
        const similarity = getSimilarity(normalizedTarget, normalizedItem);
        if (similarity > highestSimilarity && similarity >= threshold) {
            highestSimilarity = similarity;
            bestMatch = item;
        }
    }

    return bestMatch;
}

/**
 * Viết hoa chữ cái đầu của mỗi từ (Dùng cho tên riêng).
 * @param {string} str 
 * @returns {string}
 */
export function capitalizeName(str) {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

/**
 * Chuẩn hóa số điện thoại (về dạng 0xxx...).
 * @param {string} phone 
 * @returns {string}
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';
    // Loại bỏ mọi ký tự không phải số
    let cleaned = phone.replace(/\D/g, '');
    // Nếu bắt đầu bằng 84, thay bằng 0
    if (cleaned.startsWith('84')) {
        cleaned = '0' + cleaned.slice(2);
    }
    return cleaned;
}

/**
 * Chuẩn hóa ngày tháng (Về dạng DD/MM/YYYY).
 * Hỗ trợ: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, DDMMYYYY, D/M/YYYY
 * @param {string} dateStr 
 * @returns {string}
 */
export function normalizeDate(dateStr) {
    if (!dateStr) return '';
    
    // Loại bỏ khoảng trắng thừa
    let s = dateStr.trim();
    if (!s) return '';

    // 1. Nếu là chuỗi số 8 chữ số (DDMMYYYY)
    if (/^\d{8}$/.test(s)) {
        return `${s.substring(0, 2)}/${s.substring(2, 4)}/${s.substring(4)}`;
    }

    // 2. Nếu là chuỗi số 6 chữ số (DDMMYY) - Tạm thời không hỗ trợ vì dễ nhầm lẫn
    
    // 3. Thử parse các định dạng có dấu phân cách: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, D.M.Y
    const parts = s.split(/[-/.\s]/).filter(p => !!p);
    
    if (parts.length === 3) {
        let d, m, y;
        // Kiểm tra xem phần nào là Năm (4 chữ số)
        if (parts[0].length === 4) { // YYYY-MM-DD
            [y, m, d] = parts;
        } else if (parts[2].length === 4) { // DD-MM-YYYY
            [d, m, y] = parts;
        } else if (parts[2].length === 2) { // DD-MM-YY
            [d, m, y] = parts;
            y = (parseInt(y) < 50 ? '20' : '19') + y.padStart(2, '0');
        } else {
            return s; // Không rõ định dạng
        }
        
        return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }

    // 4. Nếu là ISO String (2023-10-27T...)
    if (s.includes('T') && !isNaN(Date.parse(s))) {
        const date = new Date(s);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    return s;
}
/**
 * Bóc tách địa chỉ Việt Nam thành các phần: Tỉnh, Quận/Huyện, Phường/Xã.
 * @param {string} address 
 * @returns {{province: string, district: string, ward: string}}
 */
export function parseAddressComponents(address) {
    if (!address) return { province: '', district: '', ward: '', street: '' };

    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    const n = parts.length;
    
    let province = '', district = '', ward = '', street = '';

    if (n === 0) return { province, district, ward, street };

    // Quy tắc cực kỳ đơn giản: đếm ngược từ phải sang
    // 1. Tỉnh: phần cuối cùng
    province = parts[n - 1] || '';
    
    // 2. Huyện/Xã: phần thứ 2 từ phải sang
    if (n >= 2) {
        district = parts[n - 2];
        ward = parts[n - 2];
    }

    // 3. Đường (Street): Mọi thứ đứng trước dấu phẩy thứ 2 từ phải sang
    // CHỈ THỰC HIỆN nếu chuỗi có dấu hiệu của địa chỉ đầy đủ (có Tỉnh/TP/Quận/Huyện/Xã/Phường ở cuối)
    const adminRegex = /(Tỉnh|Thành phố|Thành Phố|TP|T\.|Hà Nội|Hồ Chí Minh|Đà Nẵng|Cần Thơ|Hải Phòng|Quận|Huyện|Q\.|H\.|Phường|Xã|P\.|X\.)$/i;
    const isFullAddress = adminRegex.test(province);

    if (isFullAddress) {
        if (n >= 3) {
            street = parts.slice(0, n - 2).join(', ');
        } else if (n === 2) {
            street = parts[0];
        } else {
            street = address;
        }
    } else {
        // Nếu không phải địa chỉ đầy đủ (đã bóc tách rồi), giữ nguyên để tránh lặp
        street = address;
    }

    return {
        province: cleanProvinceName(province),
        district: cleanProvinceName(district),
        ward: cleanProvinceName(ward),
        street
    };
}

/**
 * Loại bỏ các tiền tố hành chính để lấy tên lõi của Tỉnh/Quận/Huyện/Xã.
 * @param {string} name 
 * @returns {string}
 */
export function cleanProvinceName(name) {
    if (!name) return '';
    // Xóa "Tỉnh ", "Thành phố ", "Quận ", "Huyện ", "Xã ", "Phường ", "Thị xã "...
    return name.replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.|TP|T\.|Quận|Huyện|Q\.|H\.|Xã|Phường|P\.|Thị xã|Thị trấn)\s+/i, '').trim();
}

import { AddressLearning } from './addressLearning.js';

/**
 * Trích xuất phần địa chỉ nhà / đường từ một chuỗi địa chỉ đầy đủ.
 * @param {string} address 
 * @returns {string}
 */
export function getStreetPart(address) {
    if (!address) return '';

    // Ưu tiên 1: Kiểm tra xem đã "học" được gì từ địa chỉ này chưa
    const learned = AddressLearning.getLearnedStreet(address);
    if (learned) return learned;

    if (!address.includes(',')) return address;
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);

    // Tìm index của phần Xã/Phường
    const wardIndex = parts.findIndex(p => /Xã|Phường|Thị trấn|TT\.|P\.|X\./i.test(p));

    if (wardIndex > 0) {
        // Nếu tìm thấy Xã/Phường, phần đường sẽ là từ đầu đến trước Xã
        return parts.slice(0, wardIndex).join(', ');
    } else if (parts.length >= 4) {
        // Nếu không tìm thấy bằng regex, nhưng có từ 4 phần trở lên, giả định 3 phần cuối là Tỉnh, Huyện, Xã
        return parts.slice(0, parts.length - 3).join(', ');
    } else if (parts.length > 1) {
        // Nếu chỉ có 2-3 phần mà không nhận diện được, lấy phần đầu tiên
        return parts[0];
    }

    return address;
}

/**
 * Tách một chuỗi kết hợp (Số nhà, Đường) thành hai phần riêng biệt.
 * Phục vụ cho các form có id="soNha" và id="duong" tách rời.
 * @param {string} streetCombo 
 * @returns {{houseNumber: string, streetName: string}}
 */
export function splitHouseNumberAndStreet(streetCombo) {
    if (!streetCombo) return { houseNumber: '', streetName: '' };

    // Nếu có dấu phẩy đầu tiên, lấy phần trước là số nhà, phần sau là đường
    const commaIndex = streetCombo.indexOf(',');
    if (commaIndex > 0) {
        return {
            houseNumber: streetCombo.substring(0, commaIndex).trim(),
            streetName: streetCombo.substring(commaIndex + 1).trim()
        };
    }

    // Phân tách nếu chuỗi bắt đầu bằng Từ khóa báo số nhà
    // Ví dụ: Số 12A, Tòa nhà B, Ngõ 3, Thôn 4, Lô 5...
    const match = streetCombo.match(/^(?:số|sn|nhà|lô|tổ|thôn|xóm|ngõ|ngách|hẻm|kđt|khu|ấp|bản|tòa|phòng|tầng|căn hộ|chung cư)\s*[0-9a-zA-Z\-\.\/]+\s/i);
    if (match) {
        return {
            houseNumber: match[0].trim(),
            streetName: streetCombo.substring(match[0].length).trim()
        };
    }

    // Nếu chỉ có một cụm bắt đầu bằng số (VD: "12A Lý Thường Kiệt")
    const matchNumber = streetCombo.match(/^[\d]+[a-zA-Z\-\/]*\s/);
    if (matchNumber) {
        return {
            houseNumber: matchNumber[0].trim(),
            streetName: streetCombo.substring(matchNumber[0].length).trim()
        };
    }

    // Default: không có số nhà rõ ràng, đưa tất cả vào đường
    return { houseNumber: '', streetName: streetCombo };
}

```

---

### File: src\utils\tests\test_address.js

```javascript
import { parseAddressComponents } from '../stringHelper.js';

const testAddresses = [
    "Số nhà 41, ngõ 9, đường Bảo Đà, Xã Bình Minh, TP Hà Nội",
    "123 Lý Thường Kiệt, Phường 5, Quận 10, TP. Hồ Chí Minh",
    "Thôn 1, Xã Ea Kao, Thành phố Buôn Ma Thuột, Đắk Lắk",
    "Số 10, ngách 2, ngõ 5, đường Hoàng Hoa Thám, P. Liễu Giai, Q. Ba Đình, Hà Nội",
    "Số nhà 41 ngõ 9 đường Bảo Đà - Xã Bình Minh - TP Hà Nội",
    "Số 102 Lê Duẩn\nPhường Cửa Nam\nQuận Hoàn Kiếm\nHà Nội"
];

testAddresses.forEach(addr => {
    const result = parseAddressComponents(addr);
    console.log(`Address: ${addr}`);
    console.log(`- Street:   "${result.street}"`);
    console.log(`- Ward:     "${result.ward}"`);
    console.log(`- District: "${result.district}"`);
    console.log(`- Province: "${result.province}"`);
    console.log('---');
});

```

---

### File: src\utils\tokenTracker.js

```javascript
import { Storage } from './storage.js';

const SK_TOKEN_USAGE = 'VNPT_TOKEN_USAGE';

export const TokenTracker = {
    addUsage: (tokens) => {
        if (!tokens) return;
        
        const today = new Date().toISOString().split('T')[0];
        let usage = Storage.get(SK_TOKEN_USAGE) || {};
        
        // Reset count if it's a new day
        if (usage.date !== today) {
            usage = { date: today, tokens: 0, requests: 0 };
        }
        
        usage.tokens += tokens;
        usage.requests += 1;
        Storage.set(SK_TOKEN_USAGE, usage);
        
        // Phát sự kiện để cập nhật UI
        const evt = new CustomEvent('vnpt_usage_updated', { detail: usage });
        document.dispatchEvent(evt);
    },
    
    getUsage: () => {
        const today = new Date().toISOString().split('T')[0];
        let usage = Storage.get(SK_TOKEN_USAGE) || { date: today, tokens: 0, requests: 0 };
        
        // Reset nếu khác ngày
        if (usage.date !== today) {
            return { date: today, tokens: 0, requests: 0 };
        }
        return usage;
    }
};

```

---


## Thư mục: src/ui

### File: src\ui\components\CloudSyncUI.js

```javascript
import { FirebaseService } from '../../api/firebaseService.js';
import { showToast } from '../toast.js';
import { AppState } from '../../core/state.js';
import { loadSavedData } from '../../features/fieldsManager.js';

export function initCloudSyncUI(container) {
  const cloudSection = document.createElement('div');
  cloudSection.className = 'vnpt-cloud-sync-section';
  
  const updateUI = (user) => {
    if (user) {
      cloudSection.innerHTML = `
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div class="cloud-user-info">
          <div class="user-status-wrapper">
            <div class="user-status-dot"></div>
            <span class="user-email-text">${user.email}</span>
          </div>
          <button class="util-btn-logout-mini" id="vnpt-btn-cloud-logout" title="Đăng xuất">Đăng xuất</button>
        </div>

        <div class="util-separator"></div>
        <div class="util-submenu-title">Đồng bộ cá nhân (Firebase)</div>
        <div class="cloud-action-grid">
          <div class="cloud-action-item push" id="vnpt-btn-cloud-push">
            <span class="cloud-action-icon">📤</span>
            <span class="cloud-action-label">Đẩy lên Cloud</span>
          </div>
          <div class="cloud-action-item pull" id="vnpt-btn-cloud-pull">
            <span class="cloud-action-icon">📥</span>
            <span class="cloud-action-label">Kéo về máy</span>
          </div>
        </div>

        <style>
          .cloud-user-info {
            padding: 6px 12px; 
            font-size: 11px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            background: rgba(26, 115, 232, 0.02);
          }
          .user-status-wrapper {
            display: flex; 
            align-items: center; 
            gap: 6px;
            overflow: hidden;
          }
          .user-status-dot {
            width: 8px; 
            height: 8px; 
            background: #34a853; 
            border-radius: 50%; 
            box-shadow: 0 0 8px #34a853;
            flex-shrink: 0;
          }
          .user-email-text {
            font-weight: 700; 
            color: #3c4043; 
            max-width: 140px; 
            overflow: hidden; 
            text-overflow: ellipsis; 
            white-space: nowrap;
          }

          .cloud-action-grid {
            display: flex;
            gap: 6px;
            padding: 8px 12px;
          }
          .cloud-action-item {
            flex: 1;
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 8px;
            padding: 6px 4px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            min-height: 32px;
          }
          
          .cloud-action-item:hover {
            background: #fff;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.08);
          }
          
          .cloud-action-item.push:hover { border-color: var(--vnpt-primary); color: var(--vnpt-primary); }
          .cloud-action-item.pull:hover { border-color: var(--vnpt-success); color: var(--vnpt-success); }

          .cloud-action-item:active {
            transform: translateY(0) scale(0.97);
          }
          
          .cloud-action-icon {
            font-size: 14px;
          }

          .cloud-action-label {
            font-size: 10px;
            font-weight: 700;
            white-space: nowrap;
          }

          .util-btn-logout-mini {
            background: #f8f9fa;
            border: 1px solid #dadce0;
            border-radius: 6px;
            padding: 2px 8px;
            font-size: 9px;
            font-weight: 700;
            color: #d93025;
            cursor: pointer;
            transition: all 0.2s;
          }
          .util-btn-logout-mini:hover {
            background: #fdf2f2;
            border-color: #d93025;
          }
        </style>
      `;
      
      
      document.getElementById('vnpt-btn-cloud-logout').onclick = async () => {
        await FirebaseService.logout();
        showToast("👋 Đã đăng xuất!");
      };
      
      document.getElementById('vnpt-btn-cloud-push').onclick = async () => {
        try {
          showToast("⏳ Đang đẩy dữ liệu...");
          
          // 1. Đẩy Profiles
          const { getProfiles } = await import('../../features/profileManager.js');
          const profiles = getProfiles();
          for (const p of profiles) {
            await FirebaseService.pushProfile(p);
          }

          // 2. Đẩy Cấu hình (Mapping, Hotkeys, Text Template, Data mặc định...)
          const { 
              SK_CALC_MAP, SK_HOTKEYS, 
              LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
              SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
              SK_ADDRESS_LEARNING, SK_GEMINI_KEY
          } = await import('../../core/constants.js');
          const { Storage } = await import('../../utils/storage.js');
          const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
          
          // Dùng DEFAULT_CALC_MAP làm fallback nếu user chưa lưu mapping thủ công
          const globalConfig = {
              calcMap: Storage.get(SK_CALC_MAP) ?? DEFAULT_CALC_MAP,
              hotkeys: Storage.get(SK_HOTKEYS),
              fields: Storage.get(LOCAL_KEY_FIELDS),
              taxRate: Storage.get(SK_TAX),
              templates: Storage.get(SK_TEMPLATES),
              defaultFields: Storage.get(LOCAL_KEY_DEFAULT_FIELDS),
              dataDefault: Storage.get(SK_DATA_DEF),
              addressLearning: Storage.get(SK_ADDRESS_LEARNING),
              geminiKey: Storage.get(SK_GEMINI_KEY) // Đã gộp API Keys vào đây
          };
          await FirebaseService.pushGlobalConfig(globalConfig);

          showToast("✅ Đã đồng bộ lên Cloud!");
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };
      
      document.getElementById('vnpt-btn-cloud-pull').onclick = async () => {
        try {
          showToast("⏳ Đang kéo dữ liệu...");
          const cloudProfiles = await FirebaseService.pullProfiles();
          const cloudConfig = await FirebaseService.pullGlobalConfig();

          if (cloudProfiles.length === 0 && !cloudConfig) {
            showToast("ℹ️ Không tìm thấy dữ liệu trên Cloud");
            return;
          }
          
          if (confirm(`Tìm thấy ${cloudProfiles.length} bản ghi dữ liệu. Bạn có muốn ghi đè bộ cài đặt Local không?`)) {
             // 1. Áp dụng Profiles
             const { importProfiles } = await import('../../features/profileManager.js');
             importProfiles(cloudProfiles);

             // 2. Áp dụng Cấu hình (Nếu có)
             if (cloudConfig) {
                 const { 
                     SK_CALC_MAP, SK_HOTKEYS, 
                     LOCAL_KEY_FIELDS, SK_TEMPLATES, SK_TAX, 
                     SK_DATA_DEF, LOCAL_KEY_DEFAULT_FIELDS,
                     SK_ADDRESS_LEARNING, SK_GEMINI_KEY
                 } = await import('../../core/constants.js');
                 const { Storage } = await import('../../utils/storage.js');
                 const { DEFAULT_CALC_MAP } = await import('../../core/defaults.js');
                 
                 // Lưu config vào Storage (dùng DEFAULT nếu cloud không có)
                 Storage.set(SK_CALC_MAP, cloudConfig.calcMap ?? DEFAULT_CALC_MAP);
                 if (cloudConfig.hotkeys) Storage.set(SK_HOTKEYS, cloudConfig.hotkeys);
                 if (cloudConfig.fields) Storage.set(LOCAL_KEY_FIELDS, cloudConfig.fields);
                 if (cloudConfig.taxRate !== undefined) Storage.set(SK_TAX, cloudConfig.taxRate);
                 if (cloudConfig.templates) Storage.set(SK_TEMPLATES, cloudConfig.templates);
                 if (cloudConfig.defaultFields) Storage.set(LOCAL_KEY_DEFAULT_FIELDS, cloudConfig.defaultFields);
                 if (cloudConfig.dataDefault) Storage.set(SK_DATA_DEF, cloudConfig.dataDefault);
                 if (cloudConfig.addressLearning) Storage.set(SK_ADDRESS_LEARNING, cloudConfig.addressLearning);
                 
                 // Khôi phục Gemini Key
                 if (cloudConfig.geminiKey) {
                    Storage.set(SK_GEMINI_KEY, cloudConfig.geminiKey);
                    const keyInput = document.getElementById('vnpt-gemini-key');
                    if (keyInput) keyInput.value = cloudConfig.geminiKey;
                 }
             }

             showToast("✅ Đã khôi phục toàn bộ cấu hình!");
             
             // Nạp lại dữ liệu bảng mà không cần refresh trang
             loadSavedData();
          }
        } catch (err) {
          showToast("❌ Lỗi: " + err.message, "#ea4335");
        }
      };

    } else {
      cloudSection.innerHTML = `
        <div class="util-submenu-title">☁️ Tài khoản Cloud</div>
        <div class="cloud-login-prompt">
          <p class="login-prompt-text">Đăng nhập để đồng bộ Profile & API Key giữa các máy tính.</p>
          <button class="vnpt-btn-confirm full-width" id="vnpt-btn-cloud-login-trigger">Đăng nhập / Đăng ký</button>
        </div>
        <style>
          .cloud-login-prompt { padding: 8px; text-align: center; }
          .login-prompt-text { font-size: 10px; color: #666; margin-bottom: 8px; }
          .full-width { width: 100%; font-size: 12px; }
        </style>
      `;
      
      document.getElementById('vnpt-btn-cloud-login-trigger').onclick = () => {
        showLoginModal();
      };
    }
  };

  FirebaseService.onAuthChange(updateUI);
  container.appendChild(cloudSection);
}

function showLoginModal() {
  const overlay = document.createElement('div');
  overlay.className = 'vnpt-pdf-overlay'; // Reusing modal styles
  overlay.innerHTML = `
    <div class="vnpt-pdf-dialog-box login-modal-box">
      <div class="pdf-dlg-header">
        <h3 class="centered-text">🔥 Firebase Sync</h3>
      </div>
      <div class="login-form-container">
        <input type="email" id="cloud-email" placeholder="Email" class="cw-map-input login-input" autocomplete="new-password">
        <input type="text" id="cloud-password" placeholder="Mật khẩu" class="cw-map-input login-input sensitive-mask" autocomplete="new-password">
      </div>
      <div class="vnpt-pdf-actions column-layout">
        <button id="btn-do-login" class="vnpt-btn-confirm full-width">Đăng nhập</button>
        <button id="btn-do-signup" class="util-item-small signup-link">Chưa có tài khoản? Đăng ký ngay</button>
        <button id="btn-close-cloud" class="pdf-btn-cancel full-width">Đóng</button>
      </div>
    </div>
    <style>
      .login-modal-box { width: 320px; }
      .centered-text { text-align: center; }
      .login-form-container { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
      .login-input { height: 36px; font-size: 13px; }
      .column-layout { flex-direction: column; gap: 8px; }
      .signup-link { width: 100%; border: none; font-size: 11px; }
    </style>
  `;
  document.body.appendChild(overlay);

  const emailInp = overlay.querySelector('#cloud-email');
  const passInp = overlay.querySelector('#cloud-password');

  overlay.querySelector('#btn-do-login').onclick = async () => {
    try {
      await FirebaseService.signIn(emailInp.value, passInp.value);
      showToast("✅ Đăng nhập thành công!");
      overlay.remove();
    } catch (err) {
      console.error("[CloudSync] Login Error:", err);
      const msg = err.code === 'auth/operation-not-allowed' 
        ? "Lỗi: Bạn chưa bật Email/Password trong Firebase Console!" 
        : err.message;
      showToast("❌ " + msg, "#ea4335");
    }
  };

  overlay.querySelector('#btn-do-signup').onclick = async () => {
    try {
      if (!emailInp.value || !passInp.value) {
        showToast("⚠️ Vui lòng nhập đầy đủ Email và Mật khẩu", "#ffc107");
        return;
      }
      if (confirm("Đăng ký tài khoản mới với Email này?")) {
        await FirebaseService.signUp(emailInp.value, passInp.value);
        showToast("✅ Đăng ký thành công!");
        overlay.remove();
      }
    } catch (err) {
      console.error("[CloudSync] Signup Error:", err);
      const msg = err.code === 'auth/operation-not-allowed' 
        ? "Lỗi: Bạn chưa bật Email/Password trong Firebase Console!" 
        : err.message;
      showToast("❌ " + msg, "#ea4335");
    }
  };

  overlay.querySelector('#btn-close-cloud').onclick = () => overlay.remove();
}

```

---

### File: src\ui\dragDrop.js

```javascript
/**
 * @file dragDrop.js
 * @desc Xử lý kéo thả (drag & drop) cho hai widget DOCX và Calc.
 *       Hỗ trợ dock/snap vào cạnh dưới màn hình, giới hạn phạm vi di chuyển,
 *       lưu vị trí vào localStorage (LOCAL_KEY_POS, SK_POS_CALC).
 * @exports makeDraggable  — Kích hoạt kéo thả cho một element với handle cụ thể
 * @exports initDragDrop    — Hàm wrapper khởi tạo cho widget DOCX
 * @seeAlso core/state.js (AppState.hasDragged), ui/widget.js (host)
 */
// src/ui/dragDrop.js
import { AppState } from '../core/state.js';
import { LOCAL_KEY_POS } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

const DOCK_THRESHOLD = 60; // px từ cạnh dưới màn hình để kích hoạt dock

export function makeDraggable(widgetEl, handleEls, storageKey, onDragStartCallback = null, onDockChange = null) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;
    let startX = 0;
    let startY = 0;
    let isDocked = false;
    const DRAG_THRESHOLD = 5; // Ngưỡng để xác nhận là đang kéo (pixels)

    function setDocked(docked) {
        if (isDocked === docked) return;
        isDocked = docked;
        if (onDockChange) onDockChange(docked);
    }

    function startDrag(e) {
        if (e.button !== 0) return; // Chỉ nhận click chuột trái

        // Nếu click vào input, button, select... thì không kéo để nhường sự kiện focus/click
        const isInteractive = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable;
        if (isInteractive) return;

        isDragging = true;
        
        AppState.hasDragged = false;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = widgetEl.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';

        if (handleEls) {
            handleEls.forEach(el => el.style.cursor = 'grabbing');
        }
        
        if (onDragStartCallback) onDragStartCallback();
        e.preventDefault();
    }

    handleEls.forEach(el => {
        el.addEventListener('mousedown', startDrag);
    });

    let animationFrameId = null;
    let pendingX = 0;
    let pendingY = 0;

    function updateWidgetPosition() {
        if (!isDragging) return;

        let newX = pendingX;
        let newY = pendingY;

        const w = window.innerWidth;
        const h = window.innerHeight;

        const toggleBtn = document.getElementById('vnpt-toggle-btn');
        const iconWidth = toggleBtn ? toggleBtn.offsetWidth : 40;
        const iconHeight = toggleBtn ? toggleBtn.offsetHeight : 40;

        const isRightAnchor = widgetEl.id === 'vnpt-docx-widget';
        let pWidth = widgetEl.offsetWidth || 0;

        if (isRightAnchor) {
            let btnSpace = iconWidth + 6;
            let minX = btnSpace - pWidth;
            let maxX = w - pWidth + 6;
            if (newX < minX) newX = minX;
            if (newX > maxX) newX = maxX;
        } else {
            pWidth = pWidth || 200;
            if (newX < 0) newX = 0;
            if (newX + pWidth > w) newX = Math.max(0, w - pWidth);
        }

        let shouldDock = isDocked;
        if (isRightAnchor) {
            shouldDock = false; // Disable docking for vnpt-docx-widget completely
        } else {
            // Kiểm tra trạng thái chuột để dự đoán docking
            if (!isDocked) {
                if (pendingY + offsetY > h - 10) shouldDock = true;
            } else {
                if (pendingY + offsetY < h - 40) shouldDock = false;
            }
        }

        if (newY < 0) newY = 0;

        if (shouldDock) {
            setDocked(true);
            widgetEl.style.top = (h - (widgetEl.offsetHeight || 34)) + 'px';
            if (isRightAnchor) {
                widgetEl.style.right = (w - newX - pWidth) + 'px';
                widgetEl.style.left = 'auto';
            } else {
                widgetEl.style.left = newX + 'px';
                widgetEl.style.right = 'auto';
            }
        } else {
            setDocked(false);
            let pHeight = widgetEl.offsetHeight || 40;
            let bottomLimit;
            if (isRightAnchor) {
                bottomLimit = 10 + iconHeight;
            } else {
                const tb = widgetEl.querySelector('.cw-title-bar');
                bottomLimit = tb ? tb.offsetHeight : pHeight;
            }
            if (newY + bottomLimit > h) newY = Math.max(0, h - bottomLimit);

            widgetEl.style.top = newY + 'px';
            if (isRightAnchor) {
                widgetEl.style.right = (w - newX - pWidth) + 'px';
                widgetEl.style.left = 'auto';
            } else {
                widgetEl.style.left = newX + 'px';
                widgetEl.style.right = 'auto';
            }
        }
        widgetEl.style.bottom = 'auto';
        animationFrameId = null;
    }

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        
        if (!AppState.hasDragged) {
            const dist = Math.sqrt(Math.pow(e.clientX - startX, 2) + Math.pow(e.clientY - startY, 2));
            if (dist > DRAG_THRESHOLD) {
                AppState.hasDragged = true;
            } else {
                return;
            }
        }

        pendingX = e.clientX - offsetX;
        pendingY = e.clientY - offsetY;

        if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(updateWidgetPosition);
        }
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            // Thực hiện nốt lần cập nhật cuối cùng nếu cần
            updateWidgetPosition();
        }

        document.body.style.userSelect = '';
        if (handleEls) handleEls.forEach(el => el.style.cursor = 'grab');

        if (storageKey) {
            const isRightAnchor = widgetEl.id === 'vnpt-docx-widget';
            // Lúc này toạ độ đã được cập nhật ổn định trên style
            Storage.set(storageKey, {
                left: isRightAnchor ? undefined : widgetEl.style.left,
                right: isRightAnchor ? widgetEl.style.right : undefined,
                top: widgetEl.style.top,
                x: isRightAnchor ? undefined : parseFloat(widgetEl.style.left),
                y: parseFloat(widgetEl.style.top),
                docked: isDocked
            });
        }
        
        setTimeout(() => {
            AppState.hasDragged = false;
        }, 100);
    });

    return { isDocked: () => isDocked, setDocked };
}

export function initDragDrop() {
    if (AppState.widget && AppState.header) {
        makeDraggable(AppState.widget, [AppState.header], LOCAL_KEY_POS);

        window.addEventListener('resize', () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const toggleBtn = document.getElementById('vnpt-toggle-btn');
            const iconWidth = toggleBtn ? toggleBtn.offsetWidth : 40;
            const iconHeight = toggleBtn ? toggleBtn.offsetHeight : 40;

            let rect = AppState.widget.getBoundingClientRect();
            let newX = rect.left;
            let newY = rect.top;

            let pWidth = AppState.widget.offsetWidth || 0;
            let btnSpace = iconWidth + 6;
            let minX = btnSpace - pWidth;
            let maxX = w - pWidth + 6;
            
            if (newX < minX) newX = minX;
            if (newX > maxX) newX = maxX;
            if (newY + 10 + iconHeight > h) newY = Math.max(0, h - (10 + iconHeight));

            AppState.widget.style.right = (w - newX - pWidth) + 'px';
            AppState.widget.style.top = newY + 'px';
        });
    }
}

```

---

### File: src\ui\styles\calculator.js

```javascript
export const calculatorStyles = `
    /* ═══════════════════════════════════════════
       SECTION 6: INLINE CALC (Premium Layout)
       ═══════════════════════════════════════════ */
    #vnpt-inline-calc { 
        background: rgba(255, 255, 255, 0.3); 
        padding: 4px 8px; 
        border-bottom: 1px solid var(--vnpt-border);
        display: block;
    }
    .cw-body-inline { display: flex; flex-direction: column; gap: 4px; }
    .cw-inline-row { display: flex; align-items: center; gap: 4px; width: 100%; box-sizing: border-box; }
    .cw-input-inline { 
        flex: 1; min-width: 60px; padding: 2px 6px; border: 1px solid #1f5bd2ff; border-radius: 6px; 
        font-size: 11px; font-weight: 600; height: 24px; box-sizing: border-box;
        background: #fff; transition: all 0.2s;
    }
    .cw-input-inline:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
    .cw-input-readonly-inline { background-color: rgba(30, 142, 62, 0.05); color: var(--vnpt-success); cursor: default; flex: 1.5; border-color: rgba(30, 142, 62, 0.2); }
    
    .cw-tax-group-inline { position: relative; display: flex; align-items: center; flex: 0 0 auto; min-width: 45px; }
    .cw-tax-input-inline { width: 45px; padding: 2px 14px 2px 6px; border: 1px solid #dadce0; border-radius: 6px; font-size: 11px; text-align: right; height: 24px; box-sizing: border-box; }
    .cw-tax-symbol { position: absolute; right: 4px; color: #5f6368; font-size: 9px; font-weight: bold; pointer-events: none; }

    .cw-map-btn-inline {
        background: rgba(255, 255, 255, 0.82); border: 1px solid #1a73e8; border-radius: 6px;
        width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
        font-size: 12px; cursor: pointer; transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        color: #1a73e8; flex-shrink: 0; padding: 0;
        box-shadow: 0 1px 3px rgba(26, 115, 232, 0.1);
    }
    .cw-map-btn-inline:hover { background: var(--vnpt-primary-grad); color: white; transform: scale(1.1) rotate(5deg); box-shadow: 0 4px 8px rgba(26, 115, 232, 0.3); }

    .btn-calc-toggle { background: rgba(26, 115, 232, 0.08); color: var(--vnpt-primary); }
    .btn-calc-toggle:hover { background: rgba(26, 115, 232, 0.15); }
    .btn-calc-toggle.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }
`;

```

---

### File: src\ui\styles\controls.js

```javascript
export const controlStyles = `
    /* ═══════════════════════════════════════════
       SECTION 4: CONTROL BUTTONS
       ═══════════════════════════════════════════ */
    .vnpt-btn-action { 
        padding: 0 8px; height: 24px; 
        display: flex; align-items: center; justify-content: center; 
        font-weight: 700; font-size: 11px; cursor: pointer; 
        border-radius: 6px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        white-space: nowrap; box-sizing: border-box; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        flex-shrink: 1; min-width: 0;
    }
    .vnpt-btn-action:hover { transform: translateY(-1px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .vnpt-btn-action:active { transform: translateY(0) scale(0.96); }

    .vnpt-btn-icon {
        border: 1px solid #1f5bd2ff;
        background: rgba(0,0,0,0.03); width: 24px; height: 24px;
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; cursor: pointer; border-radius: 6px;
        color: #5f6368; transition: all 0.2s;
    }
    .vnpt-btn-icon:hover { background: var(--vnpt-primary-light); color: var(--vnpt-primary); transform: scale(1.05); }
    .vnpt-btn-icon.active { background: var(--vnpt-primary); color: white; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .header-center { 
        display: flex; 
        gap: 2px; 
        background: rgba(0,0,0,0.04); 
        padding: 2px; 
        border-radius: 8px;
        align-items: center;
    }

    .vnpt-btn-header {
        height: 24px;
        padding: 0 10px;
        border: none;
        background: transparent;
        color: #5f6368;
        font-size: 10.5px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
    }
    .vnpt-btn-header:hover {
        background: #fff;
        color: var(--vnpt-primary);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .vnpt-btn-header.active {
        background: var(--vnpt-primary);
        color: white;
        box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
    }

    /* Đặc trị màu sắc nhẹ cho từng nút khi hover */
    .vnpt-btn-header.btn-ai:hover { color: #8e24aa; }
    .vnpt-btn-header.btn-scan:hover { color: var(--vnpt-success); }
    .vnpt-btn-header.btn-fill:hover { color: #f57c00; }
    .vnpt-btn-header.btn-id:hover { color: #d81b60; }
    
    /* ═══════════════════════════════════════════
       SECTION: BACKUP HISTORY DROPDOWN
       ═══════════════════════════════════════════ */
    .vnpt-backup-history {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px); 
        border: 1px solid var(--vnpt-border);
        border-radius: 12px; 
        box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        width: 320px; 
        max-height: 420px; 
        overflow-y: auto;
        display: none; 
        flex-direction: column; 
        z-index: 1000000;
        padding: 8px; 
        animation: menuFadeIn 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
        transform-origin: top right;
    }
    .vnpt-backup-history.show { display: flex; }
    .backup-history-header {
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 800;
        color: var(--vnpt-primary);
        text-transform: uppercase;
        letter-spacing: 0.8px;
        border-bottom: 1px solid rgba(26, 115, 232, 0.1);
        background: rgba(26, 115, 232, 0.04);
        border-radius: 12px 12px 0 0;
        margin: -8px -8px 6px -8px;
    }
    .backup-history-item {
        padding: 10px 12px; border-radius: 10px;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); 
        border-bottom: 1px solid rgba(0,0,0,0.03);
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
    }
    .backup-history-item:hover { background: var(--vnpt-primary-light); transform: scale(1.02); }
    .backup-info { flex: 1; min-width: 0; }
    .backup-history-name { font-size: 11.5px; font-weight: 700; color: #3c4043; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .backup-history-time { font-size: 9px; color: #9aa0a6; font-weight: 600; margin-top: 2px; }
    
    .backup-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .backup-actions button {
        width: 28px; height: 28px; border-radius: 6px; border: 1px solid #dadce0;
        background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
        font-size: 12px; transition: all 0.2s;
    }
    .btn-restore-action:hover { background: var(--vnpt-success); color: #fff; border-color: var(--vnpt-success); }
    .btn-delete-action:hover { background: var(--vnpt-danger); color: #fff; border-color: var(--vnpt-danger); }
    
    .backup-history-item:hover .backup-preview-content { display: flex; }

    .backup-preview-content {
        margin-top: 8px;
        padding: 8px;
        background: rgba(0,0,0,0.03);
        border-radius: 8px;
        font-size: 10px;
        display: none;
        flex-direction: column;
        gap: 4px;
        border: 1px dashed #dadce0;
    }
    .backup-preview-content.show { display: flex; }
    .preview-row { display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.02); padding-bottom: 2px; }
    .preview-label { font-weight: 700; color: #5f6368; }
    .preview-val { color: #1a73e8; font-weight: 600; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
    
    .backup-history-empty { padding: 30px 20px; text-align: center; font-size: 11px; color: #9aa0a6; font-style: italic; line-height: 1.6; }

    /* Utility Menu UI - Ultra Compact */
    .vnpt-util-dropdown { position: relative; }
    .vnpt-util-menu {
        position: absolute; top: calc(100% + 8px); right: 0;
        background: #fff; border: 1px solid var(--vnpt-border); border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 100000;
        display: none; flex-direction: column; width: 260px;
        padding: 4px;
        transform-origin: top right;
    }
    .vnpt-util-menu.show { display: flex; }
    
    .util-config-container { display: flex; flex-direction: column; gap: 8px; }

    .util-section-mini {
        padding: 4px; border-bottom: 1px solid #f0f0f0;
    }
    .util-section-mini:last-child { border-bottom: none; }

    .util-action-row { display: flex; gap: 4px; align-items: center; width: 100%; box-sizing: border-box; }
    
    .util-item-mini {
        flex: 1;
        min-width: 0; /* Cho phép co lại nhỏ hơn text nếu cần */
        background: #f8f9fa; border: 1px solid #eee; border-radius: 6px;
        padding: 4px 2px; font-size: 10px; font-weight: 700; color: #3c4043;
        cursor: pointer; transition: all 0.2s; text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .util-item-mini.btn-json-icon {
        flex: 0 0 24px; /* Thu nhỏ thêm một chút */
        font-size: 11px;
        padding: 4px 0;
    }
    .util-item-mini:hover { background: var(--vnpt-primary-light); border-color: var(--vnpt-primary); color: var(--vnpt-primary); }
    .util-item-mini.danger:hover { background: #fdf2f2; border-color: #d93025; color: #d93025; }

    .util-row-compact { display: flex; align-items: center; gap: 8px; }
    .util-label-tiny { font-size: 9px; font-weight: 800; color: #9aa0a6; text-transform: uppercase; }
    
    .size-options-tiny { display: flex; gap: 2px; flex: 1; }
    .size-options-tiny button {
        flex: 1; padding: 2px 0; border: 1px solid #eee; border-radius: 4px;
        background: #fff; font-size: 9px; font-weight: 700; cursor: pointer;
    }
    .size-options-tiny button:hover { background: var(--vnpt-primary); color: #fff; border-color: var(--vnpt-primary); }

    .cw-row-mini { display: flex; gap: 4px; }
    .cw-input-mini {
        flex: 1; padding: 4px 8px; border: 1px solid #eee; border-radius: 6px;
        font-size: 10px; background: #fafafa;
    }
    .cw-input-mini:focus { border-color: var(--vnpt-primary); outline: none; background: #fff; }
    
    .util-btn-test-tiny {
        background: #f0f4ff; color: var(--vnpt-primary); border: none;
        border-radius: 6px; width: 24px; cursor: pointer; font-size: 10px;
    }

    .vnpt-hotkey-list-mini { display: flex; flex-direction: column; gap: 3px; max-height: 120px; overflow-y: auto; }
    .vnpt-hotkey-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 2px 4px; background: #fafafa; border-radius: 4px;
    }
    .vnpt-hotkey-label { font-size: 9px; color: #5f6368; }
    .vnpt-hotkey-btn {
        background: #fff; border: 1px solid #eee; border-radius: 4px;
        padding: 1px 4px; font-size: 9px; font-weight: 700; color: var(--vnpt-primary);
        min-width: 50px; text-align: center;
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
    }
`;

```

---

### File: src\ui\styles\fields.js

```javascript
export const fieldsStyles = `
    /* ═══════════════════════════════════════════
       SECTION 3: FIELDS CONTAINER & FIELD ROWS
       ═══════════════════════════════════════════ */
    #vnpt-fields-container { 
        --label-flex: 0.2;
        flex: 1; overflow: hidden; background: rgba(255, 255, 255, 0.3); 
        border: 1px solid var(--vnpt-border); border-radius: 12px; 
        margin-bottom: 4px; position: relative; display: flex; flex-direction: column; 
        box-shadow: inset 0 2px 10px rgba(0,0,0,0.02);
    }

    #vnpt-fields-container.vnpt-mode-default {
        border: 2px dashed var(--vnpt-danger);
        background: rgba(234, 67, 53, 0.05);
        box-shadow: inset 0 0 15px rgba(234, 67, 53, 0.1);
    }
    #vnpt-fields-list { flex: 1; overflow-y: auto; padding: 4px; }

    /* Column splitter */
    .fields-col-splitter {
        flex: 0 0 6px; cursor: col-resize;
        display: flex; align-items: center; justify-content: center;
        background: transparent; border-radius: 3px;
        opacity: 0; transition: opacity 0.2s, background 0.2s;
        position: relative; z-index: 2;
    }
    .fields-col-splitter::after {
        content: ''; display: block;
        width: 2px; height: 60%; min-height: 10px;
        background: var(--vnpt-border); border-radius: 2px;
        transition: background 0.2s;
    }
    #vnpt-fields-container:hover .fields-col-splitter { opacity: 1; }
    .fields-col-splitter:hover::after,
    .fields-col-splitter.dragging::after { background: var(--vnpt-primary); }
    .fields-col-splitter.dragging { opacity: 1; cursor: col-resize; }

    .vnpt-field-row { 
        display: flex; gap: 2px; margin-bottom: 2px; align-items: center; 
        padding: 1px 2px; border-radius: 6px; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        background: rgba(255, 255, 255, 0.6); border: 1px solid transparent;
    }
    .vnpt-field-row:hover { 
        background: #fff; border-color: var(--vnpt-primary-light); 
        transform: translateX(2px); box-shadow: 0 2px 8px rgba(0,0,0,0.06); 
    }

    .btn-sync-dir, .btn-sync-dir-calc {
        cursor: pointer; padding: 0; user-select: none;
        flex: 0 0 16px; height: 16px; display: flex; align-items: center; justify-content: center;
        border: none; background: transparent; color: #bdc1c6;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        opacity: 0.8;
    }
    .btn-sync-dir:hover, .btn-sync-dir-calc:hover { 
        transform: scale(1.15); opacity: 1;
        background: rgba(0,0,0,0.03); border-radius: 3px;
    }
    .btn-sync-dir:active, .btn-sync-dir-calc:active { transform: scale(0.9); }
    
    .btn-sync-dir[data-dir="both"], .btn-sync-dir-calc[data-dir="both"] { color: var(--vnpt-primary); }
    .btn-sync-dir[data-dir="up"], .btn-sync-dir-calc[data-dir="up"] { color: #f57c00; }
    .btn-sync-dir[data-dir="down"], .btn-sync-dir-calc[data-dir="down"] { color: var(--vnpt-success); }
    
    .btn-sync-dir svg, .btn-sync-dir-calc svg { transition: transform 0.3s ease; width: 12px; height: 12px; }
    .btn-sync-dir:active svg, .btn-sync-dir-calc:active svg { transform: rotate(180deg); }

    .vnpt-field-row input { 
        flex: 1; padding: 1px 4px; border: 1px solid #1f5bd2ff; border-radius: 4px; 
        font-size: 10px; height: 20px; transition: all 0.2s; background: #fff;
    }
    .vnpt-field-row input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.1); outline: none; }
    
    .vnpt-field-row input.row-chk { flex: 0 0 16px; width: 14px; height: 14px; margin: 0; cursor: pointer; accent-color: var(--vnpt-primary); }
    .vnpt-field-row input.f-label { flex: var(--label-flex); color: #1a73e8; font-weight: 700; background: rgba(26,115,232,0.03); }
    .vnpt-field-row input.f-key { display: none; flex: 0.45; font-weight: 700; color: #d63384; background: rgba(214,51,132,0.03); }
    .show-ids .vnpt-field-row input.f-key { display: block; }

    .btn-field-link {
        cursor: pointer; padding: 0; user-select: none;
        flex: 0 0 16px; height: 16px; display: flex; align-items: center; justify-content: center;
        border: none; background: transparent; color: #bdc1c6; transition: 0.2s; font-size: 10px;
    }
    .btn-field-link:hover { color: var(--vnpt-primary); transform: scale(1.1); }


    .vnpt-btn-hide { background: #f1f3f4; border: none; border-radius: 4px; font-size: 10px; cursor: pointer; padding: 2px 6px; color: #5f6368; font-weight: 600; }
    .vnpt-btn-hide:hover { background: #e8eaed; color: #3c4043; }
    
    .vnpt-btn-del { background: #fce8e6; color: var(--vnpt-danger); border: none; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-weight: 700; font-size: 10px; }
    .vnpt-btn-del:hover { background: #f9d7d1; }

    /* Connection Badge */
    .connection-badge {
        font-size: 8px;
        margin: 0 1px;
        flex-shrink: 0;
        cursor: help;
        opacity: 0.7;
        width: 10px;
        text-align: center;
    }
    .connection-badge.connected { color: #28a745; filter: drop-shadow(0 0 2px rgba(40, 167, 69, 0.4)); }
    .connection-badge.disconnected { color: #ccc; }

    /* MST Lookup Button */
    .mst-lookup-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        flex: 1;
        height: 24px;
    }
    .btn-mst-lookup {
        position: absolute;
        right: 3px;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: none;
        background: var(--vnpt-primary-light);
        color: var(--vnpt-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        transition: all 0.2s;
        z-index: 5;
        padding: 0;
        line-height: 1;
    }
    .btn-mst-lookup:hover {
        background: var(--vnpt-primary);
        color: white;
        transform: scale(1.1);
    }
    .btn-mst-lookup.loading {
        pointer-events: none;
        opacity: 0.8;
    }
    .btn-mst-lookup .spinner {
        display: none;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin-small 0.8s linear infinite;
    }
    .btn-mst-lookup.loading .spinner { display: block; }
    .btn-mst-lookup.loading .icon { display: none; }

    /* Validation & Error States */
    @keyframes vnpt-shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
    }
    .vnpt-shake { animation: vnpt-shake 0.3s ease-in-out; }
    
    .field-error { 
        border-color: #ea4335 !important; 
        background-color: #fff1f0 !important; 
        color: #ea4335 !important;
        box-shadow: 0 0 0 3px rgba(234, 67, 53, 0.1) !important;
    }
    .field-required-empty {
        border: 1px dashed var(--vnpt-danger) !important;
        background: rgba(234, 67, 53, 0.05) !important;
    }

    @keyframes field-flash-success {
        0% { background-color: rgba(40, 167, 69, 0.5); box-shadow: 0 0 12px rgba(40, 167, 69, 0.4); }
        30% { background-color: rgba(40, 167, 69, 0.3); }
        100% { background-color: rgba(255, 255, 255, 0.6); box-shadow: none; }
    }
    .field-flash-success {
        animation: field-flash-success 3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes spin-small { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    #vnpt-fields-list::-webkit-scrollbar { width: 6px; }
    #vnpt-fields-list::-webkit-scrollbar-track { background: transparent; }
    #vnpt-fields-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 10px; }
    #vnpt-fields-list::-webkit-scrollbar-thumb:hover { background: #bdc1c6; }
`;

```

---

### File: src\ui\styles\index.js

```javascript
import { themeStyles } from './theme.js';
import { panelStyles } from './panel.js';
import { fieldsStyles } from './fields.js';
import { controlStyles } from './controls.js';
import { calculatorStyles } from './calculator.js';
import { scannerStyles } from './scanner.js';
import { linkerStyles } from './linker.js';
import { templateStyles } from './template.js';

export const allStyles = `
    ${themeStyles}
    ${panelStyles}
    ${fieldsStyles}
    ${controlStyles}
    ${calculatorStyles}
    ${scannerStyles}
    ${linkerStyles}
    ${templateStyles}
`;

export function injectStyles() {
    const styleId = 'vnpt-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = allStyles;
    document.head.appendChild(style);
}

```

---

### File: src\ui\styles\linker.js

```javascript
export const linkerStyles = `
    /* ═══════════════════════════════════════════
       SECTION 10: FIELD LINKER
       ═══════════════════════════════════════════ */

    /* Nút 🔗 trên mỗi field row */
    .btn-field-link {
        flex: 0 0 22px;
        width: 22px;
        height: 22px;
        border-radius: 5px;
        border: 1px solid rgba(26, 115, 232, 0.25);
        background: rgba(26, 115, 232, 0.06);
        color: #1a73e8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
        transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-field-link:hover {
        background: var(--vnpt-primary);
        color: white;
        border-color: var(--vnpt-primary);
        transform: scale(1.15) rotate(-5deg);
        box-shadow: 0 3px 8px rgba(26, 115, 232, 0.35);
    }
    .btn-field-link.active {
        background: #f57f17;
        color: white;
        border-color: #e65100;
        box-shadow: 0 0 0 3px rgba(245, 127, 23, 0.3);
        animation: pulse-orange 1.2s infinite;
    }

    @keyframes pulse-orange {
        0% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0.4); }
        70% { box-shadow: 0 0 0 6px rgba(245, 127, 23, 0); }
        100% { box-shadow: 0 0 0 0 rgba(245, 127, 23, 0); }
    }

    /* Con trỏ crosshair khi ở chế độ linking */
    .vnpt-linking-mode,
    .vnpt-linking-mode *:not(.vnpt-linking-banner):not(.vnpt-linking-banner *) {
        cursor: crosshair !important;
    }

    /* Hover highlight - xanh dương (element chuẩn bị được link) */
    .vnpt-link-highlight {
        outline: 2.5px solid #1a73e8 !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999990 !important;
        animation: linkPulse 0.9s infinite alternate;
    }
    @keyframes linkPulse {
        from { outline-color: #1a73e8; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(26,115,232,0.2); }
        to   { outline-color: #4fc3f7; outline-offset: 5px; box-shadow: 0 0 12px 4px rgba(26,115,232,0.15); }
    }

    /* Existing highlight - xanh lá (element ĐÃ được link) */
    .vnpt-link-existing {
        outline: 2.5px solid #1e8e3e !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999989 !important;
        animation: existingPulse 1.2s infinite alternate;
    }
    @keyframes existingPulse {
        from { outline-color: #1e8e3e; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(30,142,62,0.2); }
        to   { outline-color: #34a853; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(30,142,62,0.15); }
    }

    /* Unlink hover - đỏ/cam (hover trên element đã link =Click để BỎ link) */
    .vnpt-unlink-hover {
        outline: 2.5px solid #ea4335 !important;
        outline-offset: 3px !important;
        position: relative;
        z-index: 9999991 !important;
        animation: unlinkPulse 0.7s infinite alternate;
    }
    .vnpt-unlink-hover::after {
        content: '🔓';
        position: absolute;
        top: -18px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 12px;
        pointer-events: none;
        z-index: 9999992;
    }
    @keyframes unlinkPulse {
        from { outline-color: #ea4335; outline-offset: 2px; box-shadow: 0 0 0 0 rgba(234,67,53,0.2); }
        to   { outline-color: #ff7043; outline-offset: 5px; box-shadow: 0 0 10px 3px rgba(234,67,53,0.18); }
    }

    /* Banner hướng dẫn nổi ở đầu trang */
    .vnpt-linking-banner {
        position: fixed;
        top: 18px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
        color: white;
        padding: 8px 20px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        z-index: 99999999;
        box-shadow: 0 8px 28px rgba(26, 115, 232, 0.5);
        white-space: nowrap;
        letter-spacing: 0.3px;
        display: flex;
        align-items: center;
        gap: 6px;
        animation: bannerSlideDown 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .vnpt-linking-banner kbd {
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.4);
        border-radius: 4px;
        padding: 1px 6px;
        font-family: inherit;
        font-size: 11px;
    }
    /* Badge đếm số links đã chọn */
    .vnpt-link-count-badge {
        background: #34a853;
        color: white;
        font-size: 10px;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 20px;
        letter-spacing: 0.3px;
        animation: badgePop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes badgePop {
        from { transform: scale(0.7); opacity: 0.5; }
        to   { transform: scale(1);   opacity: 1; }
    }
    /* Nút "✅ Xong" bên trong banner */
    .vnpt-link-done-btn {
        background: rgba(255,255,255,0.22);
        border: 1px solid rgba(255,255,255,0.5);
        color: white;
        border-radius: 20px;
        padding: 3px 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        font-family: inherit;
    }
    .vnpt-link-done-btn:hover {
        background: rgba(255,255,255,0.35);
        transform: scale(1.05);
    }
    .vnpt-link-done-btn:active { transform: scale(0.96); }

    @keyframes bannerSlideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-16px) scale(0.9); }
        to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1); }
    }
`;

```

---

### File: src\ui\styles\panel.js

```javascript
export const panelStyles = `
    /* ═══════════════════════════════════════════
       SECTION 1: WIDGET CONTAINER & TOGGLE BTN
       ═══════════════════════════════════════════ */
    #vnpt-docx-widget { position: fixed; top: 100px; right: 50px; z-index: 999999; font-family: var(--vnpt-font); }

    #vnpt-toggle-btn.btn-closed { 
        position: absolute; right: 10px; top: 10px;
        width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
        background: var(--vnpt-primary); color: white; border: none; 
        cursor: pointer; display: flex; align-items: center; justify-content: center; 
        box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
    }
    #vnpt-toggle-btn.btn-closed:hover { transform: scale(1.1) rotate(5deg); background: var(--vnpt-primary-hover); }

    #vnpt-toggle-btn.btn-opened {
        position: absolute; right: 10px; top: 2px;
        width: 32px; height: 32px; font-size: 14px; border-radius: 8px;
        background: var(--vnpt-danger); color: white; border: none;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(234, 67, 53, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 10;
    }
    #vnpt-toggle-btn.btn-opened:hover { transform: scale(1.1) rotate(-5deg); background: var(--vnpt-danger-hover); }

    /* ═══════════════════════════════════════════
       SECTION 2: EXPORT PANEL LAYOUT & HEADER
       ═══════════════════════════════════════════ */
    #vnpt-export-panel { 
        position: relative; 
        width: 380px; min-width: 320px; 
        height: auto; min-height: 200px;
        max-height: 92vh; max-width: 98vw;
        display: flex; flex-direction: column; 
        background: var(--vnpt-bg-glass);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid var(--vnpt-border-bright);
        border-radius: var(--vnpt-radius); padding: 4px; 
        box-shadow: var(--vnpt-shadow);
    }
    #vnpt-export-panel.vnpt-resizing { transition: none !important; user-select: none !important; }
    
    #vnpt-panel-body { display: flex; flex-direction: column; overflow: hidden; flex: 1; margin-top: 4px; border-radius: 12px; }

    #vnpt-panel-header { 
        margin: -4px -4px 0 -4px; padding: 2px 8px;
        border-bottom: 1px solid var(--vnpt-border); 
        cursor: move; user-select: none; 
        display: flex; align-items: center; justify-content: space-between; 
        background: rgba(255, 255, 255, 0.4);
        border-radius: var(--vnpt-radius) var(--vnpt-radius) 0 0;
        gap: 2px;
        position: relative;
    }
    #vnpt-panel-header::after {
        content: ""; position: absolute; bottom: -1px; left: 12px; right: 12px;
        height: 1px; background: linear-gradient(90deg, transparent, var(--vnpt-primary), transparent);
        opacity: 0.3;
    }
    #vnpt-panel-header:hover { background: rgba(255, 255, 255, 0.6); }
    
    .header-left { display: flex; align-items: center; min-width: 40px; flex-shrink: 0; }
    .header-center { display: flex; gap: 2px; flex: 1; justify-content: center; min-width: 0; overflow: hidden; }
    .header-right { 
        display: flex; gap: 2px; align-items: center; 
        margin-right: 34px; flex-shrink: 0;
    }

    #vnpt-panel-title { 
        font-size: 11px; font-weight: 800; letter-spacing: 0.3px;
        background: var(--vnpt-primary-grad);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-transform: uppercase;
    }

    .vnpt-version {
        font-size: 9px; font-weight: 700; color: #9aa0a6;
        margin-left: 4px; vertical-align: bottom; opacity: 0.8;
    }

    .vnpt-update-badge {
        font-size: 8px; font-weight: 900; background: var(--vnpt-danger);
        color: white; padding: 1px 4px; border-radius: 4px;
        margin-left: 4px; cursor: pointer; text-transform: uppercase;
        animation: bounce 2s infinite; display: inline-block;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);}
        40% {transform: translateY(-3px);}
        60% {transform: translateY(-2px);}
    }

    /* 4 Corner Resizers */
    .vnpt-resizer {
        position: absolute; width: 16px; height: 16px; z-index: 10000;
    }
    .vnpt-resizer.tl { top: -4px; left: -4px; cursor: nwse-resize; }
    .vnpt-resizer.tr { top: -4px; right: -4px; cursor: nesw-resize; }
    .vnpt-resizer.bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
    .vnpt-resizer.br { bottom: -4px; right: -4px; cursor: nwse-resize; }
    .vnpt-resizer:hover { background: rgba(26, 115, 232, 0.4); border-radius: 50%; }
    .vnpt-resizer:active { background: var(--vnpt-primary); transform: scale(1.2); }

    body.vnpt-resizing-global * { user-select: none !important; cursor: inherit !important; }

    /* Pinned state */
    #vnpt-export-panel.vnpt-pinned {
        transition: none !important;
    }

    #vnpt-export-panel.vnpt-pinned:not(:hover) {
        min-height: unset !important;
        height: 64px !important;
        width: 460px;
        overflow: hidden;
        padding-bottom: 0 !important;
    }
    
    #vnpt-export-panel.vnpt-pinned:not(:hover) #vnpt-panel-body {
        display: none !important;
    }

    #vnpt-export-panel.vnpt-pinned:hover #vnpt-panel-body {
        display: flex !important;
    }
`;

```

---

### File: src\ui\styles\scanner.js

```javascript
export const scannerStyles = `
    /* ═══════════════════════════════════════════
       SECTION 7: PDF SCAN MODAL
       ═══════════════════════════════════════════ */
    .btn-scan-pdf { background: rgba(30, 142, 62, 0.08); color: var(--vnpt-success); border: 1px solid rgba(30, 142, 62, 0.1); } 
    .btn-scan-pdf:hover { background: var(--vnpt-success); color: #fff; border-color: transparent; }

    .vnpt-pdf-overlay { 
        position: fixed; inset: 0; background: rgba(0,0,0,0.4);
        backdrop-filter: blur(4px); z-index: 9999999; display: flex;
        align-items: center; justify-content: center; font-family: var(--vnpt-font);
    }
    
    .vnpt-pdf-loading-box {
        background: #fff; padding: 30px 40px; border-radius: 20px;
        text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        animation: pdfFadeIn 0.3s ease;
    }

    .loader-spinner {
        border: 4px solid #f3f3f3; border-top: 4px solid var(--vnpt-primary);
        border-radius: 50%; width: 40px; height: 40px; margin: 0 auto;
        animation: spin 1s linear infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    .vnpt-pdf-dialog-box { 
        background: #fff; border-radius: 20px; padding: 20px;
        width: 560px; max-width: 92vw; max-height: 80vh; 
        display: flex; flex-direction: column;
        box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: pdfFadeIn 0.3s ease; 
    }
    @keyframes pdfFadeIn { 
        from { opacity:0; transform: scale(0.92) translateY(20px); }
        to { opacity:1; transform: scale(1) translateY(0); } 
    }

    .pdf-dlg-header h3 { margin: 0 0 16px 0; color: #3c4043; font-size: 15px; }
    
    .pdf-dlg-cols {
        display: flex; gap: 12px; flex: 1; overflow: hidden; margin-bottom: 16px;
    }
    
    .pdf-col-left {
        flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 12px;
        padding: 12px; overflow-y: auto; font-family: 'Courier New', monospace;
        font-size: 12px; line-height: 1.6; color: #3c4043; white-space: pre-wrap;
    }
    
    .pdf-col-right {
        flex: 1.2; display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid #e0e0e0; border-radius: 12px;
    }

    .pdf-dlg-body { flex: 1; overflow-y: auto; }

    .pdf-result-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
    .pdf-result-table th { background: #f8f9fa; padding: 10px; text-align: left; font-weight: 800; color: #5f6368; position: sticky; top: 0; z-index: 2; border-bottom: 1px solid #e0e0e0; }
    .pdf-result-table td { padding: 8px; border-bottom: 1px solid #f1f3f4; vertical-align: middle; }
    .pdf-row-auto td { background: #fff; }
    .pdf-row-auto:hover td { background: #f8f9fa; }

    .pdf-val-input {
        width: 100%; padding: 6px 10px; border: 1px solid #dadce0; border-radius: 6px;
        font-size: 12px; font-weight: 600; color: #1a73e8; transition: all 0.2s;
        box-sizing: border-box;
    }
    .pdf-val-input:focus { border-color: var(--vnpt-primary); outline: none; box-shadow: 0 0 0 3px var(--vnpt-primary-light); }

    .vnpt-pdf-actions { display: flex; gap: 8px; justify-content: flex-end; align-items: center; border-top: 1px solid #f1f3f4; padding-top: 12px; }
    
    .pdf-btn-cancel {
        padding: 8px 16px; background: #f1f3f4; border: none; border-radius: 8px;
        color: #3c4043; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .pdf-btn-cancel:hover { background: #e8eaed; }
    .pdf-btn-confirm {
        padding: 8px 16px; background: var(--vnpt-primary); border: none; border-radius: 8px;
        color: #fff; font-weight: 700; cursor: pointer; transition: 0.2s;
    }
    .pdf-btn-confirm:hover { background: var(--vnpt-primary-hover); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }

    /* ═══════════════════════════════════════════
       SECTION 8: AI SCANNER UI
       ═══════════════════════════════════════════ */
    #vnpt-btn-ai-mode.active { background: var(--vnpt-primary); color: #fff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.3); }

    .vnpt-ai-scanner-section {
        padding: 8px; background: rgba(255, 255, 255, 0.5); border-bottom: 1px solid var(--vnpt-border);
        display: flex; flex-direction: column; gap: 6px;
    }

    .ai-scanner-header { display: flex; align-items: center; justify-content: space-between; }
    .ai-title { font-size: 11px; font-weight: 800; color: #1a73e8; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .ai-scan-row { display: flex; flex-direction: row; gap: 6px; align-items: stretch; }

    .ai-queue-container {
        flex: 0 0 110px;
        border: 2px dashed #dadce0; border-radius: 12px; min-height: 100px; background: rgba(255,255,255,0.7);
        display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
        padding: 4px; gap: 4px; transition: all 0.2s; cursor: pointer; position: relative; overflow: hidden;
    }
    .ai-queue-container:hover, .ai-queue-container.drag-over { border-color: var(--vnpt-primary); background: var(--vnpt-primary-light); }
    .ai-queue-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1; text-align: center; gap: 2px; }
    .ai-queue-placeholder span:first-child { font-size: 20px; pointer-events: none; }
    .ai-queue-placeholder span:last-child { font-size: 9px; color: #9aa0a6; font-weight: 600; pointer-events: none; white-space: nowrap; line-height: 1.3; }
    
    .ai-queue-list { display: flex; flex-wrap: wrap; gap: 4px; overflow-y: auto; width: 100%; }
    .ai-queue-list::-webkit-scrollbar { width: 3px; }
    .ai-queue-list::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 4px; }
    
    .ai-queue-item {
        flex: 0 0 auto; width: 40px; height: 40px; border-radius: 6px; position: relative; border: 1px solid #e0e0e0;
        background: #fff; display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .ai-queue-item img { width: 100%; height: 100%; object-fit: cover; }
    .ai-queue-item .file-icon { font-size: 20px; }
    .ai-queue-item .btn-remove-item {
        position: absolute; top: 0; right: 0; background: rgba(234,67,53,0.9); color: #fff;
        width: 14px; height: 14px; font-size: 9px; display: flex; align-items: center; justify-content: center;
        border: none; cursor: pointer; border-bottom-left-radius: 4px; opacity: 0; transition: opacity 0.2s;
    }
    .ai-queue-item:hover .btn-remove-item { opacity: 1; }

    #vnpt-raw-scan-input {
        flex: 1; min-width: 0; min-height: 100px; padding: 8px; border-radius: 12px; box-sizing: border-box;
        border: 1px solid #1f5bd2ff; background: rgba(255, 255, 255, 0.8);
        font-size: 11px; font-family: inherit; resize: none; line-height: 1.5;
        transition: all 0.2s;
    }
    #vnpt-raw-scan-input:focus { border-color: var(--vnpt-primary); box-shadow: 0 0 0 3px var(--vnpt-primary-light); outline: none; }
    #vnpt-raw-scan-input.ai-scanning-glow {
        border-color: #f57f17;
        animation: textPulse 1s infinite alternate;
        pointer-events: none; opacity: 0.8;
    }
    @keyframes textPulse {
        from { box-shadow: 0 0 0 2px rgba(245, 127, 23, 0.2); }
        to { box-shadow: 0 0 0 6px rgba(245, 127, 23, 0.5); border-color: #ffb300; }
    }
    
    .raw-scan-actions { display: flex; justify-content: space-between; gap: 6px; margin-top: 4px; }
    .raw-scan-actions .vnpt-btn-confirm { padding: 6px 12px; font-size: 11px; height: auto; flex: 1; text-align: center; }
    .btn-local-process { background: var(--vnpt-success) !important; box-shadow: 0 4px 12px rgba(30, 142, 62, 0.2) !important; flex: 1; }
    .btn-local-process:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-ai-process { background: var(--vnpt-primary-grad) !important; box-shadow: 0 4px 12px rgba(26, 115, 232, 0.2) !important; font-weight: 800; flex: 1.3;}

    /* ═══════════════════════════════════════════
       SECTION 5: TEMPLATE MANAGER & BOTTOM ROW
       ═══════════════════════════════════════════ */
    .bottom-export-area {
        display: flex; flex-direction: column;
        border-top: 1px solid var(--vnpt-border);
        background: rgba(255, 255, 255, 0.1);
        padding-top: 2px;
    }

    #vnpt-template-section {
        display: none;
        margin: 0;
        padding: 0;
    }

    .bottom-export-area:hover #vnpt-template-section {
        display: block;
        max-height: 400px;
        margin-bottom: 8px;
        padding-top: 4px;
    }

    .bottom-export-row { display: flex; align-items: center; gap: 6px; margin-top: 4px; padding: 0 4px; }
    .bottom-export-row .vnpt-control-group { margin-bottom: 0; flex: 1; min-width: 0; display: flex; align-items: center; gap: 4px; }
    .bottom-export-row .vnpt-control-group input[type="text"] { height: 24px; padding: 2px 8px; border-radius: 6px; border: 1px solid #1f5bd2ff; flex: 1; min-width: 0; font-size: 11px; }
    
    .btn-upload-local {
        display: inline-flex; align-items: center; justify-content: center;
        width: 24px; height: 24px; border-radius: 6px;
        background: rgba(0,0,0,0.04); border: 1px solid #dadce0;
        font-size: 12px; cursor: pointer; transition: all 0.2s;
        color: #5f6368; box-sizing: border-box;
        flex-shrink: 0;
    }
    .btn-upload-local:hover { 
        background: var(--vnpt-primary-light); border-color: var(--vnpt-primary);
        color: var(--vnpt-primary); transform: scale(1.05);
    }
    
    .vnpt-control-group .btn-export { flex: 0 0 auto; height: 24px; margin: 0; border-radius: 6px; background: var(--vnpt-primary-grad); color: white; border: none; font-weight: 800; font-size: 11px; padding: 0 12px; cursor: pointer; }
    .vnpt-control-group .btn-export:hover { opacity: 0.9; transform: translateY(-1px); }

    #vnpt-btn-export-txt { color: #00695c; border-color: rgba(0, 105, 92, 0.3); }
    #vnpt-btn-export-txt:hover { background: #00695c; color: white; border-color: transparent; }
    .text-hint { font-size: 11px; color: #70757a; font-style: italic; text-align: center; margin-bottom: 4px; }
`;

```

---

### File: src\ui\styles\template.js

```javascript
export const templateStyles = `
    /* ═══════════════════════════════════════════
       SECTION: TEMPLATE MANAGER
       ═══════════════════════════════════════════ */
    .vnpt-template-manager-inner {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .tmpl-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;
        border-top: 1px solid #eee;
        padding-top: 5px;
    }

    .vnpt-title-main {
        font-size: 11px;
        font-weight: 700;
        color: #444;
    }

    .vnpt-btn-wrap {
        display: flex;
        gap: 4px;
    }

    .vnpt-local-list-container {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .tmpl-row-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        background: #f8f9fa;
        border: 1px solid #e0e0e0;
        border-radius: 15px;
        cursor: pointer;
        outline: none;
        transition: all 0.2s;
    }
    .tmpl-row-item:hover {
        background: #fff;
        border-color: var(--vnpt-primary-light);
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .tmpl-row-item.active {
        border-color: var(--vnpt-primary);
        background: var(--vnpt-primary-light);
    }

    .tmpl-badge-cloud {
        font-size: 8px;
        padding: 1px 5px;
        border-radius: 10px;
        flex-shrink: 0;
        font-weight: bold;
        background: #1976d2;
        color: #fff;
    }

    .tmpl-name-text {
        font-size: 11px;
        font-weight: 600;
        color: #212529;
        white-space: nowrap;
    }
    .tmpl-row-item.active .tmpl-name-text {
        color: var(--vnpt-primary);
    }

    .tmpl-btn-rename {
        font-size: 10px;
        padding: 1px 4px;
        border: none;
        background: none;
        color: #555;
        cursor: pointer;
        margin-left: auto;
    }
    .tmpl-btn-del {
        font-size: 10px;
        padding: 1px 4px;
        border: none;
        background: none;
        color: #d32f2f;
        cursor: pointer;
        margin-left: 2px;
    }
`;

```

---

### File: src\ui\styles\theme.js

```javascript
export const themeStyles = `
    :root {
        --vnpt-primary: #1a73e8;
        --vnpt-primary-hover: #1557b0;
        --vnpt-primary-light: rgba(26, 115, 232, 0.1);
        --vnpt-primary-grad: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
        --vnpt-danger: #ea4335;
        --vnpt-danger-hover: #d93025;
        --vnpt-success: #1e8e3e;
        --vnpt-bg-glass: rgba(255, 255, 255, 0.82);
        --vnpt-border: rgba(0, 0, 0, 0.08);
        --vnpt-border-bright: rgba(255, 255, 255, 0.4);
        --vnpt-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        --vnpt-radius: 16px;
        --vnpt-font: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .sensitive-mask {
        -webkit-text-security: disc !important;
    }
`;

```

---

### File: src\ui\styles.js

```javascript
/**
 * @file styles.js
 * @desc Entry point cho hệ thống CSS của VNPT PRO.
 *       Tất cả CSS hiện đã được tách ra các module nhỏ trong thư mục ./styles/ 
 *       để dễ bảo trì và phân tích.
 */

import { injectStyles as injectStylesInternal } from './styles/index.js';

export function injectStyles() {
    injectStylesInternal();
}

```

---

### File: src\ui\toast.js

```javascript
/**
 * @file toast.js
 * @desc Hiển thị thông báo (toast) nhỏ gọn.
 *       Đã tối ưu: Hỗ trợ cộng dồn (stacking) nhiều thông báo cùng lúc.
 */

let toastContainer = null;

/**
 * Hiển thị thông báo dạng toast
 * @param {string} msg Nội dung thông báo
 * @param {string} color Màu nền (Hex/CSS color)
 * @param {number} duration Thời gian hiển thị (ms)
 */
export function showToast(msg, color = '#198754', duration = 2500) {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'vnpt-toast-container';
        Object.assign(toastContainer.style, {
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column-reverse', // Thông báo mới ở dưới cùng, đẩy cũ lên
            alignItems: 'center',
            gap: '8px',
            zIndex: '1000000',
            pointerEvents: 'none'
        });
        document.body.appendChild(toastContainer);
    }

    const t = document.createElement('div');
    t.innerText = msg;
    Object.assign(t.style, {
        background: color,
        color: '#fff',
        padding: '8px 18px',
        borderRadius: '24px',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'opacity 0.3s, transform 0.3s',
        fontSize: '13px',
        fontWeight: '500',
        fontFamily: "'Segoe UI', Roboto, sans-serif",
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        whiteSpace: 'nowrap',
        pointerEvents: 'auto'
    });

    toastContainer.appendChild(t);

    // Fade in
    requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
    });

    // Fade out and remove
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            t.remove();
            // Nếu không còn toast nào, xóa container để giải phóng tài nguyên (tùy chọn)
            if (toastContainer && toastContainer.childNodes.length === 0) {
                // Giữ lại container để tái sử dụng nhanh hơn
            }
        }, 300);
    }, duration);
}

```

---

### File: src\ui\widget.js

```javascript
/**
 * @file widget.js
 * @desc Khởi tạo giao diện chính của VNPT Export Widget (panel bên phải).
 *       Thiết lập layout HTML, quản lý trạng thái đóng/mở, lưu kích thước (ResizeObserver),
 *       và kết nối với các module: FieldsManager, TemplateManager.
 * @exports initWidget  — Tạo DOM, khôi phục state, và gán sự kiện đóng/mở panel
 * @seeAlso features/fieldsManager.js (bảng dữ liệu), features/templateManager.js (mẫu DOCX)
 */
import { AppState } from '../core/state.js';
import { renderTemplateManager, saveLocalTemplate } from '../features/templateManager.js';
import { initFieldsManager, loadSavedData } from '../features/fieldsManager.js';
import { LOCAL_KEY_SIZE, LOCAL_KEY_OPENED, LOCAL_KEY_POS, SK_CALC_MAP, SK_HOTKEYS, APP_VERSION, LOCAL_KEY_PINNED } from '../core/constants.js';
import { DEFAULT_CALC_MAP, DEFAULT_HOTKEYS } from '../core/defaults.js';
import { exportConfig } from '../features/configManager.js';
import { Storage } from '../utils/storage.js';
import { exportFullBackup, importFullBackup, getInternalBackups, restoreInternalBackup } from '../utils/backupHelper.js';
import { startRecording, getHotkeyString } from '../features/hotkeys.js';
import { showToast } from './toast.js';
import { testGeminiConnection } from '../api/gemini.js';
import { initCloudSyncUI } from './components/CloudSyncUI.js';
import { RemoteConfig } from '../api/remoteConfig.js';
import { generateVNPTMockData } from '../features/mockDataGenerator.js';


export function initWidget() {
    const widget = document.getElementById('vnpt-docx-widget') || document.createElement('div');
    widget.id = 'vnpt-docx-widget'; // Widget bọc ngoài cùng
    // Khôi phục trạng thái mở/đóng và ghim
    const isOpened = Storage.get(LOCAL_KEY_OPENED) === true;
    const isPinned = Storage.get(LOCAL_KEY_PINNED) === true;

    widget.innerHTML = `
        <button id="vnpt-toggle-btn" title="Mở/Đóng UI Hợp đồng" class="${isOpened ? 'btn-opened' : 'btn-closed'}">${isOpened ? '✖' : '📄'}</button>

        <div id="vnpt-export-panel" style="display: ${isOpened ? 'flex' : 'none'};">
            <!-- 4 Corner Resizers -->
            <div class="vnpt-resizer tl"></div>
            <div class="vnpt-resizer tr"></div>
            <div class="vnpt-resizer bl"></div>
            <div class="vnpt-resizer br"></div>

            <div id="vnpt-panel-header" title="Kẹp chuột vào đây để di chuyển">
                <div class="header-left">
                    <button class="vnpt-btn-icon" id="vnpt-btn-pin" title="Ghim thu gọn UI (Tự mở khi di chuột)" style="margin-right:4px; font-size:12px; width:24px; height:24px; border:none; background:transparent;">${isPinned ? '📌' : '📎'}</button>
                    <span id="vnpt-panel-title">VNPT PRO</span>
                    <span class="vnpt-version">v${APP_VERSION}</span>
                    <span id="vnpt-update-badge-container"></span>
                </div>
                <div class="header-center">
                    <button class="vnpt-btn-header btn-ai" id="vnpt-btn-ai-mode" title="Mở bảng điều khiển AI Scanner">✨ AI</button>
                    <button class="vnpt-btn-header btn-scan" id="vnpt-btn-scan" title="Lấy data theo biểu mẫu web">🔍 Quét</button>
                    <button class="vnpt-btn-header btn-fill" id="vnpt-btn-fill-back" title="Điền dữ liệu ngược lên web">📝 Điền</button>
                    <button class="vnpt-btn-header btn-id" id="vnpt-btn-toggle-id" title="Ẩn hiện key đồng bộ">🆔 ID</button>
                    <input type="file" id="vnpt-pdf-input" accept=".pdf,image/*" style="display:none;" />
                </div>
                <div class="header-right">
                    <button class="vnpt-btn-icon btn-add" id="vnpt-btn-add" title="Chèn thêm trường trống">✚</button>
                    <button class="vnpt-btn-icon btn-clean" id="vnpt-btn-batch-del" title="Dọn dẹp & Lưu vào History (Shift+Click để Xóa hàng)">🗑</button>
                    <div class="vnpt-restore-dropdown" style="position: relative; display: flex;">
                        <button class="vnpt-btn-icon btn-restore" id="vnpt-btn-restore-last" title="Khôi phục bản gần nhất">⏪</button>
                        <div id="vnpt-backup-history" class="vnpt-backup-history"></div>
                    </div>
                    
                    <div class="vnpt-util-dropdown">
                        <button class="vnpt-btn-icon btn-more" id="vnpt-btn-more" title="Thêm công cụ">⚙️</button>
                        <div class="vnpt-util-menu" id="vnpt-util-menu">
                            <div class="util-config-container">
                                <!-- Nhóm 1: Hệ thống -->
                                <div class="util-section-mini">
                                    <div class="util-action-row">
                                        <button class="util-item-mini" id="vnpt-btn-default" title="Dữ liệu mặc định VNPT">🏢 VNPT</button>
                                        <button class="util-item-mini danger" id="vnpt-btn-clean-data" title="Reset All">🧹 Reset</button>
                                        <div class="util-json-group" style="display: flex; gap: 2px; flex-shrink: 0;">
                                            <button class="util-item-mini btn-json-icon" id="vnpt-btn-import-json" title="Nhập JSON">📥</button>
                                            <button class="util-item-mini btn-json-icon" id="vnpt-btn-export-json" title="Xuất JSON">📤</button>
                                        </div>
                                        <input type="file" id="vnpt-file-import-json" name="vnpt-file-import-json" accept=".json" style="display: none;">
                                    </div>
                                </div>

                                <!-- Nhóm 2: Giao diện -->
                                <div class="util-section-mini">
                                    <div class="util-row-compact">
                                        <span class="util-label-tiny">Cỡ:</span>
                                        <div class="size-options-tiny">
                                            <button data-size="S">S</button>
                                            <button data-size="M">M</button>
                                            <button data-size="L">L</button>
                                            <button data-size="Full">MAX</button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Nhóm 3: Cloud & AI -->
                                <div class="util-section-mini">
                                    <div id="vnpt-cloud-sync-container"></div>
                                    <div class="gemini-config-mini">
                                        <div class="cw-row-mini">
                                            <input id="vnpt-gemini-key" type="text" placeholder="Gemini Key..." class="cw-input-mini sensitive-mask">
                                            <button class="util-btn-test-tiny" id="vnpt-btn-test-gemini">⚡</button>
                                        </div>
                                        <select id="vnpt-gemini-model" class="cw-input-mini" style="margin-top:4px;">
                                            <option value="gemini-2.5-flash">2.5 Flash</option>
                                            <option value="gemini-2.5-flash-lite">2.5 Lite</option>
                                            <option value="gemini-3.1-flash-lite-preview">3.1 Lite</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Nhóm 4: Phím tắt -->
                                <div class="util-section-mini">
                                    <div class="util-label-tiny" style="margin-bottom:4px;">PHÍM TẮT:</div>
                                    <div id="vnpt-hotkey-list" class="vnpt-hotkey-list-mini">
                                        <!-- Replaced by renderHotkeys -->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Inline Calculator Container -->
            <div id="vnpt-inline-calc"></div>

            <div id="vnpt-panel-body">
                <!-- AI Scanner Section (Hidden by default) -->
                <div id="vnpt-ai-scanner-section" class="vnpt-ai-scanner-section" style="display: none;">
                    <div class="ai-scanner-header" style="margin-bottom: -2px;">
                        <span class="ai-title">Xử lý tệp & Nhập văn bản:</span>
                    </div>
                    
                    <div class="ai-scan-row">
                        <div class="ai-queue-container" id="vnpt-ai-queue-container" title="Bấm để chọn file hoặc dán (Ctrl+V) file/ảnh vào đây">
                            <div class="ai-queue-placeholder" id="vnpt-ai-queue-placeholder">
                                <span>📁</span>
                                <span>Kéo thả / Ctrl+V</span>
                            </div>
                            <div class="ai-queue-list" id="vnpt-ai-queue-list"></div>
                        </div>

                        <textarea id="vnpt-raw-scan-input" placeholder="Nhập rác để quét tự động, HOẶC dùng @key để Copy thành Text Template..."></textarea>
                    </div>
                    
                    <div class="raw-scan-actions">
                        <button class="vnpt-btn-icon" id="vnpt-btn-show-pdf" title="Xem lại Kết quả cũ">📝</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-clear-queue" title="Xóa hàng đợi & nội dung">🗑️</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-scan-mail" title="Trích xuất nội dụng Mail (Gmail/Outlook)">📧</button>
                        <button class="vnpt-btn-icon" id="vnpt-btn-export-txt" title="Copy chuỗi thành Text Template">📋</button>
                        <button id="vnpt-btn-raw-process-local" class="vnpt-btn-confirm btn-local-process" title="Phân loại nhanh văn bản bằng offline Regex">QR Text</button>
                        <button id="vnpt-btn-ai-process" class="vnpt-btn-confirm btn-ai-process">QUÉT AI</button>
                        <span id="vnpt-token-usage" title="Dung lượng AI đã dùng hôm nay (Reset lúc 0h)" style="font-size: 11px; color: #5f6368; font-weight: 500; margin-left: auto; display: flex; align-items: center; white-space: nowrap;">📊 0 req (0 tok)</span>
                    </div>
                </div>

                <div id="vnpt-banner-area"></div>
                <div id="vnpt-fields-container">
                    <div id="vnpt-fields-list"></div>
                </div>



                <div class="bottom-export-area">
                    <div id="vnpt-template-section">
                        <div id="vnpt-template-manager"></div>
                    </div>

                    <div class="bottom-export-row">
                        <input type="file" id="vnpt-template-file" name="vnpt-template-file" accept=".docx" style="display:none;" />
                        <div class="vnpt-control-group">
                            <label for="vnpt-template-file" class="btn-upload-local" title="Chọn file DOCX từ máy tính">📁</label>
                            <input type="text" id="vnpt-export-filename" name="vnpt-export-filename" value="Export_Auto.docx" title="Tên file DOCX khi xuất" />
                            <button class="vnpt-btn-action btn-export" id="vnpt-btn-export" title="Xuất ra file DOCX">🖨️ XUẤT</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(widget);

    AppState.widget = widget;
    AppState.panel = document.getElementById('vnpt-export-panel');
    AppState.toggleBtn = document.getElementById('vnpt-toggle-btn');
    AppState.header = document.getElementById('vnpt-panel-header');
    AppState.bannerArea = document.getElementById('vnpt-banner-area');
    AppState.fieldsContainer = document.getElementById('vnpt-fields-list');
    AppState.fieldsWrapper = document.getElementById('vnpt-fields-container');

    // Khôi phục kích thước bảng
    try {
        const savedSize = Storage.get(LOCAL_KEY_SIZE);
        if (savedSize && savedSize.width && savedSize.height) {
            AppState.panel.style.width = savedSize.width + 'px';
            AppState.panel.style.height = savedSize.height + 'px';
            if (savedSize.zoom) {
                AppState.panel.style.zoom = savedSize.zoom;
            }
        }
    } catch (e) { console.error('Lỗi load size panel:', e); }

    // Theo dõi và lưu kích thước bảng
    const resizeObserver = new ResizeObserver(entries => {
        if (AppState.panel.style.display === 'none') return;
        for (let entry of entries) {
            const { width, height } = entry.contentRect;
            if (width > 0 && height > 0) {
                Storage.setDebounced(LOCAL_KEY_SIZE, {
                    width: Math.round(width + 20),
                    height: Math.round(height + 20),
                    zoom: parseFloat(AppState.panel.style.zoom) || 1
                }, 1000);
            }
        }
    });
    resizeObserver.observe(AppState.panel);

    AppState.panelBody = document.getElementById('vnpt-panel-body');

    renderTemplateManager(
        document.getElementById('vnpt-template-manager'),
        (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        }
    );

    document.getElementById('vnpt-template-file').addEventListener('change', function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const tmplContainer = document.getElementById('vnpt-template-manager');

        saveLocalTemplate(file, tmplContainer, (arrayBuffer, name) => {
            AppState.templateBuffer = arrayBuffer;
            AppState.templateName = name;
        });
        this.value = '';
    });

    // Đóng/Mở Panel 
    AppState.toggleBtn.addEventListener('click', (e) => {
        if (AppState.hasDragged) return;

        if (AppState.panel.style.display === 'none') {
            AppState.panel.style.display = 'flex';
            AppState.toggleBtn.className = 'btn-opened';
            AppState.toggleBtn.innerHTML = '✖';
            Storage.set(LOCAL_KEY_OPENED, true);
        } else {
            AppState.panel.style.display = 'none';
            AppState.toggleBtn.className = 'btn-closed';
            AppState.toggleBtn.innerHTML = '📄';
            Storage.set(LOCAL_KEY_OPENED, false);
        }
    });

    // Pin/Unpin Logic
    const pinBtn = document.getElementById('vnpt-btn-pin');
    if (isPinned) AppState.panel.classList.add('vnpt-pinned');
    
    pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const currentlyPinned = AppState.panel.classList.contains('vnpt-pinned');
        if (currentlyPinned) {
            AppState.panel.classList.remove('vnpt-pinned');
            Storage.set(LOCAL_KEY_PINNED, false);
            pinBtn.innerHTML = '📎';
            pinBtn.title = 'Ghim thu gọn UI (Tự mở khi di chuột)';
        } else {
            AppState.panel.classList.add('vnpt-pinned');
            Storage.set(LOCAL_KEY_PINNED, true);
            pinBtn.innerHTML = '📌';
            pinBtn.title = 'Bỏ ghim UI';
        }
    });

    const moreBtn = document.getElementById('vnpt-btn-more');
    const utilMenu = document.getElementById('vnpt-util-menu');
    const SIZE_PRESETS = {
        'S': { width: '380px', height: '420px', zoom: 0.9 },
        'M': { width: '460px', height: '600px', zoom: 1 },
        'L': { width: '620px', height: '800px', zoom: 1.15 },
        'Full': { width: '98vw', height: '92vh', zoom: 1.25 }
    };



    const geminiKeyInput = document.getElementById('vnpt-gemini-key');
    const geminiModelSelect = document.getElementById('vnpt-gemini-model');


    if (geminiKeyInput && geminiModelSelect) {
        import('../core/constants.js').then(({ SK_GEMINI_KEY, SK_GEMINI_MODEL }) => {
            geminiKeyInput.value = Storage.get(SK_GEMINI_KEY) || '';
            const savedModel = Storage.get(SK_GEMINI_MODEL) || 'gemini-2.5-flash';
            // Cập nhật giá trị hiển thị để khớp với bộ nhớ mới
            let isModelExist = Array.from(geminiModelSelect.options).some(opt => opt.value === savedModel);
            geminiModelSelect.value = isModelExist ? savedModel : 'gemini-2.5-flash';

            geminiKeyInput.onchange = () => {
                Storage.set(SK_GEMINI_KEY, geminiKeyInput.value.trim());
            };
            geminiModelSelect.onchange = () => {
                Storage.set(SK_GEMINI_MODEL, geminiModelSelect.value);
            };

            // Nút kiểm tra kết nối
            const btnTest = document.getElementById('vnpt-btn-test-gemini');
            if (btnTest) {
                btnTest.onclick = async () => {
                    const key = geminiKeyInput.value.trim();
                    const model = geminiModelSelect.value;

                    if (!key) {
                        showToast("⚠️ Vui lòng nhập API Key trước khi thử", "#ffc107");
                        return;
                    }

                    btnTest.disabled = true;
                    // btnTest.textContent = "⏳ Đang thử..."; // Bỏ theo yêu cầu

                    try {
                        await testGeminiConnection(key, model);
                        showToast("✅ Kết nối tới Gemini thành công!", "#1e8e3e");
                    } catch (err) {
                        showToast("❌ Kết nối thất bại: " + err, "#ea4335");
                    } finally {
                        btnTest.disabled = false;
                        // btnTest.textContent = "⚡ Kiểm tra kết nối"; // Bỏ theo yêu cầu
                    }
                };
            }
        });
    }

    document.getElementById('vnpt-btn-export-json').onclick = () => exportFullBackup();

    const btnMockData = document.getElementById('vnpt-btn-mock-data');
    if (btnMockData) {
        btnMockData.onclick = () => {
            generateVNPTMockData();
            showToast("🎲 Đã sinh dữ liệu ảo (Mock Data) thành công!", "#9c27b0");
        };
    }



    const btnImport = document.getElementById('vnpt-btn-import-json');
    const fileImport = document.getElementById('vnpt-file-import-json');

    btnImport.onclick = () => fileImport.click();
    fileImport.onchange = async (e) => {
        if (e.target.files.length > 0) {
            const success = await importFullBackup(e.target.files[0]);
            if (success) setTimeout(() => location.reload(), 1500);
        }
    };

    moreBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShow = utilMenu.classList.toggle('show');
        moreBtn.classList.toggle('active', isShow);
    });

    utilMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
        if (utilMenu.classList.contains('show')) {
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        }
    });

    const closeUtilBtn = document.getElementById('vnpt-btn-close-util');
    if (closeUtilBtn) {
        closeUtilBtn.onclick = (e) => {
            e.stopPropagation();
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        };
    }

    utilMenu.querySelectorAll('.size-options-tiny button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sizeKey = e.target.getAttribute('data-size');
            const preset = SIZE_PRESETS[sizeKey];
            if (preset) {
                AppState.panel.style.width = preset.width;
                AppState.panel.style.height = preset.height;
                AppState.panel.style.zoom = preset.zoom;
            }
            utilMenu.classList.remove('show');
            moreBtn.classList.remove('active');
        });
    });

    // --- Hotkey Manager Logic ---
    function renderHotkeys() {
        const hotkeyList = document.getElementById('vnpt-hotkey-list');
        if (!hotkeyList) return;

        const hotkeys = Storage.get(SK_HOTKEYS, DEFAULT_HOTKEYS);
        hotkeyList.innerHTML = '';

        Object.entries(hotkeys).forEach(([action, config]) => {
            const row = document.createElement('div');
            row.className = 'vnpt-hotkey-row';
            row.innerHTML = `
                <span class="vnpt-hotkey-label">${config.label || action}</span>
                <button class="vnpt-hotkey-btn" data-action="${action}">${getHotkeyString(config)}</button>
            `;

            const btn = row.querySelector('.vnpt-hotkey-btn');
            btn.onclick = (e) => {
                e.stopPropagation();
                if (btn.classList.contains('recording')) return;

                btn.classList.add('recording');
                btn.textContent = 'Bấm phím...';

                startRecording(action, (newConfig) => {
                    btn.classList.remove('recording');
                    btn.textContent = getHotkeyString(newConfig);
                });
            };

            hotkeyList.appendChild(row);
        });
    }
    renderHotkeys();

    // Custom Resizing 4 Corners
    const resizers = AppState.panel.querySelectorAll('.vnpt-resizer');
    resizers.forEach(resizer => {
        resizer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = AppState.panel.offsetWidth;
            const startHeight = AppState.panel.offsetHeight;
            const widgetRect = AppState.widget.getBoundingClientRect();
            const startTop = widgetRect.top;
            const startRight = window.innerWidth - widgetRect.right;

            AppState.panel.classList.add('vnpt-resizing');
            document.body.classList.add('vnpt-resizing-global');
            const cursor = window.getComputedStyle(resizer).cursor;
            document.body.style.cursor = cursor;

            const onMouseMove = (moveEvt) => {
                const dx = moveEvt.clientX - startX;
                const dy = moveEvt.clientY - startY;

                if (resizer.classList.contains('br')) {
                    AppState.panel.style.width = Math.max(360, startWidth + dx) + 'px';
                    AppState.panel.style.height = Math.max(250, startHeight + dy) + 'px';
                } else if (resizer.classList.contains('bl')) {
                    const newWidth = startWidth - dx;
                    if (newWidth > 360) {
                        AppState.panel.style.width = newWidth + 'px';
                    }
                    AppState.panel.style.height = Math.max(250, startHeight + dy) + 'px';
                } else if (resizer.classList.contains('tr')) {
                    AppState.panel.style.width = Math.max(360, startWidth + dx) + 'px';
                    const newHeight = startHeight - dy;
                    if (newHeight > 250) {
                        AppState.panel.style.height = newHeight + 'px';
                        AppState.widget.style.top = (startTop + dy) + 'px';
                    }
                } else if (resizer.classList.contains('tl')) {
                    const newWidth = startWidth - dx;
                    const newHeight = startHeight - dy;
                    if (newWidth > 360) {
                        AppState.panel.style.width = newWidth + 'px';
                    }
                    if (newHeight > 250) {
                        AppState.panel.style.height = newHeight + 'px';
                        AppState.widget.style.top = (startTop + dy) + 'px';
                    }
                }
            };

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                AppState.panel.classList.remove('vnpt-resizing');
                document.body.classList.remove('vnpt-resizing-global');
                document.body.style.cursor = '';

                // Lưu vị trí và kích thước
                const isRightAnchor = AppState.widget.id === 'vnpt-docx-widget';
                Storage.setDebounced(LOCAL_KEY_POS, {
                    right: isRightAnchor ? AppState.widget.style.right : undefined,
                    top: AppState.widget.style.top,
                    x: isRightAnchor ? undefined : parseFloat(AppState.widget.style.left),
                    y: parseFloat(AppState.widget.style.top),
                }, 500);

                Storage.setDebounced(LOCAL_KEY_SIZE, {
                    width: AppState.panel.offsetWidth,
                    height: AppState.panel.offsetHeight,
                    zoom: parseFloat(AppState.panel.style.zoom) || 1
                }, 500);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        });
    });


    // --- Cloud Sync UI ---
    const cloudContainer = document.getElementById('vnpt-cloud-sync-container');
    if (cloudContainer) {
        initCloudSyncUI(cloudContainer);
    }

    // --- Pin & Hover Logic ---
    const panel = AppState.panel;
    
    const handleMouseEnter = () => {
        if (AppState.panel.classList.contains('vnpt-pinned') && AppState.panel.style.display === 'none') {
            AppState.panel.style.display = 'flex';
            AppState.toggleBtn.className = 'btn-opened';
            AppState.toggleBtn.innerHTML = '✖';
        }
    };

    const handleMouseLeave = () => {
        if (!AppState.panel.classList.contains('vnpt-pinned')) return;
        
        // Kiểm tra xem có đang focus vào input nào bên trong panel không
        const isFocusingInput = AppState.panel.contains(document.activeElement) && 
                                (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA');
        
        // Nếu đang gõ hoặc chọn gợi ý (focus), không tự động đóng
        if (isFocusingInput) return;

        AppState.panel.style.display = 'none';
        AppState.toggleBtn.className = 'btn-closed';
        AppState.toggleBtn.innerHTML = '📄';
    };

    // Gán sự kiện cho cả nút toggle và panel để đảm bảo mượt mà
    AppState.widget.addEventListener('mouseenter', handleMouseEnter);
    AppState.widget.addEventListener('mouseleave', handleMouseLeave);

    // Lắng nghe khi kết thúc focus (ví dụ chọn xong gợi ý hoặc click ra ngoài)
    document.addEventListener('focusin', (e) => {
        // Nếu focus ra ngoài panel mà chuột cũng đang ở ngoài -> đóng panel (nếu đang ghim)
        if (AppState.panel.classList.contains('vnpt-pinned') && !AppState.panel.contains(e.target)) {
            // Kiểm tra chuột thực tế có đang nằm trong widget ko (dùng :hover selector ảo)
            if (!AppState.widget.matches(':hover')) {
                AppState.panel.style.display = 'none';
                AppState.toggleBtn.className = 'btn-closed';
                AppState.toggleBtn.innerHTML = '📄';
            }
        }
    });

    // --- Update Notification Logic ---
    function checkUpdateUI() {
        const container = document.getElementById('vnpt-update-badge-container');
        if (!container) return;

        if (RemoteConfig.hasUpdate()) {
            const badge = document.createElement('span');
            badge.className = 'vnpt-update-badge';
            badge.textContent = 'NEW';
            badge.title = `Có bản cập nhật mới v${RemoteConfig.info.latestVersion}. Click để xem!`;

            badge.onclick = (e) => {
                e.stopPropagation();
                if (RemoteConfig.info.updateUrl) {
                    window.open(RemoteConfig.info.updateUrl, '_blank');
                } else {
                    showToast(`Bản cập nhật v${RemoteConfig.info.latestVersion} đã sẵn sàng!`, "#1a73e8");
                }
            };

            container.innerHTML = '';
            container.appendChild(badge);
        }
    }

    // Kiểm tra ngay khi init và sau khi RemoteConfig refresh
    setTimeout(checkUpdateUI, 1000);
    // Lắng nghe RemoteConfig nếu có trigger (hiện tại RemoteConfig chưa có event emitter, nhưng setTimeout là đủ)

    // --- Token Tracker UI ---
    import('../utils/tokenTracker.js').then(({ TokenTracker }) => {
        const usageEl = document.getElementById('vnpt-token-usage');
        if (usageEl) {
            const usage = TokenTracker.getUsage();
            usageEl.textContent = `📊 ${usage.requests} req (${usage.tokens.toLocaleString()} tok)`;
            
            document.addEventListener('vnpt_usage_updated', (e) => {
                usageEl.textContent = `📊 ${e.detail.requests} req (${e.detail.tokens.toLocaleString()} tok)`;
            });
        }
    });
}

```

---


