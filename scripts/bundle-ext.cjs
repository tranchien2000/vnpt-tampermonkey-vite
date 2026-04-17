const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const pkg = require('../package.json');

async function bundle() {
    const zipName = `vnpt-extension-v${pkg.version}.zip`;
    const releasesDir = path.join(__dirname, '../releases');
    if (!fs.existsSync(releasesDir)) fs.mkdirSync(releasesDir);

    const output = fs.createWriteStream(path.join(releasesDir, zipName));
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
        console.log(`✅ Created Extension Zip: releases/${zipName} (${archive.pointer()} bytes)`);
    });

    archive.pipe(output);
    archive.directory('dist/extension/', false);
    await archive.finalize();
}

bundle();
