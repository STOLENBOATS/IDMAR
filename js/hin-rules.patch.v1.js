
// js/hin-rules.patch.v1.js — non-intrusive validator augment (runs after validador-win.js)
(function(){
  const MIN_YEAR = 1998;

  const Codebooks = {
    countries: null,
    mics: null,
    async load(){
      if (!this.countries){
        try{ this.countries = await (await fetch('data/countries.min.json', {cache:'force-cache'})).json(); }catch{ this.countries = {}; }
      }
      if (!this.mics){
        try{ this.mics = await (await fetch('data/mic.sample.json', {cache:'force-cache'})).json(); }catch{ this.mics = {}; }
      }
    },
    countryName(cc){ return (this.countries[cc?.toUpperCase()]||'').trim(); },
    micName(mmm){ return (this.mics[mmm?.toUpperCase()]||'').trim(); }
  };

  function parseHIN(raw){
    if (!raw) return null;
    let t = String(raw).trim().toUpperCase();
    t = t.replace(/[^A-Z0-9]/g,'');
    const cc = t.slice(0,2);
    const mic = t.slice(2,5);
    const serial = t.slice(5,10);   // positions 6–10
    const tail = t.slice(10);       // remaining (dates/version)
    let yy = NaN;
    const m = tail.match(/(\d{2})$/); 
    if (m){ yy = Number(m[1]); }
    let year = Number.isFinite(yy) ? (yy >= 70 ? 1900+yy : 2000+yy) : NaN;

    return { cc, mic, serial, tail, year, raw: t };
  }

  function makeBadge(txt, ok=true){
    const cls = ok ? 'ok' : 'err';
    return `<span class="badge ${cls}">${txt}</span>`;
  }

  async function enhance(){
    await Codebooks.load();

    const form = document.getElementById('winForm');
    const resultBox = document.getElementById('winResult');
    const certCb = document.getElementById('winCert');
    const certLine = document.getElementById('certLine');
    const certNumber = document.getElementById('certNumber');
    const certIssuer = document.getElementById('certIssuer');
    const forense = document.getElementById('winForense');

    if (!form || !resultBox) return;
    if (certLine) certLine.style.display = '';

    function annotate(hinInfo){
      if (!forense) return;
      const country = Codebooks.countryName(hinInfo.cc);
      const maker   = Codebooks.micName(hinInfo.mic);
      const items = [];
      if (country) items.push(`<b>País</b>: ${country} (${hinInfo.cc})`);
      if (maker)   items.push(`<b>Fabricante</b>: ${maker} (${hinInfo.mic})`);
      items.push(`<b>Serial (pos. 6–10)</b>: ${hinInfo.serial||'—'}`);
      if (Number.isFinite(hinInfo.year)) items.push(`<b>Ano decodificado</b>: ${hinInfo.year}`);
      const html = `<ul class="kv">${items.map(i=>`<li>${i}</li>`).join('')}</ul>`;
      const div = document.createElement('div');
      div.className = 'anno';
      div.innerHTML = html;
      const old = forense.querySelector('.anno'); if (old) old.remove();
      forense.appendChild(div);
    }

    function enforce(hinInfo){
      const badSerial = !/^[A-Z0-9]{5}$/.test(hinInfo.serial||'');
      const needsCert = Number.isFinite(hinInfo.year) && hinInfo.year < MIN_YEAR;
      const certOk = !!certCb?.checked || (!!certNumber?.value?.trim() && !!certIssuer?.value?.trim());

      let problems = [];
      if (badSerial) problems.push('Serial (pos. 6–10) deve ser alfanumérico (5 chars).');
      if (needsCert && !certOk) problems.push(`Ano < ${MIN_YEAR} só é aceite com Certificado de Conformidade.`);

      if (problems.length){
        resultBox.insertAdjacentHTML('afterbegin', `<div class="alert err">${problems.join(' ')}</div>`);
        if (!resultBox.querySelector('.badge.err')){
          resultBox.insertAdjacentHTML('afterbegin', makeBadge('Rever regras', false));
        }
      }
      return problems.length === 0;
    }

    form.addEventListener('submit', function(){
      setTimeout(()=>{
        const raw = document.getElementById('winInput')?.value || '';
        const info = parseHIN(raw);
        if (!info) return;
        resultBox.querySelectorAll('.alert.err').forEach(n=>n.remove());
        annotate(info);
        enforce(info);
      }, 0);
    });

    certCb?.addEventListener('change', ()=>{
      const raw = document.getElementById('winInput')?.value || '';
      const info = parseHIN(raw); if (!info) return;
      resultBox.querySelectorAll('.alert.err').forEach(n=>n.remove());
      enforce(info);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance);
  else enhance();
})();
