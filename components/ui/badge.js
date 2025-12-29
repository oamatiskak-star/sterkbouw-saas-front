// components/ui/badge.js
export default function Badge({ children, variant = 'default', ...props }) {
  const styles = {
    default: { backgroundColor: '#e0e0e0', color: '#333' },
    primary: { backgroundColor: '#007bff', color: 'white' },
    success: { backgroundColor: '#28a745', color: 'white' },
    warning: { backgroundColor: '#ffc107', color: '#333' },
    danger: { backgroundColor: '#dc3545', color: 'white' }
  };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        ...styles[variant]
      }}
      {...props}
    >
      {children}
    </span>
  );
}
