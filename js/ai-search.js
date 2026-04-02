/**
 * RwandaBooking Smart Search Autocomplete
 * AI-powered destination suggestions with recent search tracking
 */

const DESTINATIONS = [
    { name: 'Kigali', subtitle: 'Capital city · Hotels & apartments', icon: '🌆', type: 'city' },
    { name: 'Musanze', subtitle: 'Volcanoes National Park · Gorilla trekking', icon: '🦍', type: 'city' },
    { name: 'Gisenyi (Rubavu)', subtitle: 'Lake Kivu · Beach resorts', icon: '🌊', type: 'city' },
    { name: 'Akagera', subtitle: 'Akagera National Park · Safari lodges', icon: '🦁', type: 'park' },
    { name: 'Nyungwe', subtitle: 'Nyungwe Forest · Chimpanzee trekking', icon: '🌿', type: 'park' },
    { name: 'Kibuye (Karongi)', subtitle: 'Lake Kivu · Scenic lakeside stays', icon: '🏖️', type: 'city' },
    { name: 'Butare (Huye)', subtitle: 'National University · Cultural heritage', icon: '🏛️', type: 'city' },
    { name: 'Cyangugu (Rusizi)', subtitle: 'Border town · Nature and waterfalls', icon: '💧', type: 'city' },
    { name: 'Ruhengeri', subtitle: 'Gateway to gorillas · Mountain views', icon: '⛰️', type: 'city' },
    { name: 'Kinigi', subtitle: 'Volcanoes National Park HQ · Trekking base', icon: '🌋', type: 'park' },
    { name: 'Lake Kivu', subtitle: 'Scenic lake across western Rwanda', icon: '🌅', type: 'nature' },
    { name: 'Volcanoes National Park', subtitle: 'Gorilla & golden monkey trekking', icon: '🦍', type: 'park' },
    { name: 'Gishwati-Mukura Park', subtitle: 'Forest park · Chimpanzees & birds', icon: '🐒', type: 'park' },
    { name: 'Kigali Airport (KGL)', subtitle: 'International flights hub', icon: '✈️', type: 'transport' },
    { name: 'Rwanda', subtitle: 'All destinations in Rwanda', icon: '🇷🇼', type: 'country' },
];

let searchDropdownOpen = false;

const initSearch = () => {
    // Only enhance search on pages that have the main search field
    const searchInput = document.getElementById('search-dest');
    if (!searchInput) return;

    enhanceSearch(searchInput);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
} else {
    initSearch();
}

function enhanceSearch(input) {
    // Wrap input group
    const inputGroup = input.closest('.input-group');
    if (!inputGroup) return;

    inputGroup.style.position = 'relative';

    // Create dropdown
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.id = 'searchDropdown';
    inputGroup.appendChild(dropdown);

    // On focus: show recent & popular
    input.addEventListener('focus', () => {
        showDropdown(input, dropdown, '');
    });

    // On input: filter suggestions
    input.addEventListener('input', () => {
        showDropdown(input, dropdown, input.value);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!inputGroup.contains(e.target)) {
            closeDropdown(dropdown);
        }
    });

    // Keyboard navigation
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDropdown(dropdown);
        if (e.key === 'ArrowDown') {
            const first = dropdown.querySelector('.search-suggestion-item');
            first?.focus();
        }
    });
}

function showDropdown(input, dropdown, query) {
    const recent = getRecentSearches();
    const lower = query.toLowerCase().trim();

    let items = [];

    if (!lower) {
        // Show recent searches first, then popular
        if (recent.length > 0) {
            items.push({ type: 'header', label: 'Recently searched' });
            items.push(...recent.map(r => ({ ...r, isRecent: true })));
            items.push({ type: 'divider' });
        }
        items.push({ type: 'header', label: 'Popular destinations' });
        items.push(...DESTINATIONS.slice(0, 6));
    } else {
        // Fuzzy search
        const matches = DESTINATIONS.filter(d => {
            return d.name.toLowerCase().includes(lower) || d.subtitle.toLowerCase().includes(lower);
        });

        if (matches.length === 0) {
            dropdown.innerHTML = `<div class="search-no-result">No destinations found for "<strong>${escapeHtml(query)}</strong>"</div>`;
            dropdown.classList.add('open');
            return;
        }

        items.push({ type: 'header', label: `Destinations matching "${query}"` });
        items.push(...matches);
    }

    // Render
    dropdown.innerHTML = items.map(item => {
        if (item.type === 'header') {
            return `<div class="search-group-label">${item.label}</div>`;
        }
        if (item.type === 'divider') {
            return `<hr class="search-divider">`;
        }
        return `
      <button class="search-suggestion-item" tabindex="0"
        onclick="selectDestination('${escapeHtml(item.name)}', this.closest('#searchDropdown'))">
        <span class="sug-icon">${item.icon}</span>
        <span class="sug-info">
          <span class="sug-name">${highlightMatch(item.name, lower)}</span>
          <span class="sug-sub">${item.subtitle}</span>
        </span>
        ${item.isRecent ? '<span class="sug-recent-tag">Recent</span>' : ''}
      </button>
    `;
    }).join('');

    dropdown.classList.add('open');
}

function selectDestination(name, dropdown) {
    const input = document.getElementById('search-dest');
    if (input) input.value = name;

    // Save to recent searches
    saveRecentSearch(name);

    closeDropdown(dropdown);
    input?.focus();
}

function closeDropdown(dropdown) {
    dropdown?.classList.remove('open');
}

function getRecentSearches() {
    try {
        const data = JSON.parse(localStorage.getItem('rwb_recent_searches') || '[]');
        return data.map(name => {
            const dest = DESTINATIONS.find(d => d.name === name);
            return dest || { name, icon: '🔍', subtitle: 'Previous search', isRecent: true };
        });
    } catch { return []; }
}

function saveRecentSearch(name) {
    try {
        let recent = JSON.parse(localStorage.getItem('rwb_recent_searches') || '[]');
        recent = [name, ...recent.filter(r => r !== name)].slice(0, 4);
        localStorage.setItem('rwb_recent_searches', JSON.stringify(recent));
    } catch { }
}

function highlightMatch(text, query) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + `<mark>${text.slice(idx, idx + query.length)}</mark>` + text.slice(idx + query.length);
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
