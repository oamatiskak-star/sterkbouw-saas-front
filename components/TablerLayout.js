import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"
import { AppContext } from "../pages/_app"

export default function TablerLayout({ children }) {
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useContext(AppContext)

  const menu = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: "home"
    },
    {
      label: "Projecten",
      href: "/projecten",
      icon: "building",
      children: [
        { label: "Overzicht", href: "/projecten/overzicht" },
        { label: "Nieuw project", href: "/projecten/nieuw" }
      ]
    },
    {
      label: "Calculaties",
      href: "/calculaties",
      icon: "calculator",
      children: [
        { label: "STABU calculator", href: "/calculaties/stabu" },
        { label: "Fixed Price", href: "/calculaties/fixed-price" }
      ]
    },
    {
      label: "Ontwerp & BIM",
      href: "/bim",
      icon: "cube",
      children: [
        { label: "BIM Architect", href: "/bim/architect" },
        { label: "Constructeurs", href: "/bim/constructeurs" },
        { label: "E en W", href: "/bim/ew" }
      ]
    },
    {
      label: "Portalen",
      href: "/portalen",
      icon: "users",
      children: [
        { label: "Kopersportaal", href: "/portalen/kopers" },
        { label: "Huurdersportaal", href: "/portalen/huurders" }
      ]
    },
    {
      label: "Financiën",
      href: "/financien",
      icon: "cash",
      children: [
        { label: "Investeringen", href: "/financien/investeringen" },
        { label: "Cashflow", href: "/financien/cashflow" },
        { label: "Rapportages", href: "/financien/rapportages" }
      ]
    },
    {
      label: "Instellingen",
      href: "/instellingen",
      icon: "settings",
      children: [
        { label: "Gebruikers", href: "/instellingen/gebruikers" },
        { label: "Rollen", href: "/instellingen/rollen" },
        { label: "Systeem", href: "/instellingen/systeem" }
      ]
    }
  ]

  return (
    <div className={`page ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <aside cla
