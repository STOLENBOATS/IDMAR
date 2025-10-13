
import { EngineCatalog } from './engine_catalog.js';
(function(){
  async function init(){
    const catalogURL = document.currentScript?.dataset?.catalog || 'data/engines_catalog.json';
    let catalog;
    try{ catalog = await EngineCatalog.load(catalogURL); }catch(e){ console.warn('EngineCatalog load failed', e); return; }

    const el = {
      brand: document.querySelector('[data-engine-field=brand], #marca, #marca_motor, select[name=marca]'),
      letterPair: document.querySelector('[data-engine-field=letter_pair], #par_letras, input[placeholder*="BA, BB"]'),
      shaft: document.querySelector('[data-engine-field=shaft], #shaft, input[placeholder*="S / L / X"]'),
      modelCode: document.querySelector('[data-engine-field=model_code], #codigo_modelo, input[placeholder*="Model code"], input[placeholder*="F350"], input[name*=codigo]'),
      series: document.querySelector('[data-engine-field=series], #serie, input[placeholder*="6–7"]'),
      power: document.querySelector('[data-engine-field=power], #potencia, input[placeholder*="150"]'),
      disp: document.querySelector('[data-engine-field=displacement], #cilindrada, input[placeholder*="2670"]'),
      origin: document.querySelector('[data-engine-field=origin], #origem, input[placeholder*="Jap"]')
    };

    function ensureDatalist(id){
      let dl = document.getElementById(id);
      if(!dl){ dl = document.createElement('datalist'); dl.id = id; document.body.appendChild(dl); }
      return dl;
    }
    function fillDatalist(dl, arr){
      dl.innerHTML = '';
      arr.forEach(v=>{ const opt = document.createElement('option'); opt.value = v; dl.appendChild(opt); });
    }

    function bindBrand(){
      if(!el.brand) return;
      if(el.brand.tagName === 'SELECT'){
        if(el.brand.options.length < 2){
          catalog.brands().forEach(b=>{ const o=document.createElement('option'); o.value=b; o.textContent=b; el.brand.appendChild(o); });
        }
      }else{
        const dl = ensureDatalist('engine_brands_dl');
        fillDatalist(dl, catalog.brands());
        el.brand.setAttribute('list', 'engine_brands_dl');
      }
      el.brand.addEventListener('change', brandChanged);
      el.brand.addEventListener('input', brandChanged);
    }

    function brandChanged(){
      const name = (el.brand?.value||'').trim();
      const opts = catalog.optionsFor(name);
      if(el.shaft){ const dl = ensureDatalist('engine_shaft_dl'); fillDatalist(dl, opts.shaft||[]); el.shaft.setAttribute('list','engine_shaft_dl'); }
      if(el.letterPair && opts.yearPairsHint){ if(!el.letterPair._origPH) el.letterPair._origPH = el.letterPair.getAttribute('placeholder')||''; el.letterPair.setAttribute('placeholder', opts.yearPairsHint); }
      if(el.series && opts.seriesDigits?.length){ el.series.title = 'Digits allowed: ' + opts.seriesDigits.join(', '); }
      if(el.modelCode && opts.modelExamples?.length){ const dl = ensureDatalist('engine_model_examples_dl'); fillDatalist(dl, opts.modelExamples); el.modelCode.setAttribute('list','engine_model_examples_dl'); }
      if(el.power && opts.powerRange){ el.power.title = 'hp: '+opts.powerRange[0]+'–'+opts.powerRange[1]; }
      if(el.disp && opts.dispRange){ el.disp.title = 'cc: '+opts.dispRange[0]+'–'+opts.dispRange[1]; }
      if(el.origin && opts.originsHint?.length){ const dl=ensureDatalist('engine_origin_dl'); fillDatalist(dl, opts.originsHint); el.origin.setAttribute('list','engine_origin_dl'); }
    }

    bindBrand();
    if(el.brand && el.brand.value) brandChanged();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
