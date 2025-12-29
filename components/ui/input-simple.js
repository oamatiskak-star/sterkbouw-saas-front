// components/ui/input.js
export default function Input(props) {
  return (
    <input 
      style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        width: '100%',
        fontSize: '14px'
      }}
      {...props}
    />
  );
}
