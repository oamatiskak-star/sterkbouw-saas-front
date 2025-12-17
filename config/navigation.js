export const NAVIGATION = [
  {
    key: "dashboard",
    label: "Dashboard",
    route: "/dashboard",
    children: [
      { key: "dashboard_overzicht", label: "Overzicht", route: "/dashboard" },
      { key: "dashboard_activiteiten", label: "Activiteiten", route: "/dashboard/activiteiten" },
      { key: "dashboard_meldingen", label: "Meldingen", route: "/dashboard/meldingen" }
    ]
  },
  {
    key: "projecten",
    label: "Projecten",
    route: "/projecten",
    children: [
      { key: "projecten_overzicht", label: "Overzicht", route: "/projecten" },
      { key: "projecten_nieuw", label: "Nieuw project", route: "/projecten/nieuw" },
      { key: "projecten_planning", label: "Planning", route: "/projecten/planning" },
      { key: "projecten_documenten", label: "Documenten", route: "/projecten/documenten" },
      { key: "projecten_risico", label: "Risico", route: "/projecten/risico" }
    ]
  },
  {
    key: "calculaties",
    label: "Calculaties",
    route: "/calculaties",
    children: [
      { key: "calculaties_overzicht", label: "Overzicht", route: "/calculaties" },
      { key: "calculaties_nieuw", label: "Nieuwe calculatie", route: "/calculaties/nieuw" },
      { key: "calculaties_bewerken", label: "Calculatie bewerken", route: "/calculaties/bewerken" },
      { key: "calculaties_output", label: "Output / PDF", route: "/calculaties/output" }
    ]
  },
  {
    key: "ontwerp_bim",
    label: "Ontwerp & BIM",
    route: "/bim",
    children: [
      { key: "bim_ontwerp", label: "Ontwerp bouwkundig", route: "/bim/ontwerp" },
      { key: "bim_ew", label: "E en W", route: "/bim/ew" },
      { key: "bim_tekeningen", label: "Tekeningen", route: "/bim/tekeningen" }
    ]
  },
  {
    key: "financien",
    label: "Financiën",
    route: "/financien",
    children: [
      { key: "financien_cashflow", label: "Cashflow", route: "/financien/cashflow" },
      { key: "financien_rapportages", label: "Rapportages", route: "/financien/rapportages" }
    ]
  },
  {
    key: "instellingen",
    label: "Instellingen",
    route: "/instellingen",
    children: [
      { key: "instellingen_gebruikers", label: "Gebruikers", route: "/instellingen/gebruikers" },
      { key: "instellingen_rollen", label: "Rollen", route: "/instellingen/rollen" },
      { key: "instellingen_systeem", label: "Systeem", route: "/instellingen/systeem" }
    ]
  }
]
