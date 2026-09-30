(function(){
const lessons=window.lessons||[];
const chapters=document.getElementById('chapters');
const nav=document.getElementById('chapter-nav');
function readArray(key){try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:[]}catch(e){return []}}
function store(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}}
function showToast(message){const toast=document.getElementById('toast');toast.textContent=message;toast.classList.add('show');window.setTimeout(function(){toast.classList.remove('show')},1900)}
const saved=readArray('elektro-learned');
lessons.forEach(function(lesson){
  nav.insertAdjacentHTML('beforeend','<a href="#'+lesson.id+'" data-nav="'+lesson.id+'"><span class="nav-num">'+lesson.n+'</span><span>'+lesson.title+'</span></a>');
  let options='';
  lesson.quiz.opts.forEach(function(option,optIndex){
    options+='<label class="quiz-option"><input type="radio" name="quiz-'+lesson.n+'" value="'+optIndex+'"><span>'+option+'</span></label>';
  });
  const completeText=saved.includes(lesson.id)?'✓ Kapitola hotová':'Označit kapitolu jako hotovou';
  const quiz='<section class="quiz" aria-label="Otázka k procvičení"><h3>Teď si to zkus</h3><p>'+lesson.quiz.q+'</p><div class="quiz-options">'+options+'</div><div class="quiz-actions"><button class="quiz-button" type="button">Zkontrolovat odpověď</button><span class="quiz-feedback" aria-live="polite"></span></div></section>';
  chapters.insertAdjacentHTML('beforeend','<article class="chapter" id="'+lesson.id+'" data-chapter="'+lesson.id+'"><header class="chapter-head"><div class="chapter-icon" aria-hidden="true">'+lesson.icon+'</div><div><div class="chapter-tag">Kapitola '+lesson.n+' · '+lesson.tag+'</div><h2>'+lesson.title+'</h2><p class="chapter-sub">'+lesson.lead+'</p></div><span class="read-time">'+lesson.time+'</span></header><div class="chapter-body">'+lesson.body.join('')+quiz+'<button class="complete-button" type="button" aria-pressed="'+(saved.includes(lesson.id)?'true':'false')+'">'+completeText+'</button></div></article>');
});
function updateProgress(){
  const done=readArray('elektro-learned');
  const count=lessons.filter(function(lesson){return done.includes(lesson.id)}).length;
  const percent=Math.round(count/lessons.length*100);
  document.getElementById('progress-text').textContent='Tvůj postup: '+count+' z '+lessons.length+' kapitol';
  document.getElementById('progress-percent').textContent=percent+' %';
  document.getElementById('progress-fill').style.width=percent+'%';
  document.querySelectorAll('#chapter-nav a').forEach(function(link){link.classList.toggle('done',done.includes(link.dataset.nav))});
}
updateProgress();
chapters.addEventListener('click',function(event){
  const quizButton=event.target.closest('.quiz-button');
  if(quizButton){
    const article=quizButton.closest('.chapter');
    const lesson=lessons.find(function(item){return item.id===article.id});
    const selected=article.querySelector('input[name="quiz-'+lesson.n+'"]:checked');
    const feedback=article.querySelector('.quiz-feedback');
    if(!selected){feedback.textContent='Nejdřív vyber jednu odpověď.';feedback.className='quiz-feedback bad';return}
    if(Number(selected.value)===lesson.quiz.ans){feedback.textContent='Správně! '+lesson.quiz.why;feedback.className='quiz-feedback good'}
    else{feedback.textContent='Zkus to ještě jednou. '+lesson.quiz.why;feedback.className='quiz-feedback bad'}
  }
  const completeButton=event.target.closest('.complete-button');
  if(completeButton){
    const id=completeButton.closest('.chapter').id;
    let done=readArray('elektro-learned');
    if(done.includes(id)){done=done.filter(function(item){return item!==id});completeButton.setAttribute('aria-pressed','false');completeButton.textContent='Označit kapitolu jako hotovou'}
    else{done.push(id);completeButton.setAttribute('aria-pressed','true');completeButton.textContent='✓ Kapitola hotová'}
    store('elektro-learned',done);updateProgress();
    showToast(done.includes(id)?'Kapitola přidána do postupu.':'Kapitola odebrána z postupu.');
  }
});
const search=document.getElementById('search');
search.addEventListener('input',function(){
  const query=search.value.trim().toLocaleLowerCase('cs');
  let shown=0;
  document.querySelectorAll('.chapter').forEach(function(article){
    const match=article.innerText.toLocaleLowerCase('cs').includes(query);
    article.hidden=!match;
    if(match)shown++;
    const link=document.querySelector('[data-nav="'+article.id+'"]');
    if(link)link.hidden=!match;
  });
  document.getElementById('no-results').style.display=shown?'none':'block';
});
const voltage=document.getElementById('voltage');
const resistance=document.getElementById('resistance');
function updateLab(){
  const u=Number(voltage.value),r=Number(resistance.value),i=u/r;
  document.getElementById('voltage-label').textContent=u+' V';
  document.getElementById('resistance-label').textContent=r+' Ω';
  document.getElementById('current-result').textContent=(i<1?i.toFixed(3):i.toFixed(2)).replace('.',',')+' A';
}
voltage.addEventListener('input',updateLab);
resistance.addEventListener('input',updateLab);
updateLab();
const themeButton=document.getElementById('theme-toggle');
const themeLabel=document.getElementById('theme-label');
function setTheme(dark){
  document.body.classList.toggle('dark',dark);
  themeLabel.textContent=dark?'Světlý vzhled':'Tmavý vzhled';
  try{localStorage.setItem('elektro-theme',dark?'dark':'light')}catch(e){}
}
let prefersDark=false;
try{prefersDark=localStorage.getItem('elektro-theme')==='dark'}catch(e){}
setTheme(prefersDark);
themeButton.addEventListener('click',function(){setTheme(!document.body.classList.contains('dark'))});
document.getElementById('menu-toggle').addEventListener('click',function(){document.querySelector('.sidebar').scrollIntoView({behavior:'smooth',block:'start'})});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting)document.querySelectorAll('#chapter-nav a').forEach(function(link){link.classList.toggle('active',link.getAttribute('href')==='#'+entry.target.id)});
    });
  },{rootMargin:'-18% 0px -68% 0px'});
  document.querySelectorAll('.chapter').forEach(function(chapter){observer.observe(chapter)});
}
})();