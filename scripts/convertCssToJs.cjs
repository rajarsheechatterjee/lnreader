const fs = require('fs');
const path = require('path');

const cssFilePath = path.resolve(
  __dirname + '/../android/app/src/main/assets/css/',
  'index.css',
);
const jsFilePath = path.resolve(
  __dirname + '/../android/app/src/main/assets/css/',
  'index.js',
);

fs.readFile(cssFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading CSS file:', err);
    return;
  }

  const jsContent = `export default \`\n${data}\n\`;`;

  fs.writeFile(jsFilePath, jsContent, 'utf8', err => {
    if (err) {
      console.error('Error writing JS file:', err);
      return;
    }

    console.info('CSS file successfully converted to JS module.');
  });
});
