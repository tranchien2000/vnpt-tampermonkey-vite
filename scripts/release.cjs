const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Script tự động hóa quy trình Release:
 * 1. Tăng version trong package.json
 * 2. Build code mới nhất
 * 3. Commit và Push lên GitHub
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

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// 1. Tăng version (Patch: 1.6.0 -> 1.6.1)
const versions = pkg.version.split('.').map(Number);
versions[2] += 1; // Tăng số cuối
const newVersion = versions.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`✅ Bumped version to: ${newVersion}`);

// 2. Build code
run('npm run build');

// 3. Commit message (Lấy từ tham số hoặc mặc định)
const userMsg = process.argv[2] || "Cập nhật tính năng mới";
const commitMsg = `release: v${newVersion} - ${userMsg}`;

// 4. Git actions
run('git add .');
run(`git commit -m "${commitMsg}"`);
run('git push');

console.log(`\n🎉 Đã hoàn tất Release v${newVersion}!`);
console.log(`🚀 Hệ thống thông báo cập nhật sẽ sớm hiển thị trên máy user.`);
