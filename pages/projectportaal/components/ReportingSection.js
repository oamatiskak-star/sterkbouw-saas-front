import React, { useState } from 'react';
import styles from '../styles/ReportingSection.module.css';

const ReportingSection = ({ data }) => {
const [reports, setReports] = useState(data.reports || []);
const [newReport, setNewReport] = useState({
title: '',
type: 'weekly',
content: ''
});

text
const generateReport = () => {
    if (newReport.title) {
        const report = {
            ...newReport,
            id: Date.now(),
            date: new Date().toISOString(),
            generatedBy: 'Huidige gebruiker'
        };
        setReports(prev => [report, ...prev]);
        setNewReport({ title: '', type: 'weekly', content: '' });
    }
};

const downloadReport = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    if (report) {
        // Create and download PDF
        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'});
        element.href = URL.createObjectURL(file);
        element.download = `${report.title}-${report.date}.json`;
        document.body.appendChild(element);
        element.click();
    }
};

const reportTypes = [
    { id: 'weekly', label: 'Wekelijks' },
    { id: 'monthly', label: 'Maandelijks' },
    { id: 'progress', label: 'Voortgang' },
    { id: 'financial', label: 'Financieel' }
];

return (
    <div className={styles.container}>
        <h2>Rapportage</h2>
        
        <div className={styles.generator}>
            <h3>Nieuw rapport genereren</h3>
            <div className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Titel</label>
                    <input
                        type="text"
                        value={newReport.title}
                        onChange={(e) => setNewReport(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Voer rapport titel in"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Type rapport</label>
                    <select
                        value={newReport.type}
                        onChange={(e) => setNewReport(prev => ({ ...prev, type: e.target.value }))}
                    >
                        {reportTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.label}</option>
                        ))}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Inhoud</label>
                    <textarea
                        value={newReport.content}
                        onChange={(e) => setNewReport(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Beschrijving van het rapport..."
                        rows={4}
                    />
                </div>
                <button onClick={generateReport} className={styles.generateButton}>
                    Rapport Genereren
                </button>
            </div>
        </div>

        <div className={styles.reportsList}>
            <h3>Eerdere rapporten</h3>
            {reports.length === 0 ? (
                <p>Geen rapporten beschikbaar</p>
            ) : (
                <div className={styles.grid}>
                    {reports.map((report) => (
                        <div key={report.id} className={styles.reportCard}>
                            <div className={styles.cardHeader}>
                                <h4>{report.title}</h4>
                                <span className={`${styles.type} ${styles[report.type]}`}>
                                    {reportTypes.find(t => t.id === report.type)?.label}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <p>{report.content || 'Geen aanvullende inhoud'}</p>
                                <div className={styles.meta}>
                                    <span>{new Date(report.date).toLocaleDateString()}</span>
                                    <span>{report.generatedBy}</span>
                                </div>
                            </div>
                            <div className={styles.cardActions}>
                                <button 
                                    onClick={() => downloadReport(report.id)}
                                    className={styles.downloadButton}
                                >
                                    Download
                                </button>
                                <button className={styles.viewButton}>
                                    Bekijken
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

export default ReportingSection;
