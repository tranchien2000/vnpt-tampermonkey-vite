/**
 * generate_graph.cjs
 * Tự động quét mã nguồn và tạo sơ đồ phụ thuộc (Dependency Graph) dạng Mermaid Markdown.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '..', 'src');
const OUTPUT_FILE = path.join(__dirname, '..', 'ARCHITECTURE_GRAPH.md');

// Các thư mục cần quét
const DIRS = ['core', 'api', 'features', 'ui', 'utils'];

function getImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        if (importPath.startsWith('.')) {
            const absoluteImport = path.resolve(path.dirname(filePath), importPath);
            const relativeToSrc = path.relative(SRC_DIR, absoluteImport).replace(/\\/g, '/');
            imports.push(relativeToSrc);
        }
    }
    return imports;
}

function scanDir(dir, graph) {
    const fullPath = path.join(SRC_DIR, dir);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath, { recursive: true });
    files.forEach(file => {
        if (file.endsWith('.js')) {
            const relativePath = path.join(dir, file).replace(/\\/g, '/');
            const fullFilePath = path.join(SRC_DIR, relativePath);
            if (fs.statSync(fullFilePath).isFile()) {
                const imports = getImports(fullFilePath);
                graph[relativePath] = imports;
            }
        }
    });
}

function resolveImport(currentFile, importPath, nodes) {
    // 1. Thử đường dẫn chính xác
    if (nodes.includes(importPath)) return importPath;
    
    // 2. Thử thêm .js
    if (nodes.includes(importPath + '.js')) return importPath + '.js';
    
    // 3. Thử thêm /index.js (cho folder import)
    if (nodes.includes(importPath + '/index.js')) return importPath + '/index.js';

    return null;
}

function generate() {
    console.log('--- Đang tạo Đồ thị kiến trúc dự án ---');
    
    // Dọn dẹp folder graphify-out nếu có (nếu bạn dùng tool khác)
    const extraCache = path.join(__dirname, '..', 'graphify-out');
    if (fs.existsSync(extraCache)) {
        fs.rmSync(extraCache, { recursive: true, force: true });
    }

    const graph = {};
    DIRS.forEach(dir => scanDir(dir, graph));

    let mermaid = '```mermaid\nflowchart TD\n';
    
    // Định nghĩa các Style Class cho từng Layer
    mermaid += '    classDef core fill:#f9f,stroke:#333,stroke-width:2px;\n';
    mermaid += '    classDef api fill:#bbf,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef ui fill:#bfb,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef feature fill:#fbb,stroke:#333,stroke-width:1px;\n';
    mermaid += '    classDef util fill:#eee,stroke:#333,stroke-width:1px,stroke-dasharray: 5 5;\n\n';

    const nodes = Object.keys(graph);
    
    // Tạo Node
    nodes.forEach(node => {
        const id = node.replace(/[\/\.-]/g, '_').replace(/^_/, '');
        const label = node.split('/').pop();
        let style = '';
        if (node.startsWith('core/')) style = ':::core';
        else if (node.startsWith('api/')) style = ':::api';
        else if (node.startsWith('ui/')) style = ':::ui';
        else if (node.startsWith('features/')) style = ':::feature';
        else if (node.startsWith('utils/')) style = ':::util';
        
        mermaid += `    ${id}["${label}"]${style}\n`;
    });

    mermaid += '\n';

    // Tạo liên kết
    nodes.forEach(node => {
        const fromId = node.replace(/[\/\.-]/g, '_').replace(/^_/, '');
        const imports = graph[node];
        imports.forEach(imp => {
            const resolvedTarget = resolveImport(node, imp, nodes);
            if (resolvedTarget) {
                const toId = resolvedTarget.replace(/[\/\.-]/g, '_').replace(/^_/, '');
                if (fromId !== toId) {
                    mermaid += `    ${fromId} --> ${toId}\n`;
                }
            }
        });
    });

    mermaid += '```';

    const output = `# Architecture Graph\n\nSơ đồ này được tạo tự động bởi \`scripts/generate_graph.cjs\`. Giúp theo dõi các mối quan hệ phụ thuộc giữa các module trong dự án.\n\n${mermaid}\n`;
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`==> Đã tạo xong đồ thị tại: ${OUTPUT_FILE}`);
}

generate();
