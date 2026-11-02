document.addEventListener('DOMContentLoaded', () => {
 const section=document.querySelector('.home-reviews'); if(!section)return;
 section.classList.add('home-reviews--ready');
 const tabs=Array.from(section.querySelectorAll('[data-review-platform]'));
 const panels=Array.from(section.querySelectorAll('[data-review-panel]'));
 const behavior=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth';
 const visible=()=>window.innerWidth<=767?1:window.innerWidth<=1000?3:4;
 const states=panels.map(panel=>{
  const track=panel.querySelector('[data-review-track]');
  const cards=Array.from(track.querySelectorAll('[data-review-card]'));
  const dots=Array.from(panel.querySelectorAll('[data-review-dot]'));
  const prev=panel.querySelector('[data-review-prev]');const next=panel.querySelector('[data-review-next]');
  const limit=()=>cards.length-visible();
  const step=()=>cards[0].getBoundingClientRect().width+18;
  const index=()=>Math.min(limit(),Math.max(0,Math.round(track.scrollLeft/step())));
  const update=()=>{if(panel.hidden)return;const current=index();prev.disabled=current===0;next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;dots.forEach((dot,i)=>{dot.hidden=i>limit();dot.setAttribute('aria-pressed',String(i===current));});};
  const go=i=>track.scrollTo({left:Math.min(limit(),Math.max(0,i))*step(),behavior:behavior()});
  prev.hidden=false;next.hidden=false;panel.querySelector('[data-review-dots]').hidden=false;
  prev.addEventListener('click',()=>go(index()-1));next.addEventListener('click',()=>go(index()+1));
  dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
  track.addEventListener('scroll',update,{passive:true});
  return{panel,track,update};
 });
 const select=platform=>{tabs.forEach(tab=>tab.setAttribute('aria-pressed',String(tab.dataset.reviewPlatform===platform)));states.forEach(state=>{state.panel.hidden=state.panel.dataset.reviewPanel!==platform;if(!state.panel.hidden){state.track.scrollLeft=0;state.update();}});};
 section.querySelector('[data-review-platforms]').hidden=false;
 tabs.forEach(tab=>tab.addEventListener('click',()=>select(tab.dataset.reviewPlatform)));
 select('avito');window.addEventListener('resize',()=>states.forEach(state=>state.update()));
});
