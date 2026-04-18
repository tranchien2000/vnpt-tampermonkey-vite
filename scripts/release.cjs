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
const releasesDir = path.join(rootDir, 'releases');

// Đọc package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;

// 1. Xác định version mới (Patch: 1.7.0 -> 1.7.1)
const versions = pkg.version.split('.').map(Number);
versions[2] += 1; 
const newVersion = versions.join('.');

// Cập nhật package.json
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Cập nhật version.json
if (fs.existsSync(verJsonPath)) {
    const verJson = JSON.parse(fs.readFileSync(verJsonPath, 'utf8'));
    verJson.version = newVersion;
    verJson.latestVersion = newVersion;
    verJson.updateTime = new Date().toISOString();
    fs.writeFileSync(verJsonPath, JSON.stringify(verJson, null, 2));
    console.log(`✅ Updated version.json to v${newVersion}`);
}

console.log(`✅ Bumped version: ${oldVersion} -> ${newVersion}`);

// 2. Build code
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
run(`${npmCmd} run build`);
run(`${npmCmd} run build:ext`);

// 3. Sao lưu bản build vào thư mục releases
if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir);
const currentReleaseDir = path.join(releasesDir, `v${newVersion}`);
if (!fs.existsSync(currentReleaseDir)) fs.mkdirSync(currentReleaseDir);

// Đóng gói extension
run(`node scripts/bundle-ext.cjs`);

try {
    // Copy Userscript
    const buildFile = fs.readdirSync(path.join(rootDir, 'dist')).find(f => f.endsWith('.user.js'));
    if (buildFile) {
        fs.copyFileSync(path.join(rootDir, 'dist', buildFile), path.join(currentReleaseDir, buildFile));
    }

    // Copy Extension Zip
    const zipFile = `vnpt-extension-v${newVersion}.zip`;
    if (fs.existsSync(path.join(releasesDir, zipFile))) {
        fs.copyFileSync(path.join(releasesDir, zipFile), path.join(currentReleaseDir, zipFile));
        console.log(`📂 Saved Extension Zip to: releases/v${newVersion}/${zipFile}`);
    }
} catch (e) {
    console.warn('⚠️ Không thể copy file build vào thư mục releases.', e);
}

// 4. Git actions
let userMsg = process.argv[2];

// Nếu không nhập tin nhắn, tự động generate từ lịch sử commit
if (!userMsg) {
    try {
        console.log('> Đang tự động tạo nội dung thay đổi từ Git...');
        const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        const gitLog = execSync(`git log ${lastTag}..HEAD --oneline --pretty=format:"- %s"`, { encoding: 'utf8' }).trim();
        
        if (gitLog) {
            userMsg = gitLog.split('\n')
                .filter(line => !line.toLowerCase().includes('release') && !line.toLowerCase().includes('chore:'))
                .join('; ');
            if (!userMsg) userMsg = "Cập nhật định kỳ và tối ưu hóa hệ thống.";
        } else {
            userMsg = "Bản phát hành định kỳ.";
        }
    } catch (e) {
        userMsg = "Bản phát hành mới.";
    }
}

const commitMsg = `chore: release v${newVersion} - ${userMsg}`;

// Trước khi commit, hãy đồng bộ tag và code từ origin để tránh bị rejected
console.log('> Đang đồng bộ tag từ GitHub...');
try { execSync('git fetch --tags', { stdio: 'ignore' }); } catch(e) {}

run('git add .');
run(`git commit -m "${commitMsg}"`);

// Ghi đè tag local và push cưỡng chế tag lên origin
console.log(`> Đang tạo và đẩy tag v${newVersion}...`);
run(`git tag -f v${newVersion}`);
run(`git push origin v${newVersion} -f`);

console.log(`\n🚀 Đang đẩy code lên GitHub...`);
try {
    run('git push origin main');
} catch (pushError) {
    console.log('⚠️  Bị từ chối Push. Đang thử pull --rebase và push lại...');
    run('git pull origin main --rebase');
    run('git push origin main');
}

console.log(`\n🎉 HOÀN TẤT RELEASE v${newVersion}!`);
