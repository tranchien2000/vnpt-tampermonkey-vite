/**
 * generate_brain.cjs
 * Script này tổng hợp tài liệu và cấu trúc dự án thành các module nhỏ để tối ưu hóa context cho AI và NotebookLM.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT_DIR, '.notebooklm');

// Định nghĩa các module và file cần bao gồm
const MODULES = {
    identity: {
        file: 'brain_identity.md',
        docs: ['PROJECT_MEMORY.md', 'README.md']
    },
    architecture: {
        file: 'brain_architecture.md',
        docs: ['graphify-out/GRAPH_REPORT.md', 'ARCHITECTURE.md']
    },
    code_summary: {
        file: 'brain_code.md',
        dirs: ['src/core', 'src/features', 'src/api', 'src/utils']
    },
    workflows: {
        file: 'brain_flows.md',
        dir: '.agents/workflows'
    },
    rules: {
        file: 'brain_rules.md',
        files: ['.cursorrules']
    }
};

function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

function getFileSummary(relativeRef) {
    const fullPath = path.join(ROOT_DIR, relativeRef);
    if (!fs.existsSync(fullPath)) return null;

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    let summary = '';
    let inComment = false;
    let lineCount = 0;

    for (let i = 0; i < Math.min(lines.length, 50); i++) {
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
        if (lineCount > 15) break; 
    }

    return summary.trim() || 'No description available.';
}

function generate() {
    console.log('--- Đang khởi tạo Bộ não dự án (Multi-module) ---');
    const timestamp = new Date().toLocaleString('vi-VN');

    // 1. Module Identity (Dưới 50 dòng README)
    let identityContent = `# Project Identity & Memory\n*Cập nhật: ${timestamp}*\n\n`;
    for (const doc of MODULES.identity.docs) {
        const p = path.join(ROOT_DIR, doc);
        if (fs.existsSync(p)) {
            console.log(`Đang đọc Identity: ${doc}`);
            let content = fs.readFileSync(p, 'utf8');
            if (doc === 'README.md') content = content.split('\n').slice(0, 100).join('\n') + '\n\n... (lược bỏ) ...';
            identityContent += `## ${doc}\n\n${content}\n\n---\n\n`;
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, MODULES.identity.file), identityContent);

    // 2. Module Architecture (Graphify + Architecture Docs)
    let archContent = `# Project Architecture (Graphify Optimized)\n*Cập nhật: ${timestamp}*\n\n`;
    for (const doc of MODULES.architecture.docs) {
        const p = path.join(ROOT_DIR, doc);
        if (fs.existsSync(p)) {
            console.log(`Đang đọc Arch: ${doc}`);
            archContent += `## ${doc}\n\n${fs.readFileSync(p, 'utf8')}\n\n---\n\n`;
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, MODULES.architecture.file), archContent);

    // 3. Module Code Summary
    let codeContent = `# Source Code Logic Map\n*Cập nhật: ${timestamp}*\n\n`;
    for (const dir of MODULES.code_summary.dirs) {
        const fullDirPath = path.join(ROOT_DIR, dir);
        if (fs.existsSync(fullDirPath)) {
            codeContent += `## Thư mục: ${dir}\n\n| File | Mô tả |\n| :--- | :--- |\n`;
            const files = fs.readdirSync(fullDirPath);
            for (const file of files) {
                const relativeFile = path.join(dir, file);
                const fullFilePath = path.join(ROOT_DIR, relativeFile);
                if (fs.statSync(fullFilePath).isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
                    const summary = (getFileSummary(relativeFile) || '').replace(/\n/g, '<br>');
                    codeContent += `| ${file} | ${summary} |\n`;
                }
            }
            codeContent += '\n';
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, MODULES.code_summary.file), codeContent);

    // 4. Module Workflows
    let wfContent = `# Workflow Catalog\n*Cập nhật: ${timestamp}*\n\n`;
    const wfDirPath = path.join(ROOT_DIR, MODULES.workflows.dir);
    if (fs.existsSync(wfDirPath)) {
        const wfFiles = fs.readdirSync(wfDirPath).filter(f => f.endsWith('.md'));
        for (const wf of wfFiles) {
            const content = fs.readFileSync(path.join(wfDirPath, wf), 'utf8');
            const descMatch = content.match(/description:\s*(.*)/);
            wfContent += `- **/${wf.replace('.md', '')}**: ${descMatch ? descMatch[1] : 'Không có mô tả.'}\n`;
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, MODULES.workflows.file), wfContent);

    // 5. Module Rules
    let rulesContent = `# Project Rules\n*Cập nhật: ${timestamp}*\n\n`;
    for (const file of MODULES.rules.files) {
        const p = path.join(ROOT_DIR, file);
        if (fs.existsSync(p)) {
            rulesContent += `## Rules from ${file}\n\n${fs.readFileSync(p, 'utf8')}\n\n`;
        }
    }
    fs.writeFileSync(path.join(OUTPUT_DIR, MODULES.rules.file), rulesContent);

    console.log(`==> Đã tạo xong 5 module não bộ tại: ${OUTPUT_DIR}`);
}

ensureDirectoryExistence(path.join(OUTPUT_DIR, 'dummy.txt'));
generate();
