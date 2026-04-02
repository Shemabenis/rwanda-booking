/**
 * js/booking.js
 * Universal Booking Handler — with toast notifications & email confirmation
 */

// ── Toast Notification System ──────────────────────────────────────────
(function injectToastStyles() {
    if (document.getElementById('toast-styles')) return;
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        #toast-container {
            position: fixed;
            top: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        }
        .toast {
            pointer-events: auto;
            min-width: 320px;
            max-width: 420px;
            padding: 16px 20px;
            border-radius: 10px;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 8px 32px rgba(0,0,0,0.18);
            display: flex;
            align-items: flex-start;
            gap: 12px;
            transform: translateX(120%);
            opacity: 0;
            transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease;
        }
        .toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        .toast.hiding {
            transform: translateX(120%);
            opacity: 0;
        }
        .toast-success {
            background: linear-gradient(135deg, #0071c2 0%, #005999 100%);
        }
        .toast-error {
            background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
        }
        .toast-warning {
            background: linear-gradient(135deg, #e5a800 0%, #cc9600 100%);
        }
        .toast-icon {
            font-size: 22px;
            flex-shrink: 0;
            margin-top: 1px;
        }
        .toast-content { flex: 1; }
        .toast-title {
            font-weight: 700;
            font-size: 15px;
            margin-bottom: 2px;
        }
        .toast-message {
            opacity: 0.92;
            font-size: 13px;
        }
        .toast-close {
            background: rgba(255,255,255,0.2);
            border: none;
            color: #fff;
            width: 24px; height: 24px;
            border-radius: 50%;
            font-size: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: background 0.15s;
            margin-top: 1px;
        }
        .toast-close:hover { background: rgba(255,255,255,0.35); }
        .toast-progress {
            position: absolute;
            bottom: 0; left: 0;
            height: 3px;
            background: rgba(255,255,255,0.4);
            border-radius: 0 0 10px 10px;
            animation: toastProgress 5s linear forwards;
        }
        @keyframes toastProgress {
            from { width: 100%; }
            to   { width: 0%; }
        }
    `;
    document.head.appendChild(style);
})();

function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a toast notification
 * @param {'success'|'error'|'warning'} type
 * @param {string} title
 * @param {string} message
 * @param {number} duration  ms before auto-dismiss (default 5000)
 */
function showToast(type, title, message, duration = 5000) {
    const container = ensureToastContainer();
    const icons = { success: '✅', error: '❌', warning: '⚠️' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.position = 'relative';
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '💬'}</span>
        <div class="toast-content">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close">✕</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Trigger slide-in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });

    const dismiss = () => {
        toast.classList.remove('show');
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    };

    toast.querySelector('.toast-close').onclick = dismiss;
    const timer = setTimeout(dismiss, duration);
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(dismiss, 2000));
}

// ── Booking Handler ────────────────────────────────────────────────────

async function submitBooking(config) {
    // config expects:
    // type: 'accommodation', 'car', 'flight', 'attraction'
    // itemId: UUID
    // itemName: string (for display)
    // price: numeric (total_price)
    // checkIn: Date string
    // checkOut: Date string
    // guests: int
    
    let retries = 0;
    while (!window.initSupabase && retries < 40) {
        await new Promise(r => setTimeout(r, 50));
        retries++;
    }
    if (!window.initSupabase) {
        showToast('error', 'Connection Error', 'Booking unavailable: unable to connect to server.');
        return;
    }

    const supabase = await window.initSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
        const proceed = confirm(`You must be signed in to book ${config.itemName}. Would you like to sign in now?`);
        if (proceed) {
            window.location.href = 'login.html';
        }
        return;
    }

    // Default dates if missing
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Prepare insert payload
    const payload = {
        user_id: session.user.id,
        check_in: config.checkIn || todayStr,
        check_out: config.checkOut || config.checkIn || todayStr,
        guests: config.guests || 1,
        total_price: config.price || 0,
        status: 'pending',
        booking_type: config.type
    };

    if (config.type === 'accommodation') payload.hotel_id = config.itemId;
    else if (config.type === 'car') payload.car_rental_id = config.itemId;
    else if (config.type === 'flight') payload.flight_id = config.itemId;
    else if (config.type === 'attraction') payload.attraction_id = config.itemId;

    try {
        const { data, error } = await supabase.from('bookings').insert(payload).select();
        
        if (error) {
            console.error("Booking error:", error);
            
            if (error.code === '22P02') {
                showToast('error', 'Database Error', 'Cannot book a mock item. Please ensure you are connected to the live database.');
            } else {
                showToast('error', 'Booking Failed', 'Failed to process booking. Please try again.');
            }
        } else {
            const bookingId = data[0].id;
            showToast(
                'success',
                'Booking Confirmed! 🎉',
                `${config.itemName} has been reserved successfully.<br>Reservation ID: <strong>${bookingId.substring(0, 8)}...</strong>`,
                7000
            );

            // Send confirmation email in background
            sendConfirmationEmail(supabase, session, config, bookingId);
        }
    } catch (e) {
        console.error(e);
        showToast('error', 'Unexpected Error', 'An error occurred while processing your booking.');
    }
}

// ── Email Confirmation ─────────────────────────────────────────────────

async function sendConfirmationEmail(supabase, session, config, bookingId) {
    try {
        const userEmail = session.user.email;
        if (!userEmail) return;

        const fmtPrice = (n) => 'RWF ' + Number(n).toLocaleString();
        const fmtDate = (d) => {
            if (!d) return 'N/A';
            return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
            });
        };

        const typeLabels = {
            accommodation: '🏨 Stay',
            car: '🚗 Car Rental',
            flight: '✈ Flight',
            attraction: '🎟️ Attraction'
        };

        const emailPayload = {
            to: userEmail,
            bookingId: bookingId,
            itemName: config.itemName,
            bookingType: typeLabels[config.type] || config.type,
            totalPrice: fmtPrice(config.price),
            checkIn: fmtDate(config.checkIn),
            checkOut: fmtDate(config.checkOut),
            guests: config.guests || 1
        };

        // Call the edge function
        const { error } = await supabase.functions.invoke('send-booking-email', {
            body: emailPayload
        });

        if (error) {
            console.warn('Email confirmation could not be sent:', error);
            // Don't show an error toast — the booking itself succeeded
        } else {
            showToast('success', 'Email Sent 📧', `A confirmation email has been sent to ${userEmail}.`, 5000);
        }
    } catch (e) {
        console.warn('Email sending failed silently:', e);
    }
}

window.submitBooking = submitBooking;
window.showToast = showToast;
