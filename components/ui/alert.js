// components/ui/alert.js

export function Alert({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) {
  const variants = {
    default: 'bg-gray-50 text-gray-900 border-gray-200',
    destructive: 'bg-red-50 text-red-900 border-red-200',
    warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
    success: 'bg-green-50 text-green-900 border-green-200'
  };

  return (
    <div
      className={`rounded-lg border p-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertTitle({ children, className = '', ...props }) {
  return (
    <h5 className={`font-semibold leading-none tracking-tight mb-2 ${className}`} {...props}>
      {children}
    </h5>
  );
}

export function AlertDescription({ children, className = '', ...props }) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

// Optioneel: default export van het hoofd Alert component
export default Alert;
