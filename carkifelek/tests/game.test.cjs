const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');const C=require('../app.js');const ctx={window:{}};vm.runInNewContext(fs.readFileSync('questions.js','utf8'),ctx);const qs=ctx.window.QUESTION_BANK;
assert.equal(qs.length,346);assert.equal(new Set(qs.map(q=>q.course)).size,16);assert.equal(new Set(qs.map(q=>q.id)).size,346);assert.equal(new Set(qs.map(q=>q.course+'|'+q.answer)).size,346);
for(const q of qs){assert(q.clue.length>10);assert(C.clean(q.answer,q.course).length>0);assert(q.answer.split(' ').every(w=>w.length<=20));assert(/^[A-ZÇĞİÖŞÜÄ -]+$/.test(q.answer),q.answer);}
const initial=()=>({q:{answer:'KİTAP',course:'Türk Dili ve Edebiyatı'},teams:[{name:'A',score:1000,round:0},{name:'B',score:700,round:0}],turn:0,value:200,selected:[],solved:false,spinning:false});
let s=initial();let r=C.award(s,'K');assert.equal(r.p,200);assert.equal(s.teams[0].score,1200);assert.equal(s.turn,0);assert.equal(s.value,null);assert.equal(C.award(s,'K'),null);
s.value=300;r=C.award(s,'Z');assert.equal(r.hit,false);assert.equal(s.turn,1);assert.equal(s.teams[1].score,700);
s=initial();s.q.answer='ANANAS';
r=C.award(s,'A');
assert.equal(r.n,3);
assert.equal(r.cost,100);
assert.equal(s.teams[0].score,900);

s=initial();s.teams[0].score=99;
assert.equal(C.award(s,'İ'),null);
assert.equal(s.teams[0].score,99);
assert.deepEqual(s.selected,[]);
assert.equal(s.value,200);

s=initial();s.teams[0].score=100;
r=C.award(s,'Ö');
assert.equal(r.hit,false);
assert.equal(r.cost,100);
assert.equal(s.teams[0].score,0);
assert.equal(s.turn,1);

s=initial();s.selected=['K','T','P','İ'];s.teams[0].score=0;
r=C.award(s,'A');
assert.equal(r.cost,0);
assert.equal(r.won,true);
assert.equal(s.teams[0].score,500);

s=initial();
assert.equal(C.spinOutcome(s,'SESLİ',1000),'SESLİ');
assert.equal(s.deadline,31000);
assert.equal(C.letterOption(s,'K'),null);
assert.equal(C.award(s,'İ').cost,0);
assert.equal(s.deadline,null);

s=initial();s.selected=['İ','A'];
assert.equal(C.spinOutcome(s,'SESLİ',1000),'JOKER');
assert.equal(C.award(s,'K').p,300);

s=initial();C.spinOutcome(s,'JOKER',1000);
assert.equal(C.award(s,'İ').cost,0);

s=initial();C.spinOutcome(s,200,1000);
assert.equal(C.remainingTime(s,1000),30);
assert.equal(C.remainingTime(s,30001),1);
assert.equal(C.expireTurn(s,30999),false);
assert.equal(C.expireTurn(s,31000),true);
assert.equal(C.expireTurn(s,31001),false);
assert.equal(s.turn,1);
assert.equal(s.value,null);
assert.equal(s.deadline,null);
assert.equal(s.teams[0].score,1000);

s=initial();assert.equal(C.spinOutcome(s,'PAS',1000),null);assert.equal(s.turn,1);
assert.equal(s.deadline,null);
assert(!C.values.includes('İFLAS'));
assert(C.isVowel('Ü','Almanca (ikinci yabancı dil)'));
assert(C.isVowel('I','Matematik') && C.isVowel('İ','Matematik'));
assert.notEqual(C.clean('ısı'),C.clean('isi'));assert.equal(C.clean('friendship','İngilizce'),'FRIENDSHIP');assert.equal(C.clean('hücre - zarı'),'HÜCREZARI');
for (const q of qs) {
 s=initial();
 s.q=q;
 const letters=[...new Set(C.clean(q.answer,q.course))];
 const consonants=letters.filter(letter=>!C.isVowel(letter,q.course));
 const vowels=letters.filter(letter=>C.isVowel(letter,q.course));
 for (const letter of [...consonants,...vowels]) {
  s.value=100;
  assert(C.award(s,letter),q.answer);
 }
 assert(s.solved,q.answer);
 assert.equal(s.teams[0].score,1500+100*[...C.clean(q.answer,q.course)].filter(letter=>!C.isVowel(letter,q.course)).length,q.answer);
}
assert.equal(qs.filter(q=>q.clue==='Bir ilimiz.').length,81);
assert(qs.filter(q=>q.course==='Müzik').every(q=>q.clue==='Bir müzik terimi.'));
for(const course of new Set(qs.map(q=>q.course)))assert.equal(new Set(qs.filter(q=>q.course===course).map(q=>q.clue)).size,1);

console.log('Passed: all 346 words, scoring, vowel fees and prizes, pass, and exact timer expiry.');
