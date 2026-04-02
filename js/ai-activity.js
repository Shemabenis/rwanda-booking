/**
 * RwandaBooking Live Activity Feed
 * Shows realistic social-proof toast notifications to create a "24/7 live" feel
 */

const ACTIVITY_DATA = [
    { name: 'Amara K.', city: 'Nairobi', action: 'just booked', place: 'Kigali Serena Hotel', emoji: '🏨' },
    { name: 'Jean-Pierre N.', city: 'Kigali', action: 'just booked', place: 'Gorilla trekking permits', emoji: '🦍' },
    { name: 'Fatima A.', city: 'Lagos', action: 'just booked', place: 'Lake Kivu Resort', emoji: '🌊' },
    { name: 'David M.', city: 'Johannesburg', action: 'just booked', place: 'Akagera Game Lodge', emoji: '🦁' },
    { name: 'Priya S.', city: 'Dubai', action: 'is viewing', place: 'Volcanoes National Park stay', emoji: '🌋' },
    { name: 'Alice O.', city: 'London', action: 'just booked', place: 'Kigali Heights Apartment', emoji: '🏢' },
    { name: 'Emmanuel R.', city: 'Kampala', action: 'just booked', place: 'Musanze Caves Guest House', emoji: '🏡' },
    { name: 'Sofia L.', city: 'Paris', action: 'is viewing', place: 'Nyungwe House Resort', emoji: '🌿' },
    { name: 'Omar B.', city: 'Cairo', action: 'just booked', place: 'Ubumwe Grande Hotel', emoji: '⭐' },
    { name: 'Chloe W.', city: 'New York', action: 'just booked', place: "One&Only Gorilla\u2019s Nest", emoji: '🦍' },
    { name: 'Tariq A.', city: 'Addis Ababa', action: 'just booked', place: 'Kigali Airport Hotel', emoji: '✈️' },
    { name: 'Aisha M.', city: 'Dar es Salaam', action: 'is viewing', place: 'Lake Kivu Serena Hotel', emoji: '🌅' },
    { name: 'Lucas P.', city: 'Brussels', action: 'just booked', place: 'Gisenyi Beach Resort', emoji: '🏖️' },
    { name: 'Ngozi A.', city: 'Abuja', action: 'just booked', place: 'Kigali Marriott Hotel', emoji: '🏨' },
    { name: 'Yui T.', city: 'Tokyo', action: 'is viewing', place: 'Gorilla trekking experience', emoji: '🦍' },
    { name: 'Kwame A.', city: 'Accra', action: 'just booked', place: 'Rubavu Beach Guesthouse', emoji: '🌊' },
    { name: 'Isabelle M.', city: 'Montreal', action: 'just booked', place: 'Bisate Lodge', emoji: '🌿' },
    { name: '3 people', city: '', action: 'are viewing', place: 'Kigali hotel deals right now', emoji: '👀' },
    { name: '7 travelers', city: '', action: 'booked in Rwanda', place: 'in the last hour', emoji: '🔥' },
    { name: 'Rosa G.', city: 'Madrid', action: 'just booked', place: 'Cyangugu Guesthouse', emoji: '🏡' },
];

let activityIndex = 0;
let activityTimeout = null;

const initActivity = () => {
    // Create toast container
    const container = document.createElement('div');
    container.id = 'activity-container';
    document.body.appendChild(container);

    // Start showing toasts after 8 seconds, then every 18–35 seconds
    setTimeout(() => {
        showActivityToast();
        scheduleNext();
    }, 8000);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivity);
} else {
    initActivity();
}

function scheduleNext() {
    const delay = 18000 + Math.random() * 17000; // 18–35 second intervals
    activityTimeout = setTimeout(() => {
        showActivityToast();
        scheduleNext();
    }, delay);
}

function showActivityToast() {
    const container = document.getElementById('activity-container');
    if (!container) return;

    // Cycle through activities
    const item = ACTIVITY_DATA[activityIndex % ACTIVITY_DATA.length];
    activityIndex++;

    const location = item.city ? ` from ${item.city}` : '';

    const toast = document.createElement('div');
    toast.className = 'activity-toast';
    toast.innerHTML = `
    <span class="activity-emoji">${item.emoji}</span>
    <div class="activity-text">
      <strong>${item.name}</strong>${location}
      <span>${item.action} <em>${item.place}</em></span>
    </div>
    <button class="activity-close" onclick="this.parentElement.remove()">✕</button>
  `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('visible');
        });
    });

    // Auto-dismiss after 6 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 400);
    }, 6000);

    // Max 3 visible at once
    const toasts = container.querySelectorAll('.activity-toast');
    if (toasts.length > 3) {
        const oldest = toasts[0];
        oldest.classList.remove('visible');
        setTimeout(() => oldest.remove(), 400);
    }
}
