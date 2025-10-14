// js/engine-brand-config.v1.js
window.IDMAR_BRAND_CONFIG = {
  version: 'r1',
  brands: {
    yamaha: {
      label: 'Yamaha',
      fields: [
        { id:'sn', label:'Número de Série', type:'text', placeholder:'ex.: 6ML-1005843', required:true, pattern:'^[A-Z0-9\-]{5,20}$', help:'Pode incluir prefixo/código (ex.: 6ML) seguido do número.' },
        { id:'plate_loc', label:'Localização da chapa', type:'select', options:['Coluna de direção','Suporte (bracket)','Bloco do motor (core plug)'], help:'Onde foi lida/confirmada a chapa.' },
        { id:'year_code', label:'Código de ano (se aplicável)', type:'text', placeholder:'ex.: N', pattern:'^[A-HJ-NPR-Z0-9]$' },
        { id:'notes', label:'Notas/observações', type:'textarea', placeholder:'Aspetos visuais / anomalias / corrosão / remarcações…' }
      ],
      rules: {
        validate(form){ 
          const out = { ok:true, issues:[] };
          const sn = form.sn?.trim() || '';
          if (!sn) { out.ok=false; out.issues.push('Número de Série é obrigatório.'); }
          if (sn && !/^[A-Z0-9\-]{5,20}$/.test(sn)) { out.ok=false; out.issues.push('Formato do SN inesperado.'); }
          if (sn && !/^[A-Z0-9]{2,4}\-/.test(sn)) { out.issues.push('Dica: faltará um prefixo (ex.: 6ML-)?'); }
          return out;
        }
      }
    },
    honda: {
      label: 'Honda',
      fields: [
        { id:'sn', label:'Número de Série', type:'text', placeholder:'ex.: BABJ-1300123', required:true, pattern:'^[A-Z0-9\-]{5,20}$' },
        { id:'plate_loc', label:'Localização da chapa', type:'select', options:['Chapa lateral','Suporte (bracket)','Bloco (core plug)'] },
        { id:'model_code', label:'Código de modelo', type:'text', placeholder:'ex.: BF90D' },
        { id:'notes', label:'Notas/observações', type:'textarea', placeholder:'Sinais de remarcação / divergência com etiqueta de modelo…' }
      ],
      rules: {
        validate(form){
          const out = { ok:true, issues:[] };
          const sn = form.sn?.trim() || '';
          if (!sn) { out.ok=false; out.issues.push('Número de Série é obrigatório.'); }
          if (sn && !/^[A-Z0-9\-]{5,20}$/.test(sn)) { out.ok=false; out.issues.push('Formato do SN inesperado.'); }
          return out;
        }
      }
    }
  }
};
