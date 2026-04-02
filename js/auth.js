/**
 * auth.js
 * Handles Supabase Authentication logic, UI toggling, and global Session State mapping.
 */

let authMode = 'signin'; // Mode can be 'signin' or 'signup'

async function toggleAuthMode(event) {
    if (event) event.preventDefault();

    const fnGroup = document.getElementById('firstNameGroup');
    const lnGroup = document.getElementById('lastNameGroup');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-link');
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');

    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    if (authMode === 'signin') {
        authMode = 'signup';
        if (fnGroup) fnGroup.style.display = 'block';
        if (lnGroup) lnGroup.style.display = 'block';
        
        // Force inputs to be required during registration
        const fnInput = document.getElementById('auth-firstName');
        const lnInput = document.getElementById('auth-lastName');
        if (fnInput) fnInput.required = true;
        if (lnInput) lnInput.required = true;

        if (submitBtn) submitBtn.textContent = 'Create Account';
        if (toggleLink) toggleLink.textContent = 'Already have an account? Sign in here';
    } else {
        authMode = 'signin';
        if (fnGroup) fnGroup.style.display = 'none';
        if (lnGroup) lnGroup.style.display = 'none';
        
        const fnInput = document.getElementById('auth-firstName');
        const lnInput = document.getElementById('auth-lastName');
        if (fnInput) fnInput.required = false;
        if (lnInput) lnInput.required = false;

        if (submitBtn) submitBtn.textContent = 'Sign In';
        if (toggleLink) toggleLink.textContent = "Don't have an account? Register here";
    }
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    errorEl.style.display = 'none';
    successEl.style.display = 'none';
    
    // Ensure supabase is dynamically loaded via our config
    let retries = 0;
    while (!window.initSupabase && retries < 40) {
        await new Promise(r => setTimeout(r, 50));
        retries++;
    }
    if (!window.initSupabase) {
        errorEl.textContent = "System error: Authentication service is temporarily unavailable.";
        errorEl.style.display = 'block';
        return;
    }

    const supabase = await window.initSupabase();
    const submitBtn = document.getElementById('auth-submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
        if (authMode === 'signup') {
            const firstName = document.getElementById('auth-firstName').value;
            const lastName = document.getElementById('auth-lastName').value;
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        first_name: firstName,
                        last_name: lastName
                    }
                }
            });

            if (error) {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            } else {
                if (data.user && !data.session) {
                    successEl.textContent = "Account created! Please check your email inbox to confirm your account.";
                    successEl.style.display = 'block';
                } else if (data.session) {
                    // Instantly logged in (e.g., if confirm email is disabled)
                    window.location.href = 'index.html';
                }
            }
        } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                errorEl.textContent = "Invalid login credentials.";
                errorEl.style.display = 'block';
            } else {
                window.location.href = 'index.html';
            }
        }
    } catch (err) {
        errorEl.textContent = "An unexpected error occurred.";
        errorEl.style.display = 'block';
        console.error(err);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function handleSignOut() {
    try {
        if (!window.initSupabase) return;
        const supabase = await window.initSupabase();
        await supabase.auth.signOut();
        window.location.replace('index.html'); // Force fresh load
    } catch (e) {
        console.error("Logout Error:", e);
    }
}

// Global listener: Auto-detects session and morphs UI universally 
document.addEventListener('DOMContentLoaded', async () => {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }
        if (!window.initSupabase) return;

        const supabase = await window.initSupabase();
        
        // Listen to changes
        supabase.auth.onAuthStateChange((event, session) => {
            updateGlobalNav(session);
        });
        
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        updateGlobalNav(session);
    } catch(err) {
        console.warn("Could not load auth UI observer:", err);
    }
});

function updateGlobalNav(session) {
    const navActions = document.querySelector('.nav-actions');
    const mmAuth = document.querySelector('.mm-auth');
    
    if (session) {
        // User IS logged in
        if (navActions) {
            navActions.innerHTML = `
                <button class="btn btn-secondary" onclick="handleSignOut()">Sign out</button>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 16px;">
                   ${session.user.email.charAt(0).toUpperCase()}
                </div>
            `;
        }
        if (mmAuth) {
            mmAuth.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); margin-bottom: 8px;">Signed in as ${session.user.email}</div>
                <button onclick="handleSignOut()" style="width:100%; padding: 12px; background: transparent; border: 1px solid var(--text-secondary); border-radius: 6px;">Sign Out</button>
            `;
        }
        
        // If they are magically on the login page while signed in, redirect them
        if (window.location.pathname.includes('login.html')) {
            window.location.replace('index.html');
        }
    } else {
        // User IS NOT logged in
        if (navActions && !navActions.innerHTML.includes('login.html')) {
            navActions.innerHTML = `
                <button class="btn btn-secondary" onclick="window.location.href='login.html'" data-i18n="nav_register">Register</button>
                <button class="btn btn-secondary" onclick="window.location.href='login.html'" data-i18n="nav_signin">Sign in</button>
            `;
        }
        if (mmAuth && !mmAuth.innerHTML.includes('login.html')) {
             mmAuth.innerHTML = `
                <a href="login.html" class="mm-btn-signin" data-i18n="nav_signin">Sign in</a>
                <a href="login.html" class="mm-btn-register" data-i18n="nav_register">Register</a>
             `;
        }
    }
}
