import React from 'react';
import styles from '../styles/DesktopSidebar.module.css';

const DesktopSidebar = () => {
const navItems = [
{ icon: '🏠', label: 'Dashboard', active: true },
{ icon: '📋', label: 'Projecten', count: 5 },
{ icon: '📁', label: 'Documenten' },
{ icon: '💬', label: 'Berichten', count: 3 },
{ icon: '📊', label: 'Rapportages' },
{ icon: '👥', label: 'Team' },
{ icon: '⚙️', label: 'Instellingen' },
];

text
const projects = [
    { id: 1, name: 'Nieuwbouw Amsterdam', progress: 75 },
    { id: 2, name: 'Renovatie Rotterdam', progress: 30 },
    { id: 3, name: 'Utiliteit Den Haag', progress: 90 },
];

return (
    <aside className={styles.sidebar}>
        <div className={styles.logo}>
            <h1>🛠️ BouwPortaal</h1>
        </div>

        <nav className={styles.mainNav}>
            <ul className={styles.navList}>
                {navItems.map((item, index) => (
                    <li key={index}>
                        <a 
                            href="#" 
                            className={`${styles.navLink} ${item.active ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{item.icon}</span>
                            <span className={styles.label}>{item.label}</span>
                            {item.count && (
                                <span className={styles.badge}>{item.count}</span>
                            )}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>

        <div className={styles.projectsSection}>
            <h3>Actieve Projecten</h3>
            <ul className={styles.projectList}>
                {projects.map((project) => (
                    <li key={project.id} className={styles.projectItem}>
                        <div className={styles.projectInfo}>
                            <span className={styles.projectName}>{project.name}</span>
                            <span className={styles.projectProgress}>
                                {project.progress}%
                            </span>
                        </div>
                        <div className={styles.progressBar}>
                            <div 
                                className={styles.progressFill}
                                style={{ width: `${project.progress}%` }}
                            ></div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <div className={styles.sidebarFooter}>
            <div className={styles.quickActions}>
                <button className={styles.actionButton}>
                    ➕ Nieuw project
                </button>
                <button className={styles.actionButton}>
                    📤 Export
                </button>
            </div>
            <div className={styles.helpSection}>
                <a href="#" className={styles.helpLink}>❓ Help & Support</a>
                <a href="#" className={styles.helpLink}>📚 Documentatie</a>
            </div>
        </div>
    </aside>
);
};

export default DesktopSidebar;
