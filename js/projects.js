'use strict';const PROJECTS=[{id:'proj-1',type:'game',title:'Dungka Mini Game',description:'A fast-paced 60-second challenge where you click on crabs to score points while carefully avoiding the SB19 members!',thumb:'assets/dungka_logo.png',thumbEmoji:'🎮',url:'https://lolomaku.art/dungka',status:'live',},{id:'proj-2',type:'app',title:"A'TINTAAN",description:"A digital coloring book filled with lineworks of SB19 members made by your fellow A'TIN.",thumb:'assets/atintaan_logo.png',thumbEmoji:'🎨',url:'https://lolomaku.art/atintaan',status:'live',},];function createProjectCard(project){const isComingSoon=project.status==='coming-soon';const badgeClass=project.type==='game'?'badge-game':'badge-app';const badgeLabel=project.type==='game'?'Game':'Web App';const card=document.createElement('article');card.className='project-card';card.setAttribute('data-type',project.type);if(isComingSoon)card.setAttribute('aria-disabled','true');const thumbHtml=project.thumb?`<img src="${project.thumb}" alt="${project.title}" loading="lazy" width="400" height="250">`:`<span class="project-card-thumb-icon" aria-hidden="true">${project.thumbEmoji}</span>`;card.innerHTML=`
    <div class="project-card-thumb ${project.thumb ? '' : 'no-image'}">
      ${thumbHtml}
    </div>
    <div class="project-card-arrow" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div class="project-card-body">
      <div class="project-card-meta">
        <span class="badge ${badgeClass}">${badgeLabel}</span>
        ${isComingSoon ? '<span class="badge badge-paid">Soon</span>' : ''}
      </div>
      <h3 class="project-card-title">${project.title}</h3>
      <p class="project-card-desc">${project.description}</p>
    </div>
  `;if(!isComingSoon){card.addEventListener('click',()=>{if(project.url&&project.url!=='#')window.open(project.url,'_blank','noopener');});card.style.cursor='pointer'}else{card.style.opacity='0.6';card.style.cursor='default'}
return card}
let activeProjectFilter='all';function renderProjects(){const grid=document.getElementById('projects-grid');if(!grid)return;const filtered=activeProjectFilter==='all'?PROJECTS:PROJECTS.filter(p=>p.type===activeProjectFilter);grid.innerHTML='';if(!filtered.length){grid.innerHTML='<div class="state-empty"><div class="state-empty-emoji">🔍</div><h3>Nothing here yet</h3><p>Check back soon!</p></div>';return}
filtered.forEach((project,i)=>{const card=createProjectCard(project);card.style.animationDelay=`${i * 60}ms`;grid.appendChild(card)})}
function initProjectFilters(){const btns=document.querySelectorAll('[data-project-filter]');btns.forEach(btn=>{btn.addEventListener('click',()=>{btns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');activeProjectFilter=btn.getAttribute('data-project-filter');renderProjects()})})}
document.addEventListener('DOMContentLoaded',()=>{renderProjects();initProjectFilters()})