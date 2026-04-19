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
 * @param {Function} onReparse Callback khi nhấn nút phân loại lại từ text thô (truyền vào text mới)
 */
export function showPdfConfirmDialog(results, rawText, onConfirm, onReparse) {
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
        <div class="vnpt-pdf-dialog-box">
            <div class="pdf-dlg-header">
                <h3>🔍 KIỂM TRA & XÁC NHẬN KẾT QUẢ QUÉT</h3>
            </div>
            
            <div class="pdf-dlg-cols">
                <!-- Cột trái: Nội dung gốc (Cho phép Edit) -->
                <div class="pdf-col-left" id="pdf-col-left-resizable">
                    <textarea id="pdf-raw-text-edit" spellcheck="false" title="Bạn có thể sửa văn bản thô rồi nhấn 'CẬP NHẬT'">${rawText || ""}</textarea>
                </div>

                <!-- Thanh kéo chia cột -->
                <div class="pdf-dlg-splitter" id="pdf-dlg-splitter"></div>

                <!-- Cột phải: Các trường nhận diện được -->
                <div class="pdf-col-right">
                    <div class="pdf-dlg-body">
                        <table class="pdf-result-table">
                            <thead>
                                <tr>
                                    <th width="34"><input type="checkbox" id="pdf-check-all" checked title="Chọn tất cả"></th>
                                    <th width="110">Trường</th>
                                    <th>Giá trị AI trích xuất (Có thể sửa)</th>
                                </tr>
                            </thead>
                            <tbody>${tbodyHtml}</tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div class="vnpt-pdf-actions">
                <button class="pdf-btn-cancel" id="pdf-btn-cancel">Hủy bỏ (Esc)</button>
                <button class="pdf-btn-reparse" id="pdf-btn-reparse" title="Áp dụng Regex bóc tách lại từ văn bản bên trái">CẬP NHẬT</button>
                <button class="pdf-btn-confirm" id="pdf-btn-confirm">Lưu vào bảng (Enter)</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // --- Logic kéo chia cột ---
    const splitter = dialog.querySelector('#pdf-dlg-splitter');
    const colLeft = dialog.querySelector('#pdf-col-left-resizable');
    
    if (splitter && colLeft) {
        splitter.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startWidth = colLeft.offsetWidth;
            
            splitter.classList.add('dragging');
            document.body.style.cursor = 'col-resize';

            const onMouseMove = (moveEvt) => {
                const deltaX = moveEvt.clientX - startX;
                const newWidth = Math.max(100, Math.min(450, startWidth + deltaX));
                colLeft.style.width = newWidth + 'px';
                colLeft.style.flex = '0 0 ' + newWidth + 'px';
            };

            const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                splitter.classList.remove('dragging');
                document.body.style.cursor = '';
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Bắt event
    const btnCancel = dialog.querySelector('#pdf-btn-cancel');
    const btnConfirm = dialog.querySelector('#pdf-btn-confirm');
    const btnReparse = dialog.querySelector('#pdf-btn-reparse');
    const checkAll = dialog.querySelector('#pdf-check-all');
    const rowChks = dialog.querySelectorAll('.pdf-row-chk');
    const valInputs = dialog.querySelectorAll('.pdf-val-input');
    const rawTextEdit = dialog.querySelector('#pdf-raw-text-edit');

    // Chức năng Check all
    if (checkAll) {
        checkAll.addEventListener('change', (e) => {
            rowChks.forEach(chk => chk.checked = e.target.checked);
        });
    }

    const closeDialog = () => {
        window.removeEventListener('keydown', handleDialogKeys);
        dialog.remove();
    };

    const handleDialogKeys = (e) => {
        if (e.key === 'Escape') {
            closeDialog();
        } else if (e.key === 'Enter') {
            // Nhấn Enter để lưu, nhưng bỏ qua nếu đang ở ô Textarea (để xuống dòng)
            if (e.target && e.target.id === 'pdf-raw-text-edit') {
                return;
            }
            e.preventDefault();
            btnConfirm.click();
        }
    };

    window.addEventListener('keydown', handleDialogKeys);

    btnCancel.onclick = closeDialog;

    btnReparse.onclick = () => {
        if (onReparse) {
            const currentText = rawTextEdit.value;
            onReparse(currentText);
        }
    };

    btnConfirm.onclick = async () => {
        try {
            const { PatternLearning } = await import('../../utils/patternLearning.js');
            const selected = [];
            const rows = dialog.querySelectorAll('.pdf-row-auto');
            rows.forEach(row => {
                const chk = row.querySelector('.pdf-row-chk');
                const valInput = row.querySelector('.pdf-val-input');
                if (chk && chk.checked && valInput) {
                    const idx = parseInt(chk.getAttribute('data-index'));
                    const resultItem = results[idx];
                    if (resultItem) {
                        const finalValue = valInput.value.trim();
                        // HỌC MÁY: Nếu giá trị người dùng nhập khác với giá trị ban đầu (Regex tìm được)
                        if (finalValue && finalValue !== resultItem.value && rawText) {
                            PatternLearning.learn(rawText, resultItem.key, finalValue);
                        }
                        selected.push({
                            ...resultItem,
                            value: finalValue
                        });
                    }
                }
            });

            closeDialog();
            if (onConfirm) onConfirm(selected);
        } catch (err) {
            console.error("[VNPT] Lỗi khi xác nhận kết quả:", err);
            alert("Có lỗi xảy ra khi lưu dữ liệu. Vui lòng thử lại.");
        }
    };
}
