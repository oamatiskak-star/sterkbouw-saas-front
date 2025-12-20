export default function FormField({
  label,
  type = "text",
  full = false,
  ...props
}) {
  return (
    <div className={`sb-form-field ${full ? "full" : ""}`}>
      {type === "checkbox" ? (
        <label className="sb-checkbox">
          <input type="checkbox" {...props} />
          <span>{label}</span>
        </label>
      ) : (
        <>
          <label>{label}</label>
          {type === "textarea" ? (
            <textarea {...props} />
          ) : (
            <input type={type} {...props} />
          )}
        </>
      )}
    </div>
  )
}
