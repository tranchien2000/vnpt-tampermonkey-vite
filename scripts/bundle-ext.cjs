const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const pkg = require('../package.json');

async function bundle() {
  const zipName = `vnpt-extension-v${pkg.version}.zip`;
  const outputDir = path.join(__dirname, '../releases');
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const output = fs.createWriteStream(path.join(outputDir, zipName));
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`\n✅ Đã đóng gói xong: releases/${zipName}`);
    console.log(`📊 Dung lượng: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  });

  archive.on('error', (err) => { throw err; });
  archive.pipe(output);

  // Thêm thư mục dist/extension vào file zip
  const extPath = path.join(__dirname, '../dist/extension');
  if (!fs.existsSync(extPath)) {
    console.error('❌ Thư mục dist/extension không tồn tại. Hãy chạy npm run build:ext trước!');
    process.exit(1);
  }

  archive.directory(extPath, false);
  await archive.finalize();
}

bundle();
