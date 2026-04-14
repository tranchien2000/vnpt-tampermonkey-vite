import { VALIDATION_REGEX, REQUIRED_KEYS } from '../../core/constants.js';

/**
 * Kiểm tra định dạng dữ liệu (MST, SĐT, Email)
 */
export function validateField(key, value, inputEl) {
    let isValid = true;
    let regex = null;

    if (key === 'soDkdn') regex = VALIDATION_REGEX.MST;
    else if (key === 'sdt') regex = VALIDATION_REGEX.PHONE;
    else if (key === 'emailDaiDien') regex = VALIDATION_REGEX.EMAIL;
    else if (key === 'cmnd' || key === 'cccd') regex = VALIDATION_REGEX.ID_CARD;

    if (regex && value.trim() !== "") {
        isValid = regex.test(value.trim());
    }

    if (!isValid) {
        inputEl.classList.add('field-error');
        inputEl.classList.add('vnpt-shake');
        setTimeout(() => inputEl.classList.remove('vnpt-shake'), 400);
    } else {
        inputEl.classList.remove('field-error');
    }
    return isValid;
}

/**
 * Làm mới trạng thái validation cho một hàng (Bắt buộc & Định dạng)
 * @param {HTMLElement} row - Hàng cần kiểm tra
 */
export function refreshRowValidation(row) {
    const fKey = row.querySelector('.f-key');
    const fVal = row.querySelector('.f-val');
    if (!fKey || !fVal) return;

    const primaryKey = fKey.value.split(',')[0].trim();
    const value = fVal.value.trim();

    // 1. Kiểm tra Bắt buộc (Required)
    if (REQUIRED_KEYS.includes(primaryKey)) {
        if (!value) {
            fVal.classList.add('field-required-empty');
        } else {
            fVal.classList.remove('field-required-empty');
        }
    } else {
        fVal.classList.remove('field-required-empty');
    }

    // 2. Kiểm tra Định dạng (MST, SĐT, Email...)
    validateField(primaryKey, fVal.value, fVal);
}
