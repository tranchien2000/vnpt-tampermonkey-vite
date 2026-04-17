/**
 * generate_brain.cjs
 * Tối ưu hóa cho NotebookLM MCP CLI: Gom toàn bộ bộ não dự án vào một file duy nhất.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, '.notebooklm', 'PROJECT_FULL_BRAIN.md');

// --- CẤU HÌNH NOTEBOOKLM ---
const NOTEBOOK_ID = "6mE9pD-z_N7NfA"; // Đã cập nhật từ kết quả nlm list
// ---------------------------

// Cấu hình các thành phần dữ liệu
const CONFIG = {
    docs: ['PROJECT_MEMORY.md', 'README.md', 'docs/ARCHITECTURE.md', 'docs/RULES.md', '.cursorrules'],
    codeDirs: ['src/core', 'src/features', 'src/api', 'src/utils', 'src/ui']
};

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });
}

function generate() {
    console.log('--- 🧠 Đang khởi tạo FULL BRAIN cho NotebookLM MCP ---');
    const timestamp = new Date().toLocaleString('vi-VN');
    let fullContent = `# VNPT PRO PROJECT FULL BRAIN\n*Snapshot: ${timestamp}*\n\n`;

    // 1. Gộp các file tài liệu quan trọng
    fullContent += `## 📚 PHẦN 1: TÀI LIỆU & QUY TẮC\n\n`;
    CONFIG.docs.forEach(doc => {
        const p = path.join(ROOT_DIR, doc);
        if (fs.existsSync(p)) {
            console.log(`- Đang nạp tài liệu: ${doc}`);
            fullContent += `### 📄 File: ${doc}\n\n${fs.readFileSync(p, 'utf8')}\n\n---\n\n`;
        }
    });

    // 2. Gộp toàn bộ Source Code
    fullContent += `## 💻 PHẦN 2: LOGIC SOURCE CODE\n\n`;
    CONFIG.codeDirs.forEach(dir => {
        const fullDirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(fullDirPath)) {
            console.log(`- Đang quét thư mục: ${dir}`);
            
            const scanFiles = (currentDir, relativePath) => {
                const items = fs.readdirSync(currentDir);
                for (const item of items) {
                    const fullPath = path.join(currentDir, item);
                    const relPath = path.join(relativePath, item);
                    
                    if (fs.statSync(fullPath).isDirectory()) {
                        scanFiles(fullPath, relPath);
                    } else if (item.endsWith('.js') || item.endsWith('.ts') || item.endsWith('.cjs')) {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        fullContent += `#### 🛠️ Code: ${relPath}\n\n\`\`\`javascript\n${content}\n\`\`\`\n\n`;
                    }
                }
            };
            scanFiles(fullDirPath, dir);
        }
    });

    ensureDirectoryExistence(OUTPUT_FILE);
    fs.writeFileSync(OUTPUT_FILE, fullContent);

    console.log(`\n✅ HOÀN TẤT! Đã tạo bộ não tổng hợp tại: ${OUTPUT_FILE}`);

    // --- TỰ ĐỘNG ĐẨY LÊN NOTEBOOKLM QUA CLI ---
    try {
        console.log(`🚀 Đang tự động đẩy lên NotebookLM qua CLI (nlm)...`);
        
        // Lệnh đẩy source lên NotebookLM bằng nlm
        if (!NOTEBOOK_ID) {
            throw new Error("Vui lòng điền NOTEBOOK_ID vào script generate_brain.cjs (Dùng lệnh 'nlm list' để lấy ID)");
        }
        // Chuyển sang đường dẫn tương đối để tránh lỗi shell trên Windows
        const relativeOutputFile = path.relative(ROOT_DIR, OUTPUT_FILE);
        const command = `nlm source add ${NOTEBOOK_ID} --file "${relativeOutputFile}"`;
        console.log(`> Chạy lệnh: ${command}`);
        
        execSync(command, { stdio: 'inherit', cwd: ROOT_DIR });
        console.log(`\n✨ Đã cập nhật bộ não lên NotebookLM thành công!`);
    } catch (err) {
        console.log(`\n⚠️  Lỗi khi đẩy lên NotebookLM: ${err.message}`);
        console.log(`👉 Đảm bảo bạn đã đăng nhập nlm và đã chọn đúng notebook.`);
    }
}

generate();
