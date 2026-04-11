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
 * @param {string} rawText Văn bản thô AI trích xuất được
 * @param {Function} onConfirm Callback array được tích chọn
 */
export function showPdfConfirmDialog(results, rawText, onConfirm) {
    let dialog = document.getElementById('vnpt-pdf-dialog');
    if (dialog) dialog.remove();

    dialog = document.createElement('div');
    dialog.id = 'vnpt-pdf-dialog';
    dialog.className = 'vnpt-pdf-overlay';
    
    // Render TR rows with Inputs for editing
    const tbodyHtml = results.map((res, i) => `
        <tr class="pdf-row-auto">
            <td style="text-align: center;">
                <input type="checkbox" class="pdf-row-chk" data-index="${i}" ${res.checked ? 'checked' : ''} />
            </td>
            <td><strong title="${res.key}">${res.label}</strong></td>
            <td>
                <input type="text" class="pdf-val-input" data-index="${i}" value="${res.value}" placeholder="..." />
            </td>
        </tr>
    `).join('');

    dialog.innerHTML = `
        <div class="vnpt-pdf-dialog-box" style="width: 900px; height: 80vh;">
            <div class="pdf-dlg-header">
                <h3>🔍 KIỂM TRA & XÁC NHẬN KẾT QUẢ AI</h3>
            </div>
            
            <div class="pdf-dlg-cols">
                <!-- Cột trái: Nội dung gốc -->
                <div class="pdf-col-left" title="Nội dung văn bản thô AI đọc được">
                    <div style="font-weight: 800; color: #5f6368; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">VĂN BẢN GỐC (RAW TEXT)</div>
                    ${rawText || "Không có dữ liệu văn bản thô."}
                </div>

                <!-- Cột phải: Các trường nhận diện được -->
                <div class="pdf-col-right">
                    <div class="pdf-dlg-body">
                        <table class="pdf-result-table">
                            <thead>
                                <tr>
                                    <th width="40"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                                    <th width="120">Trường</th>
                                    <th>Giá trị AI trích xuất (Có thể sửa)</th>
                                </tr>
                            </thead>
                            <tbody>${tbodyHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="vnpt-pdf-actions">
                <div style="flex:1; font-size:11px; color:#5f6368;">Mẹo: So sánh nội dung bên trái và sửa lại ô bên phải nếu AI nhận diện sai.</div>
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">✖ Hủy bỏ</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">✅ Chấp nhận & Lưu</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // Bắt event
    const btnCancel = dialog.querySelector('#pdf-btn-cancel');
    const btnConfirm = dialog.querySelector('#pdf-btn-confirm');
    const checkAll = dialog.querySelector('#pdf-check-all');
    const rowChks = dialog.querySelectorAll('.pdf-row-chk');
    const valInputs = dialog.querySelectorAll('.pdf-val-input');

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
                // Lấy giá trị từ input (có thể đã được người dùng sửa)
                const editedValue = valInputs[idx].value;
                selected.push({
                    ...results[idx],
                    value: editedValue
                });
            }
        });
        dialog.remove();
        onConfirm(selected);
    };
}
