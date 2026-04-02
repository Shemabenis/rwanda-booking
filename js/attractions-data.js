/**
 * attractions-data.js
 * Mock data for Rwanda Booking Attractions
 */

// Fallback data
const fallbackAttractions = [
    {
        id: "AT101",
        name: "Mountain Gorilla Trekking",
        location: "Volcanoes National Park",
        category: "Wildlife & Nature",
        duration: "1 Day",
        price: 1500000,
        // Restored previous local image
        image: "images/mountain_gorilla_trek_1768753092607.png",
        rating: 9.9,
        description: "A once-in-a-lifetime experience trekking to see the majestic mountain gorillas in their natural habitat."
    },
    {
        id: "AT102",
        name: "Kigali City Tour & Genocide Memorial",
        location: "Kigali",
        category: "Culture & History",
        duration: "Half Day",
        price: 45000,
        image: "images/kigali_convention_center_1768753060416.png",
        rating: 9.5,
        description: "Explore the vibrant city of Kigali and visit the moving Genocide Memorial to understand Rwanda's history. Includes a stop at the Convention Center."
    },
    {
        id: "AT103",
        name: "Akagera Big 5 Safari",
        location: "Akagera National Park",
        category: "Wildlife & Nature",
        duration: "1 Day",
        price: 180000,
        image: "images/akagera_safari_landscape_1768753107916.png",
        rating: 9.2,
        description: "Experience a classic safari drive in Rwanda's only savannah park, home to lions, rhinos, elephants, buffalos, and leopards."
    },
    {
        id: "AT104",
        name: "Nyungwe Canopy Walk",
        location: "Nyungwe National Park",
        category: "Adventure",
        duration: "2 Hours",
        price: 60000,
        image: "images/rwanda_hero_landscape_1768753044984.png",
        rating: 9.0,
        description: "Walk above the treetops on a suspension bridge 60 meters above the forest floor in ancient Nyungwe Forest. Breathtaking views of the canopy."
    },
    {
        id: "AT105",
        name: "Lake Kivu Boat Cruise",
        location: "Gisenyi / Kibuye",
        category: "Relaxation",
        duration: "3 Hours",
        price: 35000,
        image: "images/lake_kivu_resort_1768753076757.png",
        rating: 8.8,
        description: "Relax on a scenic boat ride on Lake Kivu, visiting islands and enjoying the stunning volcanic views. Perfect for sunset."
    }
];

let _loadedAttractionsCache = [];

async function fetchAttractions() {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }

        if (!window.initSupabase) {
            console.warn("Supabase not initialized, using fallback dataset.");
            return fallbackAttractions;
        }

        const supabase = await window.initSupabase();

        // Query Supabase for attractions
        const { data, error } = await supabase
            .from('attractions')
            .select(`*`)
            .eq('is_active', true);

        if (error) {
            console.error("Error fetching attractions from Supabase:", error);
            return fallbackAttractions;
        }

        if (!data || data.length === 0) {
            return fallbackAttractions;
        }

        return data.map(a => {
            let durStr = "??";
            if (a.duration_days && a.duration_days > 0) durStr = `${a.duration_days} Day(s)`;
            else if (a.duration_hours) durStr = `${a.duration_hours} Hour(s)`;

            // Convert raw snake_case category string to Capitalized spaced
            const formattedCat = (a.category || "General").replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            return {
                id: a.id,
                name: a.name,
                location: a.city + (a.district ? `, ${a.district}` : ''),
                category: formattedCat,
                duration: durStr,
                price: parseFloat(a.price_adult) || 0,
                image: a.main_image || "images/rwanda_hero_landscape_1768753044984.png",
                rating: parseFloat(a.average_rating) || 0,
                description: a.short_description || a.description || "A wonderful experience."
            };
        });
    } catch (err) {
        console.error("Exception fetching attractions:", err);
        return fallbackAttractions;
    }
}

// Helper to format price
function formatAttractionPrice(price) {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
}
