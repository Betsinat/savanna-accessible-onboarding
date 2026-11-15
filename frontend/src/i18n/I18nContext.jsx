import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const catalogModules = import.meta.glob('./*.json', {
  eager: true,
  import: 'default',
});

const catalogs = Object.fromEntries(
  Object.entries(catalogModules).map(([path, catalog]) => [
    path.slice(2, -5),
    catalog,
  ])
);
const preferredLanguageOrder = ['en', 'am', 'om', 'ti', 'so', 'aa'];

const fallbackCatalog = catalogs.en;
const I18nContext = createContext(null);

function getStoredLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem('savanna_lang');
    return stored && catalogs[stored] ? stored : 'en';
  } catch (error) {
    console.error('Unable to read the saved language preference:', error);
    return 'en';
  }
}

function getStoredSimpleWords() {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem('savanna_simple_words') === 'true';
  } catch (error) {
    console.error('Unable to read the simple-language preference:', error);
    return false;
  }
}

function getValue(catalog, key) {
  return key.split('.').reduce((value, part) => value?.[part], catalog);
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getStoredLanguage);
  const [simpleWords, setSimpleWordsState] = useState(getStoredSimpleWords);
  const catalog = catalogs[lang] || fallbackCatalog;
  const metadata = catalog.meta;

  const setLang = useCallback((nextLanguage) => {
    if (!catalogs[nextLanguage]) {
      throw new RangeError(`Unsupported language: ${nextLanguage}`);
    }

    try {
      window.localStorage.setItem('savanna_lang', nextLanguage);
    } catch (error) {
      console.error('Unable to save the language preference:', error);
    }
    setLangState(nextLanguage);
  }, []);

  const setSimpleWords = useCallback((enabled) => {
    try {
      window.localStorage.setItem('savanna_simple_words', String(enabled));
    } catch (error) {
      console.error('Unable to save the simple-language preference:', error);
    }
    setSimpleWordsState(enabled);
  }, []);

  const t = useCallback((key, values = {}) => {
    const translated = getValue(catalog, key) ?? getValue(fallbackCatalog, key);
    if (typeof translated !== 'string') {
      console.error(`Missing translation string: ${key}`);
      return key;
    }

    return translated.replace(/\{\{(\w+)\}\}/g, (match, name) =>
      Object.hasOwn(values, name) ? String(values[name]) : match
    );
  }, [catalog]);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = metadata.dir || 'ltr';
  }, [lang, metadata.dir]);

  const value = useMemo(() => ({
    lang,
    setLang,
    simpleWords,
    setSimpleWords,
    t,
    bcp47: metadata.bcp47,
    isEthiopic: lang === 'am' || lang === 'ti',
    languages: Object.entries(catalogs)
      .sort(([first], [second]) => {
        const firstOrder = preferredLanguageOrder.indexOf(first);
        const secondOrder = preferredLanguageOrder.indexOf(second);
        return (firstOrder === -1 ? Infinity : firstOrder) -
          (secondOrder === -1 ? Infinity : secondOrder);
      })
      .map(([code, item]) => ({
        code,
        label: item.meta.label,
      })),
  }), [lang, metadata.bcp47, metadata.label, metadata.dir, setLang, setSimpleWords, simpleWords, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider.');
  }
  return context;
}
