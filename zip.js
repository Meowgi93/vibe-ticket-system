const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, '../Vibe_Phase3_Latest.zip'));
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
  console.log('Archive created successfully! Total bytes: ' + archive.pointer());
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Exclude node_modules and .git
archive.glob('**/*', {
  cwd: __dirname,
  ignore: ['node_modules/**', 'server/node_modules/**', '.git/**', '.vscode/**']
});

archive.finalize();
