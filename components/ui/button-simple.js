// components/ui/button.js
export default function Button({ children, ...props }) {
  return (
    <button 
      style={{
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }}
      {...props}
    >
      {children}
    </button>
  );
}
