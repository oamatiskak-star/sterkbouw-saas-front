import React, { useState } from 'react';
import styles from '../styles/ExportDossierButton.module.css';

const ExportDossierButton = () => {
const [isExporting, setIsExporting] = useState(false);
const [exportFormat, setExportFormat] = useState('pdf');

text
const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, this would generate and download the dossier
    alert(`Dossier geëxporteerd als ${exportFormat.toUpperCase()}`);
    
    setIsExporting(false);
};

const formats = [
    { id: 'pdf', label: 'PDF', icon: '📄' },
    { id: 'zip', label: 'ZIP', icon: '📦' },
    { id: 'excel', label: 'Excel', icon: '📊' },
];

return (
    <div className={styles.container}>
        <div className={styles.dropdown}>
            <button 
                className={styles.exportButton}
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? (
                    <>
                        <span className={styles.spinner}></span>
                        Bezig met exporteren...
                    </>
                ) : (
                    '📥 Exporteer Dossier'
                )}
            </button>
            
            <div className={styles.dropdownContent}>
                <div className={styles.formatSelector}>
                    <p>Kies formaat:</p>
                    {formats.map(format => (
                        <label key={format.id} className={styles.formatOption}>
                            <input
                                type="radio"
                                name="exportFormat"
                                value={format.id}
                                checked={exportFormat === format.id}
                                onChange={(e) => setExportFormat(e.target.value)}
                            />
                            <span className={styles.formatIcon}>{format.icon}</span>
                            {format.label}
                        </label>
                    ))}
                </div>
                
                <div className={styles.options}>
                    <label className={styles.option}>
                        <input type="checkbox" defaultChecked />
                        Inclusief bijlagen
                    </label>
                    <label className={styles.option}>
                        <input type="checkbox" defaultChecked />
                        Inclusief communicatie
                    </label>
                    <label className={styles.option}>
                        <input type="checkbox" />
                        Watermerk toevoegen
                    </label>
                </div>
                
                <div className={styles.actions}>
                    <button 
                        className={styles.cancelButton}
                        onClick={() => setIsExporting(false)}
                    >
                        Annuleren
                    </button>
                    <button 
                        className={styles.confirmButton}
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Exporting...' : 'Bevestigen'}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
};

export default ExportDossierButton;

