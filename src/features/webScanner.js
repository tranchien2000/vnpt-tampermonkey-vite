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
import { RemoteConfig } from '../api/remoteConfig.js';
import { buildFullDOMMap, findPageInput, invalidateDOMMap } from '../utils/domHelper.js';
import { capitalizeName, formatPhoneNumber, normalizeDate } from '../utils/stringHelper.js';
import { createInternalBackup, generateBackupName } from '../utils/backupHelper.js';
import { debounce } from '../utils/common.js';

/**
 * Lấy giá trị hiển thị (text/title) của một element.
 * Tự động xử lý Select, Ng-Select2 và Input thông thường.
 */
function getElValueText(el) {
    if (!el) return '';
    const tag = el.tagName.toLowerCase();

    if (tag === 'select') {
        return el.options[el.selectedIndex]?.text || '';
    }

    if (tag === 'ng-select2') {
        const span = el.querySelector('.select2-selection__rendered');
        return span ? (span.getAttribute('title') || span.textContent.trim()) : '';
    }

    // Với Input thông thường hoặc các element khác có thuộc tính title
    return (el.value || el.getAttribute('title') || '').trim();
}

/**
 * Quét tất cả các thành phần địa chỉ trên trang và trả về chuỗi đã nối chuẩn.
 * @param {boolean} forceRefresh - Nếu true, bắt buộc quét lại DOM.
 * @returns {string} Chuỗi địa chỉ đầy đủ.
 */
function scanFullAddress(forceRefresh = false) {
    if (forceRefresh) buildFullDOMMap(true); // Chỉ ép buộc khi cần thiết (VD: bấm nút Quét)
    const labels = RemoteConfig.getLabels();
    const keyString = Object.keys(labels).find(k => k.includes('diaChi'));
    if (!keyString) return '';

    const labelText = labels[keyString];
    const ids = keyString.split(',').map(s => s.trim());
    let addressObj = { detail: '', ward: '', district: '', province: '' };

    // 1. Quét theo ID/Name/FormControlName
    ids.forEach(id => {
        const el = findPageInput(id, labelText);
        if (el) {
            let val = getElValueText(el);
            if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                if (id === 'diaChi' || id === 'duong') {
                    // Ưu tiên giữ lại nội dung dài nhất (chi tiết nhất)
                    if (!addressObj.detail || val.length > addressObj.detail.length) {
                        addressObj.detail = val;
                    }
                }
                else if (id.includes('tinh')) addressObj.province = val;
                else if (id.includes('xaIdNew') || id.includes('huyen') || id.includes('quan')) addressObj.district = val;
                else if (id.includes('xa') || id.includes('phuong')) addressObj.ward = val;
            }
        }
    });

    // 2. Nhận diện Thông minh theo tiền tố Title (Nếu còn thiếu)
    document.querySelectorAll('ng-select2').forEach(s2 => {
        const span = s2.querySelector('.select2-selection__rendered');
        if (!span) return;
        const title = (span.getAttribute('title') || span.textContent || '').trim();
        if (!title || title === '--- Chọn ---' || title.includes('Chọn')) return;

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
    if (parts.length > 0) parts.push("");

    return parts.filter(p => !!p).join(', ');
}

/**
 * Tìm tên Tỉnh/Thành phố trên trang web
 * @returns {string} Tên tỉnh/thành phố hoặc rỗng
 */
function getProvinceName() {
    let rawVal = '';
    const provinceIds = ['tinhIdNew', 'tinhId', 'diaChiTruSoTinhIdNew'];
    for (const id of provinceIds) {
        const el = findPageInput(id);
        if (el) {
            rawVal = getElValueText(el);
            if (rawVal && rawVal !== '--- Chọn ---' && !rawVal.includes('Chọn')) break;
        }
    }

    if (!rawVal || rawVal === '--- Chọn ---') {
        // Tìm theo Title (Select2)
        const s2List = document.querySelectorAll('ng-select2');
        for (const s2 of s2List) {
            const span = s2.querySelector('.select2-selection__rendered');
            const title = (span?.getAttribute('title') || span?.textContent || '').trim();
            if (title && (title.startsWith('Tỉnh') || title.startsWith('Thành phố')) && !title.includes('Chọn')) {
                rawVal = title;
                break;
            }
        }
    }

    if (rawVal) {
        // Cắt bỏ "Tỉnh " hoặc "Thành phố " theo yêu cầu USER
        return rawVal.trim().replace(/^(Tỉnh|Thành phố)\s+/i, '');
    }
    return '';
}

export function initWebScanner() {
    document.getElementById('vnpt-btn-scan').addEventListener('click', function () {
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

        const labels = RemoteConfig.getLabels();
        Object.keys(labels).forEach(keyString => {
            const labelText = labels[keyString];
            const ids = keyString.split(',').map(s => s.trim());
            const isAddressField = ids.includes('diaChi');
            const isNoiCapDkdn = ids.includes('noiCapSoDkdn');

            let val = '';
            if (isAddressField) {
                val = scanFullAddress(false); // Map đã được build ở dòng 135
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
                        val = getElValueText(el);
                        if (val && val !== '--- Chọn ---' && !val.includes('Chọn')) {
                            foundCount++;
                        } else {
                            val = ''; // Reset nếu là text rác "Chọn..."
                        }
                    }
                });
            }

            val = val || getScannerFallback(keyString);
            if (val && typeof val === 'string') {
                const primaryId = ids[0];
                if (['sdt'].includes(primaryId)) val = formatPhoneNumber(val);
                else if (['ngaySinhCustomer', 'ngayCapCustomer', 'ngayCapSoDkdnCustomer', 'ngayKy', 'ngayTiepNhan'].includes(primaryId)) val = normalizeDate(val);
            }
            addOrUpdateFieldRow(keyString, val, null, '', null, false); // Nút quét thì xem như lấy từ form lần đầu
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
    let labelLookupCache = null;
    let lastLabelsVersion = 0;

    /**
     * Tạo bản đồ lookup nhanh từ ID/FCN sang matchedKey
     */
    function getLabelLookup() {
        const labels = RemoteConfig.getLabels();
        // Giả sử RemoteConfig có version hoặc ta check hash nếu cần, 
        // ở đây tạm thời check nếu cache chưa có.
        if (labelLookupCache) return labelLookupCache;

        const lookup = new Map();
        Object.keys(labels).forEach(matchedKey => {
            const ids = matchedKey.split(',').map(s => s.trim());
            ids.forEach(id => lookup.set(id, matchedKey));
        });
        labelLookupCache = lookup;
        return lookup;
    }

    function handleSyncEvent(e) {
        // Bỏ qua nếu sự kiện từ chính widget
        if (e.target.closest('#vnpt-docx-widget') || e.target.closest('#vnpt-inline-calc')) return;

        // Xử lý phím Enter
        if (e.type === 'keydown' && e.key !== 'Enter') return;

        const el = e.target.closest('input, textarea, select, ng-select2');
        if (!el) return;

        const targetId = el.id;
        const targetFcn = el.getAttribute('formcontrolname');

        const lookup = getLabelLookup();
        const matchedKey = (targetId && lookup.get(targetId)) || (targetFcn && lookup.get(targetFcn));

        if (matchedKey !== undefined) {
            let val = undefined;
            if (matchedKey.includes('diaChi')) {
                // Sử dụng map hiện tại (đã được xây dựng hoặc lazy build)
                val = scanFullAddress(false);

                // --- BỔ SUNG: Cập nhật luôn noiCapSoDkdn trong Widget khi Tỉnh thay đổi ---
                const province = getProvinceName();
                if (province) {
                    const skdtVal = "SKDT " + province;
                    const skdtKey = Array.from(lookup.values()).find(k => k.includes('noiCapSoDkdn'));
                    if (skdtKey) {
                        addOrUpdateFieldRow(skdtKey, skdtVal, null, '', null, true);
                    }
                }
            } else {
                val = getElValueText(el);
            }

            if (val !== undefined) {
                // Cập nhật vào Widget ngay lập tức
                addOrUpdateFieldRow(matchedKey, val, null, '', null, true);
                saveFieldsToLocal();

                // Debug log (ẩn)
                console.debug(`[Sync] Updated ${matchedKey} with value: "${val}"`);
            }
        }
    }

    // Đặc trị cho Tỉnh (Real-time OnChange) vì Select2 đôi khi không bubble event
    function setupProvinceSync() {
        const provinceIds = ['tinhId', 'tinhIdNew', 'diaChiTruSoTinhIdNew'];
        provinceIds.forEach(pId => {
            const el = document.getElementById(pId);
            if (el && !el.dataset.widgetSyncBound) {
                el.dataset.widgetSyncBound = "1";
                const updateWidgetSkdt = () => {
                    const province = getProvinceName();
                    if (province) {
                        const skdtVal = "SKDT " + province;
                        const lookup = getLabelLookup();
                        const skdtKey = Array.from(lookup.values()).find(k => k.includes('noiCapSoDkdn'));
                        if (skdtKey) {
                            addOrUpdateFieldRow(skdtKey, skdtVal, null, '', null, true);
                            saveFieldsToLocal();
                        }
                    }
                };
                el.addEventListener('change', updateWidgetSkdt);
                // Với Select2 (VNPT) cần listener đặc thù qua jQuery nếu có
                if (typeof $ !== 'undefined') {
                    $(el).on('select2:select change', updateWidgetSkdt);
                }
            }
        });
    }

    // Debounce cho Sync Event và Observer
    const debouncedHandleSync = debounce(handleSyncEvent, 100);
    const debouncedOnMutation = debounce(() => {
        invalidateDOMMap();
        setupProvinceSync();
    }, 500);

    document.addEventListener('input', debouncedHandleSync);
    document.addEventListener('change', handleSyncEvent); // Change thì sync ngay
    document.addEventListener('keydown', handleSyncEvent);

    // Chạy setupProvinceSync định kỳ hoặc qua MutationObserver để bắt các form load chậm
    setupProvinceSync();
    const observer = new MutationObserver(() => debouncedOnMutation());
    observer.observe(document.body, { childList: true, subtree: true });
}
