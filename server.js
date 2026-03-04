const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// UPI Payment ID
const UPI_ID = 'khanstravels@okhdfcbank';

// Session middleware
app.use(session({
  secret: 'khan-travels-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// Admin credentials
const ADMIN_CREDENTIALS = {
  username: 'rasulpvi',
  password: 'rasul2006'
};

// Bus types with fares
const BUS_TYPES = {
  'APPLE BUS': { type: 'AC Sleeper', fare: 900 },
  'NATIONAL BUS': { type: 'NON-AC Seater', fare: 600 },
  'DELTA KING': { type: 'AC Sleeper', fare: 850 }
};

// Initialize database file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ bookings: [] }, null, 2));
}

// Helper functions
function readDatabase() {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { bookings: [] };
  }
}

function writeDatabase(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Check if cancellation is allowed
function canCancel(booking) {
  const now = new Date();
  const bookingTime = new Date(booking.created_at);
  const diffMs = now - bookingTime;
  const diffMins = Math.floor(diffMs / 60000);
  const currentHour = now.getHours();
  return diffMins <= 45 && currentHour < 17;
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { error: null, busTypes: BUS_TYPES });
});

app.get('/admin-login', (req, res) => {
  res.render('admin-login', { error: null });
});

app.post('/admin-login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    req.session.adminLoggedIn = true;
    res.redirect('/admin');
  } else {
    res.render('admin-login', { error: 'Invalid username or password' });
  }
});

app.get('/admin-logout', (req, res) => {
  req.session.adminLoggedIn = false;
  res.redirect('/admin-login');
});

app.post('/search-buses', (req, res) => {
  const { route, date, timing } = req.body;
  const db = readDatabase();
  const bookedSeats = db.bookings
    .filter(b => b.route === route && b.travel_date === date && b.timing === timing && b.payment_status === 'success')
    .flatMap(b => b.seats);
  
  const buses = Object.entries(BUS_TYPES).map(([name, info]) => ({
    name,
    type: info.type,
    fare: info.fare
  }));
  
  res.json({ buses, bookedSeats, route, date, timing });
});

app.get('/seat-selection', (req, res) => {
  const { route, bus, timing, date } = req.query;
  const db = readDatabase();
  
  // Get bookings for this route/date/timing
  const relevantBookings = db.bookings
    .filter(b => b.route === route && b.travel_date === date && b.timing === timing && b.payment_status === 'success');
  
  // Get booked seats as array
  const bookedSeats = relevantBookings.flatMap(b => b.seats);
  
  // Create seat gender mapping
  const seatGenders = {};
  relevantBookings.forEach(booking => {
    if (booking.passengers) {
      booking.passengers.forEach(passenger => {
        const seatNum = passenger.seat ? passenger.seat.toString() : null;
        if (seatNum) {
          seatGenders[seatNum] = passenger.gender;
        }
      });
    }
  });
  
  const routeDisplay = route === 'peravurani_to_chennai' ? 'Peravurani → Chennai' : 'Chennai → Peravurani';
  const busInfo = BUS_TYPES[bus] || { type: 'AC Sleeper', fare: 800 };
  
  res.render('seat-selection', {
    route, busName: bus, busType: busInfo.type, timing,
    travelDate: date, routeDisplay, bookedSeats, seatGenders, totalSeats: 40, fare: busInfo.fare
  });
});

app.get('/get-seats', (req, res) => {
  const { route, date, timing } = req.query;
  const db = readDatabase();
  const bookedSeats = db.bookings
    .filter(b => b.route === route && b.travel_date === date && b.timing === timing && b.payment_status === 'success')
    .flatMap(b => b.seats);
  res.json({ bookedSeats });
});

app.post('/select-seats', (req, res) => {
  const { route, busName, timing, date, seats, totalAmount } = req.body;
  const busInfo = BUS_TYPES[busName] || { type: 'AC Sleeper' };
  
  res.render('passenger', { 
    route, busName, busType: busInfo.type, timing, date, 
    seats: JSON.parse(seats), totalAmount, upiId: UPI_ID
  });
});

app.post('/process-booking', (req, res) => {
  const { 
    route, busName, timing, date, seats, 
    passengers, totalAmount, paymentMethod, cardNumber, expiry, cvv, upiTransactionId
  } = req.body;
  
  let paymentSuccess = false;
  if (paymentMethod === 'upi') {
    paymentSuccess = upiTransactionId && upiTransactionId.length > 5;
  } else {
    paymentSuccess = cardNumber && expiry && cvv;
  }
  
  if (paymentSuccess) {
    const bookingId = 'KHAN-' + uuidv4().substring(0, 8).toUpperCase();
    const busInfo = BUS_TYPES[busName] || { type: 'AC Sleeper' };
    
    const db = readDatabase();
    db.bookings.push({
      id: db.bookings.length + 1,
      booking_id: bookingId,
      route, bus_name: busName, bus_type: busInfo.type, timing, travel_date: date,
      seats: JSON.parse(seats), passengers: JSON.parse(passengers),
      total_amount: parseFloat(totalAmount), payment_method: paymentMethod,
      payment_status: 'success', created_at: new Date().toISOString()
    });
    writeDatabase(db);
    
    res.render('confirmation', {
      bookingId, route, busName, busType: busInfo.type, timing, date,
      seats: JSON.parse(seats), passengers: JSON.parse(passengers), totalAmount
    });
  } else {
    res.render('index', { error: 'Payment failed. Please try again.', busTypes: BUS_TYPES });
  }
});

app.post('/cancel-booking', (req, res) => {
  const { bookingId } = req.body;
  const db = readDatabase();
  const booking = db.bookings.find(b => b.booking_id === bookingId);
  
  if (!booking) {
    return res.json({ success: false, message: 'Booking not found' });
  }
  if (!canCancel(booking)) {
    return res.json({ success: false, message: 'Cancellation not allowed after 45 minutes or after 5 PM' });
  }
  
  db.bookings = db.bookings.filter(b => b.booking_id !== bookingId);
  writeDatabase(db);
  res.json({ success: true, message: 'Booking cancelled successfully' });
});

app.get('/admin', (req, res) => {
  if (!req.session.adminLoggedIn) {
    return res.redirect('/admin-login');
  }
  
  const db = readDatabase();
  const bookings = db.bookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const bookingsWithCancel = bookings.map(b => ({ ...b, canCancel: canCancel(b) }));
  res.render('admin', { bookings: bookingsWithCancel });
});

app.get('/admin/stats', (req, res) => {
  const db = readDatabase();
  const successfulBookings = db.bookings.filter(b => b.payment_status === 'success');
  const stats = {
    total_bookings: successfulBookings.length,
    total_revenue: successfulBookings.reduce((sum, b) => sum + b.total_amount, 0),
    total_seats: successfulBookings.reduce((sum, b) => sum + b.seats.length, 0)
  };
  res.json(stats);
});

// Export to Excel (.xlsx)
app.get('/admin/export', (req, res) => {
  if (!req.session.adminLoggedIn) {
    return res.redirect('/admin-login');
  }
  
  const db = readDatabase();
  const bookings = db.bookings;
  
  const excelData = bookings.map(b => ({
    'Booking ID': b.booking_id,
    'Route': b.route === 'peravurani_to_chennai' ? 'Peravurani → Chennai' : 'Chennai → Peravurani',
    'Bus Name': b.bus_name,
    'Bus Type': b.bus_type || 'AC',
    'Travel Date': b.travel_date,
    'Time': b.timing,
    'Seats': b.seats.join(', '),
    'Passengers': b.passengers.map(p => p.name + ' (' + p.gender + ', ' + p.age + 'yrs)').join('; '),
    'Amount (Rs)': b.total_amount,
    'Payment Method': b.payment_method || 'Card',
    'Status': b.payment_status === 'success' ? 'Confirmed' : 'Pending',
    'Booked At': b.created_at
  }));
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(excelData);
  XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=khan_travels_bookings.xlsx');
  res.send(buffer);
});

app.listen(PORT, () => {
  console.log('🚀 KHAN TRAVELS Server running at http://localhost:' + PORT);
});

