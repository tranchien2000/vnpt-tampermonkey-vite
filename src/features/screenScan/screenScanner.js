/**
 * @file screenScanner.js
 * @desc Quét toàn bộ văn bản hiển thị trên tab hiện tại, loại bỏ dữ liệu rác.
 */

export function scrapeScreenText() {
    try {
        // Tạo một clone để không làm hỏng trang thực
        const backup = document.body.cloneNode(true);

        // Danh sách các thành phần cần loại bỏ để giảm nhiễu cho AI
        const junkSelectors = [
            'script', 'style', 'noscript', 'iframe', 'svg',
            'nav', 'footer', 'header:not(article header)', 
            'aside', '.sidebar', '.menu', '.banner',
            '#vnpt-docx-widget', '#vnpt-inline-calc', '.vnpt-pdf-overlay', // Các thành phần của chính chúng ta
            '[aria-hidden="true"]'
        ];

        junkSelectors.forEach(selector => {
            const elements = backup.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });

        // Lấy text và làm sạch khoảng trắng thừa
        let text = backup.innerText || "";
        
        // Normalize: Xóa các dòng trắng thừa và khoảng trắng dư
        text = text.split('\n')
                   .map(line => line.trim())
                   .filter(line => line.length > 0)
                   .join('\n');

        return text;
    } catch (err) {
        console.error("Lỗi khi quét màn hình:", err);
        return "";
    }
}
