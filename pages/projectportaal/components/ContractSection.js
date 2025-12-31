import React, { useState } from 'react';
import styles from '../styles/ContractSection.module.css';

const ContractSection = ({ data }) => {
const [contract, setContract] = useState(data);

text
const handleInputChange = (field, value) => {
    setContract(prev => ({ ...prev, [field]: value }));
};

return (
    <div className={styles.container}>
        <h2>Contract Details</h2>
        <div className={styles.form}>
            <div className={styles.formGroup}>
                <label>Contractnummer</label>
                <input
                    type="text"
                    value={contract.contractNumber || ''}
                    onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Klant</label>
                <input
                    type="text"
                    value={contract.client || ''}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Startdatum</label>
                <input
                    type="date"
                    value={contract.startDate || ''}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Einddatum</label>
                <input
                    type="date"
                    value={contract.endDate || ''}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Status</label>
                <select
                    value={contract.status || 'concept'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                >
                    <option value="concept">Concept</option>
                    <option value="actief">Actief</option>
                    <option value="afgerond">Afgerond</option>
                </select>
            </div>
            <div className={styles.formGroup}>
                <label>Budget</label>
                <input
                    type="number"
                    value={contract.budget || ''}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                />
            </div>
        </div>
        <div className={styles.actions}>
            <button className={styles.saveButton}>Opslaan</button>
            <button className={styles.pdfButton}>PDF Genereren</button>
        </div>
    </div>
);
};

export default ContractSection;
