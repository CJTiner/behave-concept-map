'use strict';
const $ = id => document.getElementById(id);
const storageKey = 'behave-concept-map-v1';
let data = structuredClone(window.BEHAVE_CONTENT);
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved?.version === 1 && Array.isArray(saved.nodes) && saved.nodes.length === data.nodes.length && saved.nodes.every((n,i) => n.id === data.nodes[i].id && ['title','chapter','theme','explanation','evidence','citation','interpretation','connectionNote'].every(k=>typeof n[k]==='string'))) data = saved;
} catch (_) { /* Editing remains usable when storage is unavailable. */ }
let selected = data.nodes[1].id, chapter = 'all', theme = 'all', editing = false;
const fields = ['title','chapter','theme','explanation','evidence','citation','interpretation','connectionNote'];
const matches = n => (chapter === 'all' || n.chapter === chapter) && (theme === 'all' || n.theme === theme);
function button(label, action) { const b=document.createElement('button'); b.type='button'; b.textContent=label; b.addEventListener('click',action); return b; }
function choose(id) { selected=id; render(); }
function render() {
  $('chapters').replaceChildren();
  [['all','All chapters'],['1','01 / Chapter 1'],['2','02 / Chapter 2'],['3','03 / Chapter 3']].forEach(([id,label])=>{
    const b=button(label,()=>{chapter=id; filterSelection();}); b.setAttribute('aria-pressed',chapter===id); $('chapters').append(b);
  });
  const themes=[...new Set(data.nodes.map(n=>n.theme))].sort();
  if(theme!=='all'&&!themes.includes(theme)) theme='all';
  $('themes').replaceChildren();
  [['all','All themes'],...themes.map(t=>[t,t])].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;$('themes').append(o);});
  $('themes').value=theme;
  $('hotspots').replaceChildren(); $('node-list').replaceChildren(); $('connections').replaceChildren();
  data.nodes.forEach((n,i)=>{
    const b=button(String(i+1).padStart(2,'0'),()=>choose(n.id));b.className='hotspot'+(matches(n)?'':' dim');b.style.left=n.x/8+'%';b.style.top=n.y/7.6+'%';b.title=n.title;b.setAttribute('aria-label',n.title);b.setAttribute('aria-pressed',selected===n.id);$('hotspots').append(b);
    if(matches(n)) {const l=button('',()=>choose(n.id));const num=document.createElement('small');num.textContent=String(i+1).padStart(2,'0');const text=document.createElement('span');text.textContent=n.title;l.append(num,text);l.setAttribute('aria-pressed',selected===n.id);$('node-list').append(l);}
  });
  data.links.forEach(([a,b])=>{
    const start=data.nodes.find(n=>n.id===a), end=data.nodes.find(n=>n.id===b);if(!start||!end)return;
    const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',`M${start.x} ${start.y} Q${(start.x+end.x)/2+30} ${(start.y+end.y)/2-20} ${end.x} ${end.y}`);p.setAttribute('class','connection'+([a,b].includes(selected)?' active':''));$('connections').append(p);
  });
  $('empty').hidden=data.nodes.some(matches);
  const n=data.nodes.find(n=>n.id===selected);
  $('selection-meta').textContent=`CHAPTER ${n.chapter} / ${n.theme.toUpperCase()}`;
  $('selection-title').textContent=n.title;
  ['explanation','evidence','citation','interpretation'].forEach(k=>$(k).textContent=n[k]);
  $('connection-note').textContent=n.connectionNote;
  $('related').replaceChildren();
  data.links.filter(l=>l.includes(selected)).forEach(l=>{const other=data.nodes.find(n=>n.id===l.find(id=>id!==selected));if(other)$('related').append(button(other.title+' ↗',()=>choose(other.id)));});
  if(!$('related').childElementCount) $('related').textContent='No connections assigned.';
  fields.forEach(k=>$('editor').elements[k].value=n[k]);
  $('editor').hidden=!editing;$('reading').hidden=editing;$('edit-toggle').textContent=editing?'Done editing':'Edit content';$('edit-toggle').setAttribute('aria-pressed',editing);
}
function filterSelection() {const first=data.nodes.find(matches);if(first&&!matches(data.nodes.find(n=>n.id===selected)))selected=first.id;render();}
$('themes').addEventListener('change',e=>{theme=e.target.value;filterSelection();});
$('lines-toggle').addEventListener('change',e=>$('connections').style.display=e.target.checked?'':'none');
$('edit-toggle').addEventListener('click',()=>{editing=!editing;render();});
// Save before changing selection: explicit save keeps the published content intentional.
$('editor').addEventListener('input',()=>$('status').textContent='Unsaved edits — save this entry before choosing another point.');
$('editor').addEventListener('submit',e=>{
  e.preventDefault();const n=data.nodes.find(n=>n.id===selected);fields.forEach(k=>n[k]=$('editor').elements[k].value.trim());
  try {localStorage.setItem(storageKey,JSON.stringify(data));$('status').textContent='Saved in this browser. Download content.js to back up or publish your changes.';} catch (_) {$('status').textContent='Saved for this visit only. Browser storage is unavailable; download content.js now.';} render();
});
$('export').addEventListener('click',()=>{
  const blob=new Blob(['// Student-edited content. Replace content.js in the project with this file.\nwindow.BEHAVE_CONTENT = '+JSON.stringify(data,null,2)+';\n'],{type:'text/javascript'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='content.js';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('status').textContent='Downloaded saved entries. Replace content.js in your GitHub repository to share these edits.';
});
render();
