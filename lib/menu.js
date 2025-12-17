export const MENU = [
{
key: "dashboard",
label: "Dashboard",
icon: "home",
route: "/dashboard",
children: [
{ label: "Overzicht", route: "/dashboard" },
{ label: "Nieuw project", route: "/dashboard/nieuw-project" },
{ label: "Importeer bestanden", route: "/dashboard/import" },
{ label: "Mapstructuur", route: "/dashboard/mappen" },
{ label: "Contacten", route: "/dashboard/contact" },
{ label: "Activiteiten", route: "/dashboard/activiteiten" },
{ label: "Taken", route: "/dashboard/taken" },
{ label: "Meldingen", route: "/dashboard/meldingen" }
]
},
{
key: "projecten",
label: "Projecten",
icon: "building",
route: "/projecten",
children: [
{ label: "Overzicht", route: "/projecten" },
{ label: "Planning", route: "/planning" },
{ label: "Bestellingen", route: "/bestellingen" },
{ label: "Offertes", route: "/offertes" },
{ label: "Cashflow", route: "/cashflow" },
{ label: "Risico", route: "/risico" },
{ label: "Documenten", route: "/uploads" }
]
},
{
key: "calculaties",
label: "Calculaties",
icon: "calculator",
route: "/calculaties",
children: [
{ label: "Overzicht", route: "/calculaties" },
{ label: "Nieuwe calculatie", route: "/calculaties/nieuw" },
{ label: "Bouwkundig", route: "/calculaties/bouw" },
{ label: "E", route: "/calculaties/e" },
{ label: "W", route: "/calculaties/w" },
{ label: "Fixed Price", route: "/calculaties/fixed-price" },
{ label: "PDF output", route: "/calculaties/output" }
]
},
{
key: "ontwerp_bim",
label: "Ontwerp & BIM",
icon: "cube",
route: "/bim",
children: [
{ label: "BIM meetstaat", route: "/bim" },
{ label: "Tekeningen", route: "/bim/tekeningen" },
{ label: "3D renders", route: "/bim/3d" }
]
}
]
