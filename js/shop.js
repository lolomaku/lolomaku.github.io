'use strict';const SHOP_CONFIG={csvUrl:'https://docs.google.com/spreadsheets/d/e/2PACX-1vSPPY-VhogzYF0HE_B5X7cOcTlYqg05PggpyARwDLXSeAiLg14vaAxfqEd7UIPjIwTCC_dE0RnJRbVV/pub?gid=0&single=true&output=csv',itemsPerPage:12,gcashFormUrl:'https://docs.google.com/forms/d/e/1FAIpQLSceOCVJ3DaZ1tnzecv_0rkVJlK85qrcDULjzz5Fx-EoHqbODQ/viewform?usp=pp_url&entry.1343575495={ID}&entry.1470546329={METHOD}',};const shopState={allItems:[],filteredItems:[],currentPage:1,activeFilter:'all',searchQuery:'',isLoading:!1,fetchError:!1,};function getPriceType(raw){const p=(raw||'').trim().toLowerCase();if(p==='free')return'free';if(p==='pay any amount')return'pay-any';return'paid'}
function getPriceLabel(raw){const type=getPriceType(raw);if(type==='free')return'Free';if(type==='pay-any')return'Pay Any Amount';return(raw||'—').trim()}
function getPriceBadge(priceType,priceLabel){switch(priceType){case 'free':return{badgeClass:'badge-free',badgeLabel:'Free'};case 'pay-any':return{badgeClass:'badge-pay-any',badgeLabel:'Pay Any'};default:return{badgeClass:'badge-priced',badgeLabel:priceLabel}}}
function parseCSV(text){const rows=[];const lines=text.split(/\r?\n/);const headers=splitCSVRow(lines[0]);for(let i=1;i<lines.length;i++){const line=lines[i].trim();if(!line)continue;const values=splitCSVRow(line);if(values.length<headers.length)continue;const obj={};headers.forEach((h,idx)=>{obj[h.trim()]=(values[idx]||'').trim()});rows.push(obj)}
return rows}
function splitCSVRow(line){const result=[];let cur='';let inQuotes=!1;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(inQuotes&&line[i+1]==='"'){cur+='"';i++}else inQuotes=!inQuotes}else if(ch===','&&!inQuotes){result.push(cur);cur=''}else{cur+=ch}}
result.push(cur);return result}
async function fetchShopItems(){if(shopState.isLoading)return;shopState.isLoading=!0;renderShopGrid();try{const url=`${SHOP_CONFIG.csvUrl}&_=${Date.now()}`;const resp=await fetch(url,{cache:'no-store'});if(!resp.ok)throw new Error(`HTTP ${resp.status}`);const text=await resp.text();shopState.allItems=parseCSV(text);shopState.fetchError=!1}catch(err){console.error('[Shop] Fetch error:',err);shopState.fetchError=!0}finally{shopState.isLoading=!1;applyFilters()}}
function applyFilters(){const q=shopState.searchQuery.toLowerCase().trim();const filter=shopState.activeFilter;shopState.filteredItems=shopState.allItems.filter(item=>{const matchesFilter=filter==='all'||(item.Type||'').toLowerCase()===filter;const matchesSearch=!q||(item.Title||'').toLowerCase().includes(q)||(item.Tags||'').toLowerCase().includes(q)||(item.ID||'').toLowerCase().includes(q)||(item.Artist||'').toLowerCase().includes(q);return matchesFilter&&matchesSearch});shopState.currentPage=1;renderShopGrid();renderPagination()}
function getPageItems(){const start=(shopState.currentPage-1)*SHOP_CONFIG.itemsPerPage;const end=start+SHOP_CONFIG.itemsPerPage;return shopState.filteredItems.slice(start,end)}
function totalPages(){return Math.max(1,Math.ceil(shopState.filteredItems.length/SHOP_CONFIG.itemsPerPage))}
function renderShopGrid(){const grid=document.getElementById('shop-grid');if(!grid)return;grid.innerHTML='';if(shopState.isLoading){for(let i=0;i<SHOP_CONFIG.itemsPerPage;i++){const sk=document.createElement('div');sk.innerHTML=`
           <div class="skeleton" style="aspect-ratio:1;border-radius:var(--radius-lg);"></div>
           <div style="padding:0.85rem 0">
             <div class="skeleton" style="height:14px;width:70%;margin-bottom:8px;border-radius:4px;"></div>
             <div class="skeleton" style="height:12px;width:40%;border-radius:4px;"></div>
           </div>
         `;grid.appendChild(sk)}
return}
if(shopState.fetchError){grid.innerHTML=`
         <div class="state-empty" style="grid-column:1/-1">
           <div class="state-empty-emoji">⚠️</div>
           <h3>Couldn't load the shop</h3>
           <p>Check your connection and <button onclick="fetchShopItems()" style="color:var(--color-accent);background:none;border:none;cursor:pointer;font-weight:700;">try again</button>.</p>
         </div>`;return}
const items=getPageItems();if(!items.length){grid.innerHTML=`
         <div class="state-empty" style="grid-column:1/-1">
           <div class="state-empty-emoji">🔍</div>
           <h3>No results</h3>
           <p>Try a different search or filter.</p>
         </div>`;return}
items.forEach((item,i)=>{const card=createShopCard(item);card.style.animationDelay=`${i * 40}ms`;grid.appendChild(card)})}
function createShopCard(item){const priceType=getPriceType(item.Price);const priceLabel=getPriceLabel(item.Price);const card=document.createElement('article');card.className='shop-card';card.setAttribute('role','button');card.setAttribute('tabindex','0');card.setAttribute('aria-label',`Open ${item.Title}`);const imgHtml=item.Image?`<img src="${item.Image}" alt="${item.Title || ''}" loading="lazy" width="300" height="300">`:`<span aria-hidden="true">🖼️</span>`;const{badgeClass,badgeLabel}=getPriceBadge(priceType,priceLabel);card.innerHTML=`
       <div class="shop-card-thumb ${item.Image ? '' : 'no-image'}">
         ${imgHtml}
       </div>
       <div class="shop-card-badge-wrap">
         <span class="badge ${badgeClass}">${badgeLabel}</span>
       </div>
       <div class="shop-card-body">
         <div class="shop-card-title">${item.Title || 'Untitled'}</div>
         <div class="shop-card-footer">
           <span class="shop-card-price">${priceLabel}</span>
         </div>
       </div>
     `;const openModal=()=>openShopModal(item);card.addEventListener('click',openModal);card.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal()}});return card}
function renderPagination(){const container=document.getElementById('shop-pagination');if(!container)return;container.innerHTML='';const total=totalPages();if(total<=1)return;const cur=shopState.currentPage;function btn(label,page,disabled=!1,isActive=!1){const b=document.createElement('button');b.className='pagination-btn'+(isActive?' active':'');b.textContent=label;b.disabled=disabled;if(!disabled&&!isActive){b.addEventListener('click',()=>{shopState.currentPage=page;renderShopGrid();renderPagination();document.getElementById('shop')?.scrollIntoView({behavior:'smooth',block:'start'})})}
return b}
function ellipsis(){const sp=document.createElement('span');sp.className='pagination-ellipsis';sp.textContent='…';return sp}
container.appendChild(btn('←',cur-1,cur===1));const pages=buildPageRange(cur,total);pages.forEach(p=>{if(p==='…')container.appendChild(ellipsis());else container.appendChild(btn(p,p,!1,p===cur))});container.appendChild(btn('→',cur+1,cur===total))}
function buildPageRange(cur,total){if(total<=7)return Array.from({length:total},(_,i)=>i+1);const pages=[];pages.push(1);if(cur>3)pages.push('…');for(let p=Math.max(2,cur-1);p<=Math.min(total-1,cur+1);p++){pages.push(p)}
if(cur<total-2)pages.push('…');pages.push(total);return pages}
let currentModalItem=null;let _modalCloseTimer=null;function openShopModal(item){if(_modalCloseTimer){clearTimeout(_modalCloseTimer);_modalCloseTimer=null}
currentModalItem=item;const overlay=document.getElementById('shop-modal-overlay');if(!overlay)return;const priceType=getPriceType(item.Price);const priceLabel=getPriceLabel(item.Price);const isFree=priceType==='free';const setEl=(id,val,prop='textContent')=>{const el=overlay.querySelector(`[data-modal="${id}"]`);if(el)el[prop]=val};setEl('title',item.Title||'Untitled');setEl('id',item.ID||'');setEl('desc',item.Description||'No description available.');setEl('price',priceLabel);const priceEl=overlay.querySelector('[data-modal="price"]');if(priceEl){priceEl.className='modal-price'+(priceType==='free'?' free':'')+(priceType==='pay-any'?' pay-any':'')}
const imgEl=overlay.querySelector('[data-modal="image"]');const imgWrap=overlay.querySelector('.modal-image-wrap');if(imgEl){if(item.Image){imgEl.src=item.Image;imgEl.alt=item.Title||'';imgEl.style.display='';if(imgWrap)imgWrap.style.display=''}else{imgEl.style.display='none';if(imgWrap)imgWrap.style.display='none'}}
const badgeEl=overlay.querySelector('[data-modal="badge"]');if(badgeEl){const{badgeClass,badgeLabel}=getPriceBadge(priceType,priceLabel);badgeEl.textContent=badgeLabel;badgeEl.className='badge '+badgeClass}
const show=(id,visible)=>{const el=overlay.querySelector(`[data-action="${id}"]`);if(el)el.style.display=visible?'':'none'};show('gcash',priceType!=='free'&&!!item.Gcash);show('maya',priceType!=='free'&&!!item.Maya);show('bmc',priceType!=='free'&&!!item.BuyMeACoffee);show('gdrive',priceType==='free'&&!!item.GDrive);overlay.querySelectorAll('.qr-panel').forEach(p=>p.classList.remove('visible'));const copyBtn=overlay.querySelector('[data-action="copy-id"]');if(copyBtn){copyBtn.onclick=()=>navigator.clipboard.writeText(item.ID||'').then(()=>showToast('ID copied!'))}
const shareBtn=overlay.querySelector('[data-action="share"]');if(shareBtn){shareBtn.onclick=()=>{const url=`${location.origin}${location.pathname}?item=${item.ID}`;navigator.clipboard.writeText(url).then(()=>showToast('Link copied!'))}}
overlay.classList.remove('closing');requestAnimationFrame(()=>{requestAnimationFrame(()=>{overlay.classList.add('open');document.body.style.overflow='hidden'})});const params=new URLSearchParams(location.search);if(params.get('item')!==item.ID){history.replaceState(null,'',`?item=${item.ID}`)}}
function closeShopModal(){const overlay=document.getElementById('shop-modal-overlay');if(!overlay||!overlay.classList.contains('open'))return;overlay.classList.add('closing');_modalCloseTimer=setTimeout(()=>{overlay.classList.remove('open','closing');document.body.style.overflow='';history.replaceState(null,'',location.pathname);currentModalItem=null;_modalCloseTimer=null},220)}
function handleGcash(){const item=currentModalItem;if(!item?.Gcash)return;const qrPanel=document.getElementById('gcash-qr-panel');const mayaPanel=document.getElementById('maya-qr-panel');if(!qrPanel)return;const isOpen=qrPanel.classList.contains('visible');if(mayaPanel)mayaPanel.classList.remove('visible');qrPanel.classList.toggle('visible',!isOpen);if(!isOpen&&item.Gcash){const img=document.getElementById('gcash-qr-img');if(img)img.src=item.Gcash}}
function handleMaya(){const item=currentModalItem;if(!item?.Maya)return;const qrPanel=document.getElementById('maya-qr-panel');const gcashPanel=document.getElementById('gcash-qr-panel');if(!qrPanel)return;const isOpen=qrPanel.classList.contains('visible');if(gcashPanel)gcashPanel.classList.remove('visible');qrPanel.classList.toggle('visible',!isOpen);if(!isOpen&&item.Maya){const img=document.getElementById('maya-qr-img');if(img)img.src=item.Maya}}
function handleBMC(){const item=currentModalItem;if(item?.BuyMeACoffee)window.open(item.BuyMeACoffee,'_blank','noopener');}
function handleGDrive(){const item=currentModalItem;if(item?.GDrive)window.open(item.GDrive,'_blank','noopener');}
function handleProceed(method){const item=currentModalItem;if(!item)return;const url=SHOP_CONFIG.gcashFormUrl.replace('{ID}',(item.ID||'').toUpperCase()).replace('{METHOD}',method.toUpperCase());window.open(url,'_blank','noopener')}
function downloadQR(imgId,filename){const img=document.getElementById(imgId);if(!img?.src)return;const a=document.createElement('a');a.href=img.src;a.download=filename;a.target='_blank';document.body.appendChild(a);a.click();document.body.removeChild(a)}
function shareOnX(){const item=currentModalItem;if(!item)return;const url=`${location.origin}${location.pathname}?item=${item.ID}`;const text=`Check out "${item.Title}" on lolomaku.art!`;window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,'_blank','noopener')}
function shareOnFacebook(){const item=currentModalItem;if(!item)return;const url=`${location.origin}${location.pathname}?item=${item.ID}`;window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank','noopener')}
function initShop(){const searchInput=document.getElementById('shop-search-input');if(searchInput){let debounceTimer;searchInput.addEventListener('input',()=>{clearTimeout(debounceTimer);debounceTimer=setTimeout(()=>{shopState.searchQuery=searchInput.value;applyFilters()},280)})}
const filterBtns=document.querySelectorAll('[data-shop-filter]');filterBtns.forEach(btn=>{btn.addEventListener('click',()=>{filterBtns.forEach(b=>b.classList.remove('active'));btn.classList.add('active');shopState.activeFilter=btn.getAttribute('data-shop-filter');applyFilters()})});const overlay=document.getElementById('shop-modal-overlay');if(overlay){overlay.addEventListener('click',(e)=>{if(e.target===overlay)closeShopModal();});overlay.querySelector('[data-action="close"]')?.addEventListener('click',closeShopModal);overlay.querySelector('[data-action="gcash"]')?.addEventListener('click',handleGcash);overlay.querySelector('[data-action="maya"]')?.addEventListener('click',handleMaya);overlay.querySelector('[data-action="bmc"]')?.addEventListener('click',handleBMC);overlay.querySelector('[data-action="gdrive"]')?.addEventListener('click',handleGDrive);overlay.querySelector('[data-action="proceed-gcash"]')?.addEventListener('click',()=>handleProceed('gcash'));overlay.querySelector('[data-action="proceed-maya"]')?.addEventListener('click',()=>handleProceed('maya'));overlay.querySelector('[data-action="dl-gcash"]')?.addEventListener('click',()=>downloadQR('gcash-qr-img','gcash-qr.png'));overlay.querySelector('[data-action="dl-maya"]')?.addEventListener('click',()=>downloadQR('maya-qr-img','maya-qr.png'));overlay.querySelector('[data-action="share-x"]')?.addEventListener('click',shareOnX);overlay.querySelector('[data-action="share-fb"]')?.addEventListener('click',shareOnFacebook)}
document.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeShopModal();});const itemId=new URLSearchParams(location.search).get('item');fetchShopItems().then(()=>{if(itemId){const item=shopState.allItems.find(i=>i.ID===itemId);if(item)openShopModal(item);}})}
document.addEventListener('DOMContentLoaded',initShop)