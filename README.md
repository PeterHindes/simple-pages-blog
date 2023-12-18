# Your Personal Text Blog Awaits!
## How to start
Simply clone this repository, change the name in `src/site-skeleton/index.html`, then delete the entries in the articles folder and start writing your own articles. The structure for the articles folder is as follows: `YYYY/MM/DD.md`.
### A note on articles formating
The Articles should only have one primary header (that is `#` which compiles to `h1`) and you can have a single layer of subheaders (that is `##` which compiles to `h2`), because the css file only has formating for those two types of headers. Feel free to modify it for your needs though.
## How to publish
Before publishing you need to install the npm packages by running ```npm install```.
To publish simply run ```npm run build``` to generate the public folder which is a basic html site you can host using any http server.
To make the process a little more *ergonomic* you can use cloudflare pages and link it to your github account which will automatically build and deploy your site whenever you push to the main branch, which is what I use.

## Attributions:
```
https://github.com/usecue/fork-me-on-github-svg-ribbons/raw/master/images/forkme_right_darkblue_121621.svg
https://fonts.google.com/specimen/Cairo
https://fonts.google.com/specimen/Preahvihear
https://fonts.google.com/specimen/Rubik+Doodle+Shadow
```