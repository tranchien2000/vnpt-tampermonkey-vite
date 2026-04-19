/**
 * @file patternLearning.js
 * @desc Module quản lý việc học bóc tách dữ liệu từ feedback người dùng.
 *       Ghi nhớ ngữ cảnh (Context) để cải thiện độ chính xác của QR TEXT.
 */
import { Storage } from './storage.js';

const SK_LEARNED_PATTERNS = 'VNPT_LEARNED_PATTERNS';

export const PatternLearning = {
    /**
     * Ghi nhớ một mẫu dữ liệu mới.
     * @param {string} rawFullText - Toàn bộ văn bản thô lúc đó.
     * @param {string} key - Tên trường dữ liệu (ví dụ: soDkdn).
     * @param {string} userValue - Giá trị chính xác do người dùng sửa.
     */
    learn(rawFullText, key, userValue) {
        if (!rawFullText || !key || !userValue) return;

        const patterns = Storage.get(SK_LEARNED_PATTERNS, {});
        
        // Trích xuất ngữ cảnh xung quanh giá trị (Dùng 50 ký tự trước và sau)
        // Tìm vị trí của giá trị trong văn bản thô
        const valIndex = rawFullText.indexOf(userValue);
        if (valIndex === -1) return;

        const contextBefore = rawFullText.substring(Math.max(0, valIndex - 40), valIndex).trim();
        // Chỉ lấy các từ khóa nhận diện quan trọng (loại bỏ số/ngày tháng thay đổi)
        const cleanAnchor = contextBefore.replace(/\d+/g, '').replace(/\s+/g, ' ').toLowerCase();

        if (cleanAnchor.length < 5) return; // Ngữ cảnh quá ngắn, không tin cậy

        if (!patterns[key]) patterns[key] = [];
        
        // Kiểm tra xem anchor này đã được học chưa
        const existing = patterns[key].find(p => p.anchor === cleanAnchor);
        if (existing) {
            existing.count = (existing.count || 1) + 1;
            existing.lastValue = userValue; // Cập nhật giá trị mới nhất
        } else {
            patterns[key].push({
                anchor: cleanAnchor,
                lastValue: userValue,
                count: 1,
                updatedAt: Date.now()
            });
        }

        // Giới hạn bộ nhớ: Mỗi key tối đa 10 mẫu tiêu biểu nhất
        patterns[key] = patterns[key].sort((a, b) => b.count - a.count).slice(0, 10);

        Storage.set(SK_LEARNED_PATTERNS, patterns);
        console.debug(`[Learning] Đã học mẫu mới cho "${key}": ...${cleanAnchor}`);
    },

    /**
     * Tìm kiếm giá trị dựa trên những gì đã học.
     */
    predict(rawFullText, results) {
        const patterns = Storage.get(SK_LEARNED_PATTERNS, {});
        const lowerText = rawFullText.toLowerCase();

        Object.keys(patterns).forEach(key => {
            // Nếu Regex chưa tìm thấy, hoặc muốn ghi đè thông minh
            for (const p of patterns[key]) {
                if (lowerText.includes(p.anchor)) {
                    // Tìm phần văn bản ngay sau anchor trong văn bản hiện tại
                    const startIdx = lowerText.indexOf(p.anchor) + p.anchor.length;
                    const snippet = rawFullText.substring(startIdx, startIdx + 50).split('\n')[0].trim();
                    
                    // Nếu snippet có chứa một chuỗi trông giống giá trị cũ (cùng định dạng)
                    // Ở đây chúng ta tạm thời lấy giá trị gần nhất nếu nó khớp định dạng Regex của key đó
                    if (snippet && !results[key]) {
                        // Logic này sẽ được hoàn thiện ở Giai đoạn 3
                    }
                }
            }
        });
        return results;
    }
};
