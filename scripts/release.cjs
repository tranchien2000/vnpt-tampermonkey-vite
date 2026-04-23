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

// 2. Cập nhật version.json
const versionJsonPath = path.join(__dirname, '../version.json');
const versionJson = JSON.parse(fs.readFileSync(versionJsonPath, 'utf8'));
versionJson.version = newVersion;
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2));
console.log(`Updated version.json to: ${newVersion}`);

// 3. Build code
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
run(`${npmCmd} run build`);

// 4. Cập nhật @version trong dist/myscript.user.js
const userScriptPath = path.join(__dirname, '../dist/myscript.user.js');
if (fs.existsSync(userScriptPath)) {
    let userScriptContent = fs.readFileSync(userScriptPath, 'utf8');
    userScriptContent = userScriptContent.replace(
        /@version\s+[\d.]+/,
        `@version      ${newVersion}`
    );
    fs.writeFileSync(userScriptPath, userScriptContent);
    console.log(`Updated @version in myscript.user.js to: ${newVersion}`);
}

// 5. Commit message - hỏi nếu không truyền argument
let userMsg = process.argv[2];
if (!userMsg) {
    userMsg = await askQuestion(`\nNhap mo ta release v${newVersion}: `);
}
if (!userMsg) {
    userMsg = 'Cap nhat tinh nang moi';
}
const commitMsg = `v${newVersion} - ${userMsg}`;

// 6. Cập nhật message trong version.json
versionJson.message = commitMsg;
fs.writeFileSync(versionJsonPath, JSON.stringify(versionJson, null, 2));
console.log(`Updated version.json message: ${commitMsg}`);

// 7. Git actions
console.log('\n=== Git Operations ===');

// Kiểm tra xem có thay đổi chưa commit không
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (!status.trim()) {
        console.log('No changes to commit. Exiting...');
        process.exit(0);
    }
} catch (e) {
    console.error('Failed to check git status');
    process.exit(1);
}

run('git add .');
run(`git commit -m "${commitMsg}"`);

// Pull với merge strategy để tránh rebase conflict
console.log('Syncing with remote...');
try {
    execSync('git fetch origin main', { stdio: 'inherit' });
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

    if (localCommit !== remoteCommit) {
        console.log('Remote has new commits, pulling...');
        execSync('git pull origin main --no-rebase --no-edit', { stdio: 'inherit' });
    } else {
        console.log('Already up to date with remote.');
    }
} catch (e) {
    console.log('Pull failed or no remote updates, continuing...');
}

run('git push origin main');

// 8. Tạo tag và push tag lên GitHub
run(`git tag -a v${newVersion} -m "Release v${newVersion} - ${userMsg}"`);
run('git push --tags');

console.log(`\nDa hoan tat Release v${newVersion}!`);
console.log(`He thong thong bao cap nhat se som hien thi tren may user.`);

} // end main

main().catch(err => {
    console.error('Release failed:', err);
    process.exit(1);
});
