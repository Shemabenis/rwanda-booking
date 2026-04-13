/**
 * RwandaBooking Main Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Handling ---
    // Moved to components.js


    // --- Search Functionality ---

    // 1. Populate search inputs from URL parameters (if any)
    const params = new URLSearchParams(window.location.search);
    const destParam = params.get('dest');
    const typeParam = params.get('type');
    const dateParam = params.get('date');
    const idParam = params.get('id');

    // Try to find the destination input (using ID or placeholder as fallback)
    const destInput = document.getElementById('search-dest') ||
        document.querySelector('input[placeholder="Where are you going?"]');

    if (destInput && destParam) {
        destInput.value = destParam;
    }

    // 2. Date Input Min Date
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });

    // --- Dynamic Property Rendering (properties.html) ---
    const propertyContainer = document.getElementById('property-container');
    const resultsCountElement = document.getElementById('results-count');

    if (propertyContainer && typeof fetchProperties !== 'undefined') {
        fetchProperties().then(data => {
            // cache it locally in our properties-data _loadedPropertiesCache
            if (typeof _loadedPropertiesCache !== 'undefined') _loadedPropertiesCache = data;
            renderProperties(data, destParam, typeParam);
        });
    }

    // --- Dynamic Property Details (property-details.html) ---
    // We check if we are on details page by looking for specific elements or URL
    if (idParam && typeof getPropertyById !== 'undefined') {
        getPropertyById(idParam).then(property => {
            if (property) {
                renderPropertyDetails(property);
            } else {
                console.warn("Property not found for id:", idParam);
            }
        });
    }

    // --- Dynamic Recent Properties (index.html) ---
    const recentPropertiesGrid = document.getElementById('recent-properties-grid');
    if (recentPropertiesGrid && typeof fetchProperties !== 'undefined') {
        fetchProperties().then(data => {
            if (data && data.length > 0) {
                // sort by id descending and get top 4
                const recent = [...data].sort((a,b) => b.id - a.id).slice(0, 4);
                recentPropertiesGrid.innerHTML = '';
                recent.forEach(p => {
                    const cardHTML = `
                        <div class="card" onclick="window.location.href='property-details.html?id=${p.id}'" style="cursor: pointer;">
                            <img src="${p.image}" alt="${p.name}" class="card-image" style="height: 200px; object-fit: cover;">
                            <div class="card-body">
                                <h3 class="card-title">${p.name}</h3>
                                <p class="card-text">${p.type.charAt(0).toUpperCase() + p.type.slice(1)} in ${p.location}</p>
                                <p style="font-weight:bold; margin-top: 8px; color: var(--brand-primary);">${formatPrice(p.price)} <span style="font-size:12px; font-weight:normal; color: var(--text-secondary);">/ night</span></p>
                            </div>
                        </div>
                    `;
                    recentPropertiesGrid.insertAdjacentHTML('beforeend', cardHTML);
                });
            } else {
                recentPropertiesGrid.innerHTML = '<p style="padding: 20px;">No recently added properties yet.</p>';
            }
        });
    }
});

// Render Properties Function
function renderProperties(allProperties, destFilter, typeFilter) {
    const container = document.getElementById('property-container');
    const countLabel = document.getElementById('results-count');

    // Filter
    let filtered = allProperties;

    if (destFilter) {
        const lowerDest = destFilter.toLowerCase();
        filtered = filtered.filter(p =>
            p.location.toLowerCase().includes(lowerDest) ||
            p.name.toLowerCase().includes(lowerDest)
        );
    }

    if (typeFilter) {
        const lowerType = typeFilter.toLowerCase();
        filtered = filtered.filter(p => p.type.toLowerCase() === lowerType);
    }

    // Update Count
    if (countLabel) {
        if (filtered.length === 0) {
            countLabel.textContent = `No properties found in "${destFilter || 'Rwanda'}"`;
        } else {
            countLabel.textContent = `${destFilter || 'Rwanda'}: ${filtered.length} properties found`;
        }
    }

    // Render
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<div style="padding: 20px; text-align: center;"><h3>No matches found. Try changing your search.</h3></div>';
        return;
    }

    filtered.forEach(p => {
        const cardHTML = `
        <div class="property-card-horizontal">
            <img src="${p.image}" class="h-card-image" alt="${p.name}">
            <div class="h-card-body">
                <div>
                    <div class="h-card-header">
                        <h3 class="h-card-title">${p.name}</h3>
                        <div class="rating-badge">${p.rating}</div>
                    </div>
                    <span class="h-card-location">${p.location} • ${p.distance}</span>
                    <p style="font-size: 14px; margin-top: 8px;">${p.description.substring(0, 100)}...</p>
                </div>
                <div class="price-block">
                    <div class="price-sub">per night</div>
                    <div class="price-text">${formatPrice(p.price)}</div>
                    <button class="btn btn-primary" style="margin-top: 8px;"
                        onclick="window.location.href='property-details.html?id=${p.id}'">See availability</button>
                </div>
            </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Render Details Function
function renderPropertyDetails(p) {
    // Update Title & Meta
    document.title = `${p.name} - RwandaBooking`;

    // Use IDs for robust selection
    const titleEl = document.getElementById('prop-title');
    if (titleEl) titleEl.textContent = p.name;

    const bcTitle = document.getElementById('breadcrumb-title');
    if (bcTitle) bcTitle.textContent = p.name;

    const bcCity = document.getElementById('breadcrumb-city');
    const cityName = p.location.split(',')[0];
    if (bcCity) bcCity.textContent = cityName;

    const subtitleEl = document.getElementById('prop-subtitle');
    const displayType = p.type.charAt(0).toUpperCase() + p.type.slice(1);
    const hostNameStr = p.host.name || 'Management';
    if (subtitleEl) subtitleEl.textContent = `Entire ${displayType.toLowerCase()} hosted by ${hostNameStr}`;

    const ratingEl = document.querySelector('.property-meta .rating-badge');
    if (ratingEl) ratingEl.textContent = p.rating;

    // Location
    const locEl = document.getElementById('prop-location');
    if (locEl) {
        // Keep the SVG
        const svg = locEl.querySelector('svg');
        locEl.innerHTML = '';
        if (svg) locEl.appendChild(svg);
        locEl.appendChild(document.createTextNode(` ${p.location} • ${p.distance}`));
    }

    // Images
    const mainImg = document.getElementById('prop-main-image');
    if (mainImg) mainImg.src = p.image;

    // For side images, we use querySelectorAll since they share a class
    const sideImgs = document.querySelectorAll('.gallery-side img');
    sideImgs.forEach(img => img.src = p.image); // Reuse for now

    // Description
    const descEl = document.getElementById('prop-description');
    if (descEl) descEl.textContent = p.description;

    // Price
    const priceEl = document.getElementById('prop-price');
    if (priceEl) priceEl.textContent = formatPrice(p.price);

    // Host
    const hostName = document.querySelector('.host-info p');
    if (hostName) hostName.textContent = `Hosted by ${p.host.name}`;

    const hostAvatar = document.querySelector('.host-avatar');
    if (hostAvatar) hostAvatar.src = p.host.avatar;

}

// Booking Modal Logic — opens a price summary first
window.openBookingModal = function () {
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (!checkIn || !checkOut) {
        alert('Please select check-in and check-out dates.');
        return;
    }

    const idParam = new URLSearchParams(window.location.search).get('id');
    const priceText = document.getElementById('prop-price')?.textContent || '0';
    const pricePerNight = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;

    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const subtotal = pricePerNight * diffDays;
    const SERVICE_FEE = 5000;
    const total = subtotal + SERVICE_FEE;
    const guestsEl = document.querySelector('.guest-select');
    const guestsText = guestsEl ? guestsEl.value : '1 guest';
    const guestsNum = parseInt(guestsText) || 1;

    // Store for confirm step
    window._stayModalData = { idParam, checkIn, checkOut, diffDays, pricePerNight, subtotal, SERVICE_FEE, total, guestsNum };

    const fmt = d => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const fmtPrice = n => 'RWF ' + n.toLocaleString();

    // Ensure modal exists (it's injected in property-details.html)
    const overlay = document.getElementById('stay-modal-overlay');
    if (!overlay) { alert('Price summary unavailable.'); return; }

    document.getElementById('sm-prop-title').textContent = document.title.split(' - ')[0];
    document.getElementById('sm-checkin').textContent = fmt(checkIn);
    document.getElementById('sm-checkout').textContent = fmt(checkOut);
    document.getElementById('sm-nights').textContent = `${diffDays} night${diffDays > 1 ? 's' : ''}`;
    document.getElementById('sm-guests').textContent = guestsText;
    document.getElementById('sm-ppn').textContent = fmtPrice(pricePerNight);
    document.getElementById('sm-subtotal').textContent = `${fmtPrice(pricePerNight)} × ${diffDays} nights = ${fmtPrice(subtotal)}`;
    document.getElementById('sm-service').textContent = fmtPrice(SERVICE_FEE);
    document.getElementById('sm-total').textContent = fmtPrice(total);

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.closeStayModal = function() {
    const overlay = document.getElementById('stay-modal-overlay');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
};

window.confirmStayBooking = async function() {
    const d = window._stayModalData;
    if (!d) return;
    const btn = document.getElementById('sm-confirm-btn');
    btn.disabled = true; btn.textContent = 'Processing...';

    if (window.submitBooking) {
        await window.submitBooking({
            type: 'accommodation',
            itemId: d.idParam,
            itemName: document.title.split(' - ')[0],
            price: d.total,
            checkIn: d.checkIn,
            checkOut: d.checkOut,
            guests: d.guestsNum
        });
    } else {
        alert('Booking system is not loaded yet. Please try again in a moment.');
    }
    btn.disabled = false; btn.innerHTML = '🏨 Confirm Booking';
    closeStayModal();
};

// Global Search Handler (called by onsubmit)
window.handleSearch = function (event) {
    event.preventDefault();

    // Get values
    const destInput = document.getElementById('search-dest') ||
        document.querySelector('input[placeholder="Where are you going?"]');
    const dateInput = document.getElementById('search-dates') ||
        document.querySelector('input[placeholder="Check-in - Check-out"]');

    const dest = destInput ? destInput.value : '';
    const date = dateInput ? dateInput.value : '';

    // Redirect
    window.location.href = `properties.html?dest=${encodeURIComponent(dest)}&date=${encodeURIComponent(date)}`;
};
