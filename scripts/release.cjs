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

function generateChangelog() {
    try {
        // Lấy tag gần nhất
        let lastTag;
        try {
            lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
        } catch (e) {
            // Nếu chưa có tag nào, lấy từ commit đầu tiên
            lastTag = execSync('git rev-list --max-parents=0 HEAD', { encoding: 'utf8' }).trim();
        }

        // Lấy commits từ tag gần nhất đến HEAD
        const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s" --no-merges`, { encoding: 'utf8' })
            .split('\n')
            .filter(line => line.trim() && !line.includes('[skip ci]'));

        if (commits.length === 0) {
            return null;
        }

        // Phân loại commits theo type
        const changelog = {
            feat: [],
            fix: [],
            refactor: [],
            chore: [],
            docs: [],
            style: [],
            other: []
        };

        commits.forEach(commit => {
            const match = commit.match(/^(\w+)(?:\([\w-]+\))?: (.+)$/);
            if (match) {
                const [, type, message] = match;
                if (changelog[type]) {
                    changelog[type].push(message);
                } else {
                    changelog.other.push(commit);
                }
            } else {
                changelog.other.push(commit);
            }
        });

        // Tạo summary
        let summary = [];
        if (changelog.feat.length > 0) summary.push(`${changelog.feat.length} tính năng mới`);
        if (changelog.fix.length > 0) summary.push(`${changelog.fix.length} lỗi đã sửa`);
        if (changelog.refactor.length > 0) summary.push(`${changelog.refactor.length} cải tiến`);

        return {
            summary: summary.join(', ') || 'Cập nhật',
            details: changelog,
            commits: commits
        };
    } catch (e) {
        console.log('Could not generate changelog:', e.message);
        return null;
    }
}

async function main() {

console.log('\n=== Pre-flight Check ===');

// 0. Sync với remote TRƯỚC KHI làm bất cứ thứ gì
console.log('Syncing with remote...');
try {
    // Fetch latest từ remote
    execSync('git fetch origin main', { stdio: 'inherit' });

    // Kiểm tra xem có diverge không
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

    if (localCommit !== remoteCommit) {
        console.log('⚠️  Local và remote đã diverge!');
        console.log('Pulling latest changes...');

        // Stash local changes nếu có
        const hasChanges = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
        if (hasChanges) {
            console.log('Stashing local changes...');
            execSync('git stash', { stdio: 'inherit' });
        }

        // Pull với merge
        execSync('git pull origin main --no-rebase --no-edit', { stdio: 'inherit' });

        // Pop stash nếu có
        if (hasChanges) {
            console.log('Restoring local changes...');
            try {
                execSync('git stash pop', { stdio: 'inherit' });
            } catch (e) {
                console.log('⚠️  Có conflict khi restore changes. Vui lòng resolve thủ công.');
                process.exit(1);
            }
        }

        console.log('✅ Synced with remote successfully!');
    } else {
        console.log('✅ Already up to date with remote.');
    }
} catch (e) {
    console.error('❌ Failed to sync with remote:', e.message);
    process.exit(1);
}

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

// 2.1. Cập nhật manifest.json cho extension
const manifestPath = path.join(__dirname, '../extension/public/manifest.json');
if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    console.log(`Updated manifest.json to: ${newVersion}`);
}

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

// 5. Tạo changelog tự động
console.log('\n=== Generating Changelog ===');
const changelog = generateChangelog();

let userMsg = process.argv[2];
let commitMsg;
let releaseNotes = '';

if (changelog) {
    console.log('\n📝 Các thay đổi từ lần release trước:');
    console.log(`   ${changelog.summary}`);
    console.log('\nChi tiết:');

    if (changelog.details.feat.length > 0) {
        console.log(`  ✨ Tính năng mới (${changelog.details.feat.length}):`);
        changelog.details.feat.forEach(msg => console.log(`     - ${msg}`));
    }
    if (changelog.details.fix.length > 0) {
        console.log(`  🐛 Sửa lỗi (${changelog.details.fix.length}):`);
        changelog.details.fix.forEach(msg => console.log(`     - ${msg}`));
    }
    if (changelog.details.refactor.length > 0) {
        console.log(`  ♻️  Cải tiến (${changelog.details.refactor.length}):`);
        changelog.details.refactor.forEach(msg => console.log(`     - ${msg}`));
    }
    if (changelog.details.chore.length > 0) {
        console.log(`  🔧 Bảo trì (${changelog.details.chore.length}):`);
        changelog.details.chore.forEach(msg => console.log(`     - ${msg}`));
    }
    if (changelog.details.docs.length > 0) {
        console.log(`  📚 Tài liệu (${changelog.details.docs.length}):`);
        changelog.details.docs.forEach(msg => console.log(`     - ${msg}`));
    }

    // Tạo release notes cho GitHub
    releaseNotes = '## 📝 Changelog\n\n';
    if (changelog.details.feat.length > 0) {
        releaseNotes += '### ✨ Tính năng mới\n';
        changelog.details.feat.forEach(msg => releaseNotes += `- ${msg}\n`);
        releaseNotes += '\n';
    }
    if (changelog.details.fix.length > 0) {
        releaseNotes += '### 🐛 Sửa lỗi\n';
        changelog.details.fix.forEach(msg => releaseNotes += `- ${msg}\n`);
        releaseNotes += '\n';
    }
    if (changelog.details.refactor.length > 0) {
        releaseNotes += '### ♻️ Cải tiến\n';
        changelog.details.refactor.forEach(msg => releaseNotes += `- ${msg}\n`);
        releaseNotes += '\n';
    }

    // Đề xuất message
    if (!userMsg) {
        console.log(`\n💡 Đề xuất: "${changelog.summary}"`);
        userMsg = await askQuestion(`\nNhập mô tả release v${newVersion} (Enter để dùng đề xuất): `);
        if (!userMsg) {
            userMsg = changelog.summary;
        }
    }
} else {
    if (!userMsg) {
        userMsg = await askQuestion(`\nNhập mô tả release v${newVersion}: `);
    }
}

if (!userMsg) {
    userMsg = 'Cập nhật tính năng mới';
}

commitMsg = `v${newVersion} - ${userMsg}`;

// Lưu release notes vào file tạm
if (releaseNotes) {
    const releaseNotesPath = path.join(__dirname, '../.release-notes.md');
    fs.writeFileSync(releaseNotesPath, releaseNotes);
    console.log(`\n✅ Release notes saved to .release-notes.md`);
}

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
console.log('Final sync before push...');
try {
    execSync('git fetch origin main', { stdio: 'inherit' });
    const localCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const remoteCommit = execSync('git rev-parse origin/main', { encoding: 'utf8' }).trim();

    if (localCommit !== remoteCommit) {
        console.log('⚠️  Remote has new commits, pulling...');
        execSync('git pull origin main --no-rebase --no-edit', { stdio: 'inherit' });
    } else {
        console.log('✅ Already up to date with remote.');
    }
} catch (e) {
    console.log('⚠️  Pull failed, will retry after push fails...');
}

// Push với retry logic
console.log('Pushing to remote...');
let pushSuccess = false;
let retries = 3;

while (!pushSuccess && retries > 0) {
    try {
        execSync('git push origin main', { stdio: 'inherit' });
        pushSuccess = true;
        console.log('✅ Push successful!');
    } catch (e) {
        retries--;
        if (retries > 0) {
            console.log(`⚠️  Push failed, retrying... (${retries} attempts left)`);
            console.log('Syncing with remote...');
            try {
                execSync('git pull origin main --no-rebase --no-edit', { stdio: 'inherit' });
            } catch (pullError) {
                console.error('❌ Pull failed:', pullError.message);
                console.log('Please resolve conflicts manually and run: git push origin main');
                process.exit(1);
            }
        } else {
            console.error('❌ Push failed after 3 attempts');
            console.log('Please check your network and try: git push origin main');
            process.exit(1);
        }
    }
}

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
