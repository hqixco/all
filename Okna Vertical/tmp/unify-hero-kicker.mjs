import fs from 'node:fs';
for(const file of ['index.html','balkony/index.html']){let s=fs.readFileSync(file,'utf8');s=s.replace(/<p class="home-kicker">([^<]+)<\/p>/,'<p class="hero-kicker">$1</p>');fs.writeFileSync(file,s)}
let s=fs.readFileSync('scripts/generate-seo.mjs','utf8').replace('class="apartment-hero__kicker"','class="apartment-hero__kicker hero-kicker"').replace('<p class="home-kicker">РЫБИНСК','<p class="hero-kicker">РЫБИНСК');fs.writeFileSync('scripts/generate-seo.mjs',s);
s=fs.readFileSync('src/seo.css','utf8').replace(/^\.seo-page \.apartment-hero__kicker[^\n]*\n/m,'').replace(/^\.seo-hero--dark \.home-kicker[^\n]*\n/m,'').replaceAll('.seo-page p, .seo-page li', '.seo-page p:not(.hero-kicker), .seo-page li');fs.writeFileSync('src/seo.css',s);
s=fs.readFileSync('src/style.css','utf8');
s=s.replace(/^[ \t]*(?:\.home-page )?\.home-hero__copy \.home-kicker \{[^}]*\}\s*\n/gm,'').replace(/^[ \t]*html\.page-balcony \.home-hero__copy \.home-kicker \{[^}]*\}\s*\n/gm,'').replace(' .home-page .home-hero__copy .home-kicker,','');
s += `\n.hero-kicker { display: inline-block; margin: 0 0 16px; padding: 0 0 11px; border: 0; border-bottom: 2px solid #fff; border-radius: 0; color: #fff; font-size: 13px; font-weight: 600; line-height: 1.55; letter-spacing: 1.5px; }\n@media (max-width: 900px) { .hero-kicker { font-size: 11px; line-height: 1.4; } }\n@media (max-width: 480px) { .hero-kicker { margin-bottom: 10px; padding-bottom: 6px; font-size: 9px; line-height: 1.2; letter-spacing: .8px; } }\n`;
fs.writeFileSync('src/style.css',s);
