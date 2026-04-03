// src/features/docExport.js
import { AppState } from '../core/state.js';

function renderDocx(arrayBuffer, dataToFill, exportFileName) {
    try {
        const doc = new window.docxtemplater(new window.PizZip(arrayBuffer), { paragraphLoop: true, linebreaks: true });
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
    document.getElementById('vnpt-btn-export').addEventListener('click', function () {
        // Lấy data từ bảng fields
        const dataToFill = {};
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        rows.forEach(row => {
            const k = row.querySelector('.f-key').value.trim();
            const v = row.querySelector('.f-val').value;
            if (k) dataToFill[k] = v;
        });

        if (Object.keys(dataToFill).length === 0) {
            alert('Bạn chưa Quét dữ liệu hoặc chưa có Biến nào.'); return;
        }

        let exportFileName = document.getElementById('vnpt-export-filename').value.trim() || 'HopDong.docx';
        if (!exportFileName.toLowerCase().endsWith('.docx')) exportFileName += '.docx';

        // Ưu tiên 1: template đã fetch từ URL (AppState.templateBuffer)
        if (AppState.templateBuffer) {
            renderDocx(AppState.templateBuffer, dataToFill, exportFileName);
            return;
        }

        // Ưu tiên 2: file local
        const fileInput = document.getElementById('vnpt-template-file');
        if (fileInput.files && fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => renderDocx(e.target.result, dataToFill, exportFileName);
            reader.readAsArrayBuffer(fileInput.files[0]);
            return;
        }

        alert('Vui lòng chọn Template: nhấn "✔ Dùng" từ danh sách hoặc chọn file local bên dưới.');
    });
}
