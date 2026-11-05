(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var mb=$('.menu-btn');if(mb)mb.addEventListener('click',function(){$('.nav').classList.toggle('open')});
  // --- ticker: BTC/ETH from public APIs (CoinGecko, fallback Binance) ---
  var tk=$('#ticker-data');
  function fmtUsd(n){return 'US$'+Number(n).toLocaleString('en-US',{maximumFractionDigits:n<100?2:0})}
  function fmtIdr(n){return 'Rp'+Number(n).toLocaleString('id-ID',{maximumFractionDigits:0})}
  function row(sym,usd,idr,chg){
    var c=chg==null?'':'<span class="'+(chg>=0?'up':'down')+'">'+(chg>=0?'▲ ':'▼ ')+Math.abs(chg).toFixed(2)+'%</span>';
    return '<span><b>'+sym+'</b> '+fmtUsd(usd)+(idr?' <small>('+fmtIdr(idr)+')</small>':'')+' '+c+'</span>';
  }
  function setTicker(html){if(tk){tk.innerHTML=html+'<small>Sumber: CoinGecko/Binance · 24 jam · bukan saran finansial</small>'}}
  function load(){
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,idr&include_24hr_change=true').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
      setTicker(row('BTC',d.bitcoin.usd,d.bitcoin.idr,d.bitcoin.usd_24h_change)+row('ETH',d.ethereum.usd,d.ethereum.idr,d.ethereum.usd_24h_change));
    }).catch(function(){
      Promise.all(['BTCUSDT','ETHUSDT'].map(function(s){return fetch('https://api.binance.com/api/v3/ticker/24hr?symbol='+s).then(function(r){return r.json()})})).then(function(a){
        setTicker(row('BTC',a[0].lastPrice,null,parseFloat(a[0].priceChangePercent))+row('ETH',a[1].lastPrice,null,parseFloat(a[1].priceChangePercent)));
      }).catch(function(){if(tk)tk.innerHTML='<small>Harga BTC/ETH sementara tidak tersedia.</small>'});
    });
  }
  if(tk){load();setInterval(load,60000)}
  // --- category filter ---
  var fl=$('.filters');
  if(fl){
    var cards=$$('[data-cat]');var em=$('.empty');
    function apply(c){var n=0;cards.forEach(function(el){var show=c==='semua'||el.getAttribute('data-cat')===c;el.style.display=show?'':'none';if(show)n++});em.style.display=n?'none':'block';$$('button',fl).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-f')===c)})}
    fl.addEventListener('click',function(e){var b=e.target.closest('button');if(b){apply(b.getAttribute('data-f'));history.replaceState(null,'','#'+b.getAttribute('data-f'))}});
    apply((location.hash||'#semua').slice(1)||'semua');
  }
  // --- share ---
  $$('[data-share]').forEach(function(a){
    var u=encodeURIComponent(location.href.split('#')[0]),t=encodeURIComponent(document.title);
    var k=a.getAttribute('data-share');
    if(k==='wa')a.href='https://wa.me/?text='+t+'%20'+u;
    if(k==='tg')a.href='https://t.me/share/url?url='+u+'&text='+t;
    if(k==='x')a.href='https://twitter.com/intent/tweet?url='+u+'&text='+t;
    if(k==='copy')a.addEventListener('click',function(){navigator.clipboard&&navigator.clipboard.writeText(location.href.split('#')[0]);a.textContent='Tersalin ✓'});
  });
  // --- telegram embeds: show fallback link if widget doesn't render ---
  setTimeout(function(){$$('.tg-card').forEach(function(c){if(!c.querySelector('iframe')){var f=c.querySelector('.tg-fallback');if(f)f.style.display='block'}})},6000);
})();
// --- dashboard market panel (CoinGecko public API; no data shown if it fails) ---
(function(){var m=document.getElementById('mkt');if(!m)return;
function f(n){return n>=1000?n.toLocaleString('en-US',{maximumFractionDigits:0}):n.toLocaleString('en-US',{maximumFractionDigits:n<1?4:2})}
function load(){fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,tether,binancecoin,solana&order=market_cap_desc').then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(d){
m.innerHTML=d.map(function(c){var ch=c.price_change_percentage_24h||0;return '<div class="q"><div class="s">'+c.symbol.toUpperCase()+'</div><div class="p">US$'+f(c.current_price)+'</div><div class="c '+(ch>=0?'up':'dn')+'">'+(ch>=0?'▲ ':'▼ ')+Math.abs(ch).toFixed(2)+'% 24h</div></div>'}).join('')
}).catch(function(){if(!m.querySelector('.q'))m.innerHTML='<div class="mkt-load muted"><span class="l-id">Data pasar belum bisa dimuat. Coba lagi nanti.</span><span class="l-en">Market data could not be loaded. Try again later.</span></div>'})}
load();setInterval(load,60000)})();
