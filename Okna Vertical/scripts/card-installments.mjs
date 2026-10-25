import { renderComponent } from './components.mjs';

const numberFormat = new Intl.NumberFormat('ru-RU');
const money = /(\d[\d \u00a0\u202f]*(?:\s+до\s+\d[\d \u00a0\u202f]*)?)\s*₽/g;
const voidTags = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);

function amount(text) {
 const match = text.match(/\d[\d \u00a0\u202f]*/);
 return match ? Number(match[0].replace(/\s/g,'')) : 0;
}
export function installmentBadge(price) {
 return renderComponent('card-installment',{amount:numberFormat.format(Math.ceil(price / 36))}).trim();
}

export function addCalculatorInstallments(html) {
 return html.replace(/<output class="home-calculator__price"[^>]*>([\s\S]*?)<\/output\s*>/g,(output,text,offset)=>{
  if(html.slice(Math.max(0,offset-100),offset).includes('class="home-calculator__price-row"'))return output;
  const price=amount(text);
  return price?`<div class="home-calculator__price-row">${output}${installmentBadge(price).replace('data-card-installment','data-calculator-installment')}</div>`:output;
 });
}

// Annotates static prices at build time. It does not generate browser markup.
export function addCardInstallments(html) {
 // Remove our previous output before recalculating; source prices remain authoritative.
 html = html.replace(/<small class="card-installment" data-card-installment>[\s\S]*?<\/small>/g,'');
 html = html.replace(/<(span|div) class="card-price-row" data-card-price>([\s\S]*?)<\/\1><!-- \/card-price -->/g,'$2');
 const root = {children:[], card:false};
 const stack = [root];
 for (const token of html.matchAll(/<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script\s*>|<style\b[^>]*>[\s\S]*?<\/style\s*>|<[^>]+>|[^<]+/gi)) {
  const value = token[0];
  const parent = stack[stack.length-1];
  if (/^<(?:!|script\b|style\b)/i.test(value)) continue;
  const closing = value.match(/^<\/([\w-]+)/);
  if (closing) {
   const index = stack.findLastIndex(node => node.tag === closing[1].toLowerCase());
   if (index > 0) { stack[index].end = token.index + value.length; stack.length = index; }
   continue;
  }
  const opening = value.match(/^<([\w-]+)/);
  if (opening) {
   const tag = opening[1].toLowerCase();
   const classes = value.match(/\bclass="([^"]*)"/)?.[1].split(/\s+/) || [];
   const isCard = classes.some(name => /(?:^|-)card$/.test(name) && !/^review-/.test(name));
   const node = {tag,start:token.index,end:token.index+value.length,card:parent.card||isCard,noInstallment:parent.noInstallment||/\bdata-no-installment\b/.test(value),children:[]};
   parent.children.push(node);
   if (!voidTags.has(tag) && !/\/\s*>$/.test(value)) stack.push(node);
  } else parent.children.push({text:value,start:token.index,end:token.index+value.length,card:parent.card});
 }
 const edits=[];
 function visit(node) {
  if (node.text !== undefined || node.noInstallment) return;
  const content = html.slice(node.start,node.end);
  const prices = [...content.replace(/<[^>]*>/g,' ').matchAll(money)];
  if (node.card && ['strong','b'].includes(node.tag) && prices.length === 1) {
   const price=amount(prices[0][1]);
   if (price) edits.push({start:node.start,end:node.end,text:`<div class="card-price-row" data-card-price>${content}${installmentBadge(price)}</div><!-- /card-price -->`});
   return;
  }
  for (const child of node.children) {
   if (child.text !== undefined && node.card && ['p','span','dd'].includes(node.tag)) {
    for (const match of child.text.matchAll(money)) {
     const price=amount(match[1]);
     if(price) edits.push({start:child.start+match.index,end:child.start+match.index+match[0].length,text:`<span class="card-price-row" data-card-price>${match[0]}${installmentBadge(price)}</span><!-- /card-price -->`});
    }
   } else visit(child);
  }
 }
 visit(root);
 for(const edit of edits.sort((a,b)=>b.start-a.start)) html=html.slice(0,edit.start)+edit.text+html.slice(edit.end);
 return html;
}
