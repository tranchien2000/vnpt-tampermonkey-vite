/**
 * @file profileManager.js
 * @desc Quản lý các cấu hình mặc định (Side B) cho từng chi nhánh VNPT khác nhau.
 */
import { Storage } from '../utils/storage.js';
import { LOCAL_KEY_PROFILES, LOCAL_KEY_ACTIVE_PROFILE_ID, LOCAL_KEY_DEFAULT_FIELDS } from '../core/constants.js';
import { DEFAULT_DATA } from '../core/defaults.js';

/**
 * Khởi tạo dữ liệu Profile nếu chưa có
 */
export function initProfiles() {
    const profiles = Storage.get(LOCAL_KEY_PROFILES);
    if (!profiles || profiles.length === 0) {
        const defaultProfile = {
            id: 'hanoi_default',
            name: 'VNPT Hà Nội (Mặc định)',
            data: DEFAULT_DATA
        };
        Storage.set(LOCAL_KEY_PROFILES, [defaultProfile]);
        Storage.set(LOCAL_KEY_ACTIVE_PROFILE_ID, 'hanoi_default');
    }
}

/**
 * Lấy danh sách Profile
 */
export function getProfiles() {
    return Storage.get(LOCAL_KEY_PROFILES) || [];
}

/**
 * Lấy ID Profile đang hoạt động
 */
export function getActiveProfileId() {
    return Storage.get(LOCAL_KEY_ACTIVE_PROFILE_ID);
}

/**
 * Chuyển sang Profile khác
 */
export function switchProfile(id) {
    const profiles = getProfiles();
    const target = profiles.find(p => p.id === id);
    if (!target) return false;

    Storage.set(LOCAL_KEY_ACTIVE_PROFILE_ID, id);
    
    // Khi đổi profile, ta ghi đè dữ liệu mặc định hiện tại bằng dữ liệu của profile đó
    // Lưu ý: LOCAL_KEY_DEFAULT_FIELDS là nơi fieldsManager đọc khi ở Default Mode
    Storage.set(LOCAL_KEY_DEFAULT_FIELDS, target.data);
    
    return true;
}

/**
 * Tạo profile mới từ dữ liệu Default Mode hiện tại
 */
export function createProfileFromCurrent(name) {
    const profiles = getProfiles();
    const currentData = Storage.get(LOCAL_KEY_DEFAULT_FIELDS) || DEFAULT_DATA;
    
    const newProfile = {
        id: 'p_' + Date.now(),
        name: name,
        data: currentData
    };
    
    profiles.push(newProfile);
    Storage.set(LOCAL_KEY_PROFILES, profiles);
    return newProfile.id;
}

/**
 * Xóa profile
 */
export function deleteProfile(id) {
    if (id === 'hanoi_default') return false; // Không cho xóa bản gốc
    
    let profiles = getProfiles();
    profiles = profiles.filter(p => p.id !== id);
    Storage.set(LOCAL_KEY_PROFILES, profiles);
    
    if (getActiveProfileId() === id) {
        switchProfile('hanoi_default');
    }
    return true;
}

/**
 * Nhập danh sách profile mới (từ Cloud)
 */
export function importProfiles(newProfiles) {
    if (!Array.isArray(newProfiles)) return;
    
    // Hợp nhất (hoặc ghi đè tùy chọn - ở đây ta ghi đè danh sách local)
    Storage.set(LOCAL_KEY_PROFILES, newProfiles);
    
    // Nếu active profile bị xóa hoặc không còn tồn tại, chuyển về mặc định
    const activeId = getActiveProfileId();
    if (!newProfiles.find(p => p.id === activeId)) {
        switchProfile('hanoi_default');
    }
}
