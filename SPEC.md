# KHAN TRAVELS - Bus Ticket Booking App Specification

## 1. Project Overview

**Project Name**: KHAN TRAVELS
**Type**: Full-stack Web Application
**Core Functionality**: Bus ticket booking system with seat selection, passenger details, and admin dashboard
**Target Users**: Passengers booking tickets, Admin managing bookings

## 2. UI/UX Specification

### Layout Structure

**Pages**:
1. **Home Page** - Booking form with route, bus, timing selection
2. **Seat Selection Page** - Visual seat layout with availability
3. **Passenger Details Page** - Form for passenger information
4. **Payment Page** - Dummy payment gateway
5. **Confirmation Page** - Ticket confirmation
6. **Admin Dashboard** - View all bookings

### Visual Design

**Color Palette**:
- Primary: #1a1a2e (Dark Navy)
- Secondary: #16213e (Deep Blue)
- Accent: #e94560 (Coral Red)
- Success: #00d9a5 (Mint Green)
- Background: #0f0f1a (Near Black)
- Text Primary: #ffffff
- Text Secondary: #a0a0a0
- Card Background: #1f1f3a

**Typography**:
- Headings: 'Poppins', sans-serif (Bold)
- Body: 'Roboto', sans-serif
- Sizes: H1: 2.5rem, H2: 2rem, H3: 1.5rem, Body: 1rem

**Spacing**:
- Section padding: 60px 20px
- Card padding: 24px
- Element gap: 16px

**Visual Effects**:
- Card shadows: 0 8px 32px rgba(233, 69, 96, 0.1)
- Hover transitions: 0.3s ease
- Gradient accents on buttons
- Glassmorphism cards with backdrop blur

### Components

**Navigation Bar**:
- Logo with app name
- Nav links: Home, Admin Login
- Sticky on scroll

**Booking Form**:
- Route dropdown (Peravurani → Chennai / Chennai → Peravurani)
- Bus type dropdown
- Date picker
- Timing selection (radio buttons)
- Search button

**Seat Layout**:
- 2D bus seat visualization (2 seats per row, 20 rows)
- Available seats: Green outline
- Selected seats: Filled coral
- Booked seats: Grayed out

**Passenger Form**:
- Name, Age, Gender, Phone, Email fields
- Dynamic form for multiple passengers

**Payment Gateway**:
- Card number, Expiry, CVV fields (dummy)
- Pay Now button
- Loading animation

**Admin Dashboard**:
- Table of all bookings
- Filters by date, route, bus
- Export options

## 3. Functionality Specification

### Core Features

1. **Route Selection**
   - Peravurani to Chennai
   - Chennai to Peravurani
   
2. **Bus Selection**
   - APPLE BUS
   - NATIONAL BUS
   - DELTA KING

3. **Timing Selection**
   - 08:00 PM (First Bus)
   - 08:15 PM (Second Bus)
   - 08:30 PM (Third Bus)

4. **Seat Selection**
   - Visual seat map
   - Multiple seat selection
   - Real-time availability check

5. **Passenger Details**
   - Name, Age, Gender, Phone, Email
   - Per-seat passenger info

6. **Payment (Dummy)**
   - Simulated payment processing
   - Success/Failure scenarios

7. **Ticket Generation**
   - Unique booking ID
   - QR code simulation
   - Downloadable ticket

8. **Admin Panel**
   - View all bookings
   - Filter by route, date, bus
   - Booking details

### Data Models

**Booking**:
- bookingId (unique)
- route (to/from)
- busName
- timing
- travelDate
- seats (array)
- passengers (array)
- totalAmount
- paymentStatus
- createdAt

## 4. Acceptance Criteria

1. ✅ User can select route (Peravurani ↔ Chennai)
2. ✅ User can select bus (APPLE/NATIONAL/DELTA)
3. ✅ User can select timing (08:00/08:15/08:30 PM)
4. ✅ User can view and select available seats
5. ✅ User can enter passenger details
6. ✅ Dummy payment gateway processes payment
7. ✅ Booking confirmation with ID generated
8. ✅ Admin can view all bookings
9. ✅ Data persists in database
10. ✅ Responsive design works on mobile

## 5. Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (file-based, no setup required)
- **Template Engine**: EJS

