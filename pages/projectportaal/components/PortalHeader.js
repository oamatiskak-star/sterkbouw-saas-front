import React from 'react';
import MobileNavigation from './MobileNavigation';
import DesktopSidebar from './DesktopSidebar';
import ExportDossierButton from './ExportDossierButton';
import styles from '../styles/PortalHeader.module.css';

const PortalHeader = ({ user, projectName, onMenuToggle }) => {
return (
<header className={styles.header}>
<div className={styles.mobileOnly}>
<button className={styles.menuButton} onClick={onMenuToggle}>
☰
</button>
<MobileNavigation />
</div>

text
        <div className={styles.desktopOnly}>
            <DesktopSidebar />
        </div>

        <div className={styles.mainContent}>
            <div className={styles.topBar}>
                <div className={styles.projectInfo}>
                    <h1>{projectName || 'Project Portal'}</h1>
                    <span className={styles.breadcrumb}>Dashboard / Projectoverzicht</span>
                </div>
                
                <div className={styles.userActions}>
                    <ExportDossierButton />
                    <div className={styles.userProfile}>
                        <div className={styles.avatar}>
                            {user?.initials || 'UU'}
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || 'Gebruiker'}</span>
                            <span className={styles.userRole}>{user?.role || 'Bezoeker'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <nav className={styles.utilityNav}>
                <button className={styles.navButton}>
                    📊 Dashboard
                </button>
                <button className={styles.navButton}>
                    📁 Documenten
                </button>
                <button className={styles.navButton}>
                    👥 Team
                </button>
                <button className={styles.navButton}>
                    ⚙️ Instellingen
                </button>
            </nav>
        </div>
    </header>
);
};

export default PortalHeader;
