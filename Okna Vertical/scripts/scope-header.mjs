import fs from 'node:fs';
const file='src/style.css';
let css=fs.readFileSync(file,'utf8');
css=css.replaceAll('body > .site-header','body.home-site > .site-header');
css=css.replace('.nav-dropdown {\n  position: relative;\n  color: #fff;', '.nav-dropdown {\n  position: relative;\n  color: #111;');
// Match CRLF as well without altering the rest of the existing stylesheet.
css=css.replace(/(\.nav-dropdown \{\r?\n  position: relative;\r?\n  color:) #fff;/,'$1 #111;');
css=css.replace(/(\.nav-dropdown__toggle \{[\s\S]*?color:) #fff;/,'$1 #111;');
css+='\nbody.home-site > .site-header .nav-dropdown__toggle { color: #fff; }\n';
fs.writeFileSync(file,css);
