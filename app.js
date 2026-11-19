"use strict";
const BASE=window.DATA;
const ADMIN=location.hash==="#ustaz";
const KEY="mts-tumpat-draf-v1";
function clone(o){return JSON.parse(JSON.stringify(o))}
function loadState(){
  if(ADMIN){try{const r=JSON.parse(localStorage.getItem(KEY)||"null");if(r&&r.base===BASE.updated&&r.data)return r.data}catch(e){}}
  return clone(BASE);
}
function touch(){
  dirty=true;
  if(ADMIN){try{localStorage.setItem(KEY,JSON.stringify({base:BASE.updated,data:STATE}))}catch(e){}}
}
function exportData(){
  const out=clone(STATE);out.updated=new Date().toISOString().slice(0,19)+"Z";
  const txt="// Data hantaran hafazan MTS Tumpat.\n// Fail ini diganti setiap kali ustaz mengemas kini data (lihat README.md).\nwindow.DATA="+JSON.stringify(out).replace(/</g,"\\u003c")+";\n";
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([txt],{type:"text/javascript"}));
  a.download="data.js";document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function resetDraft(){try{localStorage.removeItem(KEY)}catch(e){}STATE=clone(BASE);dirty=false;render()}
window.addEventListener("hashchange",()=>location.reload());
const LBL={H:"Telah Menghantar",T:"Tidak Menghantar",S:"Sakit",I:"Izin"};
const PL={1:"1 hari",7:"1 minggu",30:"1 bulan",90:"3 bulan",180:"6 bulan"};
const COL={H:"var(--h)",T:"var(--t)",S:"var(--s)",I:"var(--i)"};
const root=document.getElementById("root");
let sel=0,grp=0,per=7,canEdit=ADMIN,editDate=today(),dirty=false,STATE=loadState();
function fk(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function today(){return fk(new Date())}
function fmt(k){try{return new Date(k+"T00:00:00").toLocaleDateString("ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}catch(e){return k}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function win(){const a=[];for(let i=per-1;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);a.push(fk(d))}return a}
function cnts(s,ks){const c={H:0,T:0,S:0,I:0};ks.forEach(k=>{if(s.l[k])c[s.l[k]]++});return c}
function sums(s,ks){let l=0,b=0;ks.forEach(k=>{const d=s.d&&s.d[k];if(d){l+=+d.l||0;b+=+d.b||0}});return{l,b}}
function juz(s){const ks=Object.keys(s.d||{}).filter(k=>s.d[k].j).sort();return ks.length?s.d[ks[ks.length-1]].j:"–"}
function detTxt(s,k){const d=s.d&&s.d[k];if(!d)return"";const p=[];if(d.j)p.push("Juzuk "+d.j);if(d.l!==undefined&&d.l!=="")p.push("Lama "+d.l+" m/s");if(d.b!==undefined&&d.b!=="")p.push("Baru "+d.b+" m/s");return p.join(" · ")}
function donut(c){const tot=c.H+c.T+c.S+c.I,r=52,L=2*Math.PI*r;let off=0,seg="";if(tot){["H","T","S","I"].forEach(k=>{const l=c[k]/tot*L;if(l>0){seg+='<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+COL[k]+'" stroke-width="20" stroke-dasharray="'+l+' '+(L-l)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 70 70)"/>';off+=l}})}
return '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Komposisi status"><circle cx="70" cy="70" r="'+r+'" fill="none" stroke="var(--bd)" stroke-width="20"/>'+seg+'<text x="70" y="68" text-anchor="middle" font-size="24" font-weight="700" fill="var(--tx)">'+(tot?Math.round(c.H*100/tot)+'%':'–')+'</text><text x="70" y="86" text-anchor="middle" font-size="10" fill="var(--mut)">menghantar</text></svg>'}
function trend(s){if(per===1)return'';const ks=win(),sz=per<=7?1:per<=90?7:30,B=[];for(let i=0;i<ks.length;i+=sz){const ch=ks.slice(i,i+sz),c=cnts(s,ch);c.n=ch.length;c.lb=per<=7?new Date(ch[0]+"T00:00:00").toLocaleDateString("ms-MY",{weekday:"short"}):ch[0].slice(8)+"/"+ch[0].slice(5,7);B.push(c)}
const W=640,Hh=170,gap=(W-20)/B.length,bw=Math.min(56,gap*.65);let o='<svg viewBox="0 0 640 200" width="100%" role="img" aria-label="Trend hantaran">';[0,.5,1].forEach(f=>{const y=10+Hh*(1-f);o+='<line x1="10" x2="630" y1="'+y+'" y2="'+y+'" stroke="var(--bd)" stroke-width="1"/>'});
B.forEach((c,i)=>{const x=10+i*gap+(gap-bw)/2;let y=10+Hh;["H","S","I","T"].forEach(k=>{const h=Hh*c[k]/c.n;if(h>0){y-=h;o+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="3" fill="'+COL[k]+'"/>'}});o+='<text x="'+(x+bw/2)+'" y="192" text-anchor="middle" font-size="11" fill="var(--mut)">'+c.lb+'</text>'});return o+'</svg>'}
function legend(){return '<div class="lg">'+["H","T","S","I"].map(k=>'<span><i style="background:'+COL[k]+'"></i>'+LBL[k]+'</span>').join("")+'</div>'}
function render(){
  const s=STATE.santri[sel],wk=win(),tk=today(),lim=wk[0];
  const keys=Object.keys(s.l).filter(k=>k>=lim&&k<=tk).sort().reverse();
  const cnt=cnts(s,wk),sm=sums(s,wk),pl=per===1?'hari ini':PL[per]+' terakhir';
  let h='<p class="sub">Pilih pelajar dan tempoh untuk melihat perkembangan hantaran hafazan.</p>';
  h+='<select id="ss">'+STATE.santri.map((x,i)=>i).filter(i=>Math.floor(i/11)===grp).map(i=>'<option value="'+i+'"'+(i===sel?' selected':'')+'>'+esc(STATE.santri[i].n)+'</option>').join("")+'</select>';
  h+='<div class="chips">'+Object.keys(PL).map(p=>'<button class="chip'+(+p===per?' on':'')+'" data-p="'+p+'">'+PL[p]+'</button>').join("")+'</div>';
  h+='<div class="card"><h2>Ringkasan '+esc(s.n)+' · '+pl+'</h2><div class="stats">'+["H","T","S","I"].map(c=>'<div class="st '+c+'"><b>'+cnt[c]+'</b><span>'+LBL[c]+'</span></div>').join("")+'</div>';
  h+='<div class="stats stats3"><div class="st N"><b>'+juz(s)+'</b><span>Juzuk terkini</span></div><div class="st N"><b>'+sm.l+'</b><span>Muka surat lama</span></div><div class="st N"><b>'+sm.b+'</b><span>Muka surat baru</span></div></div>';
  const rec=cnt.H+cnt.T+cnt.S+cnt.I;
  h+=(rec?'<p class="pct">Telah menghantar '+Math.round(cnt.H*100/rec)+'% daripada '+rec+' hari yang direkodkan.</p>':'')+'</div>';
  h+='<div class="card"><h2>Graf perkembangan · '+pl+'</h2><div class="viz">'+donut(cnt)+'<div style="flex:1;min-width:200px">'+(per===1?'<p class="empty">Pilih tempoh lebih panjang untuk melihat trend.</p>':'<div class="h3" style="margin-top:0">Trend '+(per<=7?'harian':per<=90?'mingguan':'bulanan')+'</div>'+trend(s))+'</div></div>'+legend()+'</div>';
  const gi=STATE.santri.map((x,i)=>i).filter(i=>Math.floor(i/11)===grp),gt={H:0,T:0,S:0,I:0};
  gi.forEach(i=>{const c=cnts(STATE.santri[i],wk);for(const k in c)gt[k]+=c[k]});
  h+='<div class="card"><h2>Perbandingan Kumpulan '+(grp+1)+' · '+pl+'</h2><div class="stats" style="margin-bottom:8px">'+["H","T","S","I"].map(c=>'<div class="st '+c+'"><b>'+gt[c]+'</b><span>'+LBL[c]+'</span></div>').join("")+'</div><div class="h3">Ketik nama untuk membuka butiran pelajar</div>';
  h+=gi.map(i=>{const x=STATE.santri[i],c=cnts(x,wk),t=c.H+c.T+c.S+c.I,m=sums(x,wk);return '<button class="grow'+(i===sel?' on':'')+'" data-k="'+i+'"><div class="gt"><span class="gn">'+esc(x.n)+'</span><span>'+(t?Math.round(c.H*100/t)+'%':'–')+' · Juzuk '+juz(x)+' · Baru '+m.b+' m/s</span></div><div class="bar">'+(t?["H","S","I","T"].map(k=>'<span style="width:'+(c[k]*100/t)+'%;background:'+COL[k]+'"></span>').join(""):'')+'</div></button>'}).join("")+legend()+'</div>';
  h+='<div class="card"><h2>Rekod harian</h2>';
  h+=keys.length?keys.map(k=>'<div class="row"><div><div>'+fmt(k)+'</div><div class="dt2">'+detTxt(s,k)+'</div></div><span class="badge '+s.l[k]+'">'+LBL[s.l[k]]+'</span></div>').join(""):'<p class="empty">Tiada rekod pada tempoh ini.</p>';
  h+='</div>';
  if(canEdit){
    h+='<div class="card edit"><h2>Mod ustaz: isi hantaran Kumpulan '+(grp+1)+'</h2><p class="note" style="margin:0 0 10px">Nama pelajar boleh ditukar terus pada kotak nama di bawah.</p><label>Tarikh<input type="date" id="dt" value="'+editDate+'"></label>';
    h+=STATE.santri.map((x,i)=>{if(Math.floor(i/11)!==grp)return'';const d=(x.d&&x.d[editDate])||{};
      return '<div class="er"><div class="nm"><input class="nmin" data-nm="'+i+'" value="'+esc(x.n)+'" maxlength="120" aria-label="Nama pelajar"></div><div class="opts">'+["H","T","S","I"].map(c=>'<button class="opt '+c+(x.l[editDate]===c?' on':'')+'" data-i="'+i+'" data-c="'+c+'">'+LBL[c]+'</button>').join("")+'</div>'+
      (x.l[editDate]==="H"?'<div class="fl"><label>Juzuk<input type="number" min="1" max="30" inputmode="numeric" data-n="'+i+'" data-f="j" value="'+esc(d.j||"")+'"></label><label>M/s lama<input type="number" min="0" inputmode="numeric" data-n="'+i+'" data-f="l" value="'+esc(d.l===undefined?"":d.l)+'"></label><label>M/s baru<input type="number" min="0" inputmode="numeric" data-n="'+i+'" data-f="b" value="'+esc(d.b===undefined?"":d.b)+'"></label></div>':'')+'</div>'}).join("");
    h+='<button class="opt H" style="width:100%;margin-top:12px;padding:10px" data-all="1">Kumpulan '+(grp+1)+': tandakan yang kosong sebagai Telah Menghantar</button>';
    h+='<button class="save" id="ex">Muat turun data.js</button><p class="note">M/s = muka surat. Perubahan di sini hanya draf dalam pelayar ini. Ganti fail <b>js/data.js</b> di GitHub dengan fail yang dimuat turun supaya wali melihat data terkini.</p><button class="opt" style="width:100%;margin-top:10px;padding:10px" id="rs">Padam draf &amp; kembali ke data diterbitkan</button></div>';
  }
  root.innerHTML=h;
}
root.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.dataset.p){per=+b.dataset.p;render();}
  else if(b.dataset.g!==undefined){grp=+b.dataset.g;sel=grp*11;render();}
  else if(b.dataset.k!==undefined){sel=+b.dataset.k;render();window.scrollTo({top:0,behavior:"smooth"});}
  else if(b.dataset.c){const x=STATE.santri[+b.dataset.i];if(x.l[editDate]===b.dataset.c){delete x.l[editDate];if(x.d)delete x.d[editDate];}else{x.l[editDate]=b.dataset.c;if(b.dataset.c!=="H"&&x.d)delete x.d[editDate];}touch();render();}
  else if(b.dataset.all){STATE.santri.forEach((x,i)=>{if(Math.floor(i/11)===grp&&!x.l[editDate])x.l[editDate]="H";});touch();render();}
  else if(b.id==="ex")exportData();
  else if(b.id==="rs")resetDraft();
});
root.addEventListener("change",e=>{
  if(e.target.dataset.nm!==undefined){const v=e.target.value.trim();if(v){STATE.santri[+e.target.dataset.nm].n=v.slice(0,120);touch();render();}return;}
  if(e.target.id==="ss"){sel=+e.target.value;render();return;}
  if(e.target.id==="dt"&&e.target.value){editDate=e.target.value;render();}
});
root.addEventListener("input",e=>{
  const t=e.target;if(t.dataset.f===undefined)return;
  const x=STATE.santri[+t.dataset.n];x.d=x.d||{};x.d[editDate]=x.d[editDate]||{};
  x.d[editDate][t.dataset.f]=t.value===""?"":Math.max(0,+t.value);
  touch();
});
render();
