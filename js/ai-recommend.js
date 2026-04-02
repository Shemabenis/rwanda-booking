/**
 * RwandaBooking Personalized Recommendations
 * Tracks viewed destinations and shows a personalized strip on the homepage
 */

const PROPERTY_RECOMMENDATIONS = {
    Kigali: [
        { name: 'Kigali Marriott Hotel', type: 'Hotel', price: 'RWF 180,000', rating: '9.2', img: 'images/kigali_convention_center_1768753060416.png', url: 'property-details.html' },
        { name: 'Ubumwe Grande Hotel', type: 'Hotel', price: 'RWF 120,000', rating: '8.9', img: 'images/kigali_convention_center_1768753060416.png', url: 'property-details.html' },
        { name: 'Kigali Heights Apartment', type: 'Apartment', price: 'RWF 65,000', rating: '8.4', img: 'images/kigali_convention_center_1768753060416.png', url: 'property-details.html' },
    ],
    Gisenyi: [
        { name: 'Lake Kivu Serena Hotel', type: 'Resort', price: 'RWF 200,000', rating: '9.5', img: 'images/lake_kivu_resort_1768753076757.png', url: 'property-details.html' },
        { name: 'Gisenyi Beach Guesthouse', type: 'Guesthouse', price: 'RWF 45,000', rating: '8.1', img: 'images/lake_kivu_resort_1768753076757.png', url: 'property-details.html' },
    ],
    Musanze: [
        { name: "One&Only Gorilla's Nest", type: 'Luxury Lodge', price: 'RWF 850,000', rating: '9.8', img: 'images/mountain_gorilla_trek_1768753092607.png', url: 'property-details.html' },
        { name: 'Bisate Lodge', type: 'Eco Lodge', price: 'RWF 700,000', rating: '9.7', img: 'images/mountain_gorilla_trek_1768753092607.png', url: 'property-details.html' },
    ],
    Akagera: [
        { name: 'Ruzizi Tented Lodge', type: 'Tented Camp', price: 'RWF 350,000', rating: '9.3', img: 'images/akagera_safari_landscape_1768753107916.png', url: 'property-details.html' },
        { name: 'Akagera Game Lodge', type: 'Lodge', price: 'RWF 280,000', rating: '9.0', img: 'images/akagera_safari_landscape_1768753107916.png', url: 'property-details.html' },
    ],
};

// Popular picks shown on first visit
const POPULAR_PICKS = [
    { name: 'Kigali Serena Hotel', type: 'Hotel', price: 'RWF 150,000', rating: '9.1', img: 'images/kigali_convention_center_1768753060416.png', url: 'property-details.html' },
    { name: 'Lake Kivu Resort', type: 'Resort', price: 'RWF 180,000', rating: '9.4', img: 'images/lake_kivu_resort_1768753076757.png', url: 'property-details.html' },
    { name: 'Volcanoes Tented Camp', type: 'Eco Lodge', price: 'RWF 420,000', rating: '9.6', img: 'images/mountain_gorilla_trek_1768753092607.png', url: 'property-details.html' },
    { name: 'Akagera Safari Lodge', type: 'Lodge', price: 'RWF 260,000', rating: '9.0', img: 'images/akagera_safari_landscape_1768753107916.png', url: 'property-details.html' },
];

const initRecommend = () => {
    // Track destination views: called by destination card clicks
    trackDestinationClicks();

    // Show recommendation strip on homepage
    if (window.location.pathname.includes('index') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
        renderRecommendationStrip();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRecommend);
} else {
    initRecommend();
}

function trackDestinationClicks() {
    // Attach tracking to all destination cards that navigate to properties with a destination param
    document.querySelectorAll('[onclick*="properties.html?dest="]').forEach(card => {
        card.addEventListener('click', () => {
            const match = card.getAttribute('onclick')?.match(/dest=([^']+)/);
            if (match) saveViewedDestination(match[1]);
        });
    });
}

function saveViewedDestination(dest) {
    try {
        let viewed = JSON.parse(localStorage.getItem('rwb_viewed_destinations') || '[]');
        viewed = [dest, ...viewed.filter(d => d !== dest)].slice(0, 5);
        localStorage.setItem('rwb_viewed_destinations', JSON.stringify(viewed));
    } catch { }
}

function getViewedDestinations() {
    try {
        return JSON.parse(localStorage.getItem('rwb_viewed_destinations') || '[]');
    } catch { return []; }
}

function renderRecommendationStrip() {
    const viewed = getViewedDestinations();
    const isFirstVisit = viewed.length === 0;

    // Collect recommendations
    let recommendations = [];
    let title = '';
    let subtitle = '';

    if (isFirstVisit) {
        recommendations = POPULAR_PICKS;
        title = '🔥 Popular this week';
        subtitle = 'Top-rated stays loved by travelers right now';
    } else {
        title = '⭐ Recommended for you';
        subtitle = `Based on your interest in ${viewed.slice(0, 2).join(' & ')}`;

        // Pull recs from viewed destinations
        for (const dest of viewed) {
            const destRecs = PROPERTY_RECOMMENDATIONS[dest] || [];
            recommendations.push(...destRecs);
        }

        // De-duplicate by name and cap at 4
        const seen = new Set();
        recommendations = recommendations.filter(r => {
            if (seen.has(r.name)) return false;
            seen.add(r.name);
            return true;
        }).slice(0, 4);

        // If not enough, pad with popular picks
        if (recommendations.length < 3) {
            const extra = POPULAR_PICKS.filter(p => !seen.has(p.name)).slice(0, 4 - recommendations.length);
            recommendations.push(...extra);
        }
    }

    if (recommendations.length === 0) return;

    // Find insertion point: before the "Trending destinations" section
    const trendingSection = document.querySelector('.section-title');
    if (!trendingSection) return;
    const container = trendingSection.closest('.section') || trendingSection.parentElement;
    if (!container) return;

    const strip = document.createElement('div');
    strip.className = 'container section';
    strip.id = 'recommendation-strip';
    strip.innerHTML = `
    <h2 class="section-title">${title}</h2>
    <span class="section-subtitle">${subtitle}</span>
    <div class="rec-grid">
      ${recommendations.map(prop => `
        <a href="${prop.url}" class="rec-card">
          <div class="rec-image-wrap">
            <img src="${prop.img}" alt="${prop.name}" class="rec-image">
            <span class="rec-badge">${prop.type}</span>
          </div>
          <div class="rec-body">
            <h4 class="rec-title">${prop.name}</h4>
            <div class="rec-meta">
              <span class="rec-rating">⭐ ${prop.rating}</span>
              <span class="rec-price">${prop.price}<small>/night</small></span>
            </div>
          </div>
        </a>
      `).join('')}
    </div>
  `;

    // Insert before the trending destinations section
    container.parentElement.insertBefore(strip, container);
}
