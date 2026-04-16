import { findBestMatch, cleanProvinceName, parseAddressComponents } from './stringHelper.js';
import { sleep } from './common.js';

// ─── DOM Map ───
let FullDOMMap = {
    byId: new Map(),
    byName: new Map(),
    byPlaceholder: new Map(),
    byLabel: new Map(),
    allInputs: []
};

let LabelCache = [];
let lastLabelUpdate = 0;
let cachedAddressGroup = null; // Cache address group

/**
 * Xóa bộ nhớ đệm DOM khi trang thay đổi cấu trúc lớn.
 */
export function clearDOMCache() {
    FullDOMMap.byId.clear();
    FullDOMMap.byName.clear();
    FullDOMMap.byPlaceholder.clear();
    FullDOMMap.byLabel.clear();
    FullDOMMap.allInputs = [];
    cachedAddressGroup = null;
}

/**
 * Đánh dấu cache DOM map là đã lỗi thời.
 */
export function invalidateDOMMap() {
    lastMapBuild = 0;
}

/**
 * Cập nhật lại danh sách labels từ DOM.
 */
export function refreshLabelsCache() {
    LabelCache = Array.from(document.querySelectorAll('label, .label, .label-text, span.title, .form-label'));
    lastLabelUpdate = Date.now();
    return LabelCache;
}

let lastMapBuild = 0;
const MAP_BUILD_COOLDOWN = 3000; // 3 seconds cooldown

/**
 * Xây dựng bản đồ toàn bộ DOM để truy vấn nhanh O(1).
 * Nên gọi hàm này trước khi thực hiện Quét hàng loạt.
 * @param {boolean} force - Nếu true, bắt buộc xây dựng lại bất kể cooldown
 */
export function buildFullDOMMap(force = false) {
    const now = Date.now();
    // Nếu force=true hoặc lastMapBuild=0 (đã bị invalidate), ta sẽ build lại.
    // Nếu không, chỉ build nếu quá cooldown.
    if (!force && lastMapBuild !== 0 && now - lastMapBuild < MAP_BUILD_COOLDOWN && FullDOMMap.allInputs.length > 0) {
        return;
    }

    const start = performance.now();
    lastMapBuild = now;
    clearDOMCache();

    // 1. Lấy tất cả các control nhập liệu (Bao gồm ng-select2 của Angular)
    const inputs = Array.from(document.querySelectorAll('input, textarea, select, ng-select2'));
    FullDOMMap.allInputs = inputs;

    inputs.forEach(el => {
        if (el.id) FullDOMMap.byId.set(el.id, el);
        if (el.name) FullDOMMap.byName.set(el.name, el);

        const placeholder = el.getAttribute('placeholder');
        if (placeholder) FullDOMMap.byPlaceholder.set(placeholder.trim(), el);

        const fcn = el.getAttribute('formcontrolname');
        if (fcn) FullDOMMap.byName.set(fcn, el);
    });

    // 2. Lấy và ánh xạ Label
    const labels = refreshLabelsCache();
    labels.forEach(lbl => {
        const text = lbl.innerText.trim();
        if (!text) return;

        let targetEl = null;
        if (lbl.htmlFor) {
            targetEl = document.getElementById(lbl.htmlFor);
        }

        if (!targetEl) {
            // Tìm trong phạm vi gần (cha hoặc anh em)
            let p = lbl.parentElement;
            let depth = 0;
            while (p && depth < 2) {
                targetEl = p.querySelector('input, textarea, select');
                if (targetEl) break;
                p = p.parentElement;
                depth++;
            }
        }

        if (targetEl) {
            FullDOMMap.byLabel.set(text, targetEl);
        }
    });

    const end = performance.now();
    const duration = end - start;
    if (duration > 10) {
        console.debug(`[DOM] Build map in ${duration.toFixed(2)}ms for ${inputs.length} inputs and ${labels.length} labels.`);
    }
}

export function triggerCustom(el) {
    if (!el) return;

    // 1. Gửi các sự kiện Native chuẩn (Bao gồm cả Bubbles)
    const eventOptions = { bubbles: true, cancelable: true, composed: true };
    el.dispatchEvent(new Event('focus', eventOptions));
    el.dispatchEvent(new Event('input', eventOptions));
    el.dispatchEvent(new Event('change', eventOptions));

    // 2. Xử lý đặc thù cho thẻ SELECT (Select2 / ng-select2)
    if (el.tagName === 'SELECT') {
        // Gửi event đặc thù của thư viện Select2
        el.dispatchEvent(new CustomEvent('select2:select', { ...eventOptions, detail: { data: { id: el.value } } }));

        // Tìm và báo hiệu cho component cha (Angular ng-select2)
        let parentComp = el.closest('ng-select2, .select2-container, .form-group');
        if (parentComp) {
            parentComp.dispatchEvent(new Event('change', eventOptions));
            parentComp.dispatchEvent(new Event('input', eventOptions));
        }

        // 3. jQuery Fallback (Nếu trang web dùng jQuery, Select2 cần jQuery để trigger phụ thuộc)
        try {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(el).trigger === 'function') {
                $(el).trigger('change');
                $(el).trigger('select2:select');
            }
        } catch (e) {
            // Trình duyệt có thể chặn nếu CSP gắt, bỏ qua
        }
    }

    el.dispatchEvent(new Event('blur', eventOptions));
}

/**
 * Làm nổi bật phần tử trên trang khi được tương tác.
 */
function highlightElement(el, type = 'success') {
    if (!el) return;
    const color = type === 'success' ? '#28a745' : '#dc3545';
    const originalTransition = el.style.transition;
    const originalOutline = el.style.outline;
    const originalBoxShadow = el.style.boxShadow;

    el.style.transition = 'all 0.3s ease';
    el.style.outline = `2px solid ${color}`;
    el.style.boxShadow = `0 0 10px ${color}`;

    setTimeout(() => {
        el.style.outline = originalOutline;
        el.style.boxShadow = originalBoxShadow;
        setTimeout(() => { el.style.transition = originalTransition; }, 300);
    }, 1000);
}

export function syncSetValue(el, value) {
    if (!el || value === undefined || value === null) return false;

    let isSuccess = false;
    const actualEl = el.tagName === 'NG-SELECT2' ? el.querySelector('select') || el : el;

    // --- Xử lý đặc biệt cho SELECT (Dropdown) ---
    if (el.tagName === 'SELECT' || el.tagName === 'NG-SELECT2') {
        const selectEl = actualEl;
        const options = Array.from(selectEl.options || []);
        const optionTexts = options.map(o => o.text.trim());

        let searchVal = value.toString().trim();

        // 1. Thử khớp chính xác Value (Trường hợp dữ liệu nguồn đã là mã ID)
        let foundOption = options.find(o => o.value === searchVal);

        // 2. Nếu không khớp value, thử logic bóc tách Tỉnh/Huyện/Xã từ địa chỉ Full
        if (!foundOption && searchVal.includes(',')) {
            const parsedData = parseAddressComponents(searchVal);
            const addressGroup = getVNPTAddressGroup();
            
            // Xác định xem element hiện tại đóng vai trò gì trong bộ địa chỉ
            const wrapperEl = el.closest('ng-select2') || el;
            const idAttr = (wrapperEl.id || wrapperEl.getAttribute('formcontrolname') || wrapperEl.name || '').toLowerCase();
            
            if (addressGroup && (wrapperEl === addressGroup.tinh || el === addressGroup.tinh)) {
                searchVal = parsedData.province;
            } else if (addressGroup && (wrapperEl === addressGroup.xaIdNew || el === addressGroup.xaIdNew)) {
                searchVal = parsedData.ward || parsedData.district;
            } else if (idAttr.includes('tinh')) {
                searchVal = parsedData.province;
            } else if (idAttr.includes('xa') || idAttr.includes('huyen') || idAttr.includes('quan')) {
                searchVal = parsedData.ward || parsedData.district;
            }
        }

        // --- Logic so khớp Fuzzy ---
        if (!foundOption) {
            let bestText = findBestMatch(searchVal, optionTexts, 0.75);
            if (!bestText) {
                const cleanName = cleanProvinceName(searchVal);
                const cleanOptions = optionTexts.map(t => cleanProvinceName(t));
                const matchedClean = findBestMatch(cleanName, cleanOptions, 0.65);
                if (matchedClean) bestText = optionTexts[cleanOptions.indexOf(matchedClean)];
            }

            if (bestText) foundOption = options.find(o => o.text.trim() === bestText);
        }

        if (foundOption) {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(selectEl).val === 'function') {
                $(selectEl).val(foundOption.value).trigger('change').trigger('change.select2').trigger('select2:select');
            }
            selectEl.value = foundOption.value;
            isSuccess = true;
        } else if (value && !value.toString().includes(',')) {
            const $ = window.jQuery || window.$;
            if ($ && typeof $(selectEl).val === 'function') {
                $(selectEl).val(value).trigger('change').trigger('change.select2');
            }
            selectEl.value = value;
        }

        triggerCustom(selectEl);
        if (isSuccess) highlightElement(el, 'success');
        return isSuccess;

    } else {
        // --- Xử lý cho INPUT/TEXTAREA thông thường ---
        const addressGroup = getVNPTAddressGroup();
        const idLower = (el.id || el.name || el.getAttribute('formcontrolname') || '').toLowerCase();
        
        const isDuongField = (addressGroup && el === addressGroup.duong) || idLower.includes('duong') || idLower.includes('diachichitiet');

        if (isDuongField && typeof value === 'string' && value.includes(',')) {
            value = parseAddressComponents(value).street;
        }

        const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
        
        if (setter) {
            setter.call(el, value);
        } else {
            el.value = value;
        }
        isSuccess = true;
        highlightElement(el, 'success');
    }

    triggerCustom(el);
    return isSuccess;
}


/**
 * Đợi dropdown có options (AJAX load xong).
 */
async function waitForOptions(el, timeout = 3000) {
    const start = Date.now();
    let selectEl = el.tagName === 'NG-SELECT2' ? el.querySelector('select') || el : el;

    // Nếu không phải là một danh sách chọn, không cần phải đợi AJAX (input thường lấy text)
    if (selectEl.tagName !== 'SELECT' && selectEl.tagName !== 'NG-SELECT2') {
        console.debug(`[waitForOptions] Phần tử không phải SELECT/NG-SELECT2 (${selectEl.tagName}), bỏ qua bước chờ options.`);
        return true;
    }

    while (Date.now() - start < timeout) {
        // Cố gắng tìm lại nội dung mới nếu DOM bị load lại
        if (!document.contains(selectEl) && el.tagName === 'NG-SELECT2') {
            selectEl = el.querySelector('select') || el;
        }

        if (selectEl.options && selectEl.options.length > 1) {
            console.debug(`[waitForOptions] Đã tìm thấy ${selectEl.options.length} options sau ${Date.now() - start}ms.`);
            return true;
        }
        await sleep(200);
    }

    console.warn(`[waitForOptions] Timeout ${timeout}ms. Element "${el.id || el.name}" (${selectEl.tagName}) chỉ có ${selectEl.options ? selectEl.options.length : 0} options.`);
    return false;
}

// Tìm input theo id, name, hoặc nhãn thẻ label (Hỗ trợ Fuzzy Search)
export function findPageInput(name, labelText = null) {
    if (!name && !labelText) return null;

    // Auto build map if not initialized
    if (FullDOMMap.allInputs.length === 0) {
        buildFullDOMMap();
    }

    const resolveToInput = (el) => {
        if (!el) return null;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) || el.getAttribute('contenteditable') === 'true') {
            return el;
        }
        // Nếu không phải input, tìm input con đầu tiên bên trong nó (Smart Proxy)
        return el.querySelector('input, textarea, select, [contenteditable="true"]');
    };

    // 1. Thử tra cứu từ Map (O(1))
    if (name) {
        let el = FullDOMMap.byId.get(name) || FullDOMMap.byName.get(name) || FullDOMMap.byPlaceholder.get(name) || FullDOMMap.byLabel.get(name);
        if (el && document.contains(el)) return resolveToInput(el);
    }

    if (labelText) {
        let el = FullDOMMap.byLabel.get(labelText);
        if (el && document.contains(el)) return resolveToInput(el);
    }

    // 1.5. Alias fallback cho xaIdNew (Tương thích dữ liệu cũ)
    if (name && (name.includes('xaId') || name.includes('quanHuyenId') || name.includes('phuongXaId') || name.includes('xaIdNew'))) {
        const addressGroup = getVNPTAddressGroup();
        if (addressGroup && addressGroup.xaIdNew) {
            return resolveToInput(addressGroup.xaIdNew);
        }
    }

    // 2. Nếu Map chưa có (hoặc hỏng), thử tìm trực tiếp (Fallback)
    if (name) {
        const byId = document.getElementById(name);
        if (byId) {
            const resolved = resolveToInput(byId);
            if (resolved) return resolved;
        }

        const selector = `input[id="${name}"], textarea[id="${name}"], select[id="${name}"], input[name="${name}"], textarea[name="${name}"], [placeholder="${name}"], [formcontrolname="${name}"]`;
        const byAttr = document.querySelector(selector);
        if (byAttr) return byAttr;

        // Thử tìm bất cứ element nào có ID/Name đó rồi resolve
        const generalAttr = document.querySelector(`[id="${name}"], [name="${name}"]`);
        if (generalAttr) {
            const resolved = resolveToInput(generalAttr);
            if (resolved) return resolved;
        }
    }

    // 3. Fuzzy Match trên Label (Tốn kém hơn)
    const targetLabel = labelText || name;
    if (targetLabel && targetLabel.length > 2) {
        const labelTexts = Array.from(FullDOMMap.byLabel.keys());
        if (labelTexts.length === 0 && LabelCache.length > 0) {
            labelTexts.push(...LabelCache.map(l => l.innerText.trim()).filter(t => t.length > 0));
        }

        const bestText = findBestMatch(targetLabel, labelTexts, 0.82);
        if (bestText) {
            return resolveToInput(FullDOMMap.byLabel.get(bestText));
        }
    }

    return null;
}

export function getInputByLabel(text) {
    return findPageInput(null, text);
}

export function setPageField(name, value, labelText = null) {
    const el = findPageInput(name, labelText);
    if (el) {
        syncSetValue(el, value);
        return true;
    }
    return false;
}

/**
 * Trả về thứ tự ưu tiên của trường (Tỉnh=1, Huyện=2, Xã=3, Khác=9).
 */
function getFieldRank(name, el) {
    const id = (name || el?.id || el?.getAttribute('formcontrolname') || '').toLowerCase();

    // Nếu là ID hoặc Name chứa từ khóa
    if (id.includes('tinh') || id.includes('province') || id.includes('city')) return 1;
    if (id.includes('xaIdNew') || id.includes('huyen') || id.includes('quan') || id.includes('district') || id.includes('xa') || id.includes('phuong') || id.includes('ward')) return 2;

    // Nếu không, thử tìm label
    const labelEl = el?.id ? document.querySelector(`label[for="${el.id}"]`) : null;
    const labelText = (labelEl?.innerText || '').toLowerCase();
    if (labelText.includes('tỉnh') || labelText.includes('thành phố')) return 1;
    if (labelText.includes('huyện') || labelText.includes('quận') || labelText.includes('xã') || labelText.includes('phường')) return 2;

    return 9;
}

/**
 * Đồng bộ danh sách các trường theo thứ tự ưu tiên (Tỉnh -> Xã/Huyện) và có độ trễ.
 * @param {Array<string>} names - Danh sách các IDs/Names
 * @param {string} value - Giá trị đổ vào
 */
/**
 * Đợi một phần tử xuất hiện trong DOM (Hỗ trợ lazy load của Angular).
 */
async function waitForElement(name, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        // Luôn force rebuild map vì DOM có thể đã thay đổi
        buildFullDOMMap(true);
        const el = findPageInput(name);
        if (el && document.contains(el)) return el;
        await sleep(500);
    }
    return null;
}

/**
 * Đồng bộ danh sách các trường theo thứ tự ưu tiên (Tỉnh -> Xã/Huyện) và có độ trễ.
 * @param {Array<string>} names - Danh sách các IDs/Names
 * @param {string} value - Giá trị đổ vào
 */
export async function setPageFieldsSequential(names, value) {
    if (!names || !names.length) return;

    // --- 1. TỰ ĐỘNG MỞ RỘNG DANH SÁCH TARGETS CHO ĐỊA CHỈ FULL ---
    const lowerNames = names.map(n => n.toLowerCase());
    const isAddressRow = lowerNames.some(n => n.includes('diachi') || n.includes('địa chỉ'));
    const isFullAddressValue = typeof value === 'string' && value.includes(',');

    if (isAddressRow && isFullAddressValue) {
        // Tự động thêm các field địa chỉ phổ biến nếu chưa có trong list nhưng có trên trang
        const autoTargets = [
            'tinhIdNew', 'diaChiTruSoTinhIdNew',
            'xaIdNew', 'diaChiTruSoXaIdNew',
            'duong', 'diaChiTruSoDuong'
        ];
        autoTargets.forEach(t => {
            if (!names.includes(t) && findPageInput(t)) names.push(t);
        });
    }

    // --- 2. PHÂN LOẠI & NHÓM THEO RANK ---
    const tasks = names.map(name => {
        const el = findPageInput(name);
        return { name, el, rank: getFieldRank(name, el) };
    });

    // Lấy danh sách Rank duy nhất hiện có và sắp xếp (1 -> 2 -> 9)
    const uniqueRanks = [...new Set(tasks.map(t => t.rank))].sort((a, b) => a - b);
    let lastRankSuccess = true;

    // --- 3. THỰC THI THEO TỪNG CỤM RANK ---
    for (const rank of uniqueRanks) {
        // Nếu địa chỉ tầng trên (Tỉnh/Huyện) thất bại hoàn toàn, không điền tầng dưới
        if (rank <= 2 && !lastRankSuccess) {
            console.warn(`[Sync Sequential] Bỏ qua Rank ${rank} do cấp trên thất bại.`);
            continue;
        }

        const groupTasks = tasks.filter(t => t.rank === rank);
        let groupAnySuccess = false;

        console.debug(`[Sync Sequential] Đang xử lý nhóm Rank ${rank} với ${groupTasks.length} fields.`);

        // Điền tất cả các trường trong cùng nhóm Rank (Đồng bộ đồng thời)
        for (const task of groupTasks) {
            let currentEl = findPageInput(task.name) || task.el;

            // Đợi element Rank 2 (Xã/Huyện) vì nó thường render trễ sau khi chọn Tỉnh
            if (!currentEl && rank === 2) {
                console.debug(`[Sync Sequential] Đợi element Xã/Huyện (${task.name})...`);
                currentEl = await waitForElement(task.name, 3500); // Giảm timeout xuống chút để nhanh hơn
            }

            if (currentEl) {
                // Kích hoạt AJAX Lazy Load cho Rank 2 dropdowns
                if (rank > 1 && rank <= 2) {
                    const actualSelect = currentEl.tagName === 'NG-SELECT2' ? (currentEl.querySelector('select') || currentEl) : currentEl;
                    if (actualSelect.tagName === 'SELECT' || actualSelect.tagName === 'NG-SELECT2') {
                        const clickTarget = currentEl.tagName === 'NG-SELECT2' ? (currentEl.querySelector('.select2-selection, .select2-choice') || currentEl) : currentEl;
                        
                        // Trick để Select2/Angular hiểu là đang click để load data
                        clickTarget.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                        clickTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                        // Chờ đợi thông minh cho đến khi dropdown có data
                        await waitForOptions(actualSelect, 3000);
                        
                        // Đóng dropdown sau khi load xong để syncSetValue làm việc sạch sẽ
                        clickTarget.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape', code: 'Escape' }));
                    }
                }

                if (task.name.toLowerCase().includes('duong')) {
                    console.log(`[Sync Sequential] Đang nhập trường 'duong' (${task.name}) với giá trị: "${value}"`);
                }

                const success = syncSetValue(currentEl, value);
                if (success) groupAnySuccess = true;
                console.debug(`[Sync Sequential] Điền ${task.name}: ${success ? 'OK' : 'FAIL'}`);
            }
        }

        lastRankSuccess = groupAnySuccess;

        // TỐI ƯU: Chỉ nghỉ nếu cần AJAX trigger cấp tiếp theo, và nghỉ ngắn hơn nếu groupAnySuccess
        if (groupAnySuccess && rank < 9) {
            // Nếu là Tỉnh (Rank 1), chờ AJAX cho Huyện/Xã (Rank 2)
            // Nếu là Huyện/Xã (Rank 2), chờ AJAX cho các field phụ thuộc khác (nếu có)
            const waitTime = rank === 1 ? 600 : 300; 
            console.debug(`[Sync Sequential] Hoàn tất Rank ${rank}, nghỉ ${waitTime}ms chờ AJAX...`);
            await sleep(waitTime);
            buildFullDOMMap(true); // Cập nhật lại Map vì DOM có thể đã thay đổi sau AJAX
        }
    }
}

export function getVNPTAddressGroup() {
    if (cachedAddressGroup) return cachedAddressGroup;

    try {
        // 1. Tìm container chứa địa chỉ dựa trên Label (Tăng độ bền vững)
        const labels = Array.from(document.querySelectorAll('label, .label, span.title'));
        const addressLabel = labels.find(l => {
            const txt = l.innerText.toLowerCase();
            return (txt.includes('địa chỉ') || txt.includes('địa chỉ trụ sở')) && !txt.includes('email');
        });

        let targetRow = null;
        if (addressLabel) {
            // Thường label nằm trong .col rồi nằm trong .row
            targetRow = addressLabel.closest('.row.row-form') || addressLabel.closest('.row');
        }

        // Fallback về hàng thứ 3 nếu không tìm thấy nhãn (Cũ)
        if (!targetRow) {
            const mainRows = Array.from(document.querySelectorAll('form .row.row-form, .row.row-form'));
            targetRow = mainRows[2];
        }

        if (!targetRow) return null;

        // 2. Lấy 2 cột con của hàng địa chỉ
        const subCols = targetRow.querySelectorAll('.col-12.col-sm-6, .col-sm-6');
        if (subCols.length < 2) return null;

        const leftCol = subCols[0];  // Tỉnh
        const rightCol = subCols[1]; // Xã/Huyện, Đường

        const findDeep = (col, selector) => col.querySelector(selector);
        const controlsInRight = Array.from(rightCol.querySelectorAll('select, ng-select2, input'));

        const xaIdNewEl = findDeep(rightCol, '[formcontrolname*="xaIdNew" i], [id*="xaIdNew" i], [formcontrolname*="huyen" i], [id*="huyenId" i], [formcontrolname*="xa" i]');
        const duongEl = findDeep(rightCol, '[formcontrolname*="duong" i], [id*="duong" i]');
        const soNhaEl = findDeep(rightCol, '[formcontrolname*="soNha" i], [id*="sonha" i]');

        let fallbackDuong = null;
        if (!duongEl && controlsInRight.length > 0) {
            // Mặc định trường cuối cùng trong cột phải thường là Đường nếu không có ID đặc biệt
            fallbackDuong = (soNhaEl && controlsInRight[controlsInRight.length - 1] === soNhaEl) 
                ? controlsInRight[controlsInRight.length - 2] 
                : controlsInRight[controlsInRight.length - 1];
        }

        cachedAddressGroup = {
            tinh: findDeep(leftCol, '[formcontrolname*="tinhIdNew" i], [id*="tinhId" i]') || leftCol.querySelector('select, ng-select2'),
            xaIdNew: xaIdNewEl || controlsInRight[0],
            duong: duongEl || fallbackDuong
        };
        
        return cachedAddressGroup;
    } catch (e) {
        return null;
    }
}
