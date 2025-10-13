/*! IDMAR — WIN Rules Add‑on (r3)
 * Drop‑in. Não altera validadores existentes.
 * Incluir DEPOIS de js/validador-win.js
 * Funções: interpretação mínima + lista de regras + (opcional) renderWinResult().
 */
(function(w,d){
  if (w.__IDMAR_WIN_RULES_R3__) return; w.__IDMAR_WIN_RULES_R3__ = true;
  function qs(sel, root){ return (root||d).querySelector(sel); }
  function interpretWIN(win){
    const c = String(win||'').replace(/-/g,'').toUpperCase().trim();
    if (c.length!==14 && c.length!==16) return {valid:false, reason:'Tamanho inválido (14/16).'};
    if (c.length===15) return {valid:false, reason:'Formato EUA não admite 15.'};
    if (!/^[A-Z0-9]+$/.test(c)) return {valid:false, reason:'Caracteres inválidos.'};
    const eu = (c.length===14);
    const country=c.slice(0,2), maker=c.slice(2,5);
    let series, month, year, model;
    if (eu){ series=c.slice(5,10); month=c.slice(10,11); year=c.slice(11,12); model=c.slice(12,14); }
    else { series=c.slice(5,12); month=c.slice(12,13); year=c.slice(13,14); model=c.slice(14,16); }
    if(!/^[A-Z]{2}$/.test(country)) return {valid:false,reason:'País inválido.'};
    if(!/^[A-Z]{3}$/.test(maker)) return {valid:false,reason:'Fabricante inválido.'};
    if(!/^[A-HJ-NPR-Z]$/.test(month)) return {valid:false,reason:'Mês inválido (I,O,Q proibidas).'};
    if(!/^[0-9]$/.test(year)) return {valid:false,reason:'Ano (1 dígito) inválido.'};
    if(!/^[0-9]{2}$/.test(model)) return {valid:false,reason:'Modelo (2 dígitos) inválido.'};
    const map="ABCDEFGHJKLMNPRSTUVWXYZ".split(''); const idx=map.indexOf(month);
    const monthName=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][Math.max(0, idx%12)];
    const yy=parseInt(year,10), myy=parseInt(model,10);
    const current = new Date().getFullYear();
    const windowMax = current + 1;
    let modelResolved = null;
    [1900,2000,2100].forEach((cent)=>{ const y = cent + myy; if (y>=1998 && y<=windowMax) modelResolved = y; });
    if(modelResolved===null) return {valid:false, reason:'Ano do modelo fora do intervalo permitido (>=1998).'};
    const candidates = [];
    for (let d=0; d<=1; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    for (let d=2; d<=9; d++){ const y = modelResolved - d; if ((y % 10)===yy && y>=1998 && y<=current) candidates.push(y); }
    let prodResolved = candidates.length? candidates[0] : null;
    if(prodResolved===null) return {valid:false, reason:'Ano de produção inconsistente ou fora de 1998+.'};
    if(modelResolved < prodResolved) return {valid:false, reason:'Ano do modelo não pode ser anterior ao de produção.'};
    const countryMap = {'PT':'Portugal','FR':'França','ES':'Espanha','IT':'Itália','DE':'Alemanha','NL':'Países Baixos','GB':'Reino Unido','UK':'Reino Unido','US':'Estados Unidos','CA':'Canadá'};
    const makerMap = {'CNB':'CNB Yacht Builders (França)','BEN':'Bénéteau (França)','JEA':'Jeanneau (França)','SEA':'Sea Ray (EUA)','BRP':'Bombardier Recreational Products (Evinrude)','YAM':'Yamaha (Japão)','HON':'Honda (Japão)'};
    const countryName = countryMap[country] || 'Desconhecido';
    const makerName = makerMap[maker] || 'Código de fabricante (não identificado)';
    return {valid:true, reason:'Estrutura válida.', eu, cleaned:c, country, countryName, maker, makerName, series, month, monthName, year, prodResolved, model, modelResolved};
  }
  function ensureRulesBox(){
    const host = qs('#winResult') || qs('#win-output .resultado') || qs('#winOut');
    if(!host) return null;
    let box = d.getElementById('winRulesBox');
    if(!box){
      box = d.createElement('div');
      box.id = 'winRulesBox';
      box.style.marginTop = '0.75rem';
      box.style.border = '1px solid var(--border,#e5e7eb)';
      box.style.borderRadius = '12px';
      box.style.padding = '0.8rem 1rem';
      box.style.background = 'var(--bg-elev,#fff)';
      box.innerHTML = '<h3 style="margin:.25rem 0 .5rem 0">Regras aplicadas / <span style="opacity:.7">Applied rules</span></h3><ul id="winRulesList" style="margin:.25rem 0 0 1.1rem"></ul>';
      host.appendChild(box);
    }
    return box;
  }
  function buildRules(info, certChecked){
    const current = new Date().getFullYear();
    const rules = [];
    if(info.eu === true){ rules.push('Formato: UE / HIN (14) — OK / Format: EU HIN (14) — OK'); }
    else if(info.eu === false){ rules.push('Formato: EUA (16) — OK / Format: US (16) — OK'); }
    else { rules.push('Formato desconhecido — verificar comprimento / Unknown format — check length'); }
    if(/^[A-Z]{2}$/.test(info.country||'')){
      rules.push('País (2): '+info.country+' → '+(info.countryName||'desconhecido')+' / Country code');
    } else { rules.push('País inválido (2 letras) / Invalid country code'); }
    if(/^[A-Z]{3}$/.test(info.maker||'')){
      rules.push('Fabricante (3): '+info.maker+' → '+(info.makerName||'não identificado')+' / Manufacturer code');
    } else { rules.push('Fabricante inválido (3 letras) / Invalid manufacturer code'); }
    if(/^[A-HJ-NPR-Z]$/.test(info.month||'')){
      rules.push('Mês: '+info.month+' ('+(info.monthName||'-')+') — OK / Month letter');
    } else { rules.push('Mês inválido (I,O,Q proibidas) / Invalid month'); }
    if(info.prodResolved){ rules.push('Ano de produção (1 díg.): '+info.year+' → '+info.prodResolved+' — OK / Production year'); }
    else { rules.push('Ano de produção inconsistente / Production year inconsistent'); }
    if(info.modelResolved){
      const windowMax = current + 1;
      if(info.modelResolved >= 1998 && info.modelResolved <= windowMax){
        rules.push('Ano do modelo (2 díg.): '+info.model+' → '+info.modelResolved+' — OK / Model year');
      } else {
        rules.push('Ano do modelo fora da janela (>=1998) / Model year out of window');
      }
    } else { rules.push('Ano do modelo inválido / Invalid model year'); }
    if(info.prodResolved && info.modelResolved){
      rules.push(info.modelResolved >= info.prodResolved
        ? 'Coerência: produção ≤ modelo — OK / Consistency: prod ≤ model — OK'
        : 'Inconsistência: modelo < produção / Inconsistency: model < production');
    }
    if(info.modelResolved && info.modelResolved < 1998){
      rules.push(certChecked
        ? 'Pré-1998: Certificado BV/Notified Body indicado — OK'
        : 'Pré-1998: requer Certificado BV/Notified Body — não indicado');
    } else {
      rules.push('Pré-1998: não aplicável / Not applicable');
    }
    return rules;
  }
  function showRules(info){
    const box = ensureRulesBox(); if(!box) return;
    const ul = box.querySelector('#winRulesList'); if(!ul) return;
    const cert = d.getElementById('winCert')?.checked === true;
    const rules = buildRules(info, cert);
    ul.innerHTML = rules.map(r=>'<li>'+r+'</li>').join('');
  }
  function hook(){
    const form = qs('#formWin') || qs('#winForm') || qs('form[data-form="win"]') || qs('form[action*="win"]');
    const input = qs('#win') || qs('#winInput') || qs('input[name="win"], input[name="hin"]');
    if(!form || !input) return;
    form.addEventListener('submit', function(){
      setTimeout(function(){
        try{
          const value = input.value || '';
          const info = interpretWIN(value);
          showRules(info);
          if (typeof w.renderWinResult === 'function'){
            const fields = [
              { label:'País / Country', value: info.country, meaning: (info.country||'')+' → '+(info.countryName||'Desconhecido') },
              { label:'Fabricante / Maker', value: info.maker, meaning: (info.maker||'')+' → '+(info.makerName||'—') },
              { label:'Série / Series', value: info.series, meaning: 'Sequência livre / Free sequence' },
              { label:'Mês / Month', value: info.month, meaning: info.monthName||'-' },
              { label:'Ano produção / Prod. year', value: String(info.year||''), meaning: String(info.prodResolved||'—') },
              { label:'Ano modelo / Model year', value: String(info.model||''), meaning: String(info.modelResolved||'—') },
              { label:'Formato / Format', value: info.eu ? 'UE (14)' : 'EUA (16)', meaning: 'Derivado do comprimento / Based on length' }
            ];
            const rules = buildRules(info, d.getElementById('winCert')?.checked);
            w.renderWinResult({ status: info.valid ? 'válido' : 'inválido', fields, rules });
          }
        }catch(e){}
      }, 60);
    });
  }
  if(d.readyState!=='loading') hook(); else d.addEventListener('DOMContentLoaded', hook);
})(window, document);
