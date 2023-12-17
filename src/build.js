const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const converter = new showdown.Converter();

function traverseDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, callback);
        } else {
            callback(fullPath);
        }
    });
}

traverseDir('articles', (filePath) => {
    if (path.extname(filePath) === '.md') {
        let text = fs.readFileSync(filePath, 'utf8');
        let html = converter.makeHtml(text);
        let newFilePath = path.join('public', filePath.slice(0, -3) + '.html');
        fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
        fs.writeFileSync(newFilePath, html);
    }
});