const fs = require('fs');
const path = require('path');
const showdown  = require('showdown');
const converter = new showdown.Converter();

let trips = {};

function traverseDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        callback(fullPath);
        if (fs.lstatSync(fullPath).isDirectory()) {
            traverseDir(fullPath, callback);
        }
    });
}

traverseDir('articles', (filePath) => {
    if (path.extname(filePath) === '.md') {
        let text = fs.readFileSync(filePath, 'utf8');
        let html = converter.makeHtml(text);
        dateParts = filePath.split(path.sep).slice();
        let trip = dateParts[1];
        let year = dateParts[2];
        let month = dateParts[3];
        let day = dateParts[4].split('.')[0];
        let date = `${day}-${month}-${year}`;
        let dateHtml = `<h4 class="article-date">${date}</h4>`;
        html = html.replace(/<\/h1>/, `</h1>${dateHtml}`);
        html = html.replace(/<img src="(.*)" .*>/g, '<div class="img-wrap"><img src="$1" class="article-img" $2></div>');
        trips[trip].push({date: date.split('-'), content: `<div class="article">${html}</div>` });
    } else if (path.dirname(filePath) === 'articles') {
        let trip = path.basename(filePath);
        trips[trip] = [];
    }
});

Object.entries(trips).forEach(([trip, articles]) => {
    // Sort articles in ascending order of date
    articles.sort((a, b) => {
        let dateA = new Date(a.date[2], a.date[1] - 1, a.date[0]); // -1 because months are 0-indexed
        let dateB = new Date(b.date[2], b.date[1] - 1, b.date[0]);
        return dateA - dateB;
    });
    // add the id of "latest" to the last div in the list
    articles[articles.length - 1].content = articles[articles.length - 1].content.replace("<div class=\"article\">", "<div class=\"article\" id=\"latest\">");
});

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

if (fs.existsSync('public')) {
    fs.rmSync('public', { recursive: true });
}
fs.mkdirSync('public');
// just copy index.html
fs.copyFileSync('src/site-skeleton/index.html', 'public/index.html');
// copy svg
fs.copyFileSync('src/site-skeleton/forkme_right_darkblue_121621.svg', 'public/forkme_right_darkblue_121621.svg');
fs.copyFileSync('src/site-skeleton/favicon.ico', 'public/favicon.ico');
fs.copyFileSync('src/site-skeleton/robots.txt', 'public/robots.txt');
copyDir('img', 'public/img')
copyDir('src/site-skeleton/fonts', 'public/fonts');

// Insert articles into index.html
let articlesHtml = "";
articlesHtml += '<div id="tabsContainer">';
Object.entries(trips).forEach(([trip, articles]) => {
    articlesHtml += `<label for="${trip}" class="tabHeader">${trip} Trip</label>`
});
articlesHtml += '</div>\n<div id="articlesContainer">\n';
Object.entries(trips).forEach(([trip, articles]) => {
    articlesHtml += `<input type="radio" id="${trip}" name="tab" />\n<div class="articles ${trip}">`;
    articlesHtml += articles.map(article => article.content).join('\n');
    articlesHtml += "</div>";
});
articlesHtml += "</div>";

let indexHtml = fs.readFileSync('public/index.html', 'utf8');
indexHtml = indexHtml.replace('<!-- placeholder -->', articlesHtml);
indexHtml = indexHtml.replace('<link rel="stylesheet" href="style.css" />', "<style>"+ fs.readFileSync('src/site-skeleton/style.css', 'utf8') + "</style>")
    // .replace(/\n/g, '').replace(/ +/g, ' ')
    ;
fs.writeFileSync('public/index.html', indexHtml);
