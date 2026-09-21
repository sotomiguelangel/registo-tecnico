(function (root) {
  'use strict';

  var categories = [
    'Canalização',
    'Portas/Fechaduras',
    'Acabamentos/Decoração',
    'Climatização',
    'Casa de Banho',
    'Outros',
    'Elétrico',
    'Cortinados',
    'Cozinha/Equipamento',
    'Amenities/Acessórios',
    'Mobiliário',
    'Pintura Preventiva',
    'Limpeza/Manutenção Geral',
    'Equipamento',
    'Minibar'
  ];

  function normalizeText(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/[\uFEFF\u200B\u200C\u200D]/g, '')
      .replace(/[\s\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]+/g, ' ')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function canonicalize(value, options) {
    var normalized = normalizeText(value);
    var strict = options && options.strict === true;
    if (!normalized) return 'Outros';

    var exact = categories.find(function (category) {
      return normalizeText(category) === normalized;
    });
    if (exact) return exact;

    if (
      normalized === 'casa banho' ||
      normalized.indexOf('casa de banho') !== -1 ||
      normalized.indexOf('casa banho') !== -1 ||
      normalized.indexOf('banheiro') !== -1 ||
      normalized === 'wc' ||
      normalized.indexOf('sanitario') !== -1 ||
      normalized.indexOf('instalacao sanitaria') !== -1
    ) return 'Casa de Banho';

    if (normalized.indexOf('canaliz') !== -1 || normalized.indexOf('hidraul') !== -1 ||
        normalized.indexOf('tubo') !== -1 || normalized.indexOf('fuga') !== -1 ||
        normalized.indexOf('agua') !== -1 || normalized.indexOf('torneir') !== -1) return 'Canalização';
    if (normalized.indexOf('porta') !== -1 || normalized.indexOf('fechad') !== -1 ||
        normalized.indexOf('tranco') !== -1 || normalized.indexOf('mola') !== -1 ||
        normalized.indexOf('chave') !== -1) return 'Portas/Fechaduras';
    if (normalized.indexOf('pintur') !== -1 || normalized.indexOf('verniz') !== -1 ||
        normalized.indexOf('tinta') !== -1 || normalized.indexOf('lixar') !== -1) return 'Pintura Preventiva';
    if (normalized.indexOf('acabamento') !== -1 || normalized.indexOf('decor') !== -1 ||
        normalized.indexOf('gesso') !== -1 || normalized.indexOf('pladur') !== -1 ||
        normalized.indexOf('papel') !== -1 || normalized.indexOf('estrutur') !== -1 ||
        normalized.indexOf('teto') !== -1) return 'Acabamentos/Decoração';
    if (normalized.indexOf('cozinha') !== -1 || normalized.indexOf('forno') !== -1 ||
        normalized.indexOf('fogao') !== -1 || normalized.indexOf('exaustor') !== -1 ||
        normalized.indexOf('fritadeir') !== -1 || normalized.indexOf('frio') !== -1 ||
        normalized.indexOf('refriger') !== -1) return 'Cozinha/Equipamento';
    if (normalized.indexOf('eletric') !== -1 || normalized.indexOf('eletro') !== -1 ||
        normalized.indexOf('quadro') !== -1 || normalized.indexOf('disjuntor') !== -1 ||
        normalized.indexOf('tomada') !== -1 || normalized.indexOf('lampada') !== -1 ||
        normalized.indexOf('luz') !== -1) return 'Elétrico';
    if (normalized.indexOf('cortina') !== -1 || normalized.indexOf('cortinado') !== -1 ||
        normalized.indexOf('estor') !== -1 || normalized.indexOf('persiana') !== -1) return 'Cortinados';
    if (normalized.indexOf('mobil') !== -1 || normalized.indexOf('movel') !== -1 ||
        normalized.indexOf('moveis') !== -1 || normalized.indexOf('cadeira') !== -1 ||
        normalized.indexOf('mesa') !== -1 || normalized.indexOf('cama') !== -1 ||
        normalized.indexOf('sofa') !== -1) return 'Mobiliário';
    if (normalized.indexOf('minibar') !== -1 || normalized.indexOf('frigobar') !== -1) return 'Minibar';
    if (normalized.indexOf('clima') !== -1 || normalized.indexOf('arcond') !== -1 ||
        normalized.indexOf('ar cond') !== -1 || normalized.indexOf('avac') !== -1 ||
        normalized.indexOf('chiller') !== -1 || normalized.indexOf('ventil') !== -1 ||
        normalized.indexOf('aqs') !== -1) return 'Climatização';
    if (normalized.indexOf('limpez') !== -1 || normalized.indexOf('manutencao geral') !== -1 ||
        normalized.indexOf('higiene') !== -1 || normalized.indexOf('desinfe') !== -1 ||
        normalized.indexOf('lixo') !== -1 || normalized.indexOf('geral') !== -1) return 'Limpeza/Manutenção Geral';
    if (normalized.indexOf('amenit') !== -1 || normalized.indexOf('acessor') !== -1 ||
        normalized.indexOf('toalheir') !== -1 || normalized.indexOf('saboneteir') !== -1 ||
        normalized.indexOf('espelho') !== -1 || normalized.indexOf('cabide') !== -1 ||
        normalized.indexOf('utensil') !== -1 || normalized.indexOf('secador') !== -1) return 'Amenities/Acessórios';
    if (normalized.indexOf('equip') !== -1 || normalized.indexOf('maquin') !== -1 ||
        normalized.indexOf('motor') !== -1 || normalized.indexOf('bomba') !== -1 ||
        normalized.indexOf('piscina') !== -1 || normalized.indexOf('caldeira') !== -1 ||
        normalized.indexOf('seguranc') !== -1 || normalized.indexOf('alarme') !== -1) return 'Equipamento';

    return strict ? null : 'Outros';
  }

  root.MaintenanceCategories = Object.freeze({
    CANONICAL: Object.freeze(categories.slice()),
    normalizeText: normalizeText,
    canonicalize: canonicalize
  });
})(typeof window !== 'undefined' ? window : globalThis);
