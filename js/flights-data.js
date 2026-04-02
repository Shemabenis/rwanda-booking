/**
 * flights-data.js
 * Mock data for Rwanda Booking Flights
 */

// Fallback data
const fallbackFlights = [
    {
        id: "WB101",
        airline: "RwandAir",
        logo: "images/logo_rwandair.svg",
        origin: "Kigali (KGL)",
        destination: "Dubai (DXB)",
        departureTime: "08:00",
        arrivalTime: "16:30",
        duration: "6h 30m",
        price: 450000,
        stops: "Direct",
        class: "Economy"
    },
    {
        id: "WB202",
        airline: "RwandAir",
        logo: "images/logo_rwandair.svg",
        origin: "Kigali (KGL)",
        destination: "Johannesburg (JNB)",
        departureTime: "09:15",
        arrivalTime: "13:00",
        duration: "3h 45m",
        price: 380000,
        stops: "Direct",
        class: "Economy"
    },
    {
        id: "ET303",
        airline: "Ethiopian Airlines",
        logo: "images/logo_ethiopian.svg",
        origin: "Kigali (KGL)",
        destination: "Dubai (DXB)",
        departureTime: "14:00",
        arrivalTime: "23:45",
        duration: "8h 45m",
        price: 410000,
        stops: "1 Stop (ADD)",
        class: "Economy"
    },
    {
        id: "WB404",
        airline: "RwandAir",
        logo: "images/logo_rwandair.svg",
        origin: "Kigali (KGL)",
        destination: "London (LHR)",
        departureTime: "23:30",
        arrivalTime: "07:00",
        duration: "8h 30m",
        price: 850000,
        stops: "Direct",
        class: "Economy"
    },
    {
        id: "KQ505",
        airline: "Kenya Airways",
        logo: "images/logo_kenya.svg",
        origin: "Kigali (KGL)",
        destination: "Nairobi (NBO)",
        departureTime: "10:00",
        arrivalTime: "11:20",
        duration: "1h 20m",
        price: 180000,
        stops: "Direct",
        class: "Economy"
    },
    {
        id: "WB606",
        airline: "RwandAir",
        logo: "images/logo_rwandair.svg",
        origin: "Kamembe (KME)",
        destination: "Kigali (KGL)",
        departureTime: "07:00",
        arrivalTime: "07:40",
        duration: "40m",
        price: 65000,
        stops: "Direct",
        class: "Economy"
    }
];

let _loadedFlightsCache = [];

async function fetchFlights() {
    try {
        let retries = 0;
        while (!window.initSupabase && retries < 40) {
            await new Promise(r => setTimeout(r, 50));
            retries++;
        }

        if (!window.initSupabase) {
            console.warn("Supabase not initialized, using fallback dataset.");
            return fallbackFlights;
        }

        const supabase = await window.initSupabase();

        // Query Supabase for flights
        const { data, error } = await supabase
            .from('flights')
            .select(`*`)
            .eq('is_active', true)
            .eq('is_cancelled', false);

        if (error) {
            console.error("Error fetching flights from Supabase:", error);
            return fallbackFlights;
        }

        if (!data || data.length === 0) {
            return fallbackFlights;
        }

        return data.map(f => {
            // Helpers to format timestamp strings since DB has them as timestamptz
            const depTimeStr = f.departure_time ? new Date(f.departure_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "00:00";
            const arrTimeStr = f.arrival_time ? new Date(f.arrival_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "00:00";
            
            let durStr = "??";
            if (f.duration_minutes) {
                const hours = Math.floor(f.duration_minutes / 60);
                const mins = f.duration_minutes % 60;
                durStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            }

            return {
                id: f.id,
                flightNumber: f.flight_number || "UNK",
                airline: f.airline_name || "Unknown Airline",
                logo: f.airline_logo || "images/logo_rwandair.svg", // Fallback logo
                origin: `${f.departure_city} (${f.departure_code})`,
                destination: `${f.arrival_city} (${f.arrival_code})`,
                departureTime: depTimeStr,
                arrivalTime: arrTimeStr,
                duration: durStr,
                price: parseFloat(f.economy_price) || 0,
                stops: "Direct", // Hardcode for now as db schema has no stops mapping
                class: "Economy"
            };
        });
    } catch (err) {
        console.error("Exception fetching flights:", err);
        return fallbackFlights;
    }
}

// Helper to format price
function formatFlightPrice(price) {
    return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price);
}
