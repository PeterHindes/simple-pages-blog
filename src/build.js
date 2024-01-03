const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const converter = new showdown.Converter();

let articles = [];


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
        // let date = path.dirname(filePath).split(path.sep).slice(-3).join('-'); // extract date from file path
        dateParts = filePath.split(path.sep).slice();
        let year = dateParts[1];
        let month = dateParts[2];
        let day = dateParts[3].split('.')[0];
        let date = `${day}-${month}-${year}`;
        let dateHtml = `<h4 class="article-date">${date}</h4>`;
        html = html.replace(/<\/h1>/, `</h1>${dateHtml}`);
        html = html.replace(/<img src="(.*)" .*>/g, '<div class="img-wrap"><img src="$1" class="article-img" $2></div>');
        articles.push({ date: date.split('-'), content: `<div class="article">${html}</div>` });
    }
});

// Sort articles in ascending order of date
articles.sort((a, b) => a.date.join('') - b.date.join(''));
// add the id of "latest" to the last div in the list
articles[articles.length - 1].content = articles[articles.length - 1].content.replace("<div class=\"article\">", "<div class=\"article\" id=\"latest\">");

// copy the folder src/site-skeleton to public
function copyDir(src, dest) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(file => {
        let srcPath = path.join(src, file);
        let destPath = path.join(dest, file);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}
// copyDir('src/site-skeleton', 'public');
if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true });
}
fs.mkdirSync('public');
// just copy index.html
fs.copyFileSync('src/site-skeleton/index.html', 'public/index.html');
// copy svg
fs.copyFileSync('src/site-skeleton/forkme_right_darkblue_121621.svg', 'public/forkme_right_darkblue_121621.svg');
fs.copyFileSync('src/site-skeleton/favicon.ico', 'public/favicon.ico');
copyDir('img', 'public/img')
copyDir('src/site-skeleton/fonts', 'public/fonts');

// Insert articles into index.html
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
let articlesHtml = articles.map(article => article.content).join('\n');
// indexHtml = indexHtml.replace(/\n/g, '').replace(/ +/g, ' ');
indexHtml = indexHtml.replace('<!-- placeholder -->', articlesHtml);
indexHtml = indexHtml.replace('/*insert style*/', fs.readFileSync('src/site-skeleton/style.css', 'utf8'))
    // .replace(/\n/g, '').replace(/ +/g, ' ')
    ;
fs.writeFileSync('public/index.html', indexHtml);