// components/ui/select.js
export default function Select({ children, className = '', ...props }) {
  return (
    <select
      className={className}
      style={{
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        width: '100%',
        fontSize: '14px',
        backgroundColor: 'white'
      }}
      {...props}
    >
      {children}
    </select>
  );
}
