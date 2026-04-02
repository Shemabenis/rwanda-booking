const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vjiipbmacqrkhxnlxsol.supabase.co';
const supabaseKey = 'sb_publishable_SnBeV-L1ddW_5MAo8fZCnw_0VjNqzKv';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmail() {
  console.log("Invoking edge function...");
  const { data, error } = await supabase.functions.invoke('send-booking-email', {
    body: {
      to: 'dianatesters123@gmail.com', // Let's guess a test email or use a dummy
      bookingId: 'test-1234',
      itemName: 'Test Item',
      bookingType: 'Test',
      totalPrice: 'RWF 1,000',
      checkIn: 'N/A',
      checkOut: 'N/A',
      guests: 1
    }
  });

  console.log("Data:", data);
  console.log("Error:", error);
}

testEmail();
