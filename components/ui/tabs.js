// components/ui/tabs.js
import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({});

export function Tabs({ 
  defaultValue, 
  value: controlledValue,
  onValueChange,
  className = '',
  children 
}) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  
  const handleValueChange = (newValue) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }) {
  return (
    <div className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = '', children, ...props }) {
  const { value: currentValue, onValueChange } = useContext(TabsContext);
  const isActive = currentValue === value;

  return (
    <button
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
      } ${className}`}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }) {
  const { value: currentValue } = useContext(TabsContext);
  
  if (currentValue !== value) return null;
  
  return (
    <div className={`mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
