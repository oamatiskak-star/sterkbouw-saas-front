import React, { useState } from 'react';
import styles from '../styles/DeliverySection.module.css';

const DeliverySection = ({ data }) => {
const [deliveries, setDeliveries] = useState(data.deliveries || []);
const [newDelivery, setNewDelivery] = useState({
item: '',
quantity: '',
deliveryDate: '',
status: 'pending'
});

text
const addDelivery = () => {
    if (newDelivery.item && newDelivery.quantity) {
        setDeliveries(prev => [...prev, { ...newDelivery, id: Date.now() }]);
        setNewDelivery({ item: '', quantity: '', deliveryDate: '', status: 'pending' });
    }
};

const updateStatus = (id, status) => {
    setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status } : d));
};

return (
    <div className={styles.container}>
        <h2>Levering & Montage</h2>
        <div className={styles.addForm}>
            <h3>Nieuwe levering toevoegen</h3>
            <div className={styles.formRow}>
                <input
                    type="text"
                    placeholder="Onderdeel/Item"
                    value={newDelivery.item}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, item: e.target.value }))}
                />
                <input
                    type="number"
                    placeholder="Aantal"
                    value={newDelivery.quantity}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, quantity: e.target.value }))}
                />
                <input
                    type="date"
                    value={newDelivery.deliveryDate}
                    onChange={(e) => setNewDelivery(prev => ({ ...prev, deliveryDate: e.target.value }))}
                />
                <button onClick={addDelivery} className={styles.addButton}>Toevoegen</button>
            </div>
        </div>

        <div className={styles.deliveryList}>
            <h3>Leveringsplanning</h3>
            {deliveries.length === 0 ? (
                <p>Geen leveringen gepland</p>
            ) : (
                <div className={styles.grid}>
                    {deliveries.map((delivery) => (
                        <div key={delivery.id} className={`${styles.card} ${styles[delivery.status]}`}>
                            <div className={styles.cardHeader}>
                                <h4>{delivery.item}</h4>
                                <span className={`${styles.status} ${styles[delivery.status]}`}>
                                    {delivery.status === 'pending' && 'In afwachting'}
                                    {delivery.status === 'delivered' && 'Geleverd'}
                                    {delivery.status === 'installed' && 'Gemonteerd'}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p>Aantal: {delivery.quantity}</p>
                                <p>Leverdatum: {delivery.deliveryDate || 'Niet gepland'}</p>
                            </div>
                            <div className={styles.cardActions}>
                                <button 
                                    onClick={() => updateStatus(delivery.id, 'delivered')}
                                    className={styles.statusButton}
                                >
                                    Markeer als geleverd
                                </button>
                                <button 
                                    onClick={() => updateStatus(delivery.id, 'installed')}
                                    className={styles.statusButton}
                                >
                                    Markeer als gemonteerd
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);
};

export default DeliverySection;
