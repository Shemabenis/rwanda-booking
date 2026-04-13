/**
 * properties-data.js
 * Fetch properties from Rwanda Booking Supabase backend
 */

// Fallback data in case the DB is empty or fails to load
const fallbackProperties = [
    {
        id: 1,
        name: "Kigali Heights Hotel",
        type: "hotel",
        location: "Kigali City Center",
        distance: "1.2 km from center",
        price: 120000,
        rating: 9.2,
        reviews: 124,
        image: "images/kigali_convention_center_1768753060416.png",
        description: "Experience luxury in the heart of Kigali with stunning views of the Convention Center. Features a rooftop pool, spa, and international dining.",
        amenities: ["Free WiFi", "Pool", "Spa", "Restaurant", "AC", "Gym"],
        host: { name: "Management", avatar: "https://ui-avatars.com/api/?name=Kigali+Heights&background=0D8ABC&color=fff" }
    }
];

// Helper to get all properties
async function fetchProperties() {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }

        if (!window.initSupabase) {
            console.warn("Supabase not initialized, using fallback dataset.");
            return fallbackProperties;
        }

        const supabase = await window.initSupabase();

        // Query Supabase for properties
        const { data, error } = await supabase
            .from('properties')
            .select(`
                *,
                profiles:host_id (id, first_name, last_name, email),
                property_images (image_url, is_primary)
            `)
            .eq('is_active', true);

        if (error) {
            console.error("Error fetching properties from Supabase:", error);
            return fallbackProperties;
        }

        if (!data || data.length === 0) {
            return fallbackProperties;
        }

        // Map Supabase data format to the UI format expected by our app
        const mappedData = data.map(p => {
            // Find primary image or use a default one
            let primaryImg = "images/property-placeholder.png";
            if (p.property_images && p.property_images.length > 0) {
                const pImg = p.property_images.find(img => img.is_primary) || p.property_images[0];
                primaryImg = pImg.image_url;
            } else if (p.property_type === 'hotel') {
                primaryImg = "images/kigali_convention_center_1768753060416.png";
            } else if (p.property_type === 'resort') {
                primaryImg = "images/lake_kivu_resort_1768753076757.png";
            } else {
                primaryImg = "images/mountain_gorilla_trek_1768753092607.png"; // generic fallback
            }

            const hostName = p.profiles ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() : "Host";
            
            return {
                id: p.id,
                name: p.property_name,
                type: p.property_type,
                location: p.city + (p.district ? `, ${p.district}` : ''),
                distance: "City limits", // This could optionally be computed or added to the backend
                price: parseFloat(p.base_price_per_night),
                rating: parseFloat(p.star_rating) || 0,
                reviews: 0, // Mock reviews since not in DB
                image: primaryImg,
                description: p.description || "A wonderful place to stay.",
                amenities: ["Free WiFi", "AC", "Parking"], // Mock amenities if not present in DB
                host: { 
                    name: hostName || "Management", 
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(hostName || 'Host')}&background=random` 
                }
            };
        });

        // Merge and return
        const localProps = JSON.parse(localStorage.getItem('rwanda_local_properties') || '[]');
        return [...localProps, ...mappedData];
    } catch (err) {
        console.error("Exception fetching properties:", err);
        const localProps = JSON.parse(localStorage.getItem('rwanda_local_properties') || '[]');
        return [...localProps, ...fallbackProperties];
    }
}

// Global reference for simple ID lookup fallback (used for dynamic links when needed locally)
let _loadedPropertiesCache = [];

// Helper to get property by ID
async function getPropertyById(id) {
    try {
        // 1. Check local storage mock properties first
        const localProps = JSON.parse(localStorage.getItem('rwanda_local_properties') || '[]');
        const localMatch = localProps.find(p => String(p.id) === String(id));
        if (localMatch) return localMatch;

        // 2. Check memory cache natively
        let cached = _loadedPropertiesCache.find(p => String(p.id) === String(id));
        if (cached) return cached;

        // 3. Instead of recreating mapping logic, let's fetch all (which applies mapping) and find it. 
        // This flawlessly leverages the existing robust fetch logic that ties to Supabase / Local.
        const allProps = await fetchProperties();
        return allProps.find(p => String(p.id) === String(id)) || null;

    } catch (e) {
        console.error("Error retrieving property by ID:", e);
        return null;
    }
}

// Helper to format price
function formatPrice(price) {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
}
