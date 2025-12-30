import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const MaterialContext = createContext();

export const MaterialProvider = ({ children }) => {
const [materials, setMaterials] = useState([]);
const [transactions, setTransactions] = useState([]);
const [lowStockAlerts, setLowStockAlerts] = useState([]);
const [isLoading, setIsLoading] = useState(false);

const fetchMaterials = useCallback(async () => {
setIsLoading(true);
try {
// Mock API call
const mockMaterials = [
{ id: 1, name: 'Beton C30/37', quantity: 125, unit: 'm³', minStock: 50 },
{ id: 2, name: 'Bewapening Ø16', quantity: 850, unit: 'm', minStock: 200 },
{ id: 3, name: 'Kistplaten', quantity: 45, unit: 'stk', minStock: 30 },
];
setMaterials(mockMaterials);
checkLowStock(mockMaterials);
} catch (error) {
toast.error('Fout bij laden materialen');
} finally {
setIsLoading(false);
}
}, []);

const checkLowStock = useCallback((materialList) => {
const alerts = materialList.filter(m => m.quantity <= m.minStock);
setLowStockAlerts(alerts);
if (alerts.length > 0) {
toast.warning(${alerts.length} materialen hebben lage voorraad);
}
}, []);

const updateStock = useCallback((materialId, quantity, type = 'in') => {
setMaterials(prev => prev.map(material => {
if (material.id === materialId) {
const newQuantity = type === 'in'
? material.quantity + quantity
: material.quantity - quantity;

text
    const updated = { ...material, quantity: newQuantity };
    
    // Check if low stock
    if (newQuantity <= material.minStock) {
      setLowStockAlerts(prevAlerts => {
        const existing = prevAlerts.find(a => a.id === materialId);
        return existing 
          ? prevAlerts.map(a => a.id === materialId ? updated : a)
          : [...prevAlerts, updated];
      });
    } else {
      setLowStockAlerts(prev => prev.filter(a => a.id !== materialId));
    }
    
    return updated;
  }
  return material;
}));

// Log transaction
const transaction = {
  materialId,
  type,
  quantity,
  timestamp: new Date().toISOString(),
};
setTransactions(prev => [transaction, ...prev]);
}, []);

const addMaterial = useCallback((material) => {
const newMaterial = {
...material,
id: Date.now(),
};
setMaterials(prev => [...prev, newMaterial]);
toast.success(Material ${newMaterial.name} toegevoegd);
return newMaterial;
}, []);

return (
<MaterialContext.Provider value={{
materials,
transactions,
lowStockAlerts,
isLoading,
fetchMaterials,
updateStock,
addMaterial,
}}>
{children}
</MaterialContext.Provider>
);
};

export const useMaterial = () => {
const context = useContext(MaterialContext);
if (!context) throw new Error('useMaterial must be used within MaterialProvider');
return context;
};
