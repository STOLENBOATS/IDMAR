// js/model-meta-wire.v1.js — v1.5 (ouve commit de modelo, preenche ficha + family picker + foca SN)
(function (w, d) {
  const DEBUG = true;
  const log = (...a) => { if (DEBUG) console.log('[model-meta-wire v1]', ...a); };

  // Lê o caminho do JSON do atributo data-json (já apontado para data/engines_catalog.v2.json)
  const thisScript = d.currentScript || Array.from(d.scripts).at(-1);
  const DATA_URL = thisScript?.getAttribute('data-json') || 'data/engines_catalog.v2.json';

  // Saídas da ficha
  const out = {
    hp:    d.getElementById('out-hp'),
    cc:    d.getElementById('out-cc'),
    years: d.getElementById('out-years'),
    rig:   d.getElementById('out-rig'),
    shaft: d.getElementById('out-shaft'),
    rot:   d.getElementById('out-rot'),
    gcase: d.getElementById('out-case'),
    snObs: d.getElementById('out-sn-obs'),
    snRan: d.getElementById('out-sn-ranges')
  };

  // Family picker (versão / potência / ranges)
  const fp = {
    version: d.getElementById('engineVersion'),
    power:   d.getElementById('enginePower'),
    ranges:  d.getElementById('engineSerialInfo')
  };

  const snInput = d.getElementById('engine-sn-raw');

  let catalog = null;  // JSON v2
  let yamFamilies = null; // referência para catalog.brands.Yamaha.families

  function clearFacts(){
    out.hp.textContent    = '—';
    out.cc.textContent    = '—';
    out.years.textContent = '—';
    out.rig.textContent   = '—';
    out.shaft.textContent = '—';
    out.rot.textContent   = '—';
    out.gcase.textContent = '—';
    out.snObs.textContent = '—';
    out.snRan.textContent = '—';
  }

  function fillSelect(sel, values, placeholder){
    if (!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat((values||[]).map(v => {
        const val = typeof v === 'object' ? (v.value ?? v.label) : v;
        const lab = typeof v === 'object' ? (v.label ?? v.value) : v;
        return `<option value="${val}">${lab}</option>`;
      }));
    sel.innerHTML = opts.join('');
  }

  // Procura a versão no catálogo v2 (Yamaha) e devolve a estrutura completa
  function findVersion(modelCode){
    if (!modelCode) return null;
    const fams = yamFamilies || {};
    for (const [fname, fbody] of Object.entries(fams)){
      const vs = fbody.versions || [];
      for (const v of vs){
        if (String(v.version).toUpperCase() === String(modelCode).toUpperCase()){
          return { familyName: fname, family: fbody, version: v };
        }
        // também aceita “base” (ex.: F40 sem sufixo) se houver match exato de prefixo único
        const base = String(modelCode).toUpperCase().replace(/\s+/g,'');
        if (v.version && String(v.version).toUpperCase().startsWith(base) && base === base.replace(/[A-Z]$/,'')){
          // ignora se vier com sufixo na query; só ajuda quando veio “F40”
        }
      }
    }
    return null;
  }

  function rangesToHTML(ranges){
    if (!ranges || !ranges.length) return '';
    return '<ul>' + ranges.map(r => {
      if (typeof r === 'string') return `<li>${r}</li>`;
      const from = r.from ?? '';
      const to   = r.to ?? '';
      const note = r.note ? ` <em>(${r.note})</em>` : '';
      return `<li>${from} → ${to}${note}</li>`;
    }).join('') + '</ul>';
  }

  function applyFacts(hit){
    if (!hit) { clearFacts(); return; }
    const v = hit.version, f = hit.family;

    out.hp.textContent    = (v.power ?? '—');
    out.cc.textContent    = (v.displacement_cc ?? f.displacement_cc ?? '—');
    out.years.textContent = (v.years ?? (Array.isArray(f.years) ? `${f.years[0]}–${f.years[1]}` : '—'));
    out.rig.textContent   = (v.rigging || (Array.isArray(f.rigging) ? f.rigging.join(',') : f.rigging) || '—');
    out.shaft.textContent = (v.shaft   || (Array.isArray(f.shaft)   ? f.shaft.join(',')   : f.shaft)   || '—');
    out.rot.textContent   = (v.rotation|| (Array.isArray(f.rotation)? f.rotation.join(','): f.rotation)|| '—');
    out.gcase.textContent = (v.gearcase|| (Array.isArray(f.gearcase)? f.gearcase.join(','): f.gearcase)|| '—');

    const sn = v.serial || {};
    out.snObs.textContent   = sn.notes || '—';
    out.snRan.innerHTML     = rangesToHTML(sn.ranges || []);

    // Family picker (versão/potência a partir da família)
    const versionOptions = (f.versions||[]).map(x => ({ value:String(x.version), label:String(x.version) }));
    const powerOptions   = Array.from(new Set((f.versions||[]).map(x => x.power))).sort((a,b)=>a-b);
    fillSelect(fp.version, versionOptions, '—');
    fillSelect(fp.power, powerOptions, '—');

    // Seleciona a versão atual no picker de versões
    if (fp.version) fp.version.value = String(v.version);

    // Guarda um snapshot compacto para o visor/collector usar
    w.EnginePickerState = w.EnginePickerState || {};
    w.EnginePickerState.family = {
      family: hit.familyName,
      version: v.version,
      power: v.power,
      ranges: sn.ranges || []
    };
  }

  function onCommit(ev){
    const { model, commit } = ev.detail || {};
    if (!model) return;
    log('commit recebido:', model);

    // encontra a versão correspondente
    const hit = findVersion(model) ||
                findVersion(String(model).replace(/\s+/g,'')); // tentativa com espaços removidos
    applyFacts(hit);

    // foca SN apenas quando é um commit humano (não em “mirror”)
    if (commit && snInput){
      setTimeout(()=> snInput.focus(), 0);
    }
  }

  // botão "Validar nº de motor" (cartão 3)
  function armSerialButton(){
    const btn =
      d.querySelector('#card-serial button') ||
      d.getElementById('btnSN') ||
      d.getElementById('btnSerial');
    if (!btn || btn.__armed_meta) return;
    btn.__armed_meta = true;
    btn.addEventListener('click', (ev) => {
      ev.preventDefault();
      const data = w.EngineCollect?.collect?.() || {
        brand: w.EnginePickerState?.brand,
        model: w.EnginePickerState?.model,
        family: w.EnginePickerState?.family,
        extra:  w.EngineBrandState?.data
      };
      const raw = (snInput?.value || '').trim();
      let verdict = null;
      if (raw && w.EngineSNRange && typeof w.EngineSNRange.check === 'function') {
        const ranges = data.family?.ranges || [];
        verdict = w.EngineSNRange.check(raw, ranges);
      }
      console.log('[IDMAR] VALIDAR SN:', data, '| SN=', raw, '| verdict=', verdict);
    });
  }

  // Boot
  fetch(DATA_URL)
    .then(r=>r.json())
    .then(j=>{
      catalog = j;
      yamFamilies = catalog?.brands?.Yamaha?.families || {};
      log('pronto: catálogo v2 carregado.');
      w.addEventListener('idmar:model-commit', onCommit);
      armSerialButton();
    })
    .catch(e=>console.warn('[model-meta-wire] falha a carregar catálogo', e));

})(window, document);
