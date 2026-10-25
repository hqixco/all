import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const panels = Array.from({length:5}, () => ({hidden:false, checked:false, querySelector() {return this.checked ? {} : null;}}));
const listeners = {};
const control = name => ({disabled:false, hidden:false, addEventListener(type, fn) {listeners[name + ':' + type] = fn;}});
const controls = control('controls'), previous = control('previous'), next = control('next');
const progress = {setAttribute(){}}, bar = {style:{}}, caption = {};
const quiz = {
  querySelectorAll() {return panels;},
  querySelector(selector) {return {'.quiz-controls':controls,'.quiz-prev':previous,'.quiz-next':next,'.quiz-step':caption,'.quiz-progress':progress,'.quiz-progress span':bar}[selector];},
  addEventListener(type, fn) {listeners['quiz:' + type] = fn;}
};
const timers = new Map();
let timerId = 0;
const context = {document:{querySelector(){return quiz;}}, setTimeout(fn){timers.set(++timerId, fn);return timerId;}, clearTimeout(id){timers.delete(id);}};
const code = fs.readFileSync('src/roof-replacement.js','utf8');
vm.runInNewContext(code.slice(code.indexOf('const quiz ='), code.indexOf('const modal =')), context);
const current = () => panels.findIndex(panel => !panel.hidden);
const choose = () => { panels[current()].checked = true; listeners['quiz:change']({target:{type:'radio'}}); };
const flush = () => {for (const [id, fn] of [...timers]) {timers.delete(id);fn();}};
assert.equal(current(),0);
assert.equal(next.disabled,true);
choose(); flush(); assert.equal(current(),1);
choose(); listeners['next:click'](); flush(); assert.equal(current(),2, 'Manual navigation must cancel pending automatic advance');
listeners['previous:click'](); assert.equal(current(),1); assert.equal(next.disabled,false,'Previous answer is retained');
choose(); listeners['previous:click'](); flush(); assert.equal(current(),0,'Back navigation must cancel the timer');
for (let i=0;i<4;i++) {choose();flush();}
assert.equal(current(),4); assert.equal(controls.hidden,true); assert.equal(caption.textContent,'Контактные данные');
console.log('OK: automatic advance, retained answers, timer cancellation and final contact step');
