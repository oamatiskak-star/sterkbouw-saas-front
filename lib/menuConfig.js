// lib/menuConfig.js
export const MENU = {
  dashboard: [
    { key: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { key: 'administratie', label: 'Administratie', href: '/administratie' },
    { key: 'bim', label: 'BIM', href: '/bim' },
    { key: 'bouwplaats', label: 'Bouwplaats', href: '/bouwplaatsApp' },
    { key: 'calculatie', label: 'Calculatie', href: '/calculaties' },
    { key: 'constructie', label: 'Constructie', href: '/constructie' },
    { key: 'documenten', label: 'Documenten', href: '/documenten' },
    { key: 'financien', label: 'Financiën', href: '/financien' },
    { key: 'financieringen', label: 'Financieringen', href: '/financiering' },
    { key: 'inkoop', label: 'Inkoop', href: '/inkoop' },
    { key: 'kopersportaal', label: 'Kopersportaal', href: '/kopersportaal' },
    { key: 'mail', label: 'Mail', href: '/mail' },
    { key: 'planning', label: 'Planning', href: '/planning' },
    { key: 'projecten', label: 'Projecten', href: '/projecten' },
    { key: 'projectportaal', label: 'Projectportaal', href: '/projectportaal' },
    { key: 'instellingen', label: 'Instellingen', href: '/instellingen' },
  ],

  ontwikkeling: [
    { key: 'overzicht', label: 'Overzicht', href: '/ontwikkeling' },
    { key: 'projecten', label: 'Projecten', href: '/ontwikkeling/projecten' },
    { key: 'rapportages', label: 'Rapportages', href: '/ontwikkeling/rapportages' },
  ],

  bouwplaats: [
    { key: 'inspecties', label: 'Inspecties', href: '/inspecties' },
    { key: 'leveringen', label: 'Leveringen', href: '/leveringen' },
    { key: 'materialen', label: 'Materialen', href: '/materialen' },
    { key: 'bim', label: 'BIM', href: '/bim' },
  ],

  projectportaal: [
    { key: 'status', label: 'Status', href: '/project' },
    { key: 'documenten', label: 'Documenten', href: '/documenten' },
    { key: 'communicatie', label: 'Communicatie', href: '/communicatie' },
    { key: 'akkoord', label: 'Akkoord', href: '/akkoord' },
  ],
}
