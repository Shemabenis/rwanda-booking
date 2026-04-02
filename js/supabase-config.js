/**
 * supabase-config.js
 * Handles dynamic integration of the Supabase client
 */

window.initSupabase = function () {
    if (window.supabaseClient) {
        return Promise.resolve(window.supabaseClient);
    }
    
    if (window._supabaseInitPromise) {
        return window._supabaseInitPromise;
    }

    window._supabaseInitPromise = new Promise((resolve, reject) => {
        // Load the CDN script if it's not present
        if (!document.querySelector('script[src*="supabase-js"]')) {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
            script.onload = () => {
                const supabaseUrl = 'https://vjiipbmacqrkhxnlxsol.supabase.co';
                const supabaseKey = 'sb_publishable_SnBeV-L1ddW_5MAo8fZCnw_0VjNqzKv';
                window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
                resolve(window.supabaseClient);
            };
            script.onerror = () => {
                reject(new Error("Failed to load Supabase JS SDK"));
            };
            document.head.appendChild(script);
        } else if (window.supabase) {
            const supabaseUrl = 'https://vjiipbmacqrkhxnlxsol.supabase.co';
            const supabaseKey = 'sb_publishable_SnBeV-L1ddW_5MAo8fZCnw_0VjNqzKv';
            window.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            resolve(window.supabaseClient);
        } else {
            // Script tag exists but window.supabase isn't ready yet
            const checker = setInterval(() => {
                if (window.supabase) {
                    clearInterval(checker);
                    const supabaseUrl = 'https://vjiipbmacqrkhxnlxsol.supabase.co';
                    const supabaseKey = 'sb_publishable_SnBeV-L1ddW_5MAo8fZCnw_0VjNqzKv';
                    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
                    resolve(window.supabaseClient);
                }
            }, 50);
        }
    });

    return window._supabaseInitPromise;
};
