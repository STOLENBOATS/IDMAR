
export class EngineCatalog {
  constructor(data){ this.data = data || { brands: {} }; }
  static async load(url){
    const res = await fetch(url); const json = await res.json();
    return new EngineCatalog(json);
  }
  brands(){ return Object.keys(this.data.brands||{}); }
  brand(name){ return (this.data.brands||{})[name] || null; }
  optionsFor(name){
    const b = this.brand(name); if(!b) return {};
    return {
      shaft: b.shaft_options||[],
      yearPairsHint: b.year_letter_pairs_hint||"",
      seriesDigits: b.series_digits||[],
      modelExamples: b.model_code_examples||[],
      powerRange: b.power_hp_range||null,
      dispRange: b.displacement_cc_range||null,
      originsHint: b.origins_hint||[],
      searchExamples: b.search_examples||[],
    };
  }
}
