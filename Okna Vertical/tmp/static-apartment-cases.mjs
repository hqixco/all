import fs from 'node:fs';const f='scripts/generate-seo.mjs';let s=fs.readFileSync(f,'utf8');const marker=" content = content.replaceAll('<span>→</span>'";const start=s.indexOf('const apartmentCases =');const pos=s.indexOf(marker,start);const code=` content = content.replace(/<div(\\s+class="case-photo[^" ]*(?: [^\"]*)?case-photo--gallery[^\"]*"[^>]*)>([\\s\\S]*?)<\\/div>/g, (whole,attrs,body) => {
  const photos = [...body.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)];
  let photoIndex = 0;
  body = body.replace(/<img\\b/g, () => '<img class="' + (photoIndex++ === 0 ? 'is-active' : '') + '"');
  const controls = photos.length > 1 ? '<button class="case-slider__nav case-slider__nav--prev" type="button" aria-label="Предыдущее фото"></button><button class="case-slider__nav case-slider__nav--next" type="button" aria-label="Следующее фото"></button>' : '';
  const thumbs = photos.length > 1 ? '<div class="case-slider__thumbs" aria-label="Миниатюры кейса">' + photos.map((m,i)=>'<button class="case-slider__thumb'+(i===0?' is-active':'')+'" type="button" aria-label="Показать фото '+(i+1)+'" aria-pressed="'+(i===0)+'" style="background-image:url('+m[1]+')"></button>').join('') + '</div>' : '';
  return '<div'+attrs.replace(/class="([^"]+)"/,'class="$1 is-case-slider"')+'>'+body+controls+'</div>'+thumbs;
 });
`;s=s.slice(0,pos)+code+s.slice(pos);fs.writeFileSync(f,s);
s=fs.readFileSync('src/main.js','utf8');const at=s.indexOf('document.querySelectorAll(".case-photo--gallery").forEach');const insertion=s.indexOf('  let activeIndex = 0;',at);s=s.slice(0,insertion)+`  if (gallery.closest('.apartment-cases')) {
    let selected = 0;
    const thumbs = [...(gallery.nextElementSibling?.classList.contains('case-slider__thumbs') ? gallery.nextElementSibling.querySelectorAll('button') : [])];
    const select = index => {
      selected = (index + images.length) % images.length;
      images.forEach((image,i)=>image.classList.toggle('is-active',i===selected));
      thumbs.forEach((thumb,i)=>{thumb.classList.toggle('is-active',i===selected);thumb.setAttribute('aria-pressed',String(i===selected));});
    };
    thumbs.forEach((thumb,i)=>thumb.addEventListener('click',()=>select(i)));
    gallery.querySelector('.case-slider__nav--prev')?.addEventListener('click',()=>select(selected-1));
    gallery.querySelector('.case-slider__nav--next')?.addEventListener('click',()=>select(selected+1));
    return;
  }
`+s.slice(insertion);fs.writeFileSync('src/main.js',s);
