// src/features/docExport.js
import { AppState } from '../core/state.js';

export function initDocExport() {
    document.getElementById('vnpt-btn-export').addEventListener('click', function () {
        const fileInput = document.getElementById('vnpt-template-file');
        if (!fileInput.files || fileInput.files.length === 0) {
            alert("Vui lòng gắn vòng Template (.docx) trước tiên!"); return;
        }

        const dataToFill = {};
        const rows = AppState.fieldsContainer.querySelectorAll('.vnpt-field-row');
        rows.forEach(row => {
            const k = row.querySelector('.f-key').value.trim();
            const v = row.querySelector('.f-val').value;
            if (k) dataToFill[k] = v;
        });

        if (Object.keys(dataToFill).length === 0) {
            alert("Bạn chưa Quét dữ liệu hoặc chưa có Biến nào."); return;
        }

        let exportFileName = document.getElementById('vnpt-export-filename').value.trim() || "HopDong.docx";
        if (!exportFileName.toLowerCase().endsWith(".docx")) exportFileName += ".docx";

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                // @ts-ignore
                const doc = new window.docxtemplater(new window.PizZip(e.target.result), { paragraphLoop: true, linebreaks: true });
                doc.render(dataToFill);

                const out = doc.getZip().generate({ 
                    type: "blob", 
                    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    compression: "DEFLATE",
                    compressionOptions: {
                        level: 9
                    }
                });
                const url = URL.createObjectURL(out);
                const a = document.createElement("a");
                a.href = url;
                a.download = exportFileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
            } catch (error) {
                let msg = error.message;
                if (error.properties && error.properties.errors instanceof Array) {
                    const errorDetails = error.properties.errors.map(function (e) {
                        return "- " + (e.properties.explanation || e.message);
                    }).join("\n");
                    msg = "Cấu trúc thẻ (tag) trong file Word Template (.docx) của bạn đang bị lỗi:\n\n" + errorDetails;
                } else {
                    msg = "Lỗi phần mềm Word sinh ra: " + msg;
                }
                alert(msg);
                console.error("DocX Error:", error);
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
    });
}
