import React from "react"

export default function ModuleRenderer({ component }) {
  const { type, config = {} } = component

  const ui = config.ui || {}
  const buttonsUi = ui.buttons || {}

  const isCard = ui.wrapper === "card"

  const cardStyle = isCard
    ? {
        background: ui.background || "#ffffff",
        borderRadius: ui.radius || 14,
        padding: ui.padding || 20,
        boxShadow:
          ui.shadow === "soft"
            ? "0 6px 18px rgba(0,0,0,0.08)"
            : "none",
        marginBottom: 20
      }
    : {}

  const renderButtons = list =>
    list.map((btn, i) => {
      const isPrimary = btn.style === "primary"

      const style = {
        background: isPrimary
          ? buttonsUi.primary?.bg || "#F5C400"
          : buttonsUi.secondary?.bg || "#EEF1F6",
        color: isPrimary
          ? buttonsUi.primary?.text || "#000"
          : buttonsUi.secondary?.text || "#1C2434",
        borderRadius:
          (isPrimary
            ? buttonsUi.primary?.radius
            : buttonsUi.secondary?.radius) || 10,
        padding: "10px 16px",
        border: "none",
        marginRight: 10,
        cursor: "pointer"
      }

      return (
        <button key={i} style={style}>
          {btn.label}
        </button>
      )
    })

  let content = null

  switch (type) {
    case "action_group":
      content = (
        <>
          <h3 style={{ marginBottom: 12 }}>{config.title}</h3>
          <div>{renderButtons(config.buttons || [])}</div>
        </>
      )
      break

    case "data_table":
      content = (
        <>
          <h3 style={{ marginBottom: 12 }}>{config.title}</h3>
          {/* bestaande table renderer blijft intact */}
        </>
      )
      break

    default:
      return null
  }

  if (!isCard) return content

  return <div style={cardStyle}>{content}</div>
}
