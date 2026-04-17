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

import pkg from "/package.json__import.js";

export const VALIDATION_REGEX = {
    MST: /^\d{10}(-\d{3})?$/, // 10 số hoặc 10 số - 3 số
    PHONE: /^(0|\+84)[3|5|7|8|9]\d{8}$/, // Định dạng SĐT Việt Nam
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ID_CARD: /^(\d{9}|\d{12})$/ // CMND 9 số hoặc CCCD 12 số
};

export const APP_VERSION = pkg.version;
