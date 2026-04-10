/**
 * @file webScanner.js
 * @desc Quét các trường (fields) trên trang web và đồng bộ vào bảng fields của widget.
 *       Bao gồm: nút "Quét" lấy values từ DOM theo DEFAULT_LABELS keys,
 *       và listener input/change để tự động cập nhật khi user gõ trực tiếp trên web.
 * @exports initWebScanner  — gán click/input/change listeners cho nút Quét
 * @seeAlso core/constants.js (DEFAULT_LABELS), fieldsManager.js (addOrUpdateFieldRow)
 */
import { DEFAULT_LABELS } from '../core/constants.js';
import { showToast } from '../ui/toast.js';
import { addOrUpdateFieldRow, saveFieldsToLocal } from './fieldsManager.js';
import { getScannerFallback } from '../core/scannerFallbacks.js';
import { AppState } from '../core/state.js';
import { DEFAULT_DATA } from '../core/defaults.js';
import { buildFullDOMMap, findPageInput } from '../utils/domHelper.js';
import { capitalizeName, formatPhoneNumber, normalizeDate } from '../utils/stringHelper.js';
import { createInternalBackup, generateBackupName } from '../utils/backupHelper.js';

/**
 * Quét tất cả các thành phần địa chỉ trên trang và trả về chuỗi đã nối chuẩn.
 * @returns {string} Chuỗi địa chỉ đầy đủ.
 */
function scanFullAddress() {
    buildFullDOMMap(); // Đảm bảo map mới nhất
    const keyString = Object.keys(DEFAULT_LABELS).find(k => k.includes('diaChi'));
    if (!keyString) return '';
    
    const labelText = DEFAULT_LABELS[keyString];
    const ids = keyString.split(',').map(s => s.trim());
    let addressObj = { detail: '', ward: '', district: '', province: '' };

    // 1. Quét theo ID/Name/FormControlName
    ids.forEach(id => {
        const el = findPageInput(id, labelText);
        if (el) {
            let val = '';
            if (el.tagName.toLowerCase() === 'ng-select2') {
                const span = el.querySelector('.select2-selection__rendered');
                val = span ? (span.getAttribute('title') || span.textContent.trim()) : '';
            } else {
                val = el.value || el.getAttribute('title') || '';
            }
            val = (val || '').trim();
            if (val && val !== '--- Chọn ---') {
                if (id === 'diaChi' || id === 'duong') addressObj.detail = val;
                else if (id.includes('tinh')) addressObj.province = val;
                else if (id.includes('huyen') || id.includes('quan')) addressObj.district = val;
                else if (id.includes('xa') || id.includes('phuong')) addressObj.ward = val;
            }
        }
    });

    // 2. Nhận diện Thông minh theo tiền tố Title (Nếu còn thiếu)
    document.querySelectorAll('ng-select2').forEach(s2 => {
        const span = s2.querySelector('.select2-selection__rendered');
        if (!span) return;
        const title = (span.getAttribute('title') || span.textContent || '').trim();
        if (!title || title === '--- Chọn ---') return;
        
        if ((title.startsWith('Xã') || title.startsWith('Phường') || title.startsWith('Thị trấn')) && !addressObj.ward) addressObj.ward = title;
        else if ((title.startsWith('Quận') || title.startsWith('Huyện') || title.startsWith('Thị xã')) && !addressObj.district) addressObj.district = title;
        else if ((title.startsWith('Tỉnh') || title.startsWith('Thành phố')) && !addressObj.province) addressObj.province = title;
    });

    // 3. Nối chuỗi
    let parts = [];
    if (addressObj.detail) parts.push(addressObj.detail);
    if (addressObj.ward) parts.push(addressObj.ward);
    if (addressObj.district) parts.push(addressObj.district);
    if (addressObj.province) {
        let p = addressObj.province;
        if (!p.startsWith('Tỉnh') && !p.startsWith('Thành phố')) p = 'Tỉnh ' + p;
        parts.push(p);
    }
    if (parts.length > 0) parts.push("Việt Nam");
    
    return parts.filter(p => !!p).join(', ');
}

/**
 * Tìm tên Tỉnh/Thành phố trên trang web
 * @returns {string} Tên tỉnh/thành phố hoặc rỗng
 */
function getProvinceName() {
    const provinceIds = ['tinhId', 'tinhIdNew'];
    for (const id of provinceIds) {
        const el = findPageInput(id);
        if (el) {
            let val = '';
            if (el.tagName.toLowerCase() === 'ng-select2') {
                const span = el.querySelector('.select2-selection__rendered');
                val = span ? (span.getAttribute('title') || span.textContent.trim()) : '';
            } else {
                val = el.value || el.getAttribute('title') || '';
            }
            if (val && val !== '--- Chọn ---') return val.trim();
        }
    }
    // Tìm theo Title (Select2)
    const s2List = document.querySelectorAll('ng-select2');
    for (const s2 of s2List) {
        const span = s2.querySelector('.select2-selection__rendered');
        const title = (span?.getAttribute('title') || span?.textContent || '').trim();
        if (title && (title.startsWith('Tỉnh') || title.startsWith('Thành phố'))) return title;
    }
    return '';
}

export function initWebScanner() {
    document.getElementById('vnpt-btn-scan').addEventListener('click', function () {
        createInternalBackup("Trước khi quét mới: " + generateBackupName());
        if (AppState.isDefaultMode) {
            Object.keys(DEFAULT_DATA).forEach(key => {
                addOrUpdateFieldRow(key, DEFAULT_DATA[key], DEFAULT_LABELS[key] || '');
            });
            saveFieldsToLocal();
            showToast("Đã nạp lại dữ liệu mặc định từ hệ thống.");
            return;
        }

        let foundCount = 0;
        buildFullDOMMap();

        Object.keys(DEFAULT_LABELS).forEach(keyString => {
            const labelText = DEFAULT_LABELS[keyString];
            const ids = keyString.split(',').map(s => s.trim());
            const isAddressField = ids.includes('diaChi');
            const isNoiCapDkdn = ids.includes('noiCapSoDkdn');
            
            let val = '';
            if (isAddressField) {
                val = scanFullAddress();
                if (val) foundCount++;
            } else if (isNoiCapDkdn) {
                // Tự động tính toán Nơi cấp ĐKDN từ Tỉnh
                const province = getProvinceName();
                if (province) {
                    val = "SKDT " + province;
                    foundCount++;
                }
            } else {
                ids.forEach(id => {
                    if (val) return;
                    const el = findPageInput(id, labelText);
                    if (el) {
                        if (el.tagName.toLowerCase() === 'select') val = el.options[el.selectedIndex]?.text || '';
                        else if (el.tagName.toLowerCase() === 'ng-select2') {
                            const span = el.querySelector('.select2-selection__rendered');
                            val = span ? (span.getAttribute('title') || span.textContent.trim()) : '';
                        } else val = el.value || el.getAttribute('title') || '';
                        if (val) foundCount++;
                    }
                });
            }

            val = val || getScannerFallback(keyString);
            if (val && typeof val === 'string') {
                const primaryId = ids[0];
                if (['sdt'].includes(primaryId)) val = formatPhoneNumber(val);
                else if (['ngaySinhCustomer', 'ngayCapCustomer', 'ngayCapSoDkdnCustomer', 'ngayKy', 'ngayTiepNhan'].includes(primaryId)) val = normalizeDate(val);
            }
            addOrUpdateFieldRow(keyString, val, null);
        });

        saveFieldsToLocal();

        if (foundCount > 0) {
            this.style.background = '#1e8e3e'; this.style.color = '#fff'; this.innerText = 'Đã quét xong';
            setTimeout(() => { this.style.background = ''; this.style.color = ''; this.innerText = 'Quét dữ liệu'; }, 1000);
        } else {
            showToast("Không tìm thấy trường nào trên web, đã tạo các trường mặc định với biểu mẫu trống.");
        }
    });

    // --- ĐỒNG BỘ THỜI GIAN THỰC ---
    function handleSyncEvent(e) {
        // Bỏ qua nếu sự kiện từ chính widget
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        // Xử lý phím Enter
        if (e.type === 'keydown' && e.key !== 'Enter') return;

        const el = e.target.closest('input, textarea, select, ng-select2');
        if (!el) return;

        const targetId = el.id;
        const targetFcn = el.getAttribute('formcontrolname');
        
        const matchedKey = Object.keys(DEFAULT_LABELS).find(k => {
            const keys = k.split(',').map(s => s.trim());
            return (targetId && keys.includes(targetId)) || (targetFcn && keys.includes(targetFcn));
        });

        if (matchedKey !== undefined) {
            let val = undefined;
            if (matchedKey.includes('diaChi')) {
                // Đối với nhóm địa chỉ, luôn chạy lại logic nối chuỗi để đảm bảo tính nhất quán
                val = scanFullAddress();
                
                // --- BỔ SUNG: Cập nhật luôn noiCapSoDkdn trong Widget khi Tỉnh thay đổi ---
                const province = getProvinceName();
                if (province) {
                    const skdtVal = "SKDT " + province;
                    const skdtKey = Object.keys(DEFAULT_LABELS).find(k => k.includes('noiCapSoDkdn'));
                    if (skdtKey) {
                        addOrUpdateFieldRow(skdtKey, skdtVal, null);
                    }
                }
            } else {
                const tag = el.tagName.toLowerCase();
                if (tag === 'select') val = el.options[el.selectedIndex]?.text || '';
                else if (tag === 'ng-select2') {
                    const span = el.querySelector('.select2-selection__rendered');
                    val = span ? (span.getAttribute('title') || span.textContent.trim()) : '';
                } else val = el.value;
            }
            
            if (val !== undefined) {
                // Cập nhật vào Widget ngay lập tức
                addOrUpdateFieldRow(matchedKey, val, null);
                saveFieldsToLocal();
                
                // Debug log (ẩn)
                console.debug(`[Sync] Updated ${matchedKey} with value: "${val}"`);
            }
        }
    }

    document.addEventListener('input', handleSyncEvent);
    document.addEventListener('change', handleSyncEvent);
    document.addEventListener('keydown', handleSyncEvent);
}
