const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script tự động hóa quy trình Release Nâng cấp:
 * 1. Tăng version trong package.json & version.json
 * 2. Build code mới nhất bằng Vite
 * 3. Lưu trữ bản build vào thư mục releases/vX.X.X
 * 4. Commit, Tag và Push lên GitHub
 */

function run(command) {
    console.log(`> Running: ${command}`);
    try {
        return execSync(command, { stdio: 'inherit' });
    } catch (e) {
        console.error(`Failed to run command: ${command}`);
        process.exit(1);
    }
}

// Đường dẫn các file
const rootDir = path.join(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const verJsonPath = path.join(rootDir, 'version.json');
const distPath = path.join(rootDir, 'dist/myscript.user.js'); // Chỉnh lại theo tên file build thực tế của bạn
const releasesDir = path.join(rootDir, 'releases');

// Đọc package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;

// 1. Xác định version mới (Patch: 1.6.0 -> 1.6.1)
const versions = pkg.version.split('.').map(Number);
versions[2] += 1; 
const newVersion = versions.join('.');

// Cập nhật package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Cập nhật version.json (Nếu tồn tại)
if (fs.existsSync(verJsonPath)) {
    const verJson = JSON.parse(fs.readFileSync(verJsonPath, 'utf8'));
    verJson.version = newVersion;
    verJson.latestVersion = newVersion;
    verJson.updateTime = new Date().toISOString();
    fs.writeFileSync(verJsonPath, JSON.stringify(verJson, null, 2));
    console.log(`✅ Updated version.json to v${newVersion}`);
}

console.log(`✅ Bumped version: ${oldVersion} -> ${newVersion}`);

// 1.5 Tạo tài liệu bộ não dự án cho NotebookLM
console.log(`🧠 Đang cập nhật bộ não dự án...`);
run(`node scripts/generate_brain.cjs`);

// 2. Build code
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
run(`${npmCmd} run build`);

// 3. Sao lưu bản build vào thư mục releases
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir);
const currentReleaseDir = path.join(releasesDir, `v${newVersion}`);
if (!fs.existsSync(currentReleaseDir)) fs.mkdirSync(currentReleaseDir);

try {
    const buildFile = fs.readdirSync(path.join(rootDir, 'dist')).find(f => f.endsWith('.user.js'));
    if (buildFile) {
        fs.copyFileSync(
            path.join(rootDir, 'dist', buildFile),
            path.join(currentReleaseDir, buildFile)
        );
        console.log(`📂 Saved build artifact to: releases/v${newVersion}/${buildFile}`);
    }
} catch (e) {
    console.warn('⚠️ Không thể copy file build vào thư mục releases.');
}

// 4. Git actions
let userMsg = process.argv[2];

if (!userMsg) {
    try {
        // Lấy tên các file src thay đổi (không tính dist và các file meta)
        const diffOutput = execSync('git diff --name-only HEAD~1').toString().trim();
        const diffFiles = diffOutput.split('\n').filter(f => f.startsWith('src/'));
        
        if (diffFiles.length > 0) {
            const files = diffFiles.map(f => path.basename(f)).join(', ');
            userMsg = `Cập nhật: ${files}`;
        } else {
            userMsg = "Phát hành phiên bản mới";
        }
    } catch (e) {
        userMsg = "Cập nhật tính năng mới";
    }
}

const commitMsg = `chore: release v${newVersion} - ${userMsg}`;

run('git add .');
run(`git commit -m "${commitMsg}"`);
run(`git tag -f v${newVersion} -m "${userMsg}"`); // Thêm -f (force) để ghi đè tag nếu trùng

console.log(`\n🚀 Đang đẩy code và tag lên GitHub...`);
// Cố gắng fetch và rebase trước khi push
try {
    console.log(`> Đang đồng bộ với GitHub (git pull --rebase)...`);
    execSync('git pull origin main --rebase', { stdio: 'inherit' });
} catch (e) {
    console.log('⚠️ Phát hiện xung đột hoặc lỗi đồng bộ. Đang thử giải quyết...');
    try {
        // Ưu tiên bản local cho các file config quan trọng
        execSync('git checkout --ours package.json version.json dist/*', { stdio: 'inherit' });
        execSync('git add .', { stdio: 'inherit' });
        process.env.GIT_EDITOR = 'true';
        execSync('git rebase --continue', { stdio: 'inherit' });
    } catch (rebaseError) {
        console.error('❌ Không thể tự động rebase. Vui lòng chạy "git pull origin main --rebase" thủ công.');
    }
}

// Push code và tags
try {
    run('git push origin main --follow-tags');
} catch (pushError) {
    console.log('⚠️ Push bị từ chối. Đang thử ép buộc (Force Push) để đồng bộ...');
    run('git push origin main --force --follow-tags');
}

console.log(`\n🎉 HOÀN TẤT RELEASE v${newVersion}!`);
console.log(`----------------------------------------`);
console.log(`1. Code đã được build và lưu trữ.`);
console.log(`2. Version đã tăng lên ${newVersion}.`);
console.log(`3. Git Tag v${newVersion} đã được tạo.`);
console.log(`4. Thông báo cập nhật đã được gửi tới người dùng.`);
