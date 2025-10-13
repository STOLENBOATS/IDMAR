// engine_admin_embed.v1.js — “Admin rápido” no Validador (após Forense), PT/EN
(function(w,d){
  const LS_ENGINE = 'IDMAR_ENGINE_OVERRIDES';
  const LS_MIC    = 'IDMAR_MIC_OVERRIDES';

  function $id(id){ return d.getElementById(id); }
  function loadLS(key, def){ try{ return JSON.parse(localStorage.getItem(key)||JSON.stringify(def)); }catch(_){ return def; } }
  function saveLS(key, obj){ try{ localStorage.setItem(key, JSON.stringify(obj||{})); }catch(_){} }
  function uniqPush(arr, val){ const s=new Set(arr||[]); if(val==null||val==='') return Array.from(s); s.add(String(val)); return Array.from(s); }
  function ensure(containerId, html){
    let el = $id(containerId);
    if(!el){ el = d.createElement('div'); el.id = containerId; el.className='panel'; el.innerHTML = html; const anchor = d.querySelector('details.forense-box'); (anchor? anchor : d.body).insertAdjacentElement('afterend', el); }
    return el;
  }

  // --- Painel Admin: comum (motor/WIN) ---
  function renderAdminPanel(scope){
    const html = `
      <details id="adminQuick_${scope}" class="forense-box" open>
        <summary>Admin (local) / Admin (local)</summary>
        <div class="small" style="margin:.25rem 0 .5rem">
          Guardar no dispositivo valores confirmados em campo (não sincroniza).
          / Save confirmed values locally on this device (no sync).
        </div>
        <div id="adminQuick_${scope}_body"></div>
      </details>`;
    return ensure('adminQuick_'+scope, html);
  }

  // ========================= MOTORES =========================
  function latestValidityMotor(){
    const out = $id('motorOut');
    if(!out) return {ok:false, text:''};
    const txt=(out.textContent||'').toLowerCase();
    return { ok: /válido|valid/.test(txt) && !/inválido|invalid/.test(txt), text: out.textContent||'' };
  }
  function getMotorSelection(){
    const pick = id => ($id(id)?.value)||'';
    return {
      brand: $id('brand')?.value || '',
      family: pick('eng_family'),
      model: pick('eng_model'),
      hp: pick('eng_hp'),
      displacement: pick('eng_disp'),
      year: pick('eng_year'),
      rigging: pick('eng_rig'),
      shaft: pick('eng_shaft'),
      rotation: pick('eng_rot'),
      color: pick('eng_color'),
      gear: pick('eng_gear')
    };
  }
  function adminMotorUI(){
    const host = renderAdminPanel('motor');
    const body = $id('adminQuick_motor_body');
    if(!body) return;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem">
        <div><label>Marca / Brand</label><input id="adm_m_brand" type="text" readonly></div>
        <div><label>Família / Family</label><input id="adm_m_family" type="text"></div>
        <div><label>Modelo / Model code</label><input id="adm_m_model" type="text"></div>
        <div><label>Potência (hp) / Power</label><input id="adm_m_hp" type="text"></div>
        <div><label>Cilindrada (cc) / Displacement</label><input id="adm_m_disp" type="text"></div>
        <div><label>Ano / Year</label><input id="adm_m_year" type="text"></div>
        <div><label>Comando / Rigging</label><input id="adm_m_rig" type="text" placeholder="DEC/DBW, Mechanical..."></div>
        <div><label>Altura / Shaft</label><input id="adm_m_shaft" type="text" placeholder="S/L/X/UL..."></div>
        <div><label>Rotação / Rotation</label><input id="adm_m_rot" type="text" placeholder="STD/CCW"></div>
      </div>
      <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button id="adm_m_add" class="btn">Adicionar ao catálogo (local) / Add to catalog (local)</button>
        <span id="adm_m_status" class="small"></span>
      </div>`;

    // Prefill com a seleção atual
    const s = getMotorSelection();
    $id('adm_m_brand').value  = s.brand || '';
    $id('adm_m_family').value = s.family || '';
    $id('adm_m_model').value  = s.model || '';
    $id('adm_m_hp').value     = s.hp || '';
    $id('adm_m_disp').value   = s.displacement || '';
    $id('adm_m_year').value   = s.year || '';
    $id('adm_m_rig').value    = s.rigging || '';
    $id('adm_m_shaft').value  = s.shaft || '';
    $id('adm_m_rot').value    = s.rotation || '';

    // Só ativa o botão se a validação for Válida
    const valid = latestValidityMotor().ok;
    const btn   = $id('adm_m_add'); const status=$id('adm_m_status');
    btn.disabled = !valid;
    status.textContent = valid ? 'Válido — pronto a adicionar / Valid — ready to add'
                               : 'Aguardando validação válida / Waiting for a valid result';

    btn.addEventListener('click', ()=>{
      const brand = $id('adm_m_brand').value.trim();
      const family= $id('adm_m_family').value.trim() || '_generic';
      if(!brand){ status.textContent='Indique a marca / Set brand'; return; }

      const ov = loadLS(LS_ENGINE, {});
      ov[brand] = ov[brand] || {};
      ov[brand].families = ov[brand].families || {};
      const f = ov[brand].families[family] = ov[brand].families[family] || {};

      f.hp_list          = uniqPush(f.hp_list||[], $id('adm_m_hp').value.trim());
      f.model_code_list  = uniqPush(f.model_code_list||[], $id('adm_m_model').value.trim());
      f.displacement_list= uniqPush(f.displacement_list||[], $id('adm_m_disp').value.trim());
      // years: aceita “2015” ou “2014–2017”
      const yraw = $id('adm_m_year').value.trim();
      if(yraw){
        if(/^\d{4}\s*-\s*\d{4}$/.test(yraw)){
          const [a,b] = yraw.split('-').map(s=>parseInt(s,10));
          for(let y=a;y<=b;y++) f.year_list = uniqPush(f.year_list||[], y);
        }else{
          f.year_list = uniqPush(f.year_list||[], yraw);
        }
      }
      f.rigging          = uniqPush(f.rigging||[], $id('adm_m_rig').value.trim());
      f.shaft_options    = uniqPush(f.shaft_options||[], $id('adm_m_shaft').value.trim());
      f.rotation         = uniqPush(f.rotation||[], ($id('adm_m_rot').value.trim().toUpperCase()||'STD'));

      saveLS(LS_ENGINE, ov);
      status.textContent = 'Guardado localmente / Saved locally';
    });
  }

  // =========================== WIN ===========================
  function latestValidityWin(){
    const out = $id('winOut');
    if(!out) return {ok:false,text:''};
    const txt=(out.textContent||'').toLowerCase();
    return { ok: /válido|valid/.test(txt) && !/inválido|invalid/.test(txt), text: out.textContent||'' };
  }
  function parseCurrentWin(){
    const win = $id('win')?.value.trim() || '';
    const maker = (d.querySelector('#interpWinBody tr:nth-child(2) td strong')?.textContent || '').trim().slice(0,3) || '';
    const makerLabelCell = d.querySelector('#interpWinBody tr:nth-child(2) td:last-child');
    const makerName = makerLabelCell ? (makerLabelCell.textContent.split('→')[1]||'').trim() : '';
    return { win, maker, makerName };
  }
  function adminWinUI(){
    const host = renderAdminPanel('win');
    const body = $id('adminQuick_win_body');
    if(!body) return;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.5rem">
        <div><label>Fabricante (código) / Maker code</label><input id="adm_w_maker" type="text" maxlength="3"></div>
        <div><label>Nome / Name</label><input id="adm_w_name" type="text" placeholder="Jeanneau, Beneteau..."></div>
        <div><label>Exemplo WIN / Sample WIN</label><input id="adm_w_sample" type="text" placeholder="PT-ABC12345D404"></div>
        <div style="grid-column:1/-1"><label>Notas / Notes</label><input id="adm_w_notes" type="text" placeholder="Observações úteis..."></div>
      </div>
      <div style="margin-top:.5rem;display:flex;gap:.5rem;flex-wrap:wrap">
        <button id="adm_w_add" class="btn">Adicionar (local) / Add (local)</button>
        <span id="adm_w_status" class="small"></span>
      </div>`;

    // Prefill com o WIN atual
    const cur = parseCurrentWin();
    $id('adm_w_maker').value  = cur.maker || '';
    $id('adm_w_name').value   = cur.makerName || '';
    $id('adm_w_sample').value = cur.win || '';

    const valid = latestValidityWin().ok;
    const btn   = $id('adm_w_add'); const status=$id('adm_w_status');
    btn.disabled = !valid;
    status.textContent = valid ? 'Válido — pronto a adicionar / Valid — ready to add'
                               : 'Aguardando validação válida / Waiting for a valid result';

    btn.addEventListener('click', ()=>{
      const maker = ($id('adm_w_maker').value||'').toUpperCase().trim();
      const name  = $id('adm_w_name').value.trim();
      if(!maker || maker.length!==3){ status.textContent='Código maker inválido / Invalid maker code'; return; }

      const ov = loadLS(LS_MIC, {});
      ov[maker] = ov[maker] || { name:'', notes:'', samples:[] };
      if(name) ov[maker].name = name;
      const notes = $id('adm_w_notes').value.trim();
      if(notes) ov[maker].notes = notes;
      const sample = $id('adm_w_sample').value.trim();
      if(sample) ov[maker].samples = uniqPush(ov[maker].samples, sample);
      saveLS(LS_MIC, ov);
      status.textContent = 'Guardado localmente / Saved locally';
    });
  }

  // ====== Boot: injeta os paineis nos 2 validadores ======
  function boot(){
    // Motor
    if($id('formMotor')) adminMotorUI();
    // WIN
    if($id('formWin')) adminWinUI();

    // Atualiza estado quando houver nova submissão
    if($id('formMotor')) $id('formMotor').addEventListener('submit', ()=>setTimeout(adminMotorUI, 0));
    if($id('formWin'))   $id('formWin').addEventListener('submit', ()=>setTimeout(adminWinUI, 0));
  }

  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window, document);
