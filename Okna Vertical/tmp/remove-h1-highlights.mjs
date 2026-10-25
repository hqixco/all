import fs from 'node:fs';
let s=fs.readFileSync('src/seo.css','utf8').replace('.apartment-hero h1 span { color: #ff505d; }','.apartment-hero h1 span { color: inherit; }');fs.writeFileSync('src/seo.css',s);
s=fs.readFileSync('src/style.css','utf8').replace('.home-page h1 span {\n  color: #e30613;\n}', '.home-page h1 span {\n  color: inherit;\n}');s=s.replace(/(html\.page-balcony \.home-hero__copy h1 > span \{[^}]*?)color: #ff4149;/,'$1color: inherit;');fs.writeFileSync('src/style.css',s);
