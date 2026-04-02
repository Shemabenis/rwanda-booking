/**
 * components.js
 * Injects shared Header and Footer components
 */

document.addEventListener('DOMContentLoaded', () => {
    injectHeader();
    injectFooter();
    setupMobileMenu();
    highlightActiveLink();
    loadAIFeatures();
});

/**
 * Dynamically loads all AI feature scripts on every page.
 * Scripts are loaded in order: chat -> activity -> search -> recommend
 */
function loadAIFeatures() {
    const scripts = [
        'js/supabase-config.js',
        'js/translations.js',
        'js/i18n.js',
        'js/ai-chat.js',
        'js/ai-activity.js',
        'js/ai-search.js',
        'js/ai-recommend.js',
        'js/auth.js',
        'js/booking.js'
    ];

    // Determine the base path (works whether page is at root or in a subdirectory)
    const base = document.querySelector('script[src*="components.js"]')
        ?.src.replace(/js\/components\.js.*$/, '') || '';

    // Load scripts sequentially to ensure dependencies
    const loadScript = (index) => {
        if (index >= scripts.length) return;
        const script = document.createElement('script');
        script.src = base + scripts[index];
        script.defer = true;
        script.onload = () => loadScript(index + 1);
        document.head.appendChild(script);
    };

    loadScript(0);
}


function injectHeader() {
    const headerPlaceholder = document.getElementById('app-header');
    if (!headerPlaceholder) return;

    // Use current path to determine if we are on the login page
    const isLoginPage = window.location.pathname.includes('login.html');

    // HTML Content for Header
    // Note: We use absolute paths or relative to root usually, but since all files are in root, simple filenames work.
    const headerHTML = `
    <header>
        <div class="container navbar">
            <a href="index.html" class="logo">RwandaBooking</a>

            <!-- Desktop Nav -->
            <nav class="nav-links hidden-mobile">
                <a href="index.html" class="nav-item" data-i18n="nav_home">Home</a>
                
                <!-- Language Picker -->
                <div class="lang-picker">
                    <button class="lang-btn" id="langBtn">
                        <span id="currentLangLabel">EN</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                    </button>
                    <div class="lang-dropdown">
                        <button onclick="setLanguage('en')">English</button>
                        <button onclick="setLanguage('rw')">Kinyarwanda</button>
                        <button onclick="setLanguage('fr')">Français</button>
                        <button onclick="setLanguage('sw')">Kiswahili</button>
                    </div>
                </div>

                <a href="contact.html" class="nav-item">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' width='20' height='20' fill='white'%3E%3Cpath d='M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zM128 256c0-70.7 57.3-128 128-128s128 57.3 128 128-57.3 128-128 128-128-57.3-128-128zm128 0a64 64 0 1 0 0-128 64 64 0 1 0 0 128z'/%3E%3C/svg%3E"
                        alt="Help" style="display:inline-block; vertical-align:middle;">
                </a>
                <a href="host.html" class="btn btn-secondary" data-i18n="nav_list_property">List your property</a>
                <div class="nav-actions">
                    <button class="btn btn-secondary" onclick="window.location.href='login.html'" data-i18n="nav_register">Register</button>
                    <button class="btn btn-secondary" onclick="window.location.href='login.html'" data-i18n="nav_signin">Sign in</button>
                </div>
            </nav>

            <!-- Mobile Menu Button -->
            <div class="mobile-menu-btn" id="mobileMenuBtn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
            </div>
        </div>

        <!-- Secondary Navigation Bar -->
        <div style="background-color: var(--brand-primary); padding-bottom: 0; border-top: 1px solid rgba(255,255,255,0.15);">
            <div class="container">
                <div class="secondary-nav">
                    <a href="properties.html" class="secondary-nav-item" data-page="properties">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#60a5fa" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-1.5c0-2.33-4.67-3.5-7-3.5zm13-8v2h-2V7h-2v2h-2v2h2v2h2v-2h2v2h2V7h-2z"/></svg>
                        <span data-i18n="nav_stays">Stays</span>
                    </a>
                    <a href="flights.html" class="secondary-nav-item" data-page="flights">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                        <span data-i18n="nav_flights">Flights</span>
                    </a>
                    <a href="car-rentals.html" class="secondary-nav-item" data-page="car-rentals">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#34d399" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.95-.68h9.56c.43 0 .81.28.95.68L19 11H5z"/></svg>
                        <span data-i18n="nav_cars">Car Rentals</span>
                    </a>
                    <a href="attractions.html" class="secondary-nav-item" data-page="attractions">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f87171" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/></svg>
                        <span data-i18n="nav_attractions">Attractions</span>
                    </a>
                </div>
            </div>
        </div>
    </header>
    `;

    // Inject
    headerPlaceholder.innerHTML = headerHTML;

    // Inject Mobile Menu Overlay (if not already present in body)
    if (!document.getElementById('mobileMenu')) {
        const currentPath = window.location.pathname;
        const isActive = (page) => currentPath.includes(page) ? 'mm-active' : '';

        const mobileMenuHTML = `
        <div class="mobile-menu-backdrop" id="mobileMenuBackdrop"></div>
        <div class="mobile-menu-drawer" id="mobileMenu">
            <!-- Drawer Header -->
            <div class="mm-header">
                <span class="mm-logo">RwandaBooking</span>
                <button class="mm-close-btn" id="closeMenu" aria-label="Close menu">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>
            </div>

            <!-- Travel Section -->
            <div class="mm-section-label" data-i18n="footer_discover">Browse</div>
            <nav class="mm-nav">
                <a href="index.html" class="mm-link ${isActive('index') || currentPath.endsWith('/') ? 'mm-active' : ''}">
                    <span class="mm-icon">🏠</span> <span data-i18n="nav_home">Home</span>
                </a>
                <a href="properties.html" class="mm-link ${isActive('properties')}">
                    <span class="mm-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#60a5fa"><path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-1.5c0-2.33-4.67-3.5-7-3.5zm13-8v2h-2V7h-2v2h-2v2h2v2h2v-2h2v2h2V7h-2z"/></svg>
                    </span>
                    <span data-i18n="nav_stays">Stays</span>
                </a>
                <a href="flights.html" class="mm-link ${isActive('flights')}">
                    <span class="mm-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fbbf24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>
                    </span>
                    <span data-i18n="nav_flights">Flights</span>
                </a>
                <a href="car-rentals.html" class="mm-link ${isActive('car-rentals')}">
                    <span class="mm-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#34d399"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.27-3.82c.14-.4.52-.68.95-.68h9.56c.43 0 .81.28.95.68L19 11H5z"/></svg>
                    </span>
                    <span data-i18n="nav_cars">Car Rentals</span>
                </a>
                <a href="attractions.html" class="mm-link ${isActive('attractions')}">
                    <span class="mm-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#f87171"><path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/></svg>
                    </span>
                    <span data-i18n="nav_attractions">Attractions</span>
                </a>
            </nav>

            <div class="mm-divider"></div>

            <!-- Language Section -->
            <div class="mm-section-label">Language</div>
            <nav class="mm-nav">
                <div class="mm-lang-grid">
                    <button onclick="setLanguage('en')" class="mm-lang-btn ${(window.currentLang || 'en') === 'en' ? 'active' : ''}">English</button>
                    <button onclick="setLanguage('rw')" class="mm-lang-btn ${(window.currentLang || 'en') === 'rw' ? 'active' : ''}">Kinyarwanda</button>
                    <button onclick="setLanguage('fr')" class="mm-lang-btn ${(window.currentLang || 'en') === 'fr' ? 'active' : ''}">Français</button>
                    <button onclick="setLanguage('sw')" class="mm-lang-btn ${(window.currentLang || 'en') === 'sw' ? 'active' : ''}">Kiswahili</button>
                </div>
            </nav>

            <div class="mm-divider"></div>

            <!-- Account Section -->
            <div class="mm-section-label" data-i18n="footer_terms">Account</div>
            <nav class="mm-nav">
                <a href="host.html" class="mm-link ${isActive('host')}">
                    <span class="mm-icon">🏡</span> <span data-i18n="nav_list_property">List your property</span>
                </a>
                <a href="contact.html" class="mm-link ${isActive('contact')}">
                    <span class="mm-icon">💬</span> Help &amp; Support
                </a>
                <a href="about.html" class="mm-link ${isActive('about')}">
                    <span class="mm-icon">ℹ️</span> About Us
                </a>
            </nav>

            <div class="mm-divider"></div>

            <!-- Auth Buttons -->
            <div class="mm-auth">
                <a href="login.html" class="mm-btn-signin" data-i18n="nav_signin">Sign in</a>
                <a href="login.html" class="mm-btn-register" data-i18n="nav_register">Register</a>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', mobileMenuHTML);

        // Backdrop click to close — deferred so setupMobileMenu has time to set window._rwbToggleMenu
        document.getElementById('mobileMenuBackdrop').addEventListener('click', () => {
            if (window._rwbToggleMenu) window._rwbToggleMenu(false);
        });
    }
}

function injectFooter() {
    const footerPlaceholder = document.getElementById('app-footer');
    if (!footerPlaceholder) return;

    const footerHTML = `
    <footer>
        <div class="container">
            <div class="footer-btn-container" style="text-align: center; margin-bottom: 32px;">
                <button class="btn btn-secondary"
                    style="border-color: var(--brand-primary); color: var(--brand-primary);" onclick="window.location.href='host.html'">List your property</button>
            </div>

            <div class="footer-grid">
                <div class="footer-col">
                    <h4 data-i18n="footer_support">Support</h4>
                    <ul>
                        <li><a href="#">Manage your trips</a></li>
                        <li><a href="contact.html">Contact Customer Service</a></li>
                        <li><a href="#">Safety Resource Center</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_discover">Discover</h4>
                    <ul>
                        <li><a href="#">Genius loyalty program</a></li>
                        <li><a href="#">Seasonal and holiday deals</a></li>
                        <li><a href="#">Travel articles</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_terms">Terms & Settings</h4>
                    <ul>
                        <li><a href="#">Privacy & cookies</a></li>
                        <li><a href="#">Terms and conditions</a></li>
                        <li><a href="#">Manage cookie settings</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4 data-i18n="footer_partners">Partners</h4>
                    <ul>
                        <li><a href="#">Extranet login</a></li>
                        <li><a href="#">Partner help</a></li>
                        <li><a href="#">Become an affiliate</a></li>
                    </ul>
                </div>
            </div>

            <div class="copyright">
                <p>Copyright © 2026 RwandaBooking. All rights reserved.</p>
                <p style="margin-top:8px;">RwandaBooking is part of Antigravity Holdings Inc.</p>
            </div>
        </div>
    </footer>
    `;

    footerPlaceholder.innerHTML = footerHTML;
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    const closeMenu = document.getElementById('closeMenu');

    function toggleMenu(show) {
        if (!mobileMenu) return;
        if (show) {
            mobileMenu.classList.add('active');
            if (backdrop) backdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            mobileMenu.classList.remove('active');
            if (backdrop) backdrop.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Make toggleMenu accessible to backdrop's own listener added in injectHeader
    window._rwbToggleMenu = toggleMenu;

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', () => toggleMenu(false));
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            toggleMenu(false);
        }
    });
}

function highlightActiveLink() {
    const path = window.location.pathname;

    // Highlight secondary nav items
    document.querySelectorAll('.secondary-nav-item').forEach(link => {
        const page = link.getAttribute('data-page');
        if (page && path.includes(page)) {
            link.classList.add('active');
        }
    });

    // Highlight top nav home link on index
    if (path.endsWith('index.html') || path.endsWith('/') || path === '') {
        const homeLink = document.querySelector('.nav-links a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }
}
