/**
 * @file defaults.js
 * @desc Dữ liệu mặc định hardcoded cho bên B (VNPT Hà Nội) trong hợp đồng,
 *       và danh sách các trường bên A cần đồng bộ.
 *       File này KHÔNG chứa logic — chỉ là data thuần.
 * @exports DEFAULT_DATA  — object{key: string} dùng làm giá trị mặc định
 * @exports fieldsA       — string[] danh sách id các trường bên A cần đồng bộ
 * @seeAlso dataFillFeature.js (consumer), fieldsManager.js (consumer)
 */

const now = new Date();
const ngay = String(now.getDate()).padStart(2, '0');
const thang = String(now.getMonth() + 1).padStart(2, '0');
const nam = String(now.getFullYear());

export const DEFAULT_DATA = {
    ngayKy: ngay,
    thangKy: thang,
    namKy: nam,
    ngayTiepNhan: `${ngay}/${thang}/${nam}`,
    ngayThangNamKy: `${ngay}/${thang}/${nam}`,
    thangKy1: thang,
    namKy1: nam,
    tenDoanhNghiepB: "VIỄN THÔNG HÀ NỘI – CHI NHÁNH TẬP ĐOÀN BƯU CHÍNH VIỄN THÔNG VIỆT NAM",
    diaChiB: "75 Đinh Tiên Hoàng, Phường Hoàn Kiếm, Thành phố Hà Nội",
    maSoThueB: "0100686223",
    stkB: "1600114156",
    diaChiStkB: "Ngân hàng Đầu tư & Phát triển Việt Nam - CN Sở giao dịch 3 (BIDV – CN SGD 3)",
    tenB: "Phạm Khánh Chung",
    nguoiDaiDienB: "Phạm Khánh Chung",
    chucVuB: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",
    chucVuDaiDienB: "Phó Giám đốc Trung tâm Kinh doanh Khách hàng doanh nghiệp",
    giayUyQuyenSoB: "2628/GUQ-VNPT-HNI-VP",
    soGiayUyQuyenB: "2628/GUQ-VNPT-HNI-VP",
    giayUyQuyenNgayB: "1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    ngayGiayUyQuyenB: "1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    GiayUyQuyenB: "2628/GUQ-VNPT-HNI-VP ngày 1/1/2026 Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    tenDoanhNghiepB1: "Viễn thông Hà Nội – Chi nhánh Tập đoàn Bưu chính Viễn thông Việt Nam",
    donViTiepNhan: "TTKD KHDN",
    tenTiepNhan: "Bùi Anh",
    tenNguoiNhan: "Bùi Anh",
    dienThoaiB: "02436686868",
    diaChiTaiKhoanB: "NH TMCP Đầu tư & phát triển Việt Nam - Chi nhánh SGD 3 ",
    noiKy: "Hà Nội",
    emailB: "",
    lienheHopDongB: "AM Bùi Anh",
    lienheTuVanB: "AM Bùi Anh",
    lienheHoaDonB: "AM Bùi Anh",
    sucoCap1B: "AM Bùi Anh",
    sucoCap2B: "AM Bùi Anh",
    sucoCap3B: "AM Bùi Anh",
    sucoCap4B: "AM Bùi Anh"
};

/** Các trường liên hệ bên A — dùng để đồng bộ giá trị đầu tiên tìm được */
export const fieldsA = [
    "lienheHopDongA",
    "lienheHoaDonA",
    "lienheTuVanA",
    "sucoCap1A",
    "sucoCap2A",
    "sucoCap3A",
    "sucoCap4A"
];
