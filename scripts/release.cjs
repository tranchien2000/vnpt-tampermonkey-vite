const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

/**
 * Script tự động hóa quy trình Release:
 * 1. Tăng version trong package.json
 * 2. Build code mới nhất
 * 3. Commit và Push lên GitHub
 *
 * Cách dùng:
 *   npm run release                         -> Hỏi message
 *   npm run release -- "Sửa lỗi XYZ"       -> Dùng message truyền vào
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

function askQuestion(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function main() {

const pkgPath = path.join(__dirname, '../package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

// 1. Tăng version (Patch: 1.6.0 -> 1.6.1)
const versions = pkg.version.split('.').map(Number);
versions[2] += 1; // Tăng số cuối
const newVersion = versions.join('.');
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
console.log(`Bumped version to: ${newVersion}`);

// 2. Build code
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
run(`${npmCmd} run build`);

// 3. Commit message - hỏi nếu không truyền argument
let userMsg = process.argv[2];
if (!userMsg) {
    userMsg = await askQuestion(`\nNhap mo ta release v${newVersion}: `);
}
if (!userMsg) {
    userMsg = 'Cap nhat tinh nang moi';
}
const commitMsg = `v${newVersion} - ${userMsg}`;

// 4. Git actions
run('git add .');
run(`git commit -m "${commitMsg}"`);
// Pull rebase trước để tránh lỗi non-fast-forward (do GitHub Action tạo commit trên remote)
run('git pull --rebase origin main');
run('git push');

// 5. Tạo tag và push tag lên GitHub
run(`git tag -a v${newVersion} -m "Release v${newVersion} - ${userMsg}"`);
run('git push --tags');

console.log(`\nDa hoan tat Release v${newVersion}!`);
console.log(`He thong thong bao cap nhat se som hien thi tren may user.`);

} // end main

main().catch(err => {
    console.error('Release failed:', err);
    process.exit(1);
});
