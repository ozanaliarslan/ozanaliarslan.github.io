const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const C=require('../app.js');const ctx={window:{}};vm.runInNewContext(fs.readFileSync('questions.js','utf8'),ctx);const qs=ctx.window.QUESTION_BANK;
assert.equal(qs.length,205);assert.equal(new Set(qs.map(q=>q.course)).size,15);assert.equal(new Set(qs.map(q=>q.id)).size,205);assert.equal(new Set(qs.map(q=>q.course+'|'+q.answer)).size,205);
for(const q of qs){assert(q.clue.length>10);assert(C.clean(q.answer,q.course).length>0);assert(q.answer.split(' ').every(w=>w.length<=20));assert(/^[A-ZÇĞİÖŞÜÄ -]+$/.test(q.answer),q.answer);}
const initial=()=>({q:{answer:'KİTAP',course:'Türk Dili ve Edebiyatı'},teams:[{name:'A',score:1000,round:0},{name:'B',score:700,round:0}],turn:0,value:200,selected:[],solved:false,spinning:false});
let s=initial();let r=C.award(s,'K');assert.equal(r.p,200);assert.equal(s.teams[0].score,1200);assert.equal(s.turn,0);assert.equal(s.value,null);assert.equal(C.award(s,'K'),null);
s.value=300;r=C.award(s,'Z');assert.equal(r.hit,false);assert.equal(s.turn,1);assert.equal(s.teams[1].score,700);
s=initial();s.q.answer='ANANAS';r=C.award(s,'A');assert.equal(r.n,3);assert.equal(s.teams[0].score,1600);
s=initial();s.selected=['K','İ','T','A'];r=C.award(s,'P');assert(r.won);assert.equal(s.teams[0].score,1700);assert.equal(C.award(s,'P'),null);assert.equal(C.solve(s,'KİTAP'),null);
s=initial();assert.equal(C.solve(s,'kitap'),true);assert.equal(s.teams[0].score,1500);
s=initial();assert.equal(C.solve(s,'başka'),false);assert.equal(s.turn,1);assert.equal(s.teams[0].score,1000);
s=initial();s.teams[0]={name:'A',score:1450,round:450};assert.equal(C.spinOutcome(s,'İFLAS'),'bankrupt');assert.equal(s.teams[0].score,1000);assert.equal(s.turn,1);
s=initial();assert.equal(C.spinOutcome(s,'PAS'),'pass');assert.equal(s.turn,1);
assert.notEqual(C.clean('ısı'),C.clean('isi'));assert.equal(C.clean('friendship','İngilizce'),'FRIENDSHIP');assert.equal(C.clean('hücre - zarı'),'HÜCREZARI');
for(const q of qs){s=initial();s.q=q;s.selected=[];for(const letter of new Set(C.clean(q.answer,q.course))){s.value=100;C.award(s,letter);}assert(s.solved,q.answer);assert.equal(s.teams[0].score,1500+100*C.clean(q.answer,q.course).length,q.answer);}
console.log('Passed: 205-question integrity; repeated letters, score, turns, bankrupt, pass, solve, duplicate prevention, Turkish/English normalization; full completion of all 205 rounds.');
