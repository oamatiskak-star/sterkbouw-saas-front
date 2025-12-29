// components/ui/card.js
export default function Card({ children, style, ...props }) {
  return (
    <div 
      style={{
        padding: '24px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
