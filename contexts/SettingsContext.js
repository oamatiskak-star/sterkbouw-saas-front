import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
const [settings, setSettings] = useState(() => {
const saved = localStorage.getItem('appSettings');
return saved ? JSON.parse(saved) : {
theme: 'light',
language: 'nl',
units: 'metric',
offlineMode: false,
autoSync: true,
notification: {
inspections: true,
materials: true,
messages: true,
},
map: {
showLocations: true,
trackPosition: true,
},
};
});

const updateSettings = useCallback((newSettings) => {
setSettings(prev => {
const updated = { ...prev, ...newSettings };
localStorage.setItem('appSettings', JSON.stringify(updated));
return updated;
});
}, []);

const toggleTheme = useCallback(() => {
updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' });
}, [settings.theme, updateSettings]);

const toggleOfflineMode = useCallback(() => {
updateSettings({ offlineMode: !settings.offlineMode });
}, [settings.offlineMode, updateSettings]);

const toggleNotification = useCallback((type) => {
updateSettings({
notification: {
...settings.notification,
[type]: !settings.notification[type],
},
});
}, [settings.notification, updateSettings]);

useEffect(() => {
// Apply theme to document
document.documentElement.setAttribute('data-theme', settings.theme);
}, [settings.theme]);

return (
<SettingsContext.Provider value={{
settings,
updateSettings,
toggleTheme,
toggleOfflineMode,
toggleNotification,
}}>
{children}
</SettingsContext.Provider>
);
};

export const useSettings = () => {
const context = useContext(SettingsContext);
if (!context) throw new Error('useSettings must be used within SettingsProvider');
return context;
};
