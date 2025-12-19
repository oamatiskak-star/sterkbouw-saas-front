export const NAVIGATION = [
  {
    key: "nieuw_project",
    label: "Nieuw Project",
    route: "/nieuw-project",
    roles: ["admin"],
    children: [
      { key: "nieuw_project_overzicht", label: "Overzicht", route: "/nieuw-project", roles: ["admin"] },
      { key: "nieuw_project_import", label: "Importeer bestanden", route: "/nieuw-project/import", roles: ["admin"] },
      { key: "nieuw_project_structuur", label: "Maak mapstructuur", route: "/nieuw-project/structuur", roles: ["admin"] },
      { key: "nieuw_project_contact", label: "Nieuw contact", route: "/nieuw-project/contact", roles: ["admin"] },
      { key: "nieuw_project_activiteiten", label: "Activiteiten", route: "/nieuw-project/activiteiten", roles: ["admin"] },
      { key: "nieuw_project_taken", label: "Open taken", route: "/nieuw-project/taken", roles: ["admin"] },
      { key: "nieuw_project_meldingen", label: "Meldingen", route: "/nieuw-project/meldingen", roles: ["admin"] }
    ]
  },
  {
    key: "projecten",
    label: "Projecten",
    route: "/projecten",
    roles: ["admin"],
    children: [
      { key: "projecten_lopend", label: "Lopende projecten", route: "/projecten", roles: ["admin"] },
      { key: "projecten_detail", label: "Projectdetail", route: "/projecten/detail", roles: ["admin"] },
      { key: "projecten_planning", label: "Planning", route: "/projecten/planning", roles: ["admin"] },
      { key: "projecten_bestellingen", label: "Bestellingen", route: "/projecten/bestellingen", roles: ["admin"] },
      { key: "projecten_offertes", label: "Offertes", route: "/projecten/offertes", roles: ["admin"] },
      { key: "projecten_cashflow", label: "Cashflow", route: "/projecten/cashflow", roles: ["admin"] },
      { key: "projecten_risico", label: "Risico", route: "/projecten/risico", roles: ["admin"] },
      { key: "projecten_documenten", label: "Documenten", route: "/projecten/documenten", roles: ["admin"] },
      { key: "projecten_kalender", label: "Kalender", route: "/projecten/kalender", roles: ["admin"] },
      { key: "projecten_archief", label: "Archief", route: "/projecten/archief", roles: ["admin"] }
    ]
  },
  {
    key: "calculaties",
    label: "Calculaties",
    route: "/calculaties",
    roles: ["admin"],
    children: [
      { key: "calculaties_overzicht", label: "Overzicht calculaties", route: "/calculaties", roles: ["admin"] },
      { key: "calculaties_nieuw", label: "Nieuwe calculatie", route: "/calculaties/nieuw", roles: ["admin"] },
      { key: "calculaties_import", label: "Importeer bestanden", route: "/calculaties/import", roles: ["admin"] },
      { key: "calculaties_bewerken", label: "Calculatie bewerken", route: "/calculaties/bewerken", roles: ["admin"] },
      { key: "calculaties_fixed_price", label: "Fixed Price", route: "/calculaties/fixed-price", roles: ["admin"] },
      { key: "calculaties_ew", label: "E en W", route: "/calculaties/ew", roles: ["admin"] },
      { key: "calculaties_output", label: "Output / PDF", route: "/calculaties/output", roles: ["admin"] }
    ]
  },
  {
    key: "financiering",
    label: "Financiering",
    route: "/financiering",
    roles: ["admin"],
    children: [
      { key: "financiering_aankoop_verhuurd", label: "Aankoop belegging verhuurd", route: "/financiering/aankoop-verhuurd", roles: ["admin"] },
      { key: "financiering_aankoop_leegstand", label: "Aankoop belegging leegstaand", route: "/financiering/aankoop-leegstand", roles: ["admin"] },
      { key: "financiering_projectontwikkeling", label: "Aankoop projectontwikkeling", route: "/financiering/projectontwikkeling", roles: ["admin"] },
      { key: "financiering_structuur", label: "Financieringsstructuur", route: "/financiering/structuur", roles: ["admin"] },
      { key: "financiering_ltv", label: "LTV overzicht", route: "/financiering/ltv", roles: ["admin"] },
      { key: "financiering_exit", label: "Exit scenario’s", route: "/financiering/exit", roles: ["admin"] },
      { key: "financiering_import", label: "Importeer bestanden", route: "/financiering/import", roles: ["admin"] }
    ]
  },
  {
    key: "projectontwikkeling",
    label: "Projectontwikkeling",
    route: "/projectontwikkeling",
    roles: ["admin"],
    children: [
      { key: "projectontwikkeling_portalen", label: "Portalen", route: "/projectontwikkeling/portalen", roles: ["admin"] },
      { key: "projectontwikkeling_updates", label: "Updates", route: "/projectontwikkeling/updates", roles: ["admin"] },
      { key: "projectontwikkeling_documenten", label: "Documentdeling", route: "/projectontwikkeling/documenten", roles: ["admin"] },
      { key: "projectontwikkeling_meldingen", label: "Meldingen", route: "/projectontwikkeling/meldingen", roles: ["admin"] },
      { key: "projectontwikkeling_helpdesk", label: "Helpdesk", route: "/projectontwikkeling/helpdesk", roles: ["admin"] },
      { key: "projectontwikkeling_tickets", label: "Tickets", route: "/projectontwikkeling/tickets", roles: ["admin"] },
      { key: "projectontwikkeling_status", label: "Status", route: "/projectontwikkeling/status", roles: ["admin"] }
    ]
  },
  {
    key: "ontwerp_bim",
    label: "Ontwerp en BIM",
    route: "/bim",
    roles: ["admin"],
    children: [
      { key: "bim_bouwkundig", label: "Ontwerp bouwkundig", route: "/bim/bouwkundig", roles: ["admin"] },
      { key: "bim_installaties", label: "Ontwerp installaties", route: "/bim/installaties", roles: ["admin"] },
      { key: "bim_elektrisch", label: "Ontwerp elektra", route: "/bim/elektra", roles: ["admin"] },
      { key: "bim_water", label: "Ontwerp water en verwarming", route: "/bim/water", roles: ["admin"] },
      { key: "bim_tekeningen", label: "Tekeningen", route: "/bim/tekeningen", roles: ["admin"] },
      { key: "bim_vergunning", label: "Vergunningsstukken", route: "/bim/vergunning", roles: ["admin"] },
      { key: "bim_3d", label: "3D plattegrond render", route: "/bim/3d", roles: ["admin"] }
    ]
  },
  {
    key: "constructie",
    label: "Constructie berekenen",
    route: "/constructie",
    roles: ["admin"],
    children: [
      { key: "constructie_fundering", label: "Fundering", route: "/constructie/fundering", roles: ["admin"] },
      { key: "constructie_staal", label: "Staal", route: "/constructie/staal", roles: ["admin"] },
      { key: "constructie_beton", label: "Beton", route: "/constructie/beton", roles: ["admin"] },
      { key: "constructie_rapport", label: "Rapporten", route: "/constructie/rapporten", roles: ["admin"] },
      { key: "constructie_nieuw", label: "Nieuw rapport", route: "/constructie/nieuw", roles: ["admin"] }
    ]
  },
  {
    key: "financien",
    label: "Financiën",
    route: "/financien",
    roles: ["admin"],
    children: [
      { key: "financien_cashflow", label: "Cashflow", route: "/financien/cashflow", roles: ["admin"] },
      { key: "financien_projecten", label: "Alle projecten", route: "/financien/projecten", roles: ["admin"] },
      { key: "financien_per_project", label: "Per project", route: "/financien/per-project", roles: ["admin"] },
      { key: "financien_ontwikkelaar", label: "Ontwikkelaarscashflow", route: "/financien/ontwikkelaar", roles: ["admin"] },
      { key: "financien_administratie", label: "Administratie", route: "/financien/administratie", roles: ["admin"] },
      { key: "financien_rapportages", label: "Rapportages", route: "/financien/rapportages", roles: ["admin"] }
    ]
  },
  {
    key: "investeringen",
    label: "Investeringen",
    route: "/investeringen",
    roles: ["admin"],
    children: [
      { key: "investeringen_haalbaarheid", label: "Haalbaarheidsanalyse", route: "/investeringen/haalbaarheid", roles: ["admin"] },
      { key: "investeringen_import", label: "Importeer bestanden", route: "/investeringen/import", roles: ["admin"] },
      { key: "investeringen_scenarios", label: "Scenario’s", route: "/investeringen/scenarios", roles: ["admin"] },
      { key: "investeringen_rendement", label: "Rendement", route: "/investeringen/rendement", roles: ["admin"] },
      { key: "investeringen_risico", label: "Risicoanalyse", route: "/investeringen/risico", roles: ["admin"] }
    ]
  },
  {
    key: "mail",
    label: "Mail",
    route: "/mail",
    roles: ["admin"],
    children: [
      { key: "mail_inbox", label: "Inbox", route: "/mail", roles: ["admin"] },
      { key: "mail_dagelijks", label: "Dagelijkse verwerking", route: "/mail/dagelijks", roles: ["admin"] },
      { key: "mail_concepten", label: "Antwoordconcepten", route: "/mail/concepten", roles: ["admin"] },
      { key: "mail_offertes", label: "Offerteaanvragen", route: "/mail/offertes", roles: ["admin"] },
      { key: "mail_bestellingen", label: "Bestellingen", route: "/mail/bestellingen", roles: ["admin"] },
      { key: "mail_facturen", label: "Facturen", route: "/mail/facturen", roles: ["admin"] },
      { key: "mail_project", label: "Projectmail", route: "/mail/project", roles: ["admin"] }
    ]
  },
  {
    key: "instellingen",
    label: "Instellingen",
    route: "/instellingen",
    roles: ["admin"],
    children: [
      { key: "instellingen_gebruikers", label: "Gebruikers", route: "/instellingen/gebruikers", roles: ["admin"] },
      { key: "instellingen_rollen", label: "Rollen", route: "/instellingen/rollen", roles: ["admin"] },
      { key: "instellingen_rechten", label: "Rechten", route: "/instellingen/rechten", roles: ["admin"] },
      { key: "instellingen_modules", label: "Modules", route: "/instellingen/modules", roles: ["admin"] },
      { key: "instellingen_kpi", label: "KPI definities", route: "/instellingen/kpi", roles: ["admin"] },
      { key: "instellingen_pdf", label: "PDF templates", route: "/instellingen/pdf", roles: ["admin"] },
      { key: "instellingen_bedrijf", label: "Bedrijfsgegevens", route: "/instellingen/bedrijf", roles: ["admin"] },
      { key: "instellingen_systeem", label: "Systeem", route: "/instellingen/systeem", roles: ["admin"] }
    ]
  }
]
