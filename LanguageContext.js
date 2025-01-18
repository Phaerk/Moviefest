import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Localization data
const locales = {
    en: { /* English translations */ },
    tr: { /* Turkish translations */ },
};

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('en');

    useEffect(() => {
        const fetchLanguagePreference = async () => {
            const storedLanguage = await AsyncStorage.getItem('language');
            if (storedLanguage) {
                setSelectedLanguage(storedLanguage);
            }
        };
        fetchLanguagePreference();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('language', selectedLanguage);
    }, [selectedLanguage]);

    const t = (key) => locales[selectedLanguage][key] || key;

    return (
        <LanguageContext.Provider value={{ selectedLanguage, setSelectedLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
