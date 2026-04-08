/**
 * auth.js
 * Handles Supabase Authentication logic, UI toggling, and global Session State mapping.
 */

let authMode = 'signin'; // Mode can be 'signin' or 'signup'
let _authInitialized = false;

async function initializeAuth() {
    if (_authInitialized) return;
    _authInitialized = true;

    // Check URL for mode preference
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    
    // Ensure we apply the mode only when DOM elements are likely present
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyInitialMode(mode));
    } else {
        // Short delay to ensure injected components are there
        setTimeout(() => applyInitialMode(mode), 50);
    }
}

function applyInitialMode(mode) {
    if (mode === 'signup') {
        // Set state but don't toggle yet, let the toggle function handle details
        authMode = 'signin'; // toggleAuthMode will flip this to signup
        toggleAuthMode();
    } else if (mode === 'signin') {
        authMode = 'signup'; // toggleAuthMode will flip this to signin
        toggleAuthMode();
    }
}

async function toggleAuthMode(event) {
    if (event) event.preventDefault();

    const fnGroup = document.getElementById('firstNameGroup');
    const lnGroup = document.getElementById('lastNameGroup');
    const roleGroup = document.getElementById('roleGroup');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleLink = document.getElementById('auth-toggle-link');
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    const titleEl = document.querySelector('.auth-header h2');

    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    if (authMode === 'signin') {
        authMode = 'signup';
        if (fnGroup) fnGroup.style.display = 'block';
        if (lnGroup) lnGroup.style.display = 'block';
        if (roleGroup) roleGroup.style.display = 'block';
        
        const fnInput = document.getElementById('auth-firstName');
        const lnInput = document.getElementById('auth-lastName');
        if (fnInput) fnInput.required = true;
        if (lnInput) lnInput.required = true;

        if (submitBtn) submitBtn.textContent = 'Create Account';
        if (toggleLink) toggleLink.textContent = 'Already have an account? Sign in here';
        if (titleEl) titleEl.textContent = 'Create an account';
        
        const fpLink = document.getElementById('forgot-password-link');
        if (fpLink) fpLink.style.display = 'none';
    } else {
        authMode = 'signin';
        if (fnGroup) fnGroup.style.display = 'none';
        if (lnGroup) lnGroup.style.display = 'none';
        if (roleGroup) roleGroup.style.display = 'none';
        
        const fnInput = document.getElementById('auth-firstName');
        const lnInput = document.getElementById('auth-lastName');
        if (fnInput) fnInput.required = false;
        if (lnInput) lnInput.required = false;

        if (submitBtn) submitBtn.textContent = 'Sign In';
        if (toggleLink) toggleLink.textContent = "Don't have an account? Register here";
        if (titleEl) titleEl.textContent = 'Sign in or create an account';
        
        const fpLink = document.getElementById('forgot-password-link');
        if (fpLink) fpLink.style.display = 'block';
    }
}

async function handleAuthSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');
    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';
    
    // Ensure supabase is dynamically loaded
    let retries = 0;
    while (!window.initSupabase && retries < 40) {
        await new Promise(r => setTimeout(r, 50));
        retries++;
    }
    if (!window.initSupabase) {
        if (errorEl) {
            errorEl.textContent = "System error: Authentication service is temporarily unavailable.";
            errorEl.style.display = 'block';
        }
        return;
    }

    const supabase = await window.initSupabase();
    const submitBtn = document.getElementById('auth-submit-btn');
    if (!submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    try {
        if (authMode === 'signup') {
            const firstName = document.getElementById('auth-firstName').value;
            const lastName = document.getElementById('auth-lastName').value;
            const roleSelect = document.getElementById('auth-role');
            const role = roleSelect ? roleSelect.value : 'traveler';
            
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: new URL('login.html', window.location.href).href,
                    data: {
                        first_name: firstName,
                        last_name: lastName,
                        role: role
                    }
                }
            });

            if (error) {
                if (errorEl) {
                    errorEl.textContent = error.message;
                    errorEl.style.display = 'block';
                }
            } else {
                if (data.user && !data.session) {
                    if (successEl) {
                        successEl.textContent = "Account created! Please check your email inbox to confirm your account.";
                        successEl.style.display = 'block';
                    }
                    // Hide form to focus on success message
                    const form = document.getElementById('auth-form');
                    if (form) form.style.display = 'none';
                } else if (data.session) {
                    const sessionRole = data.session.user.user_metadata?.role || 'traveler';
                    if (sessionRole === 'host') {
                        window.location.replace('host-dashboard.html');
                    } else {
                        window.location.replace('traveler-dashboard.html');
                    }
                }
            }
        } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                if (errorEl) {
                    errorEl.textContent = "Invalid login credentials.";
                    errorEl.style.display = 'block';
                }
            } else {
                const sessionRole = data.session.user.user_metadata?.role || 'traveler';
                if (sessionRole === 'host') {
                    window.location.replace('host-dashboard.html');
                } else {
                    window.location.replace('traveler-dashboard.html');
                }
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = "An unexpected error occurred.";
            errorEl.style.display = 'block';
        }
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
        window.location.replace('index.html'); 
    } catch (e) {
        console.error("Logout Error:", e);
    }
}

// Global listener: Auto-detects session
document.addEventListener('DOMContentLoaded', async () => {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }
        if (!window.initSupabase) return;

        const supabase = await window.initSupabase();
        
        supabase.auth.onAuthStateChange((event, session) => {
            updateGlobalNav(session);
        });
        
        const { data: { session } } = await supabase.auth.getSession();
        updateGlobalNav(session);
    } catch(err) {
        console.warn("Could not load auth UI observer:", err);
    }
});

function updateGlobalNav(session) {
    const navActions = document.querySelector('.nav-actions');
    const mmAuth = document.querySelector('.mm-auth');
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (session) {
        // User IS logged in
        const role = session.user.user_metadata?.role || 'traveler';
        const dashboardLink = role === 'host' ? 'host-dashboard.html' : 'traveler-dashboard.html';

        if (navActions) {
            navActions.innerHTML = `
                <button class="btn btn-secondary" onclick="window.location.href='${dashboardLink}'">Dashboard</button>
                <button class="btn btn-secondary" onclick="handleSignOut()">Sign out</button>
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--brand-primary); color: white; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 16px;">
                   ${session.user.email.charAt(0).toUpperCase()}
                </div>
            `;
        }
        if (mmAuth) {
            mmAuth.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); margin-bottom: 8px;">Signed in as ${session.user.email}</div>
                <button onclick="window.location.href='${dashboardLink}'" style="width:100%; padding: 12px; margin-bottom: 8px; background: var(--brand-primary); color: white; border: none; border-radius: 6px;">Dashboard</button>
                <button onclick="handleSignOut()" style="width:100%; padding: 12px; background: transparent; border: 1px solid var(--text-secondary); border-radius: 6px;">Sign Out</button>
            `;
        }
        
        // Redirect away from login if authenticated
        if (isLoginPage) {
            window.location.replace(dashboardLink);
        }
    } else {
        // User IS NOT logged in
        // If on login page, we can show a simpler nav or nothing in navActions to avoid circular reloads
        if (navActions) {
            if (isLoginPage) {
                navActions.innerHTML = ''; // Keep clean on login page
            } else {
                navActions.innerHTML = `
                    <button class="btn btn-secondary" onclick="window.location.href='login.html?mode=signup'" data-i18n="nav_register">Register</button>
                    <button class="btn btn-secondary" onclick="window.location.href='login.html?mode=signin'" data-i18n="nav_signin">Sign in</button>
                `;
            }
        }
        if (mmAuth) {
            if (isLoginPage) {
                mmAuth.innerHTML = '';
            } else {
                mmAuth.innerHTML = `
                    <a href="login.html?mode=signin" class="mm-btn-signin" data-i18n="nav_signin">Sign in</a>
                    <a href="login.html?mode=signup" class="mm-btn-register" data-i18n="nav_register">Register</a>
                `;
            }
        }
    }
}

function togglePasswordVisibility() {
    const pwdInput = document.getElementById('auth-password');
    const eyeIcon = document.getElementById('eye-icon');
    if (!pwdInput || !eyeIcon) return;

    if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        // Eye-off icon
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
        `;
    } else {
        pwdInput.type = 'password';
        // Eye icon
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
        `;
    }
}

async function handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const errorEl = document.getElementById('auth-error');
    const successEl = document.getElementById('auth-success');

    if (errorEl) errorEl.style.display = 'none';
    if (successEl) successEl.style.display = 'none';

    if (!email) {
        if (errorEl) {
            errorEl.textContent = "Please enter your email address first.";
            errorEl.style.display = 'block';
        }
        return;
    }

    if (!window.initSupabase) {
        if (errorEl) {
            errorEl.textContent = "System error: Authentication service is temporarily unavailable.";
            errorEl.style.display = 'block';
        }
        return;
    }
    
    // Provide immediate visual feedback that request is processing
    const fpLink = document.getElementById('forgot-password-link');
    const originalText = fpLink ? fpLink.textContent : '';
    if (fpLink) fpLink.textContent = "Sending...";

    try {
        const supabase = await window.initSupabase();

        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: new URL('login.html', window.location.href).href,
        });

        if (error) {
            if (errorEl) {
                errorEl.textContent = error.message;
                errorEl.style.display = 'block';
            }
        } else {
            if (successEl) {
                successEl.textContent = "Password reset instructions have been sent to your email.";
                successEl.style.display = 'block';
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = "An error occurred while resetting the password.";
            errorEl.style.display = 'block';
        }
    } finally {
        if (fpLink) fpLink.textContent = originalText;
    }
}

// Start the initialization
initializeAuth();
