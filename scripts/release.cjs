const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script tự động hóa quy trình Release Nâng cấp lên 1.7.0
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
const releasesDir = path.join(rootDir, 'releases');

// Đọc package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;

// 1. Xác định version mới
const newVersion = "1.7.0";

// Cập nhật package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Cập nhật version.json
if (fs.existsSync(verJsonPath)) {
    const verJson = JSON.parse(fs.readFileSync(verJsonPath, 'utf8'));
    verJson.version = newVersion;
    verJson.latestVersion = newVersion;
    verJson.updateTime = new Date().toISOString();
    verJson.message = process.argv[2] || "Bản cập nhật lớn 1.7: Tối ưu hiệu năng và giao diện.";
    fs.writeFileSync(verJsonPath, JSON.stringify(verJson, null, 2));
}

console.log(`✅ Bumped version: ${oldVersion} -> ${newVersion}`);

// 2. Build code
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
run(`${npmCmd} run build`);
run(`${npmCmd} run build:ext`);

// 3. Sao lưu bản build
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir);
const currentReleaseDir = path.join(releasesDir, `v${newVersion}`);
if (!fs.existsSync(currentReleaseDir)) fs.mkdirSync(currentReleaseDir);

run(`node scripts/bundle-ext.cjs`);

try {
    const buildFile = fs.readdirSync(path.join(rootDir, 'dist')).find(f => f.endsWith('.user.js'));
    if (buildFile) {
        fs.copyFileSync(path.join(rootDir, 'dist', buildFile), path.join(currentReleaseDir, buildFile));
    }
    const zipFile = `vnpt-extension-v${newVersion}.zip`;
    if (fs.existsSync(path.join(releasesDir, zipFile))) {
        fs.copyFileSync(path.join(releasesDir, zipFile), path.join(currentReleaseDir, zipFile));
    }
} catch (e) {}

// 4. Git actions
let userMsg = process.argv[2] || "Major Release 1.7.0";
const commitMsg = `chore: release v${newVersion} - ${userMsg}`;

run('git add .');
try {
    run(`git commit -m "${commitMsg}"`);
} catch (e) {
    console.log("No changes to commit.");
}

console.log(`> Đang tạo và đẩy tag v${newVersion}...`);
run(`git tag -f v${newVersion}`);
run(`git push origin v${newVersion} -f`);

console.log(`\n🚀 Đang đẩy code lên GitHub...`);
try {
    run('git push origin main');
} catch (e) {
    run('git pull origin main --rebase');
    run('git push origin main');
}

console.log(`\n🎉 HOÀN TẤT RELEASE v${newVersion}!`);
