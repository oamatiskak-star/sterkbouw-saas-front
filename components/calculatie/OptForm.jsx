export default function OptForm({ options, setOptions }) {
  return (
    <>
      {Object.keys(options).map(k => (
        <label key={k} style={{ display: "block", marginBottom: 8 }}>
          <input
            type="checkbox"
            checked={options[k]}
            onChange={e =>
              setOptions({ ...options, [k]: e.target.checked })
            }
            style={{ marginRight: 6 }}
          />
          {k}
        </label>
      ))}
    </>
  )
}
