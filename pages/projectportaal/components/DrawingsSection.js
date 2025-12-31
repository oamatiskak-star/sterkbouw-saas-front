import React, { useState } from 'react';
import styles from '../styles/DrawingsSection.module.css';

const DrawingsSection = ({ data }) => {
const [drawings, setDrawings] = useState(data.drawings || []);
const [newDrawing, setNewDrawing] = useState({ name: '', version: '', file: null });

text
const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        setNewDrawing(prev => ({ ...prev, file }));
    }
};

const addDrawing = () => {
    if (newDrawing.name && newDrawing.version) {
        setDrawings(prev => [...prev, { ...newDrawing, id: Date.now(), date: new Date().toISOString() }]);
        setNewDrawing({ name: '', version: '', file: null });
    }
};

return (
    <div className={styles.container}>
        <h2>Tekeningen</h2>
        <div className={styles.uploadSection}>
            <h3>Nieuwe tekening uploaden</h3>
            <div className={styles.uploadForm}>
                <input
                    type="text"
                    placeholder="Tekening naam"
                    value={newDrawing.name}
                    onChange={(e) => setNewDrawing(prev => ({ ...prev, name: e.target.value }))}
                />
                <input
                    type="text"
                    placeholder="Versie"
                    value={newDrawing.version}
                    onChange={(e) => setNewDrawing(prev => ({ ...prev, version: e.target.value }))}
                />
                <input
                    type="file"
                    accept=".pdf,.dwg,.dxf"
                    onChange={handleFileUpload}
                />
                <button onClick={addDrawing} className={styles.uploadButton}>Upload</button>
            </div>
        </div>

        <div className={styles.drawingList}>
            <h3>Bestaande tekeningen</h3>
            {drawings.length === 0 ? (
                <p>Geen tekeningen gevonden</p>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Naam</th>
                            <th>Versie</th>
                            <th>Datum</th>
                            <th>Acties</th>
                        </tr>
                    </thead>
                    <tbody>
                        {drawings.map((drawing) => (
                            <tr key={drawing.id}>
                                <td>{drawing.name}</td>
                                <td>{drawing.version}</td>
                                <td>{new Date(drawing.date).toLocaleDateString()}</td>
                                <td>
                                    <button className={styles.viewButton}>Bekijk</button>
                                    <button className={styles.downloadButton}>Download</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);
};

export default DrawingsSection;
