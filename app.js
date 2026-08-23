if(window.SPRITE_B64)document.documentElement.style.setProperty('--product-sprite',`url(data:image/webp;base64,${window.SPRITE_B64})`);
if(window.CAMPAIGN_B64)document.documentElement.style.setProperty('--campaign',`url(data:image/webp;base64,${window.CAMPAIGN_B64})`);

let genderFilter='all', typeFilter='all', sortMode='featured', cart=JSON.parse(localStorage.getItem('nhanBagV3')||'[]');
let currentProduct=null,currentColor=0,currentSize='M';

const fmt=n=>new Intl.NumberFormat('vi-VN').format(n)+'₫';
const pos=(row,col)=>`${col*50}% ${(row*(100/17)).toFixed(5)}%`;
const shotStyle=(p,color)=>`background-position:${pos(p.row,color)}`;

function getFiltered(){
 let list=PRODUCTS.filter(p=>(genderFilter==='all'||p.category===genderFilter)&&(typeFilter==='all'||p.type===typeFilter));
 if(sortMode==='price-low')list.sort((a,b)=>a.price-b.price);
 if(sortMode==='price-high')list.sort((a,b)=>b.price-a.price);
 if(sortMode==='name')list.sort((a,b)=>a.name.localeCompare(b.name,'vi'));
 return list;
}
function renderProducts(){
 const grid=document.getElementById('productGrid'),list=getFiltered();
 document.getElementById('resultCount').textContent=`${list.length} product${list.length===1?'':'s'}`;
 grid.innerHTML='';
 list.forEach(p=>{
   const card=document.createElement('article');card.className='product-card';
   card.innerHTML=`<div class="product-media">
     <div class="product-shot" role="img" aria-label="${p.name}" style="${shotStyle(p,0)}"></div>
     ${p.tag?`<span class="product-tag">${p.tag}</span>`:''}
     <button class="quick-view" type="button">QUICK VIEW</button>
   </div>
   <div class="product-info">
     <div class="product-top"><span class="product-name">${p.name}</span><span class="product-price">${fmt(p.price)}</span></div>
     <div class="product-meta">${p.category.toUpperCase()} · ${p.type.toUpperCase()} · 100% LINEN</div>
     <div class="swatches">${p.colors.map((c,i)=>`<button class="swatch ${i===0?'active':''}" data-color="${i}" title="${c[0]}" aria-label="${c[0]}" style="background:${c[1]}"></button>`).join('')}</div>
   </div>`;
   const shot=card.querySelector('.product-shot');
   card.querySelector('.product-media').addEventListener('click',e=>{if(!e.target.classList.contains('quick-view'))openProduct(p.id)});
   card.querySelector('.quick-view').addEventListener('click',e=>{e.stopPropagation();openProduct(p.id)});
   card.querySelectorAll('.swatch').forEach(btn=>btn.addEventListener('click',()=>{
     const ci=+btn.dataset.color;shot.style.backgroundPosition=pos(p.row,ci);
     card.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));btn.classList.add('active');
   }));
   grid.appendChild(card);
 });
}
function setGender(f){
 genderFilter=f;
 document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===f));
 renderProducts();
}
function setType(t){
 typeFilter=t;
 document.querySelectorAll('.type-filter').forEach(b=>b.classList.toggle('active',b.dataset.type===t));
 renderProducts();
}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>setGender(b.dataset.filter)));
document.querySelectorAll('.type-filter').forEach(b=>b.addEventListener('click',()=>setType(b.dataset.type)));
document.getElementById('sortSelect').addEventListener('change',e=>{sortMode=e.target.value;renderProducts()});
document.getElementById('resetFilters').addEventListener('click',()=>{genderFilter='all';typeFilter='all';sortMode='featured';document.getElementById('sortSelect').value='featured';setGender('all');setType('all')});
document.querySelectorAll('[data-category-go]').forEach(b=>b.addEventListener('click',()=>{setGender(b.dataset.categoryGo);document.getElementById('shop').scrollIntoView({behavior:'smooth'})}));
document.querySelectorAll('[data-nav-filter]').forEach(a=>a.addEventListener('click',()=>setGender(a.dataset.navFilter)));
document.querySelectorAll('[data-mobile-filter]').forEach(a=>a.addEventListener('click',()=>{setGender(a.dataset.mobileFilter);closeMenu()}));

function renderProductModal(){
 const p=currentProduct,c=p.colors[currentColor];
 document.getElementById('productModalContent').innerHTML=`<div class="product-detail">
   <div class="detail-media"><div class="detail-shot" role="img" aria-label="${p.name} in ${c[0]}" style="${shotStyle(p,currentColor)}"></div></div>
   <div class="detail-copy">
     <p>${p.category.toUpperCase()} / ${p.type.toUpperCase()} / ${p.tag||'NHÀN'}</p>
     <h2>${p.name}</h2><div class="detail-price">${fmt(p.price)}</div>
     <div class="detail-desc">${p.desc}</div>
     <div class="option"><label>COLOUR — ${c[0].toUpperCase()}</label><div class="swatches">${p.colors.map((x,i)=>`<button class="swatch modal-color ${i===currentColor?'active':''}" data-ci="${i}" title="${x[0]}" style="background:${x[1]}"></button>`).join('')}</div></div>
     <div class="option"><label>SIZE — ${currentSize}</label><div class="sizes">${['XS','S','M','L','XL'].map(s=>`<button class="size ${s===currentSize?'active':''}" data-size="${s}">${s}</button>`).join('')}</div></div>
     <button class="add-bag" id="addBag">ADD TO BAG — ${fmt(p.price)}</button>
     <div class="detail-notes"><span>100% linen</span><span>Designed in Vietnam</span><span>Gentle cold wash</span></div>
   </div></div>`;
 document.querySelectorAll('.modal-color').forEach(b=>b.addEventListener('click',()=>{currentColor=+b.dataset.ci;renderProductModal()}));
 document.querySelectorAll('.size').forEach(b=>b.addEventListener('click',()=>{currentSize=b.dataset.size;renderProductModal()}));
 document.getElementById('addBag').addEventListener('click',addToBag);
}
function openProduct(id){
 currentProduct=PRODUCTS.find(p=>p.id===id);currentColor=0;currentSize='M';renderProductModal();
 document.getElementById('productModal').classList.add('open');document.getElementById('productModal').setAttribute('aria-hidden','false');
 document.getElementById('pageOverlay').classList.add('show');
}
function closeProduct(){
 document.getElementById('productModal').classList.remove('open');document.getElementById('productModal').setAttribute('aria-hidden','true');
 if(!document.getElementById('bagDrawer').classList.contains('open'))document.getElementById('pageOverlay').classList.remove('show');
}
document.getElementById('closeProduct').addEventListener('click',closeProduct);

function addToBag(){
 cart.push({id:currentProduct.id,color:currentColor,size:currentSize});saveBag();closeProduct();openBag();
}
function saveBag(){localStorage.setItem('nhanBagV3',JSON.stringify(cart));renderBag()}
function renderBag(){
 document.getElementById('bagCount').textContent=cart.length;let total=0;
 const el=document.getElementById('bagItems');
 if(!cart.length)el.innerHTML='<p style="color:#777;padding:20px 0">Your bag is quiet for now.</p>';
 else el.innerHTML=cart.map((it,i)=>{const p=PRODUCTS.find(x=>x.id===it.id),c=p.colors[it.color];total+=p.price;return `<div class="bag-row">
   <div class="bag-thumb"><div class="product-shot" style="${shotStyle(p,it.color)}"></div></div>
   <div><b>${p.name}</b><small>${c[0]} · ${it.size}</small><small>${fmt(p.price)}</small></div>
   <button type="button" data-remove="${i}">×</button></div>`}).join('');
 document.getElementById('bagTotal').textContent=fmt(total);
 el.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{cart.splice(+b.dataset.remove,1);saveBag()}));
}
function openBag(){renderBag();document.getElementById('bagDrawer').classList.add('open');document.getElementById('pageOverlay').classList.add('show')}
function closeBag(){document.getElementById('bagDrawer').classList.remove('open');if(!document.getElementById('productModal').classList.contains('open'))document.getElementById('pageOverlay').classList.remove('show')}
document.getElementById('bagBtn').addEventListener('click',openBag);document.getElementById('closeBag').addEventListener('click',closeBag);
document.getElementById('pageOverlay').addEventListener('click',()=>{closeBag();closeProduct()});

function openMenu(){document.getElementById('mobileMenu').classList.add('open')}
function closeMenu(){document.getElementById('mobileMenu').classList.remove('open')}
document.getElementById('menuBtn').addEventListener('click',openMenu);document.getElementById('closeMenu').addEventListener('click',closeMenu);
document.querySelectorAll('#mobileMenu a').forEach(a=>a.addEventListener('click',closeMenu));

document.getElementById('searchBtn').addEventListener('click',()=>{
 const q=(prompt('Search NHÀN products')||'').trim().toLowerCase();if(!q)return;
 const p=PRODUCTS.find(x=>x.name.toLowerCase().includes(q)||x.type.toLowerCase().includes(q)||x.category.includes(q));
 if(p)openProduct(p.id);else alert('No product found. Try: shirt, pants, dress, men, women, unisex.');
});
document.getElementById('accountBtn').addEventListener('click',()=>alert('Account area is a demo in this concept storefront.'));
document.getElementById('newsletterForm').addEventListener('submit',e=>{e.preventDefault();e.currentTarget.innerHTML='<span style="padding:14px">Thank you — welcome to NHÀN.</span>'});

renderProducts();renderBag();
