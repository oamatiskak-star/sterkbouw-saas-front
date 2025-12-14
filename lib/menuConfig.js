export const menuConfig = [
  { key:"dashboard", title:"Dashboard", actions:[
    { id:"dashboard:overview", label:"Overzicht" },
    { id:"dashboard:quick", label:"Snelle acties" }
  ]},
  { key:"projecten", title:"Projecten", actions:[
    { id:"projecten:nieuw", label:"Nieuw project" },
    { id:"projecten:open", label:"Project openen" }
  ]},
  { key:"calculaties", title:"Calculaties", actions:[
    { id:"calculaties:bouw", label:"Bouwcalculatie" },
    { id:"calculaties:ew", label:"E en W calculatie" },
    { id:"calculaties:stabu", label:"STABU calculatie" },
    { id:"calculaties:fixed", label:"Fixed Price optimalisatie" }
  ]},
  { key:"architecten", title:"Architecten", actions:[
    { id:"architecten:bouwtekening", label:"Genereer bouwtekening" },
    { id:"architecten:installatie", label:"Genereer installatietekening" },
    { id:"architecten:bim", label:"Genereer BIM-model" }
  ]},
  { key:"engineering", title:"Engineering", actions:[
    { id:"engineering:meetstaat", label:"Genereer meetstaat" },
    { id:"engineering:controle", label:"Technische controle" }
  ]},
  { key:"planning", title:"Planning", actions:[
    { id:"planning:genereer", label:"Genereer planning" }
  ]},
  { key:"documenten", title:"Documenten", actions:[
    { id:"documenten:upload", label:"Upload bestanden" },
    { id:"documenten:overzicht", label:"Overzicht" }
  ]},
  { key:"analyse", title:"Analyse", actions:[
    { id:"analyse:risico", label:"Risicoanalyse" },
    { id:"analyse:cashflow", label:"Cashflow prognose" }
  ]},
  { key:"beheer", title:"Beheer", actions:[
    { id:"beheer:gebruikers", label:"Gebruikers" },
    { id:"beheer:rollen", label:"Rollen en rechten" }
  ]}
]
