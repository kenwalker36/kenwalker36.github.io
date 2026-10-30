(() => {
  const data = window.siteContent;
  const main = document.querySelector('main');
  const dialog = document.querySelector('#reader');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let slide = 0;
  let workFilter = '全部';
  const slides = [
    {kicker:'A SMALL PLACE. AN OPEN MIND.',headline:'STAY<br><span>CURIOUS.</span>',caption:'把想法变成作品，把日常写成故事。',post:data.posts[0]},
    {kicker:'FROM AN IDEA TO SOMETHING REAL.',headline:'KEEP<br><span>MAKING.</span>',caption:'从草稿开始，慢慢找到自己的表达。',post:data.posts[1]},
    {kicker:'ORDINARY DAYS. EXTRAORDINARY DETAILS.',headline:'LOOK<br><span>CLOSER.</span>',caption:'那些值得停下来多看一眼的瞬间。',post:data.posts[2]}
  ];
  document.querySelector('.profile strong').textContent = data.name;
  document.querySelector('footer span').textContent = `© 2026 ${data.name} · 保持好奇，持续创造。`;
  document.querySelector('#categories').innerHTML = [...new Set(data.posts.map(p=>p.category))].map(c=>`<a class="category" href="#category/${encodeURIComponent(c)}">${escape(c)} <span>${String(data.posts.filter(p=>p.category===c).length).padStart(2,'0')}</span></a>`).join('');
  const heading = (title,en,desc) => `<div class="page-heading"><h1>${escape(title)}<span>${en}</span></h1><p>${escape(desc)}</p></div>`;
  const panelTitle = (title,en,link='') => `<div class="panel-title"><span>${title}<small>${en}</small></span>${link}</div>`;
  const art = w=>`<div class="art ${escape(w.art)}"><span>${escape(w.label).replace(' / ','<br>')}</span><small>PERSONAL PROJECT · ${escape(w.year)}</small></div>`;
  const works = list=>`<div class="work-grid">${list.map(w=>`<a class="work-card" href="#work/${encodeURIComponent(w.id)}">${art(w)}<h3>${escape(w.title)}</h3><p>${escape(w.type)} / ${escape(w.year)}</p></a>`).join('')}</div>`;
  const rows = list=> list.length ? list.map(p=>`<article class="list-row"><div class="date-box"><strong>${escape(p.date.slice(8))}</strong><span>${escape(p.date.slice(0,7).replace('-','.'))}</span></div><div><div class="list-meta"><span>${escape(p.category)}</span>BY ${escape(data.name)}</div><h3><a href="#post/${encodeURIComponent(p.id)}">${escape(p.title)}</a></h3><p>${escape(p.summary)}</p></div></article>`).join('') : '<p class="empty">没有找到相关内容，换个关键词试试。</p>';
  function hero() {const s=slides[slide];return `<section class="hero"><div class="hero-art"><div class="hero-kicker">${s.kicker}</div><div class="orb" aria-hidden="true"></div><h1>${s.headline}</h1><div class="hero-caption">${s.caption}</div><div class="hero-controls" aria-label="精选轮播">${slides.map((_,i)=>`<button class="${i===slide?'selected':''}" data-slide="${i}" aria-label="查看第 ${i+1} 条精选" aria-pressed="${i===slide}">0${i+1}</button>`).join('')}</div><div class="hero-index">PERSONAL ARCHIVE / 2026</div></div><div class="hero-copy"><span class="eyebrow">FEATURED JOURNAL / 精选记录</span><h2><a href="#post/${s.post.id}">${escape(s.post.title)}</a></h2><p>${escape(s.post.summary)}</p><div class="hero-bottom"><span>POSTED ${escape(s.post.date.replaceAll('-','.'))} · 示例内容</span><a href="#post/${s.post.id}">阅读全文 ↗</a></div></div></section>`;}
  function openReader(kind,id) {
    const entry=(kind==='post'?data.posts:data.works).find(p=>p.id===id);
    if(!entry){main.innerHTML=heading('页面不存在','404','这篇内容可能已经搬家。')+'<a href="#home">返回首页 →</a>';return;}
    let html=`<span class="eyebrow">${kind==='post'?escape(entry.category)+' / '+escape(entry.date):escape(entry.type)+' / '+escape(entry.year)}</span><h1 id="reader-title">${escape(entry.title)}</h1>`;
    if(kind==='post') html+=entry.body.map(p=>`<p>${escape(p)}</p>`).join('');
    else {html+=art(entry)+`<p>${escape(entry.description)}</p>`;if(/^https?:\/\//i.test(entry.url))html+=`<a class="external" target="_blank" rel="noopener noreferrer" href="${escape(entry.url)}">查看项目 ↗</a>`;}
    document.querySelector('#reader-content').innerHTML=html;
    if(!dialog.open)dialog.showModal();
    dialog.scrollTop=0;
  }
  let lastPage='#home';
  function render(){
    const hash=location.hash||'#home';
    if(hash.startsWith('#post/')||hash.startsWith('#work/')) {if(!main.innerHTML)renderHome();openReader(hash.slice(1).split('/')[0],decodeURIComponent(hash.split('/').slice(1).join('/')));return;}
    if(dialog.open)dialog.close();
    lastPage=hash;
    const route=hash.slice(1).split('/')[0];
    const active=route==='category'||route==='search'?'blog':route;
    document.querySelectorAll('[data-nav]').forEach(a=>{a.classList.toggle('active',a.dataset.nav===active);if(a.dataset.nav===active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    if(route==='home'||!route){renderHome();}
    else if(route==='blog'||route==='category'||route==='search'){
      const q=decodeURIComponent(hash.split('/').slice(1).join('/'));
      let list=data.posts;
      if(route==='category')list=list.filter(p=>p.category===q);
      if(route==='search')list=list.filter(p=>[p.title,p.summary,p.category,...p.body].join(' ').toLowerCase().includes(q.toLowerCase()));
      main.innerHTML=heading(route==='search'?`搜索：${q}`:route==='category'?q:'文章归档','JOURNAL',`${list.length} 篇记录 · 在日常里保存一些想法。`)+`<section class="panel">${panelTitle('文章列表','ALL ENTRIES')}${rows(list)}</section>`;
      if(route==='search'){const found=data.works.filter(w=>[w.title,w.type,w.description].join(' ').toLowerCase().includes(q.toLowerCase()));if(found.length)main.innerHTML+=`<section class="panel">${panelTitle('相关作品','WORKS')}${works(found)}</section>`;}
    }else if(route==='works'){
      const types=['全部',...new Set(data.works.map(w=>w.type))];
      main.innerHTML=heading('作品档案','SELECTED WORKS','想法、实验，以及一些认真完成的东西。')+`<section class="panel">${panelTitle('作品展示','PORTFOLIO')}<div class="filter-bar" aria-label="作品类型">${types.map(t=>`<button data-filter="${escape(t)}" class="${t===workFilter?'selected':''}" aria-pressed="${t===workFilter}">${escape(t)}</button>`).join('')}</div>${works(data.works.filter(w=>workFilter==='全部'||w.type===workFilter))}</section>`;
    }else if(route==='about'){
      main.innerHTML=heading('关于站长','ABOUT ME','一个人，一些兴趣，还有一间互联网小屋。')+`<section class="panel">${panelTitle('你好，很高兴认识你','HELLO THERE')}<div class="about-copy"><div class="big-label">SMALL SITE.<br><span>BIG CURIOSITY.</span></div><h2>我是 ${escape(data.name)}。</h2><p>${escape(data.bio)}</p>${data.about.map(p=>`<p>${escape(p)}</p>`).join('')}${data.email?`<p>联系我：<a href="mailto:${escape(data.email)}">${escape(data.email)}</a></p>`:''}<div class="notice">这是个人网站原型，资料和项目均为示例。<br>替换成自己的内容后，这里就会成为你的网上据点。</div></div></section>`;
    }else{main.innerHTML=heading('页面不存在','404','回到首页，重新出发。')+'<a href="#home">返回首页 →</a>';}
    document.title=`${route==='home'?'首页':route==='works'?'作品':route==='about'?'关于':'文章'} · MYSPACE`;
  }
  function renderHome(){main.innerHTML=hero()+`<section class="panel">${panelTitle('精选作品','SELECTED WORKS','<a href="#works">ALL WORKS &gt;</a>')}${works(data.works)}</section><section class="panel">${panelTitle('最近更新','LATEST ENTRIES','<a href="#blog">ARCHIVE &gt;</a>')}${rows(data.posts)}</section>`;}
  main.addEventListener('click',e=>{const s=e.target.closest('[data-slide]');if(s){slide=Number(s.dataset.slide);const wrapper=document.createElement('div');wrapper.innerHTML=hero();main.querySelector('.hero').replaceWith(wrapper.firstElementChild);}const f=e.target.closest('[data-filter]');if(f){workFilter=f.dataset.filter;render();}});
  function close(){if(dialog.open)dialog.close();location.hash=lastPage;}
  document.querySelector('#close-reader').addEventListener('click',close);
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}});
  document.querySelector('.search').addEventListener('submit',e=>{e.preventDefault();const q=document.querySelector('#search').value.trim();if(q)location.hash='#search/'+encodeURIComponent(q);else location.hash='#blog';});
  document.querySelector('#to-top').addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
  window.addEventListener('hashchange',render);
  render();
})();
