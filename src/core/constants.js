/**
 * @file constants.js
 * @desc Tất cả hằng số dùng chung toàn dự án: localStorage keys, DEFAULT_LABELS.
 * @exports DEFAULT_LABELS    — map{id → tên nhãn tiếng Việt} dùng cho webScanner
 * @exports LOCAL_KEY_*       — localStorage keys cho VNPT Export Widget
 * @exports SK_*              — localStorage keys cho Calc & AutoFill Widget
 * @seeAlso core/defaults.js (data mặc định), core/state.js (AppState)
 */
export const DEFAULT_LABELS = {
    'tenDaiDienn': 'Tên Đại Diện',
    'chucVu': 'Chức Vụ',
    'ngaySinhCustomer': 'Ngày Sinh KH',
    'diaChi': 'Địa chỉ',
    'cmnd': 'CMND/CCCD',
    'ngayCapCustomer': 'Ngày Cấp CMND',
    'noiCap': 'Nơi Cấp',
    'sdt': 'SĐT',
    'emailDaiDien': 'Email Nhận TK',
    'tenToChuc': 'Tên Tổ Chức',
    'ngayCapSoDkdnCustomer': 'Ngày Cấp ĐKKD',
    'soDkdn': 'Mã số thuế | GPKD',
    'goiDV': 'Gói Dịch Vụ',
    'ngayKy, ngayKy1': 'Ngày ký',
    'thangKy, thangKy1': 'Tháng Ký',
    'namKy, namKy1': 'Năm ký',
    'ngayTiepNhan, ngayThangNamKy': 'Ngày tiếp nhận / Ngày tháng năm ký',
    'soHopDong, inputContractGroupName, contractNumber, contractName': 'SỐ HỢP ĐỒNG',
    'soLuongGoi': 'Số Lượng Gói',
    'noiKy': 'Nơi ký',
    'lienheHopDongA, lienheTuVanA, lienheHoaDonA, sucoCap1A, sucoCap2A, sucoCap3A, sucoCap4A': 'Liên hệ A',
};

export const REQUIRED_KEYS = ['soHopDong', 'tenDaiDienn', 'cmnd', 'sdt', 'diaChi', 'tenToChuc', 'ngayCapCustomer', 'emailDaiDien', 'soDkdn', 'goiDV', 'soHopDong'];

// VNPT Docx Export Widget Keys
export const LOCAL_KEY_FIELDS = 'vnpt_docx_fields';
export const LOCAL_KEY_DEFAULT_FIELDS = 'vnpt_docx_default_fields';
export const LOCAL_KEY_POS = 'vnpt_docx_position';
export const LOCAL_KEY_SIZE = 'vnpt_docx_size';
export const LOCAL_KEY_OPENED = 'vnpt_docx_opened';

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
export const SK_TXT_TEMPLATE = 'vnpt_txt_template'; // string — nội dung text template
//