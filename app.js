"use strict";
const BASE=window.DATA;
let ADMIN=location.hash==="#ustaz";
const KEY="mts-tumpat-draf-v1";
const LBL={H:"Telah Menghantar",T:"Tidak Menghantar",S:"Sakit",I:"Izin"};
const SL={H:"Hantar",T:"Tidak",S:"Sakit",I:"Izin"};
const PL={1:"1 hari",7:"1 minggu",30:"1 bulan",90:"3 bulan",180:"6 bulan",365:"1 tahun"};
const COL={H:"var(--h)",T:"var(--t)",S:"var(--s)",I:"var(--i)"};
const root=document.getElementById("root");
let STATE=loadState(),sel=0,per=7,editDate=today(),dirty=false,mtOpen=false;

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

function fk(d){return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function today(){return fk(new Date())}
function addDays(k,n){const d=new Date(k+"T00:00:00");d.setDate(d.getDate()+n);return fk(d)}
function fmt(k){try{return new Date(k+"T00:00:00").toLocaleDateString("ms-MY",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}catch(e){return k}}
function fs(k){try{return new Date(k+"T00:00:00").toLocaleDateString("ms-MY",{day:"numeric",month:"short"})}catch(e){return k}}
function esc(s){return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function win(){const a=[];for(let i=per-1;i>=0;i--)a.push(addDays(today(),-i));return a}
function cnts(s,ks){const c={H:0,T:0,S:0,I:0};ks.forEach(k=>{if(s.l[k])c[s.l[k]]++});return c}
function sums(s,ks){let l=0,b=0;ks.forEach(k=>{const d=s.d&&s.d[k];if(d){l+=+d.l||0;b+=+d.b||0}});return{l,b}}
function jEnd(d){return Math.min(30,+d.j+Math.max(0,(+d.n||1)-1))}
function juz(s){const ks=Object.keys(s.d||{}).filter(k=>s.d[k].j).sort();return ks.length?jEnd(s.d[ks[ks.length-1]]):"–"}
function lastJuz(s){const ks=Object.keys(s.d||{}).filter(k=>k<editDate&&s.d[k].j).sort();return ks.length?jEnd(s.d[ks[ks.length-1]]):""}
function prevDate(){let m="";STATE.santri.forEach(s=>Object.keys(s.l).forEach(k=>{if(k<editDate&&k>m)m=k}));return m}
function latest(s){const ks=Object.keys(s.l).filter(k=>k<=today()).sort();return ks.length?ks[ks.length-1]:null}
function detTxt(s,k){const d=s.d&&s.d[k];if(!d)return"";const p=[];if(d.j){const n=+d.n||1;p.push(n>1?"Juzuk "+d.j+"–"+jEnd(d)+" ("+n+" juzuk)":"Juzuk "+d.j)}if(d.l!==undefined&&d.l!=="")p.push("Lama "+d.l+" m/s");if(d.b!==undefined&&d.b!=="")p.push("Baru "+d.b+" m/s");return p.join(" · ")}
function newDetail(x){x.d=x.d||{};const o={},j=lastJuz(x);if(j)o.j=j;if(x.ml)o.l=x.ml;if(x.mb&&!x.hafiz)o.b=x.mb;x.d[editDate]=o}
function vv(z){return z===undefined||z===""?"–":z}

function donut(c){const tot=c.H+c.T+c.S+c.I,r=52,L=2*Math.PI*r;let off=0,seg="";if(tot){["H","T","S","I"].forEach(k=>{const l=c[k]/tot*L;if(l>0){seg+='<circle cx="70" cy="70" r="'+r+'" fill="none" stroke="'+COL[k]+'" stroke-width="20" stroke-dasharray="'+l+' '+(L-l)+'" stroke-dashoffset="'+(-off)+'" transform="rotate(-90 70 70)"/>';off+=l}})}
return '<svg viewBox="0 0 140 140" width="140" height="140" role="img" aria-label="Komposisi status"><circle cx="70" cy="70" r="'+r+'" fill="none" stroke="var(--bd)" stroke-width="20"/>'+seg+'<text x="70" y="68" text-anchor="middle" font-size="24" font-weight="700" fill="var(--tx)">'+(tot?Math.round(c.H*100/tot)+'%':'–')+'</text><text x="70" y="86" text-anchor="middle" font-size="10" fill="var(--mut)">menghantar</text></svg>'}
function trend(s){if(per===1)return'';const ks=win(),sz=per<=7?1:per<=90?7:30,B=[];for(let i=0;i<ks.length;i+=sz){const ch=ks.slice(i,i+sz),c=cnts(s,ch);c.n=ch.length;c.lb=per<=7?new Date(ch[0]+"T00:00:00").toLocaleDateString("ms-MY",{weekday:"short"}):ch[0].slice(8)+"/"+ch[0].slice(5,7);B.push(c)}
const W=640,Hh=170,gap=(W-20)/B.length,bw=Math.min(56,gap*.65);let o='<svg viewBox="0 0 640 200" width="100%" role="img" aria-label="Trend hantaran">';[0,.5,1].forEach(f=>{const y=10+Hh*(1-f);o+='<line x1="10" x2="630" y1="'+y+'" y2="'+y+'" stroke="var(--bd)" stroke-width="1"/>'});
B.forEach((c,i)=>{const x=10+i*gap+(gap-bw)/2;let y=10+Hh;["H","S","I","T"].forEach(k=>{const h=Hh*c[k]/c.n;if(h>0){y-=h;o+='<rect x="'+x+'" y="'+y+'" width="'+bw+'" height="'+h+'" rx="3" fill="'+COL[k]+'"/>'}});o+='<text x="'+(x+bw/2)+'" y="192" text-anchor="middle" font-size="11" fill="var(--mut)">'+c.lb+'</text>'});return o+'</svg>'}
function legend(){return '<div class="lg">'+["H","T","S","I"].map(k=>'<span><i style="background:'+COL[k]+'"></i>'+LBL[k]+'</span>').join("")+'</div>'}
function heat(s){return '<div class="heat'+(per>180?' sm':'')+'">'+win().map(k=>'<i title="'+fs(k)+(s.l[k]?" · "+LBL[s.l[k]]:" · tiada rekod")+'" style="background:'+(s.l[k]?COL[s.l[k]]:"var(--bd)")+'"></i>').join("")+'</div>'}
function hero(s){const lk=latest(s),st=lk?s.l[lk]:null;return '<div class="hero"><div class="av'+(s.hafiz?' hafiz':'')+'">'+esc((s.n.trim()[0]||"?").toUpperCase())+'</div><div class="hi"><div class="hn">'+esc(s.n)+(s.hafiz?' <span class="hf">★ Hafiz</span>':'')+'</div><div class="hm">Juzuk terkini: <b>'+juz(s)+'</b></div></div>'+(st?'<div class="hl"><span class="badge '+st+'">'+LBL[st]+'</span><div class="dt2">'+fs(lk)+'</div></div>':'')+'</div>'}

function waliHtml(){
  const s=STATE.santri[sel],wk=win(),tk=today(),lim=wk[0];
  const keys=Object.keys(s.l).filter(k=>k>=lim&&k<=tk).sort().reverse();
  const cnt=cnts(s,wk),pl=per===1?"hari ini":PL[per]+" terakhir",rec=cnt.H+cnt.T+cnt.S+cnt.I;
  let h='<select id="ss">'+STATE.santri.map((x,i)=>'<option value="'+i+'"'+(i===sel?" selected":"")+'>'+(x.hafiz?"★ ":"")+esc(x.n)+'</option>').join("")+'</select>';
  h+='<div class="chips">'+Object.keys(PL).map(p=>'<button class="chip'+(+p===per?' on':'')+'" data-p="'+p+'">'+PL[p]+'</button>').join("")+'</div>';
  h+=hero(s);
  h+='<div class="card"><h2>Ringkasan · '+pl+'</h2><div class="stats">'+["H","T","S","I"].map(c=>'<div class="st '+c+'"><b>'+cnt[c]+'</b><span>'+LBL[c]+'</span></div>').join("")+'</div>';
  h+=(rec?'<p class="pct">Telah menghantar '+Math.round(cnt.H*100/rec)+'% daripada '+rec+' hari yang direkodkan.</p>':'')+'</div>';
  if(per>1)h+='<div class="card"><h2>Kalendar hantaran · '+pl+'</h2>'+heat(s)+legend()+'</div>';
  h+='<div class="card"><h2>Graf perkembangan · '+pl+'</h2><div class="viz">'+donut(cnt)+'<div style="flex:1;min-width:200px">'+(per===1?'<p class="empty">Pilih tempoh lebih panjang untuk melihat trend.</p>':'<div class="h3" style="margin-top:0">Trend '+(per<=7?'harian':per<=90?'mingguan':'bulanan')+'</div>'+trend(s))+'</div></div>'+legend()+'</div>';
  const gt={H:0,T:0,S:0,I:0};
  STATE.santri.forEach(x=>{const c=cnts(x,wk);for(const k in c)gt[k]+=c[k]});
  h+='<div class="card"><h2>Perbandingan semua pelajar · '+pl+'</h2><div class="stats" style="margin-bottom:8px">'+["H","T","S","I"].map(c=>'<div class="st '+c+'"><b>'+gt[c]+'</b><span>'+LBL[c]+'</span></div>').join("")+'</div><div class="h3">Ketik nama untuk membuka butiran pelajar'+(STATE.santri.some(x=>x.hafiz)?' · ★ Hafiz: '+STATE.santri.filter(x=>x.hafiz).length+'/'+STATE.santri.length:'')+'</div>';
  h+=STATE.santri.map((x,i)=>{const c=cnts(x,wk),t=c.H+c.T+c.S+c.I;return '<button class="grow'+(i===sel?' on':'')+'" data-k="'+i+'"><div class="gt"><span class="gn">'+(x.hafiz?'<span class="hf" style="margin:0 6px 0 0">★ Hafiz</span>':'')+esc(x.n)+'</span><span>'+(t?Math.round(c.H*100/t)+'%':'–')+' · Juzuk '+juz(x)+'</span></div><div class="bar">'+(t?["H","S","I","T"].map(k=>'<span style="width:'+(c[k]*100/t)+'%;background:'+COL[k]+'"></span>').join(""):'')+'</div></button>'}).join("")+legend()+'</div>';
  h+='<div class="card"><h2>Rekod harian</h2>';
  h+=keys.length?keys.map(k=>'<div class="row"><div><div>'+fmt(k)+'</div><div class="dt2">'+detTxt(s,k)+'</div></div><span class="badge '+s.l[k]+'">'+LBL[s.l[k]]+'</span></div>').join(""):'<p class="empty">Tiada rekod pada tempoh ini.</p>';
  return h+'</div>';
}

function selNum(i,f,max,v){let o='<option value="">–</option>';const vals=[];for(let n=1;n<=max;n++)vals.push(n);if(v!==undefined&&v!==""&&!vals.includes(+v))vals.push(+v);vals.sort((a,b)=>a-b);vals.forEach(n=>o+='<option value="'+n+'"'+(String(v)===String(n)?' selected':'')+'>'+n+'</option>');return '<select data-n="'+i+'" data-f="'+f+'">'+o+'</select>'}
function setField(t){const x=STATE.santri[+t.dataset.n];x.d=x.d||{};const dd=x.d[editDate]=x.d[editDate]||{},f=t.dataset.f;if(f==="n"&&(t.value===""||+t.value<=1))delete dd.n;else dd[f]=t.value===""?"":Math.max(0,+t.value);touch()}
function selMt(i,f,max,v){let o='<option value="">–</option>';const vals=[];for(let n=1;n<=max;n++)vals.push(n);if(v!==undefined&&!vals.includes(+v))vals.push(+v);vals.sort((p,q)=>p-q);vals.forEach(n=>o+='<option value="'+n+'"'+(String(v)===String(n)?' selected':'')+'>'+n+'</option>');return '<select data-mt="'+f+'" data-n="'+i+'" aria-label="'+(f==="ml"?"M/s lama":"M/s baru")+'">'+o+'</select>'}
function mtabHtml(){
  let h='<details class="mtab"'+(mtOpen?' open':'')+'><summary>Jadual muka surat tetap (lama &amp; baru)</summary><p class="note" style="margin:6px 0">Isi sekali sahaja. Nilai ini dipakai automatik setiap kali status Telah Menghantar dipilih dan tidak berubah sehingga anda ubah sendiri. Rekod hari-hari lepas tidak terjejas.</p><div class="mrow mh"><span>Nama</span><span>Lama (1–20)</span><span>Baru (1–5)</span></div>';
  h+=STATE.santri.map((x,i)=>'<div class="mrow"><span class="mn">'+(x.hafiz?'<span class="hf" style="margin:0 5px 0 0">★</span>':'')+esc(x.n)+'</span>'+selMt(i,"ml",20,x.ml)+(x.hafiz?'<span class="dt2">tiada (Hafiz)</span>':selMt(i,"mb",5,x.mb))+'</div>').join("");
  return h+'<button class="opt" style="width:100%;margin-top:8px" data-mtfill="1">Isi yang kosong daripada rekod terkini</button></details>';
}
function selCount(i,v){let o="";for(let n=1;n<=30;n++)o+='<option value="'+n+'"'+((+v||1)===n?' selected':'')+'>'+(n===1?'1 (biasa)':n)+'</option>';return '<select data-n="'+i+'" data-f="n" aria-label="Bilangan juzuk dihantar">'+o+'</select>'}
function ustazHtml(){
  const n=STATE.santri.length,filled=STATE.santri.filter(x=>x.l[editDate]).length,pd=prevDate();
  let h='<div class="card edit"><h2>Isi hantaran</h2>';
  h+='<div class="nav"><button class="chip" data-dd="-1" aria-label="Hari sebelum">‹</button><input type="date" id="dt" value="'+editDate+'"><button class="chip" data-dd="1" aria-label="Hari berikut">›</button><button class="chip" data-dd="0">Hari ini</button></div>';
  h+='<div class="dl">'+fmt(editDate)+' · diisi '+filled+'/'+n+'</div>';
  h+='<div class="qa"><button class="opt H" data-all="1">Semua yang kosong → Telah Menghantar</button>'+(pd?'<button class="opt" data-cp="1">Salin yang kosong daripada '+fs(pd)+'</button>':'')+'</div>';
  h+=mtabHtml();
  h+=STATE.santri.map((x,i)=>{const d=(x.d&&x.d[editDate])||{},st=x.l[editDate];
    return '<div class="er"><div class="nrow"><input class="nmin" data-nm="'+i+'" value="'+esc(x.n)+'" maxlength="120" aria-label="Nama pelajar"><button class="hfb'+(x.hafiz?' on':'')+'" data-hf="'+i+'">★ Hafiz</button></div><div class="opts">'+["H","T","S","I"].map(c=>'<button class="opt '+c+(st===c?' on':'')+'" data-i="'+i+'" data-c="'+c+'">'+SL[c]+'</button>').join("")+'</div>'+
    (st==="H"?'<div class="fl two"><label>Juzuk (mula)'+selNum(i,"j",30,d.j)+'</label><label>Bil. juzuk dihantar'+selCount(i,d.n)+'</label></div><div class="mt">M/s lama <b>'+vv(d.l)+'</b>'+(x.hafiz?'':' · baru <b>'+vv(d.b)+'</b>')+' <span>(daripada jadual tetap)</span></div>':'')+'</div>'}).join("");
  return h+'<button class="opt" style="width:100%;margin-top:12px" id="rs">Padam draf &amp; kembali ke data diterbitkan</button></div>';
}

function render(){
  let h="";
  document.body.classList.toggle("adm",ADMIN);
  if(ADMIN){
    const n=STATE.santri.length,filled=STATE.santri.filter(x=>x.l[editDate]).length;
    h+='<div class="banner">MOD USTAZ · perubahan hanya draf sehingga fail data.js dimuat naik ke GitHub</div>'+ustazHtml()+'<div class="h3" style="margin:18px 0 8px">Paparan wali (pratonton)</div>'+waliHtml();
    h+='<div class="sb"><span>'+filled+'/'+n+' diisi · '+fs(editDate)+'</span><button id="ex">Muat turun data.js</button></div>';
  }else h+='<p class="sub">Pilih pelajar dan tempoh untuk melihat perkembangan hantaran hafazan.</p>'+waliHtml();
  root.innerHTML=h;
}

root.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;const D=b.dataset;
  if(D.p){per=+D.p;render()}
  else if(D.k!==undefined){sel=+D.k;render();window.scrollTo({top:0,behavior:"smooth"})}
  else if(D.c){const x=STATE.santri[+D.i];x.d=x.d||{};
    if(x.l[editDate]===D.c){delete x.l[editDate];delete x.d[editDate]}
    else{x.l[editDate]=D.c;if(D.c!=="H")delete x.d[editDate];else if(!x.d[editDate])newDetail(x)}
    touch();render()}
  else if(D.all){STATE.santri.forEach(x=>{if(!x.l[editDate]){x.l[editDate]="H";newDetail(x)}});touch();render()}
  else if(D.cp){const pd=prevDate();STATE.santri.forEach(x=>{if(!x.l[editDate]&&x.l[pd]){x.l[editDate]=x.l[pd];x.d=x.d||{};if(x.l[pd]==="H"&&x.d[pd]){const o=x.d[editDate]=clone(x.d[pd]);if(x.ml)o.l=x.ml;if(x.mb&&!x.hafiz)o.b=x.mb;if(x.hafiz)delete o.b}}});touch();render()}
  else if(D.mtfill){STATE.santri.forEach(x=>{const ks=Object.keys(x.d||{}).sort().reverse();if(x.ml===undefined){const k=ks.find(k=>+x.d[k].l>=1&&+x.d[k].l<=20);if(k)x.ml=+x.d[k].l}if(x.mb===undefined&&!x.hafiz){const k=ks.find(k=>+x.d[k].b>=1&&+x.d[k].b<=5);if(k)x.mb=+x.d[k].b}});touch();render()}
  else if(D.hf!==undefined){const x=STATE.santri[+D.hf];x.hafiz=!x.hafiz;if(x.hafiz&&x.d&&x.d[editDate])delete x.d[editDate].b;touch();render()}
  else if(D.dd!==undefined){editDate=D.dd==="0"?today():addDays(editDate,+D.dd);render()}
  else if(b.id==="ex")exportData();
  else if(b.id==="rs")resetDraft();
});
root.addEventListener("change",e=>{
  const t=e.target;
  if(t.dataset.mt!==undefined){const x=STATE.santri[+t.dataset.n],f=t.dataset.mt,v=t.value===""?undefined:+t.value;
    if(v===undefined)delete x[f];else x[f]=v;
    const dd=x.d&&x.d[editDate];if(x.l[editDate]==="H"&&dd){const k=f==="ml"?"l":"b";if(v===undefined)delete dd[k];else if(!(k==="b"&&x.hafiz))dd[k]=v}
    touch();render();return}
  if(t.dataset.f!==undefined){setField(t);return}
  if(t.dataset.nm!==undefined){const v=t.value.trim();if(v){STATE.santri[+t.dataset.nm].n=v.slice(0,120);touch();render()}return}
  if(t.id==="ss"){sel=+t.value;render();return}
  if(t.id==="dt"&&t.value){editDate=t.value;render()}
});
root.addEventListener("input",e=>{if(e.target.dataset.f!==undefined)setField(e.target)});
root.addEventListener("toggle",e=>{if(e.target.classList&&e.target.classList.contains("mtab"))mtOpen=e.target.open},true);
window.addEventListener("hashchange",()=>location.reload());
render();
