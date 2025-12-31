import React from 'react';
import styles from '../styles/LoadingSpinner.module.css';

const LoadingSpinner = () => {
return (
<div className={styles.container}>
<div className={styles.spinner}></div>
<p>Gegevens worden geladen...</p>
</div>
);
};

export default LoadingSpinner;
