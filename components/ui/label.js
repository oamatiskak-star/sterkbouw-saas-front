// components/ui/label.js
export default function Label({ children, htmlFor, ...props }) {
  return (
    <label 
      htmlFor={htmlFor}
      style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        fontSize: '14px',
        color: '#333'
      }}
      {...props}
    >
      {children}
    </label>
  );
}
