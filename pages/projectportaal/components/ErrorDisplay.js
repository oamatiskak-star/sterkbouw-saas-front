import React from 'react';
import styles from '../styles/ErrorDisplay.module.css';

const ErrorDisplay = ({ message, onRetry }) => {
return (
<div className={styles.container}>
<div className={styles.icon}>⚠️</div>
<h3>Er is een fout opgetreden</h3>
<p className={styles.message}>{message}</p>
{onRetry && (
<button onClick={onRetry} className={styles.retryButton}>
Opnieuw proberen
</button>
)}
<button
onClick={() => window.location.reload()}
className={styles.reloadButton}
>
Pagina vernieuwen
</button>
</div>
);
};

export default ErrorDisplay;
