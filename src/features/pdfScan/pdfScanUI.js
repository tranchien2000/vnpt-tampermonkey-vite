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
 * @param {Function} onConfirm Callback array được tích chọn
 */
export function showPdfConfirmDialog(results, onConfirm) {
    let dialog = document.getElementById('vnpt-pdf-dialog');
    if (dialog) dialog.remove();

    dialog = document.createElement('div');
    dialog.id = 'vnpt-pdf-dialog';
    dialog.className = 'vnpt-pdf-overlay';
    
    // Render TR rows
    const tbodyHtml = results.map((res, i) => `
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${i}" checked />
            </td>
            <td><strong>${res.key}</strong></td>
            <td><div style="max-height: 40px; overflow-y: auto; color: #1a73e8; font-weight: 600;">${res.value}</div></td>
        </tr>
    `).join('');

    dialog.innerHTML = `
        <div class="vnpt-pdf-dialog-box">
            <div class="pdf-dlg-header">
                <h3>🔍 KẾT QUẢ ĐỌC TỪ GEMINI AI</h3>
            </div>
            <div class="pdf-dlg-body">
                <table class="pdf-result-table">
                    <thead>
                        <tr>
                            <th width="40"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                            <th width="120">ID Trường</th>
                            <th>Nội dung được AI chiết xuất</th>
                        </tr>
                    </thead>
                    <tbody>${tbodyHtml}</tbody>
                </table>
            </div>
            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368; align-self:flex-end;">Gợi ý: Căn lề AI có thể lệch, hãy check lại cẩn thận.</div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">✖ Hủy</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">✅ Đồng bộ bảng dữ liệu</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Bắt event
    const btnCancel = dialog.querySelector('#pdf-btn-cancel');
    const btnConfirm = dialog.querySelector('#pdf-btn-confirm');
    const checkAll = dialog.querySelector('#pdf-check-all');
    const rowChks = dialog.querySelectorAll('.pdf-row-chk');

    // Chức năng Check all
    checkAll.addEventListener('change', (e) => {
        rowChks.forEach(chk => chk.checked = e.target.checked);
    });

    btnCancel.onclick = () => {
        dialog.remove();
    };

    btnConfirm.onclick = () => {
        const selected = [];
        rowChks.forEach(chk => {
            if (chk.checked) {
                const idx = parseInt(chk.getAttribute('data-index'));
                selected.push(results[idx]);
            }
        });
        dialog.remove();
        onConfirm(selected);
    };
}
