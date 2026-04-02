// RwandaStays Main JavaScript

// Sample properties data
const sampleProperties = [
    {
        id: 1,
        name: "Kigali Heights Villa",
        location: "Kiyovu, Kigali",
        district: "Kigali City",
        price: 85000,
        rating: 4.8,
        reviews: 124,
        bedrooms: 3,
        bathrooms: 2,
        wifi: true,
        parking: true,
        breakfast: true,
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Modern villa with stunning city views. Perfect for business or leisure travelers."
    },
    {
        id: 2,
        name: "Musanze Gorilla Lodge",
        location: "Musanze Town",
        district: "Musanze",
        price: 65000,
        rating: 4.9,
        reviews: 89,
        bedrooms: 2,
        bathrooms: 1,
        wifi: true,
        parking: true,
        breakfast: true,
        image: "https://images.unsplash.com/photo-1566125882500-87e10f726cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Cozy lodge near Volcanoes National Park. Ideal for gorilla trekking adventures."
    },
    {
        id: 3,
        name: "Lake Kivu Beach House",
        location: "Rubavu Beach",
        district: "Rubavu",
        price: 120000,
        rating: 4.7,
        reviews: 67,
        bedrooms: 4,
        bathrooms: 3,
        wifi: true,
        parking: true,
        breakfast: false,
        image: "https://images.unsplash.com/photo-1573843983-cf03d3973d10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Beautiful beachfront house with private lake access. Perfect for families."
    },
    {
        id: 4,
        name: "Nyungwe Forest Retreat",
        location: "Nyungwe National Park",
        district: "Nyamagabe",
        price: 55000,
        rating: 4.6,
        reviews: 45,
        bedrooms: 2,
        bathrooms: 1,
        wifi: false,
        parking: true,
        breakfast: true,
        image: "https://images.unsplash.com/photo-1593693399741-6f30d8a6d12f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        description: "Eco-friendly retreat in the heart of Nyungwe rainforest."
    }
];

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Load featured properties on homepage
    if (document.getElementById('featuredProperties')) {
        loadFeaturedProperties();
    }
    
    // Set default dates
    setDefaultDates();
    
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Form submissions
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }
    
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', handleRegister);
    }
});

// Load featured properties
function loadFeaturedProperties() {
    const container = document.getElementById('featuredProperties');
    container.innerHTML = '';
    
    sampleProperties.forEach(property => {
        const propertyHTML = `
            <div class="col-md-3">
                <div class="card property-card shadow-sm h-100">
                    <div class="position-relative">
                        <img src="${property.image}" class="property-img" alt="${property.name}">
                        <div class="price-tag">${formatPrice(property.price)} RWF</div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${property.name}</h5>
                        <p class="text-muted">
                            <i class="fas fa-map-marker-alt text-primary"></i> ${property.location}, ${property.district}
                        </p>
                        <div class="rating mb-2">
                            <span class="rating-stars">
                                ${generateStars(property.rating)}
                            </span>
                            <small class="text-muted">(${property.reviews} reviews)</small>
                        </div>
                        <p class="card-text small">${property.description}</p>
                        <div class="amenities mb-3">
                            ${property.wifi ? '<span class="amenity-badge"><i class="fas fa-wifi"></i> WiFi</span>' : ''}
                            ${property.parking ? '<span class="amenity-badge"><i class="fas fa-car"></i> Parking</span>' : ''}
                            ${property.bedrooms ? `<span class="amenity-badge"><i class="fas fa-bed"></i> ${property.bedrooms} Bed</span>` : ''}
                            ${property.breakfast ? '<span class="amenity-badge"><i class="fas fa-utensils"></i> Breakfast</span>' : ''}
                        </div>
                        <a href="property.html?id=${property.id}" class="btn btn-primary w-100">
                            <i class="fas fa-eye me-2"></i>View Details
                        </a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += propertyHTML;
    });
}

// Generate star ratings
function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

// Format price with commas
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Set default dates (today and tomorrow)
function setDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    if (document.getElementById('checkIn')) {
        document.getElementById('checkIn').value = formatDate(today);
        document.getElementById('checkIn').min = formatDate(today);
    }
    
    if (document.getElementById('checkOut')) {
        document.getElementById('checkOut').value = formatDate(tomorrow);
        document.getElementById('checkOut').min = formatDate(tomorrow);
    }
}

// Search properties
function searchProperties() {
    const location = document.getElementById('searchLocation').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;
    const guests = document.getElementById('guests').value;
    
    if (!location) {
        alert('Please enter a location to search');
        return;
    }
    
    // In a real app, this would redirect to listings page with query parameters
    window.location.href = `listings.html?location=${encodeURIComponent(location)}&check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`;
}

// Handle login
function handleLogin(e) {
    e.preventDefault();
    // In a real app, this would make an API call
    alert('Login functionality will be implemented with backend.');
    bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
}

// Handle registration
function handleRegister(e) {
    e.preventDefault();
    // In a real app, this would make an API call
    alert('Registration functionality will be implemented with backend.');
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
}

// Mobile Money payment simulation
function simulateMobileMoneyPayment(amount, phone) {
    return new Promise((resolve) => {
        console.log(`Initiating Mobile Money payment of ${amount} RWF to ${phone}`);
        // Simulate API call delay
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate
            if (success) {
                resolve({ success: true, transactionId: 'MM' + Date.now() });
            } else {
                resolve({ success: false, error: 'Payment failed. Please try again.' });
            }
        }, 2000);
    });
}

// Display notification
function showNotification(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}