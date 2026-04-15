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
