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
    "ngayKy, ngayKy1": { label: "Ngày ký", value: ngay },
    "thangKy, thangKy1": { label: "Tháng ký", value: thang },
    "namKy, namKy1": { label: "Năm ký", value: nam },
    "ngayTiepNhan, ngayThangNamKy": { label: "Ngày ký (full)", value: `${ngay}/${thang}/${nam}` },
    tenDoanhNghiepB: { label: "Tên doanh nghiệp B", value: "VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM" },
    diaChiB: { label: "Địa chỉ B", value: "75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội" },
    maSoThueB: { label: "Mã số thuế B", value: "0100686223" },
    stkB: { label: "Số tài khoản B", value: "1600114156" },
    diaChiStkB: { label: "Ngân hàng/Địa chỉ STK B", value: "Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)" },
    "tenB, nguoiDaiDienB, tenDaiDienB": { label: "Người đại diện B", value: "Phạm Khánh Chung" },
    "chucVuB, chucVuDaiDienB": { label: "Chức vụ B", value: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp" },
    "giayUyQuyenSoB, soGiayUyQuyenB": { label: "Giấy ủy quyền số B", value: "2628/GUQ-VNPT-HNI-VP" },
    "giayUyQuyenNgayB, ngayGiayUyQuyenB": { label: "Giấy ủy quyền ngày B", value: `1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam` },
    GiayUyQuyenB: { label: "Giấy ủy quyền B (full)", value: `2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam` },
    tenDoanhNghiepB1: { label: "Tên doanh nghiệp B (phụ)", value: "Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam" },
    donViTiepNhan: { label: "Đơn vị tiếp nhận", value: "TTKD KHDN" },
    "tenTiepNhan, tenNguoiNhan": { label: "Người tiếp nhận", value: "Bùi Anh" },
    dienThoaiB: { label: "Điện thoại B", value: "02436686868" },
    diaChiTaiKhoanB: { label: "Địa chỉ tài khoản B", value: "NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 " },
    noiKy: { label: "Nơi ký", value: "Hà Nội" },
    emailB: { label: "Email B", value: "" },
    "lienheHopDongB, lienheTuVanB, lienheHoaDonB, sucoCap1B, sucoCap2B, sucoCap3B, sucoCap4B": { label: "Liên hệ B (AM)", value: "AM Bùi Anh" }
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
    before: ["donGiaCA", "thanhTienCA", "tongThanhTien", "tongCuocTruocThue"],
    tax: ["tongThueGTGT", "tongThue", "thueCA", "thueVAT"],
    text: ["soTienThanhToanBangChu", "tongCongBangChu", "tongCongHDbangChu", "ghiChuGiaTriHopDong", "tongGiaTriHopDongBangChu"]
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
    //'EXPORT_DOCX': { key: 'e', altKey: true, ctrlKey: false, shiftKey: false, label: 'Xuất DOCX' },
    //'COPY_TXT': { key: 'c', altKey: true, ctrlKey: false, shiftKey: false, label: 'Copy Text (Template)' },
    'TOGGLE': { key: 'w', altKey: true, ctrlKey: false, shiftKey: false, label: 'Đóng/Mở Widget' },
    'CLEAN': { key: 'd', altKey: true, ctrlKey: false, shiftKey: false, label: 'Dọn dẹp & Reset' }
};

