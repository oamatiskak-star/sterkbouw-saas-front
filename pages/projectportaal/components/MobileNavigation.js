import React, { useState } from 'react';
import styles from '../styles/MobileNavigation.module.css';

const MobileNavigation = () => {
const [isOpen, setIsOpen] = useState(false);

text
const navItems = [
    { icon: '🏠', label: 'Dashboard', active: true },
    { icon: '📋', label: 'Projecten' },
    { icon: '📁', label: 'Documenten' },
    { icon: '💬', label: 'Berichten' },
    { icon: '📊', label: 'Rapportages' },
    { icon: '👥', label: 'Team' },
    { icon: '⚙️', label: 'Instellingen' },
];

return (
    <>
        <nav className={`${styles.nav} ${isOpen ? styles.open : ''}`}>
            <div className={styles.navHeader}>
                <h2>Menu</h2>
                <button 
                    className={styles.closeButton}
                    onClick={() => setIsOpen(false)}
                >
                    ✕
                </button>
            </div>
            <ul className={styles.navList}>
                {navItems.map((item, index) => (
                    <li key={index}>
                        <a 
                            href="#" 
                            className={`${styles.navLink} ${item.active ? styles.active : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>
            <div className={styles.navFooter}>
                <button className={styles.logoutButton}>
                    👋 Uitloggen
                </button>
            </div>
        </nav>
        
        {isOpen && (
            <div 
                className={styles.overlay}
                onClick={() => setIsOpen(false)}
            />
        )}
    </>
);
};

export default MobileNavigation;
