/**
 * cars-data.js
 * Mock data for Rwanda Booking Car Rentals
 */

// Fallback data
const fallbackCars = [
    {
        id: "CR101",
        name: "Toyota RAV4",
        type: "SUV",
        seats: 5,
        transmission: "Automatic",
        fuel: "Petrol",
        price: 45000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2019_Toyota_RAV4_LE_AWD%2C_front_12.22.19.jpg/1200px-2019_Toyota_RAV4_LE_AWD%2C_front_12.22.19.jpg",
        supplier: "Kigali Car Rentals",
        supplier_logo: "images/logo_kcr.svg",
        rating: 9.0
    },
    {
        id: "CR102",
        name: "Toyota Land Cruiser Prado",
        type: "Luxury SUV",
        seats: 7,
        transmission: "Automatic",
        fuel: "Diesel",
        price: 85000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/2018_Toyota_Land_Cruiser_Prado_Icon_Automatic_2.8.jpg/1200px-2018_Toyota_Land_Cruiser_Prado_Icon_Automatic_2.8.jpg",
        supplier: "Safari Wheels",
        supplier_logo: "images/logo_safari.svg",
        rating: 9.5
    },
    {
        id: "CR103",
        name: "Hyundai Tucson",
        type: "Compact SUV",
        seats: 5,
        transmission: "Automatic",
        fuel: "Petrol",
        price: 55000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2016_Hyundai_Tucson_%28TL%29_Active_X_wagon_%282018-11-02%29_01.jpg/1200px-2016_Hyundai_Tucson_%28TL%29_Active_X_wagon_%282018-11-02%29_01.jpg",
        supplier: "Drive Rwanda",
        supplier_logo: "images/logo_drive.svg",
        rating: 8.8
    },
    {
        id: "CR104",
        name: "Suzuki Vitara",
        type: "Compact SUV",
        seats: 5,
        transmission: "Manual",
        fuel: "Petrol",
        price: 35000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/2015_Suzuki_Vitara_%28LY%29_RT-S_wagon_%282016-01-29%29_01.jpg/1200px-2015_Suzuki_Vitara_%28LY%29_RT-S_wagon_%282016-01-29%29_01.jpg",
        supplier: "Budget Cars",
        supplier_logo: "images/logo_budget.svg",
        rating: 8.2
    },
    {
        id: "CR105",
        name: "Toyota Coaster",
        type: "Minibus",
        seats: 25,
        transmission: "Manual",
        fuel: "Diesel",
        price: 150000,
        image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Toyota_Coaster_XZB50_Autobus_Oberbayern.jpg/1200px-Toyota_Coaster_XZB50_Autobus_Oberbayern.jpg",
        supplier: "Group Travel Co",
        supplier_logo: "images/logo_group.svg",
        rating: 8.5
    }
];

let _loadedCarsCache = [];

async function fetchCars() {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }

        if (!window.initSupabase) {
            console.warn("Supabase not initialized, using fallback dataset.");
            return fallbackCars;
        }

        const supabase = await window.initSupabase();

        // Query Supabase for cars
        const { data, error } = await supabase
            .from('car_rentals')
            .select(`*, profiles:host_id (first_name, last_name)`)
            .eq('is_active', true);

        if (error) {
            console.error("Error fetching cars from Supabase:", error);
            return fallbackCars;
        }

        if (!data || data.length === 0) {
            return fallbackCars;
        }

        return data.map(c => {
            const supplierName = c.profiles ? `${c.profiles.first_name || ''} ${c.profiles.last_name || ''}`.trim() : "Supplier";
            return {
                id: c.id,
                name: c.car_name,
                type: c.car_type || "Standard",
                seats: c.seating_capacity || 4,
                transmission: c.transmission || "Automatic",
                fuel: c.fuel_type || "Petrol",
                price: parseFloat(c.price_per_day),
                image: c.main_image || "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/2019_Toyota_RAV4_LE_AWD%2C_front_12.22.19.jpg/1200px-2019_Toyota_RAV4_LE_AWD%2C_front_12.22.19.jpg",
                supplier: supplierName || "Kigali Car Rentals",
                supplier_logo: "images/logo_kcr.svg", // Mock logo since it's not in schema easily
                rating: parseFloat(c.average_rating) || 0
            };
        });
    } catch (err) {
        console.error("Exception fetching cars:", err);
        return fallbackCars;
    }
}

// Helper to format price
function formatCarPrice(price) {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
}
