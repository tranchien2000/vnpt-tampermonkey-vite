/**
 * @file docExport.js
 * @desc Xử lý xuất file DOCX từ template bằng docxtemplater + PizZip.
 *       Bao gồm: render DOCX (fill data), tự động cập nhật tên file xuất,
 *       và ưu tiên template: URL buffer → file local.
 * @exports initDocExport  — gán click handler cho nút xuất DOCX và logic tên file
 * @seeAlso templateManager.js (template buffer), fieldsManager.js (data source)
 */
// src/features/docExport.js
import { AppState } from '../core/state.js';
import { storage } from '../api/storage/index.js';
import { DEFAULT_LABELS, REQUIRED_KEYS, SK_TXT_TEMPLATE } from '../core/constants.js';
import { Storage } from '../utils/storage.js';

function renderDocx(arrayBuffer, dataToFill, exportFileName) {
    try {
        let zip;
        try {
            zip = new window.PizZip(arrayBuffer);
        } catch(zipErr) {
            alert('Lỗi định dạng: File template (.docx) rỗng, bị hỏng hoặc cấu hình Link URL Google Drive chưa bật "Bất kỳ ai có liên kết". Vui lòng kiểm tra lại!');
            console.error(zipErr);
            return;
        }
        const doc = new window.docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
        doc.render(dataToFill);

        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });
        const url = URL.createObjectURL(out);
        const a = document.createElement('a');
        a.href = url;
        a.download = exportFileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
    } catch (error) {
        let msg = error.message;
        if (error.properties && error.properties.errors instanceof Array) {
            const details = error.properties.errors.map(e => '- ' + (e.properties.explanation || e.message)).join('\n');
            msg = 'Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:\n\n' + details;
        } else {
            msg = 'Lỗi phần mềm Word sinh ra: ' + msg;
        }
        alert(msg);
        console.error('DocX Error:', error);
    }
}

/**
 * Render text template với placeholder {key} → value rồi tải xuống .txt
 * @param {string} template  — chuỗi văn bản có dạng "Tôi là {tenDaiDienn}"
 * @param {Object} data      — map key→value từ bảng fields
 * @param {string} fileName  — tên file xuất (sẽ đổi đuôi sang .txt)
 */
function exportTxt(template, data, fileName) {
    // Thay thế @key bằng giá trị tương ứng trong data
    const result = template.replace(/@(\w+)/g, (match, key) => {
        return data[key] !== undefined ? data[key] : match;
    });

    const blob = new Blob([result], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace(/\.docx$/i, '') + '.txt';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
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
            if (docEl) tenToChuc = docEl.tagName.toLowerCase() === 'textarea' || docEl.tagName.toLowerCase() === 'input' ? docEl.value.trim() : docEl.innerText.trim();
        }

        function shrinkName(name) {
            if (!name) return '';
            let s = name;
            
            s = s.replace(/Tổng công ty/gi, '');
            s = s.replace(/Công ty/gi, '');
            s = s.replace(/\bCty\b/gi, '');
            s = s.replace(/Trách nhiệm hữu hạn/gi, '');
            s = s.replace(/\bTNHH\b/gi, '');
            s = s.replace(/Cổ phần/gi, '');
            s = s.replace(/\bCP\b/gi, '');
            s = s.replace(/Một thành viên/gi, '');
            s = s.replace(/\bMTV\b/gi, '');
            s = s.replace(/Chi nhánh/gi, '');
            s = s.replace(/Việt Nam/gi, 'VN');
            s = s.replace(/Viet Nam/gi, 'VN');
            
            s = s.replace(/\s+/g, ' ').trim();
            s = s.replace(/^[-,\s]+|[-,\s]+$/g, '');

            if (s.length > 50) s = s.substring(0, 47) + '...';
            return s.replace(/[<>:"/\\|?*]/g, '');
        }

        let shortTen = shrinkName(tenToChuc);
        let tplName = AppState.templateName ? AppState.templateName.replace(/\.docx$/i, '') : '';
        
        let parts = [];
        if (tplName) parts.push(tplName);
        if (shortTen) parts.push(shortTen);
        
        if (parts.length > 0) {
            filenameInput.value = parts.join(' - ') + '.docx';
        } else if (!filenameInput.value) {
            filenameInput.value = 'Export_Auto.docx';
        }
    }

    // Cập nhật định kỳ (dùng interval cho gọn)
    setInterval(autoUpdateExportFileName, 1000);

    document.getElementById('vnpt-btn-export').addEventListener('click', function () {
        // Lấy data từ bảng fields
        const dataToFill = {};
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        rows.forEach(row => {
            const rawKey = row.querySelector('.f-key').value.trim();
            const k = rawKey.split(',')[0].trim();
            const v = row.querySelector('.f-val').value;
            if (k) dataToFill[k] = v;
        });

        if (Object.keys(dataToFill).length === 0) {
            alert('Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.'); return;
        }

        // Kiểm tra các trường bắt buộc
        const missingFields = [];
        REQUIRED_KEYS.forEach(key => {
            if (!dataToFill[key] || !dataToFill[key].trim()) {
                const label = DEFAULT_LABELS[key] || key;
                missingFields.push(label);
            }
        });

        if (missingFields.length > 0) {
            const confirmMsg = `Cảnh báo: Bạn còn các trường sau chưa điền dữ liệu:\n\n- ${missingFields.join('\n- ')}\n\nBạn có chắc chắn muốn tiếp tục xuất file không?`;
            if (!confirm(confirmMsg)) return;
        }

        let exportFileName = document.getElementById('vnpt-export-filename').value.trim() || 'HopDong_Auto.docx';
        if (!exportFileName.toLowerCase().endsWith('.docx')) exportFileName += '.docx';

        // Ưu tiên 1: template đã fetch từ URL (AppState.templateBuffer)
        if (AppState.templateBuffer) {
            renderDocx(AppState.templateBuffer, dataToFill, exportFileName);
            return;
        }

        // Ưu tiên 2: file local
        const fileInput = document.getElementById('vnpt-template-file');
        if (fileInput.files && fileInput.files.length > 0) {
            storage.download('local', fileInput.files[0], { type: 'arraybuffer' })
                .then(buf => renderDocx(buf, dataToFill, exportFileName))
                .catch(err => alert(`Lỗi đọc file: ${err.message}`));
            return;
        }

        alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.');
    });

    // ── Nút Xuất TXT ──────────────────────────────────────────────────────────
    const btnExportTxt = document.getElementById('vnpt-btn-export-txt');
    const txtTemplateArea = document.getElementById('vnpt-txt-template');

    // Khôi phục nội dung đã lưu
    if (txtTemplateArea) {
        const saved = Storage.get(SK_TXT_TEMPLATE);
        if (saved) txtTemplateArea.value = saved;
        txtTemplateArea.addEventListener('input', () => {
            Storage.setDebounced(SK_TXT_TEMPLATE, txtTemplateArea.value, 800);
        });
    }

    if (btnExportTxt) {
        btnExportTxt.addEventListener('click', () => {
            const template = txtTemplateArea ? txtTemplateArea.value : '';
            if (!template.trim()) {
                alert('Bạn chưa nhập nội dung Text Template!\n\nSử dụng @key làm placeholder, ví dụ: Tôi là @tenDaiDienn');
                return;
            }

            // Thu thập dữ liệu từ bảng fields
            const dataToFill = {};
            const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
            rows.forEach(row => {
                const rawKey = row.querySelector('.f-key').value.trim();
                const k = rawKey.split(',')[0].trim();
                const v = row.querySelector('.f-val').value;
                if (k) dataToFill[k] = v;
            });

            if (Object.keys(dataToFill).length === 0) {
                alert('Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.'); return;
            }

            const exportFileName = document.getElementById('vnpt-export-filename').value.trim() || 'Export_Auto';
            exportTxt(template, dataToFill, exportFileName);
        });
    }
}
