/* Felles, automatisk navigasjon for Helges læringsportal. */
(()=>{'use strict';
if(document.getElementById('portal-nav-trigger'))return;
const HOME='https://helull.github.io/';
const sources=[{repo:'matematikk',label:'Matematikk',base:HOME+'matematikk/'},{repo:'q',label:'Spill',base:HOME+'q/'},{repo:'timeplan',label:'Timeplan',base:HOME+'timeplan/'}];
const css=document.createElement('style');css.textContent=`
#portal-nav-trigger{position:fixed!important;top:12px!important;right:12px!important;z-index:2147483000!important;width:44px!important;height:44px!important;border:1px solid #ffffff55!important;border-radius:12px!important;background:#14283c!important;color:white!important;font:700 26px system-ui,sans-serif!important;box-shadow:0 3px 14px #0003!important;cursor:pointer!important;line-height:1!important;padding:0!important}
#portal-nav-trigger:focus-visible,#portal-nav-panel a:focus-visible,#portal-nav-panel button:focus-visible{outline:3px solid #4a90e2;outline-offset:2px}
#portal-nav-shade{position:fixed!important;inset:0!important;background:#08152588!important;z-index:2147483001!important}
#portal-nav-panel{position:fixed!important;top:0!important;right:0!important;bottom:0!important;width:min(390px,94vw)!important;z-index:2147483002!important;background:#f5f7fb!important;color:#17283c!important;box-shadow:-8px 0 28px #0003!important;overflow:auto!important;padding:17px!important;font:15px/1.4 system-ui,sans-serif!important;text-align:left!important}
#portal-nav-panel *{box-sizing:border-box!important}
#portal-nav-panel .portal-head{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;margin-bottom:14px!important}
#portal-nav-panel .portal-head strong{font-size:1.2rem!important}
#portal-nav-panel button.portal-close{border:0!important;background:#e4eaf2!important;border-radius:10px!important;color:#17283c!important;padding:7px 11px!important;font-size:22px!important;cursor:pointer!important}
#portal-nav-panel a{color:#173b72!important;text-decoration:none!important;display:block!important;padding:8px 10px!important;border-radius:9px!important;overflow-wrap:anywhere!important}
#portal-nav-panel a:hover{background:#e6eef9!important}
#portal-nav-panel details{border:1px solid #dce5ef!important;border-radius:11px!important;background:white!important;margin:7px 0!important;overflow:hidden!important}
#portal-nav-panel summary{padding:10px 12px!important;cursor:pointer!important;font-weight:750!important;list-style-position:inside!important;color:#17283c!important}
#portal-nav-panel .portal-children{padding:0 7px 7px 14px!important}
#portal-nav-panel .portal-children details{margin:4px 0!important}
#portal-nav-panel .portal-small{color:#64748b!important;font-size:12px!important;margin:10px 4px!important}
#portal-nav-panel .portal-home{background:#e9f2ff!important;font-weight:750!important;margin-bottom:8px!important}
body.portal-nav-open{overflow:hidden!important}
`;document.head.append(css);
const trigger=document.createElement('button');trigger.id='portal-nav-trigger';trigger.type='button';trigger.textContent='☰';trigger.setAttribute('aria-label','Åpne programmeny');trigger.setAttribute('aria-expanded','false');document.body.append(trigger);
let shade,panel,loaded=false;
function name(s){const n=s.replace(/\.html?$/i,'').replace(/[_-]+/g,' ');const courses={'1p':'1P','1py':'1P-Y','s1':'S1','s2':'S2','r1':'R1','r2':'R2','2p':'2P','2py':'2P-Y'};return courses[s.toLowerCase()]||n.replace(/^\p{L}/u,c=>c.toLocaleUpperCase('nb-NO'))}
function link(label,url){const a=document.createElement('a');a.textContent=label;a.href=url;return a}
function details(label,url){const d=document.createElement('details'),s=document.createElement('summary'),c=document.createElement('div');s.textContent=label;c.className='portal-children';d.append(s,c);if(url)c.append(link('Åpne oversikt →',url));return {d,c}}
function build(files,source){const {d,c}=details(source.label,source.base);const dirs=new Set(),html=[];
for(const f of files){if(f.type!=='blob')continue;const p=f.path;if(p.includes('/')){const parts=p.split('/');for(let i=1;i<parts.length;i++)dirs.add(parts.slice(0,i).join('/'))}
if(/\.html?$/i.test(p)&&!/(^|\/)(index|.*backup|.*bak|admin|ajour|trekantdesktop|trekanttavle)\.html?$/i.test(p))html.push(p)}
const children=new Map();for(const path of dirs){const parent=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'';if(!children.has(parent))children.set(parent,[]);children.get(parent).push(path)}
const filesAt=new Map();for(const path of html){const parent=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'';if(!filesAt.has(parent))filesAt.set(parent,[]);filesAt.get(parent).push(path)}
function add(parent,container,depth){if(depth>8)return;for(const path of (children.get(parent)||[]).sort((a,b)=>a.localeCompare(b,'no',{numeric:true}))){const segment=path.split('/').pop();if(segment.startsWith('.')||segment==='node_modules')continue;const url=source.base+path.split('/').map(encodeURIComponent).join('/')+'/';const child=details(name(segment),url);container.append(child.d);add(path,child.c,depth+1)}
for(const path of (filesAt.get(parent)||[]).sort((a,b)=>a.localeCompare(b,'no',{numeric:true}))){const file=path.split('/').pop();container.append(link(name(file),source.base+path.split('/').map(encodeURIComponent).join('/')))}}
add('',c,0);return d}
async function load(){if(loaded)return;loaded=true;const host=panel.querySelector('#portal-nav-items');host.textContent='Henter programoversikt …';const results=await Promise.all(sources.map(async s=>{try{const r=await fetch('https://api.github.com/repos/helull/'+s.repo+'/git/trees/main?recursive=1',{headers:{Accept:'application/vnd.github+json'}});if(!r.ok)throw Error('HTTP '+r.status);const j=await r.json();if(j.truncated)throw Error('Ufullstendig oversikt');return build(j.tree,s)}catch(e){const {d,c}=details(s.label,s.base);c.append(link('Åpne '+s.label,s.base));const p=document.createElement('p');p.className='portal-small';p.textContent='Kunne ikke hente undermenyen akkurat nå.';c.append(p);return d}}));host.replaceChildren(...results);const note=document.createElement('p');note.className='portal-small';note.textContent='Nye mapper og HTML-programmer hentes automatisk fra GitHub. Oppdater siden for å hente siste endringer.';host.append(note)}
function close(){if(!panel)return;shade.remove();panel.remove();shade=panel=null;document.body.classList.remove('portal-nav-open');trigger.setAttribute('aria-expanded','false');trigger.focus()}
function open(){shade=document.createElement('div');shade.id='portal-nav-shade';shade.addEventListener('click',close);panel=document.createElement('aside');panel.id='portal-nav-panel';panel.setAttribute('aria-label','Programmeny');const head=document.createElement('div');head.className='portal-head';const title=document.createElement('strong');title.textContent='Programoversikt';const x=document.createElement('button');x.type='button';x.className='portal-close';x.textContent='×';x.setAttribute('aria-label','Lukk meny');x.addEventListener('click',close);head.append(title,x);panel.append(head,link('⌂ Hovedside',HOME));panel.lastChild.className='portal-home';const items=document.createElement('div');items.id='portal-nav-items';panel.append(items);document.body.append(shade,panel);document.body.classList.add('portal-nav-open');trigger.setAttribute('aria-expanded','true');x.focus();load()}
trigger.addEventListener('click',()=>panel?close():open());document.addEventListener('keydown',e=>{if(e.key==='Escape'&&panel)close()});
})();