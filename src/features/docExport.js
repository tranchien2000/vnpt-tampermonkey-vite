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
        if (shortTen) parts.push(shortTen);
        if (tplName) parts.push(tplName);
        
        if (parts.length > 0) {
            filenameInput.value = parts.join(' - ') + '.docx';
        } else if (!filenameInput.value) {
            filenameInput.value = 'HopDong_Auto.docx';
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
}
