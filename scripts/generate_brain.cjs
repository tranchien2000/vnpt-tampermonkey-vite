/**
 * generate_brain.js
 * Script này tổng hợp tài liệu và thông tin cấu trúc dự án để phục vụ NotebookLM.
 * Nó tập trung vào Kiến trúc và Logic chính, không bao gồm mã nguồn chi tiết.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, '.notebooklm');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'brain_context.md');

// Danh sách các file tài liệu ưu tiên
const DOCS_TO_INCLUDE = [
    'ARCHITECTURE.md',
    'PROJECT_MEMORY.md',
    'README.md',
    'docs.md' // Nếu có trong quy tắc
];

// Các thư mục code cần quét tóm tắt
const CODE_DIRS = [
    'src/core',
    'src/features',
    'src/api',
    'src/utils'
];

// Thư mục chứa Workflows
const WORKFLOWS_DIR = '.agents/workflows';

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function getFileSummary(relativeRef) {
    const fullPath = path.join(ROOT_DIR, relativeRef);
    if (!fs.existsSync(fullPath)) return null;

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    let summary = '';
    let inComment = false;
    let lineCount = 0;

    for (let i = 0; i < Math.min(lines.length, 30); i++) {
        const line = lines[i].trim();
        if (line.startsWith('/**') || line.startsWith('/*')) {
            inComment = true;
            summary += line + '\n';
            if (line.endsWith('*/')) inComment = false;
        } else if (inComment) {
            summary += line + '\n';
            if (line.endsWith('*/')) inComment = false;
        } else if (line.startsWith('//')) {
            summary += line + '\n';
        } else if (line !== '' && !inComment) {
            break;
        }
        lineCount++;
        if (lineCount > 10) break; // Limit to 10 lines max per file
    }

    return summary.trim() || 'No description available.';
}

function generate() {
    console.log('--- Đang tổng hợp dữ liệu rút gọn cho NotebookLM ---');
    let output = `# VNPT PROJECT BRAIN CONTEXT (OPTIMIZED)\n`;
    output += `*Ngày cập nhật: ${new Date().toLocaleString('vi-VN')}*\n\n`;

    // 1. Thêm các file tài liệu chính (có giới hạn)
    output += `## 1. TÀI LIỆU CỐT LÕI (CORE DOCUMENTS)\n\n`;
    for (const doc of DOCS_TO_INCLUDE) {
        const docPath = path.join(ROOT_DIR, doc);
        if (fs.existsSync(docPath)) {
            console.log(`Đang đọc: ${doc}`);
            output += `### File: ${doc}\n\n`;

            let docContent = fs.readFileSync(docPath, 'utf8');
            if (doc === 'README.md') {
                // Chỉ lấy 100 dòng đầu của README
                const lines = docContent.split('\n');
                docContent = lines.slice(0, 100).join('\n') + '\n\n... (phần còn lại đã được lược bỏ để tiết kiệm context) ...';
            }
            output += docContent + '\n\n---\n\n';
        }
    }

    // 2. Thêm tóm tắt cấu trúc code
    output += `## 2. TÓM TẮT CẤU TRÚC MÃ NGUỒN (CODE LOGIC SUMMARIES)\n\n`;

    for (const dir of CODE_DIRS) {
        const fullDirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(fullDirPath)) {
            output += `### Thư mục: ${dir}\n\n`;
            const files = fs.readdirSync(fullDirPath);

            output += `| File | Mô tả |\n| :--- | :--- |\n`;
            for (const file of files) {
                const relativeFile = path.join(dir, file);
                const fullFilePath = path.join(ROOT_DIR, relativeFile);

                if (fs.statSync(fullFilePath).isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
                    const summary = getFileSummary(relativeFile).replace(/\n/g, '<br>');
                    output += `| ${file} | ${summary} |\n`;
                }
            }
            output += '\n';
        }
    }

    // 3. Thêm Workflows (Chỉ lấy Description)
    output += `## 3. DANH MỤC QUY TRÌNH (WORKFLOWS MAP)\n\n`;
    const workflowsPath = path.join(ROOT_DIR, WORKFLOWS_DIR);
    if (fs.existsSync(workflowsPath)) {
        const wfFiles = fs.readdirSync(workflowsPath).filter(f => f.endsWith('.md'));
        for (const wf of wfFiles) {
            const content = fs.readFileSync(path.join(workflowsPath, wf), 'utf8');
            const descMatch = content.match(/description:\s*(.*)/);
            const description = descMatch ? descMatch[1] : 'Không có mô tả.';
            output += `- **/${wf.replace('.md', '')}**: ${description}\n`;
        }
        output += `\n> *Lưu ý: Để xem chi tiết workflow, hãy dùng lệnh view_file trực tiếp vào file trong thư mục .agents/workflows/*\n\n`;
    }

    // 4. Quy tắc dự án (Cursorrules/Settings)
    const cursorRulesPath = path.join(ROOT_DIR, '.cursorrules');
    if (fs.existsSync(cursorRulesPath)) {
        output += `## 4. QUY TẮC DỰ ÁN (.cursorrules)\n\n`;
        output += fs.readFileSync(cursorRulesPath, 'utf8') + '\n\n';
    }

    ensureDirectoryExistence(OUTPUT_FILE);
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`==> Đã tạo xong: ${OUTPUT_FILE}`);
}

generate();
