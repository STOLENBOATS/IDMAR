
/* IDMAR — forense-attach.compat.r1b.js
   Atualiza o último registo (índice 0) com `foto` e `meta.forense[]`.
   Seguro com os dois aliases: history_* e history*.
*/
(function () {
  const log = (...a)=>console.log('[forense-attach.r1b]', ...a);

  function readList(keys){
    for (const k of keys){
      try{
        const raw = localStorage.getItem(k);
        if (raw) return { key: k, list: JSON.parse(raw) || [] };
      }catch(_){}
    }
    return { key: keys[0], list: [] };
  }
  function writeBoth(baseKey, list){
    try{ localStorage.setItem(baseKey, JSON.stringify(list)); }catch(_){}
    const alias = baseKey.replace(/_(\w)/g, (_,c)=>c.toUpperCase());
    try{ localStorage.setItem(alias, JSON.stringify(list)); }catch(_){}
  }

  async function fileToThumb(file, maxW=260){
    try{
      const dataUrl = await new Promise((res,rej)=>{
        const fr = new FileReader();
        fr.onerror = rej;
        fr.onload = ()=>res(fr.result);
        fr.readAsDataURL(file);
      });
      const img = await new Promise((res,rej)=>{
        const im = new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=dataUrl;
      });
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width*scale), h = Math.round(img.height*scale);
      const c = document.createElement('canvas'); c.width=w; c.height=h;
      const cx = c.getContext('2d'); cx.drawImage(img,0,0,w,h);
      return c.toDataURL('image/png');
    }catch(_){ return null; }
  }

  async function attach(module, file){
    if (!file || !(file instanceof File)) return;
    const baseName = (file.name || 'forense_' + new Date().toISOString() + '.png');

    const isWin = (module||'').toUpperCase()==='WIN';
    const keys = isWin ? ['history_win','historyWin'] : ['history_motor','historyMotor'];

    const { list } = readList(keys);
    if (!Array.isArray(list) || list.length===0){
      log('Sem registos para anexar (lista vazia).');
      return;
    }
    const entry = list[0];
    if (!entry.meta) entry.meta = {};
    if (!Array.isArray(entry.meta.forense)) entry.meta.forense = [];

    const thumb = await fileToThumb(file).catch(()=>null);

    entry.foto = baseName;
    entry.thumb = entry.thumb || thumb || null;
    entry.meta.forense.unshift({
      file: baseName,
      ts: new Date().toISOString(),
      thumb: thumb || null
    });

    writeBoth(keys[0], list);
    log(`Anexado a ${isWin?'WIN':'motor'}`, entry.id||'(sem id)', baseName);
  }

  window.ForenseAttachCompat = Object.freeze({
    attachWIN: (file)=>attach('WIN', file),
    attachMotor: (file)=>attach('MOTOR', file),
    attach
  });
})();
