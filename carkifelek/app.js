'use strict';
const GameCore = (()=>{
 const alphabet='ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';
 const foreign=c=>c==='İngilizce'||c.startsWith('Almanca');
 const upper=(s,c='')=>String(s).normalize('NFC').toLocaleUpperCase(foreign(c)?'en-US':'tr-TR');
 const clean=(s,c='')=>upper(s,c).replace(/[^A-ZÇĞİÖŞÜÄ]/g,'');
 const count=(answer,letter)=>[...answer].filter(c=>c===letter).length;
 const complete=(q,selected)=>[...clean(q.answer,q.course)].every(c=>selected.includes(c));
 const vowelCost = 100;
 const turnSeconds = 30;
 const values = [
  100, 250, 'PAS', 400, 150, 'SESLİ',
  200, 350, 'PAS', 500, 150, 'JOKER',
  300, 250, 'PAS', 400, 200, 'SESLİ'
 ];
 const degreesPerSlice = 360 / values.length;

 function wheelDestination(angle, slice) {
  const center = (slice + .5) * degreesPerSlice;
  const remaining = (360 - (angle + center) % 360) % 360;
  return angle + 3 * 360 + remaining;
 }

 function isVowel(letter, course) {
  if (course === 'İngilizce') return 'AEIOU'.includes(letter);
  if (course.startsWith('Almanca')) return 'AEIOUÄÖÜ'.includes(letter);
  return 'AEIİOÖUÜ'.includes(letter);
 }

 function hasHiddenLetter(s, vowel) {
  return [...clean(s.q.answer, s.q.course)].some(letter =>
   isVowel(letter, s.q.course) === vowel && !s.selected.includes(letter));
 }

 function letterOption(s, letter) {
  if (s.solved || s.spinning || s.value === null || s.selected.includes(letter)) return null;
  const consonantsLeft = hasHiddenLetter(s, false);
  if (isVowel(letter, s.q.course)) {
   const cost = consonantsLeft && typeof s.value === 'number' ? vowelCost : 0;
   return s.teams[s.turn].score >= cost ? { cost, points: 0 } : null;
  }
  if (s.value === 'SESLİ' || !consonantsLeft) return null;
  return { cost: 0, points: s.value === 'JOKER' ? 300 : s.value };
 }

 function endChoice(s) {
  s.value = null;
  s.deadline = null;
 }

 function passTurn(s) {
  endChoice(s);
  s.turn = (s.turn + 1) % s.teams.length;
 }

 function remainingTime(s, now) {
  return Math.max(0, Math.ceil((s.deadline - now) / 1000));
 }

 function expireTurn(s, now) {
  if (s.value === null || !Number.isFinite(s.deadline) || now < s.deadline) return false;
  passTurn(s);
  return true;
 }

 function award(s, letter) {
  const option = letterOption(s, letter);
  if (!option) return null;
  const { cost, points } = option;
  const occurrences = count(s.q.answer, letter);
  const team = s.teams[s.turn];
  const earned = occurrences * points;
  team.score += earned - cost;
  team.round = Math.max(0, team.round + earned - cost);
  s.selected.push(letter);
  if (!occurrences) {
   passTurn(s);
   return { hit: false, n: 0, p: 0, cost, won: false };
  }
  endChoice(s);
  const won = complete(s.q, s.selected);
  if (won) {
   team.score += 500;
   team.round += 500;
   s.solved = true;
  }
  return { hit: true, n: occurrences, p: earned, cost, won };
 }

 function spinOutcome(s, value, now) {
  if (value === 'PAS') {
   passTurn(s);
   return null;
  }
  // A vowel prize remains playable if every vowel on the board is open.
  s.value = value === 'SESLİ' && !hasHiddenLetter(s, true) ? 'JOKER' : value;
  s.deadline = now + turnSeconds * 1000;
  return s.value;
 }

 return { alphabet, foreign, upper, clean, isVowel, hasHiddenLetter, letterOption,
  award, spinOutcome, passTurn, expireTurn, remainingTime, values, degreesPerSlice, wheelDestination, vowelCost, turnSeconds };
})();
if(typeof module!=='undefined')module.exports=GameCore;
if(typeof document!=='undefined'){
const $=id=>document.getElementById(id), KEY='sinif-carkifelek-v1', values=GameCore.values;
let state,custom=[],filter='',history=[],angle=0,confirmAction=null;
let wheelSound = true;
try { wheelSound = localStorage.getItem(KEY + '-wheel-sound') !== 'off'; } catch {}
const clone=x=>JSON.parse(JSON.stringify(x));
function defaultState(){return {teams:[{name:'Takım 1',score:0,round:0},{name:'Takım 2',score:0,round:0},{name:'Takım 3',score:0,round:0}],turn:0,round:0,used:[],q:null,selected:[],solved:false,value:null,deadline:null,spinning:false,message:'Çarkı çevirin, ilk harfi söyleyin.',tone:''};}
function validQuestion(q){return q&&typeof q.id==='string'&&typeof q.course==='string'&&q.course.trim().length>0&&q.course.length<=60&&typeof q.answer==='string'&&q.answer.length<=50&&typeof q.clue==='string'&&q.clue.length<=280&&/^[A-ZÇĞİÖŞÜÄ -]+$/.test(q.answer)&&GameCore.clean(q.answer,q.course).length>0&&q.answer.split(/\s+/).every(w=>w.length<=20);}
function validState(s){return s&&Array.isArray(s.teams)&&s.teams.length>=2&&s.teams.length<=6&&s.teams.every(t=>typeof t.name==='string'&&t.name.length<=24&&Number.isFinite(t.score)&&Number.isFinite(t.round)&&t.score>=0&&t.round>=0&&t.round<=t.score)&&Number.isInteger(s.turn)&&s.turn>=0&&s.turn<s.teams.length&&Number.isInteger(s.round)&&s.round>=0&&s.round<100000&&Array.isArray(s.used)&&s.used.every(i=>typeof i==='string')&&(!s.q||validQuestion(s.q))&&Array.isArray(s.selected)&&s.selected.every(c=>typeof c==='string'&&c.length===1)&&typeof s.solved==='boolean'&&(s.value===null||(s.value!=='PAS'&&values.includes(s.value)));}
function save(){try{localStorage.setItem(KEY,JSON.stringify({state:{...state,spinning:false},custom,filter}));}catch(e){$('bankInfo').textContent='Bu tarayıcıda otomatik kayıt kullanılamıyor';}}
function bank(){return [...window.QUESTION_BANK,...custom];}
function pool(){return bank().filter(q=>!filter||q.course===filter);}
function record(){history.push({ state: clone(state), seconds: GameCore.remainingTime(state, Date.now()), angle });if(history.length>30)history.shift();}
function message(s,tone=''){state.message=s;state.tone=tone;}
function populateCourses(){const el=$('courseSelect');el.replaceChildren(new Option('Tüm dersler · Karışık',''));[...new Set(bank().map(q=>q.course))].forEach(c=>el.add(new Option(c,c)));if(![...el.options].some(o=>o.value===filter))filter='';el.value=filter;}
function newRound(){
 if(state.spinning)return;
 const p=pool();let available=p.filter(q=>!state.used.includes(q.id));
 if(!available.length){state.used=state.used.filter(id=>!p.some(q=>q.id===id));available=p;}
 const courses=[...new Set(available.map(q=>q.course))];const course=courses[Math.floor(Math.random()*courses.length)];const choices=available.filter(q=>q.course===course);state.q=clone(choices[Math.floor(Math.random()*choices.length)]);
 state.used.push(state.q.id);state.round++;state.selected=[];state.solved=false;state.value=null;state.deadline=null;state.teams.forEach(t=>t.round=0);
 if(state.round>1)state.turn=(state.turn+1)%state.teams.length;
 message(state.teams[state.turn].name+' başlıyor. Çarkı çevirin.');render();
}
function requestRound(){if(state.spinning)return;if(state.q&&!state.solved&&(state.selected.length||state.value!==null))ask('Yeni kelimeye geçilsin mi?','Mevcut kelime açılmadan geçilecek. Kazanılan puanlar korunur.',()=>{record();newRound();});else{record();newRound();}}
function drawWheel() {
 const ctx = $('wheel').getContext('2d');
 const step = 2 * Math.PI / values.length;
 const colors = ['#e8c46f', '#377a66', '#435465', '#dca265', '#3a826a', '#62549c',
  '#edcc79', '#216758', '#435465', '#d79556', '#4e8971', '#a54a35',
  '#e5bc71', '#286b5c', '#435465', '#dfa265', '#397b66', '#62549c'];
 ctx.clearRect(0, 0, 600, 600);

 values.forEach((value, index) => {
  const start = -Math.PI / 2 + index * step;
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.arc(300, 300, 294, start, start + step);
  ctx.closePath();
  ctx.fillStyle = colors[index];
  ctx.fill();
  ctx.strokeStyle = '#fbf3dc85';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.save();
  ctx.translate(300, 300);
  ctx.rotate(start + step / 2);
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = [0, 3, 6, 9, 12, 15].includes(index) ? '#183d32' : '#fffbec';
  ctx.font = 'bold ' + (typeof value === 'string' ? 25 : 30) + 'px Arial';
  ctx.fillText(String(value), 251, 0);
  ctx.restore();
 });

 // The pegs sit on the slice boundaries so the pointer stops between two pegs.
 ctx.beginPath();
 ctx.arc(300, 300, 283, 0, 2 * Math.PI);
 ctx.strokeStyle = '#183b35';
 ctx.lineWidth = 23;
 ctx.stroke();
 ctx.beginPath();
 ctx.arc(300, 300, 290, 0, 2 * Math.PI);
 ctx.strokeStyle = '#e5c780';
 ctx.lineWidth = 4;
 ctx.stroke();

 for (let index = 0; index < values.length; index++) {
  const position = -Math.PI / 2 + index * step;
  const x = 300 + 275 * Math.cos(position);
  const y = 300 + 275 * Math.sin(position);
  const metal = ctx.createRadialGradient(x - 3, y - 4, 1, x, y, 9);
  metal.addColorStop(0, '#ffffff');
  metal.addColorStop(.45, '#c6d0d1');
  metal.addColorStop(1, '#5d6972');
  ctx.beginPath();
  ctx.arc(x, y + 1.8, 9.7, 0, 2 * Math.PI);
  ctx.fillStyle = '#13251f';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, 8.5, 0, 2 * Math.PI);
  ctx.fillStyle = metal;
  ctx.fill();
 }
}

function positionWheel(rotation, needleBend = 0) {
 $('wheel').style.transform = 'rotate(' + rotation + 'deg)';
 $('wheelPointer').style.setProperty('--needle-bend', needleBend + 'deg');
}

function tickWheel() {
 if (!wheelSound || audio?.state !== 'running') return;
 const time = audio.currentTime;
 const click = audio.createOscillator();
 const volume = audio.createGain();
 click.type = 'triangle';
 click.frequency.setValueAtTime(1750, time);
 click.frequency.exponentialRampToValueAtTime(690, time + .022);
 volume.gain.setValueAtTime(.046, time);
 volume.gain.exponentialRampToValueAtTime(.001, time + .03);
 click.connect(volume);
 volume.connect(audio.destination);
 click.start(time);
 click.stop(time + .032);
}

function animateWheel(slice, onStop) {
 const start = angle;
 const target = GameCore.wheelDestination(start, slice);
 const step = GameCore.degreesPerSlice;
 const finish = () => {
  angle = target % 360;
  positionWheel(angle);
  onStop();
 };
 if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  finish();
  return;
 }

 const duration = 4600;
 let startedAt;
 let lastPeg = Math.floor(start / step);
 let hitAt = -Infinity;

 function frame(now) {
  startedAt ??= now;
  const elapsed = now - startedAt;
  const progress = Math.min(1, elapsed / duration);
  const rotation = start + (target - start) * (1 - (1 - progress) ** 2.5);
  const peg = Math.floor(rotation / step);
  if (peg > lastPeg) {
   hitAt = now;
   lastPeg = peg;
   tickWheel();
  }

  const untilPeg = step - rotation % step;
  const sinceHit = now - hitAt;
  let bend = 0;
  if (untilPeg < 4) bend = -18 * (1 - untilPeg / 4);
  else if (sinceHit < 170) bend = -19 * Math.exp(-sinceHit / 42) * Math.cos(sinceHit / 13);
  positionWheel(rotation, bend);

  if (progress < 1) requestAnimationFrame(frame);
  else finish();
 }

 requestAnimationFrame(frame);
}

function updateWheelSoundButton() {
 const button = $('wheelSoundBtn');
 button.setAttribute('aria-pressed', String(wheelSound));
 button.textContent = wheelSound ? 'Çark sesi açık' : 'Çark sesi kapalı';
}

function board(){const board=$('board');board.replaceChildren();const words=state.q.answer.split(' ');const max=Math.max(...words.map(w=>w.length));const available=board.clientWidth||500;const tile=Math.min(44,Math.max(16,(available-18-4*(max-1))/max));board.style.setProperty('--tile',tile+'px');words.forEach(word=>{const row=document.createElement('div');row.className='word';for(const char of word){const t=document.createElement('div');const open=state.solved||state.selected.includes(char)||!GameCore.clean(char,state.q.course);t.className='tile '+(open?'revealed':'hidden');t.textContent=open?char:'';t.setAttribute('aria-label',open?char:'Kapalı harf');row.append(t);}board.append(row);});$('letterCount').textContent=words.map(w=>w.length).join(' + ')+' HARF'+(words.length>1?' · '+words.length+' KELİME':'');}
function keyboard() {
 const box = $('keyboard');
 box.replaceChildren();
 const alphabet = GameCore.foreign(state.q.course) ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZÇĞİÖŞÜÄ' : GameCore.alphabet;
 for (const letter of alphabet) {
  const button = document.createElement('button');
  button.className = 'key';
  button.textContent = letter;
  const vowel = GameCore.isVowel(letter, state.q.course);
  const option = GameCore.letterOption(state, letter);
  const label = option?.cost ? letter + ' harfini ' + option.cost + ' puana al' : letter + ' harfini seç';
  button.setAttribute('aria-label', label);
  button.title = label;
  if (vowel) button.classList.add('vowel');
  if (state.selected.includes(letter)) {
   button.classList.add(state.q.answer.includes(letter) ? 'hit' : 'miss');
  }
  button.disabled = !option;
  button.addEventListener('click', () => chooseLetter(letter));
  box.append(button);
 }
}

function wheelMessage() {
 if (state.spinning) return 'Çark dönüyor…';
 if (state.solved) return 'Tur tamamlandı';
 if (state.value === 'SESLİ') return 'Ücretsiz sesli harf';
 if (state.value === 'JOKER') return 'Joker · 300 puan / ücretsiz sesli';
 if (state.value !== null) return state.value + ' PUAN / SESSİZ HARF';
 return 'Puan · Sesli harf · Joker · Pas';
}

function keyboardMessage() {
 if (state.solved) return 'Yeni kelimeye geçebilirsiniz';
 if (state.value === null) return 'Önce çarkı çevirin';
 if (!GameCore.hasHiddenLetter(state, false)) return 'Tüm sessizler açıldı · Sesli harfler ücretsiz';
 if (state.value === 'SESLİ') return 'Ücretsiz bir sesli harf seçin';
 if (state.value === 'JOKER') return 'Sessiz harf seçin veya ücretsiz sesli harf alın';
 return state.teams[state.turn].score >= GameCore.vowelCost
  ? 'Sessiz harf seçin veya 100 puana bir sesli alın'
  : 'Sessiz harf seçin · Sesli harf için 100 puan gerekli';
}

function paintTimer() {
 const active = state.value !== null && !state.solved && !state.spinning;
 const seconds = active ? GameCore.remainingTime(state, Date.now()) : GameCore.turnSeconds;
 const timer = $('letterTimer');
 const label = seconds + ' sn';
 if ($('letterSeconds').textContent !== label) $('letterSeconds').textContent = label;
 timer.classList.toggle('active', active);
 timer.classList.toggle('urgent', active && seconds <= 5);
 timer.style.setProperty('--time-left', (seconds / GameCore.turnSeconds * 100) + '%');
}

function checkTimer() {
 if (GameCore.expireTurn(state, Date.now())) {
  message('Süre doldu. Sıra ' + state.teams[state.turn].name + ' takımında.', 'error');
  tone(220);
  render();
  return false;
 }
 paintTimer();
 return true;
}

function renderTeams(){const el=$('teams');el.replaceChildren();state.teams.forEach((t,i)=>{const div=document.createElement('div');div.className='team-card'+(i===state.turn?' active':'');const name=document.createElement('div');name.className='team-name';name.textContent=t.name;const score=document.createElement('div');score.className='team-score';score.textContent=t.score.toLocaleString('tr-TR');const r=document.createElement('div');r.className='team-round';r.textContent='Bu tur +'+t.round;div.append(name,score,r);el.append(div);});}
function render(){if(!state.q)return;const current=window.QUESTION_BANK.find(q=>q.id===state.q.id&&q.answer===state.q.answer);if(current)state.q={...current};
 if(state.value===null)state.deadline=null;
 else if(!Number.isFinite(state.deadline))state.deadline=Date.now()+GameCore.turnSeconds*1000;
 $('roundNumber').textContent=state.round+'. TUR';$('poolCount').textContent=pool().length+' kelime';$('courseBadge').textContent=state.q.course;$('clue').textContent=state.q.clue;$('status').textContent=state.message;$('status').className='status '+state.tone;board();keyboard();renderTeams();$('spinBtn').disabled=state.spinning||state.solved||state.value!==null;$('spinBtn').textContent=state.spinning?'Çark dönüyor…':state.value!==null?'Şimdi harf seçin':'Çarkı çevir';$('resetBtn').disabled=state.spinning;$('passBtn').disabled=state.solved||state.spinning;$('revealBtn').disabled=state.solved||state.spinning;$('nextBtn').disabled=state.spinning;$('courseSelect').disabled=state.spinning;$('settingsBtn').disabled=state.spinning;$('undoBtn').disabled=!history.length||state.spinning;$('wheelValue').textContent=wheelMessage();
 $('keyboardHint').textContent=keyboardMessage();
 paintTimer();
 const remaining=pool().filter(q=>!state.used.includes(q.id)).length;$('progress').textContent=remaining+' kelime kaldı';$('bankInfo').textContent=bank().length+' soru · '+new Set(bank().map(q=>q.course)).size+' ders alanı';save();}
function chooseLetter(letter) {
 if (!checkTimer() || !GameCore.letterOption(state, letter)) return;
 record();
 const name = state.teams[state.turn].name;
 const result = GameCore.award(state, letter);
 const fee = result.cost ? ' −' + result.cost + ' puan.' : '';
 const points = result.p ? ' +' + result.p + ' puan.' : '';
 if (result.won) {
  message('Tebrikler ' + name + '!' + fee + points + ' Kelime tamamlandı: +500 puan.', 'win');
 } else if (result.hit) {
  message(letter + ' harfi ' + result.n + ' yerde!' + fee + points + ' ' + name + ', yeniden çevirin.');
 } else {
  message(letter + ' yok.' + fee + ' Sıra ' + state.teams[state.turn].name + ' takımında.', 'error');
 }
 tone(result.hit ? 660 : 220);
 render();
}

function spin() {
 if (state.spinning || state.solved || state.value !== null) return;
 record();
 state.spinning = true;
 message('Çark dönüyor…');
 render();
 const random = new Uint32Array(1);
 crypto.getRandomValues(random);
 const segment = random[0] % values.length;
 if (wheelSound) unlockAudio();
 animateWheel(segment, () => {
  state.spinning = false;
  const value = GameCore.spinOutcome(state, values[segment], Date.now());
  if (value === null) message('PAS! Sıra ' + state.teams[state.turn].name + ' takımına geçti.', 'error');
  else if (value === 'SESLİ') message('Sesli harf hakkı! 30 saniye içinde ücretsiz bir sesli seçin.');
  else if (value === 'JOKER') message('Joker! 300 puanlık sessiz harf veya ücretsiz sesli harf seçin.');
  else message(value + ' puan! ' + state.teams[state.turn].name + ', harf seçmek için 30 saniyeniz var.');
  render();
 });
}

function pass() {
 if (state.solved || state.spinning || !checkTimer()) return;
 record();
 GameCore.passTurn(state);
 message('Sıra ' + state.teams[state.turn].name + ' takımında. Çarkı çevirin.');
 render();
}
function ask(title,body,action){confirmAction=action;$('confirmTitle').textContent=title;$('confirmText').textContent=body;$('confirmDialog').showModal();}
function showSettings(){$('teamCount').value=state.teams.length;teamFields();$('customStatus').textContent='Eklediğiniz soru sayısı: '+custom.length;$('settingsStatus').textContent='';customList();$('settingsDialog').showModal();}
function teamFields(){const n=Number($('teamCount').value);$('teamNames').replaceChildren();for(let i=0;i<n;i++){const label=document.createElement('label');label.textContent=(i+1)+'. takım';const input=document.createElement('input');input.value=state.teams[i]?.name||'Takım '+(i+1);input.maxLength=24;input.className='team-input';label.append(input);$('teamNames').append(label);}}
function customList(){$('customList').replaceChildren();custom.forEach(q=>{const row=document.createElement('div');row.className='custom-item';const span=document.createElement('span');span.textContent=q.course+' · '+q.answer;const b=document.createElement('button');b.textContent='Sil';b.onclick=()=>{custom=custom.filter(x=>x.id!==q.id);populateCourses();customList();$('customStatus').textContent='Soru silindi. Eklediğiniz soru sayısı: '+custom.length;save();render();};row.append(span,b);$('customList').append(row);});}
function unlockAudio() {
 try {
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === 'suspended') audio.resume().catch(() => {});
 } catch {}
}
function tone(f){try{unlockAudio();if(!audio)return;const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=f;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.18);o.start();o.stop(audio.currentTime+.18);}catch{}}
let audio=null;
try{const stored=JSON.parse(localStorage.getItem(KEY));if(stored&&validState(stored.state)){state=stored.state;state.spinning=false;custom=(stored.custom||[]).filter(validQuestion);filter=typeof stored.filter==='string'?stored.filter:'';}}catch{}
state=state||defaultState();populateCourses();drawWheel();updateWheelSoundButton();if(!state.q)newRound();else render();
checkTimer();
setInterval(checkTimer, 150);
$('spinBtn').onclick=spin;
$('wheelSoundBtn').onclick=()=>{
 wheelSound = !wheelSound;
 if (wheelSound) unlockAudio();
 try { localStorage.setItem(KEY + '-wheel-sound', wheelSound ? 'on' : 'off'); } catch {}
 updateWheelSoundButton();
};$('passBtn').onclick=pass;$('nextBtn').onclick=requestRound;
$('undoBtn').onclick=()=>{if(state.spinning||!history.length)return;const previous=history.pop();
 state=previous.state;
 angle=previous.angle;
 positionWheel(angle);
 state.spinning=false;
 if(state.value!==null)state.deadline=Date.now()+previous.seconds*1000;
 render();
 checkTimer();};
$('helpBtn').onclick=()=>$('helpDialog').showModal();$('settingsBtn').onclick=showSettings;
$('fullBtn').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{message('Tam ekran için tarayıcınızda F11 tuşunu kullanabilirsiniz.');render();}};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
$('confirmYes').onclick=()=>{const action=confirmAction;confirmAction=null;$('confirmDialog').close();if(action)action();};
$('revealBtn').onclick=()=>ask('Cevap açılsın mı?','Kelime bütün sınıfa gösterilecek. Bu işlem tamamlama bonusu kazandırmaz.',()=>{record();state.solved=true;state.value=null;message('Cevap açıldı. Kavramı birlikte açıklayın; ardından yeni kelimeye geçin.');render();});
$('courseSelect').onchange=e=>{const next=e.target.value;const apply=()=>{filter=next;history=[];newRound();populateCourses();};if(!state.solved&&(state.selected.length||state.value!==null)){e.target.value=filter;ask('Ders değiştirilsin mi?','Mevcut kelime bırakılıp seçtiğiniz dersten yeni kelime gelecek. Puanlar korunur.',apply);}else apply();};
$('teamCount').onchange=teamFields;
$('saveTeams').onclick=()=>{const names=[...document.querySelectorAll('.team-input')].map((x,i)=>x.value.trim()||'Takım '+(i+1));const changed=names.length!==state.teams.length;const apply=()=>{record();state.teams=names.map((name,i)=>({name,score:changed?0:state.teams[i].score,round:changed?0:state.teams[i].round}));if(changed){state.turn=0;state.value=null;}message('Takımlar güncellendi.');$('settingsStatus').textContent='Takımlar kaydedildi.';render();};if(changed)ask('Takım sayısı değişsin mi?','Takım puanları sıfırlanacak.',apply);else apply();};
$('customForm').onsubmit=e=>{e.preventDefault();const course=$('customCourse').value.trim(),answer=GameCore.upper($('customAnswer').value.trim(),course).replace(/\s+/g,' '),clue=$('customClue').value.trim();const q={id:'custom-'+Date.now()+'-'+Math.random().toString(36).slice(2),course,answer,clue,theme:''};if(!validQuestion(q)){$('customStatus').textContent='Cevapta yalnızca harf, boşluk veya tire kullanın. Tek kelime en fazla 20 harf olabilir.';return;}custom.push(q);populateCourses();save();customList();$('customStatus').textContent='Soru eklendi. Oynamak için bu dersi seçin veya yeni kelimeye geçin.';$('customAnswer').value='';$('customClue').value='';render();};
$('resetBtn').onclick=()=>ask('Yeni oyun başlasın mı?','Takım puanları ve tur geçmişi sıfırlanacak. Eklediğiniz sorular ve takım adları korunur.',()=>{const teams=state.teams.map(t=>({name:t.name,score:0,round:0}));state=defaultState();state.teams=teams;history=[];angle=0;positionWheel(angle);newRound();});
$('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({format:'sinif-carkifelek-v1',state:{...state,spinning:false},custom,filter},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sinif-carkifelek-oyunum.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('settingsStatus').textContent='Oyun dosyası indirildi.';};
$('importBtn').onclick=()=>$('importFile').click();
$('importFile').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>1000000)throw Error();const data=JSON.parse(await f.text());if(data.format!=='sinif-carkifelek-v1'||!validState(data.state)||!Array.isArray(data.custom)||data.custom.length>1000||!data.custom.every(validQuestion))throw Error();ask('Oyun dosyası yüklensin mi?','Bu tarayıcıdaki puanlar ve özel sorular, seçtiğiniz dosyayla değiştirilecek.',()=>{state=data.state;state.spinning=false;custom=data.custom;filter=typeof data.filter==='string'?data.filter:'';history=[];populateCourses();if(!state.q)newRound();else render();$('settingsDialog').close();});}catch{$('settingsStatus').textContent='Dosya okunamadı. Bu oyundan dışa aktarılmış geçerli bir JSON dosyası seçin.';}e.target.value='';};
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey||e.repeat)return;if(e.key.length!==1)return;const letter=GameCore.upper(e.key,state.q.course);const button=[...$('keyboard').children].find(b=>b.textContent===letter);if(button&&!button.disabled){e.preventDefault();chooseLetter(letter);}});
let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>board(),80);});
}
