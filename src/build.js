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
        // console.log(filePath);
        // console.log(date);
        let dateHtml = `<h4 class="article-date">${date}</h4>`;
        // console.log(dateHtml);
        html = html.replace(/<\/h1>/, `<\h1>${dateHtml}`);
        console.log("Date:",date,": ",html);
        articles.push({ date: date.split('-'), content: `<div>${html}</div>` });
    }
});

// Sort articles in descending order of date
articles.sort((a, b) => b.date.join('') - a.date.join(''));

// copy the folder src/site-skeleton to public
function copyDir(src, dest) {
    // delete the old public folder if it exists
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true });
    }
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
copyDir('src/site-skeleton', 'public');

// Insert articles into index.html
let indexHtml = fs.readFileSync('public/index.html', 'utf8');
let articlesHtml = articles.map(article => article.content).join('\n');
indexHtml = indexHtml.replace('<!-- placeholder -->', articlesHtml);
fs.writeFileSync('public/index.html', indexHtml);