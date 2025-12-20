export default function OptForm({ options, setOptions }) {
  return (
    <>
      {Object.keys(options).map(k => (
        <label key={k}>
          <input type="checkbox" checked={options[k]} onChange={e => setOptions({...options,[k]:e.target.checked})}/>
          {k}
        </label>
      ))}
    </>
  )
}