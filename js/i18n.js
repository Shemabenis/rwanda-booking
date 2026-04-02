/**
 * i18n.js
 * Client-side internationalization engine
 */

const SUPPORTED_LANGS = ['en', 'rw', 'fr', 'sw'];
window.currentLang = localStorage.getItem('rwb_lang') || 'en';

function initI18n() {
    // 1. Initial translation of existing elements
    translatePage();

    // 2. Observer to translate dynamically added elements (like chat, components etc)
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // Element node
                        translateElement(node);
                        node.querySelectorAll('[data-i18n]').forEach(el => translateElement(el));
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

function translatePage() {
    const lang = window.currentLang;
    document.title = getTranslation('hero_title') + " - RwandaBooking";
    document.querySelectorAll('[data-i18n]').forEach(el => translateElement(el));

    // Update the flag/label in the header
    const label = document.getElementById('currentLangLabel');
    if (label) {
        label.textContent = lang.toUpperCase();
    }
}

function translateElement(el) {
    const key = el.getAttribute('data-i18n');
    if (!key) return;

    const translation = getTranslation(key);
    if (!translation) return;

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
    } else {
        el.textContent = translation;
    }
}

function getTranslation(key) {
    const lang = window.currentLang;
    if (!window.RWB_TRANSLATIONS || !window.RWB_TRANSLATIONS[lang]) {
        return window.RWB_TRANSLATIONS?.['en']?.[key] || key;
    }
    return window.RWB_TRANSLATIONS[lang][key] || window.RWB_TRANSLATIONS['en'][key] || key;
}

function setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    window.currentLang = lang;
    localStorage.setItem('rwb_lang', lang);
    translatePage();

    // Refresh components if needed (or just reload if easier, but let's try dynamic)
    document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
}

// Global helpers
window.setLanguage = setLanguage;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}
