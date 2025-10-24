const express = require('express');
const router = express.Router();
const { db } = require('../database/init');
const { sendEmail } = require('../services/emailService');

// Business hours and slot config
// Open every day except Tuesday, from 12:00 to 01:00 (overnight)
// Booking slots available from 10:00 to 01:00
// getDay(): 0=Sun, 1=Mon, 2=Tue, ... 6=Sat
const BUSINESS_DAYS = [0, 1, 3, 4, 5, 6]; // exclude Tuesday (2)
const OPEN_HOUR = 12;   // 12:00 (operating hours start)
const CLOSE_HOUR = 1;   // 01:00 (next day)
const BOOKING_START_HOUR = 10; // 10:00 (booking slots start)
const SLOT_INTERVAL = 30; // 30-minute intervals
const BUFFER_TIME = 15; // 15-minute buffer between services for cleanup

function generateDailySlots(dateStr, duration = 60) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay();
  if (!BUSINESS_DAYS.includes(day)) return [];
  
  const slots = [];
  // Booking slots available from BOOKING_START_HOUR to CLOSE_HOUR (overnight)
  // Early morning part: 00:00 to CLOSE_HOUR
  for (let hour = 0; hour < CLOSE_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const slotTime = `${hh}:${mm}`;
      const slotEnd = addMinutesToTime(slotTime, duration);
      if (timeToMinutes(slotEnd) <= CLOSE_HOUR * 60) {
        slots.push(slotTime);
      }
    }
  }
  // Daytime-evening part: BOOKING_START_HOUR to 24:00
  for (let hour = BOOKING_START_HOUR; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_INTERVAL) {
      const hh = String(hour).padStart(2, '0');
      const mm = String(minute).padStart(2, '0');
      const slotTime = `${hh}:${mm}`;
      const slotEnd = addMinutesToTime(slotTime, duration);
      if (timeToMinutes(slotEnd) <= 24 * 60) {
        slots.push(slotTime);
      }
    }
  }
  return slots;
}

// Helper function to add minutes to a time string
function addMinutesToTime(timeStr, minutes) {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

// Helper function to convert time to minutes
function timeToMinutes(timeStr) {
  const [hours, mins] = timeStr.split(':').map(Number);
  return hours * 60 + mins;
}

// Check if a time slot overlaps with existing bookings
// Enhanced with buffer time to prevent back-to-back bookings
function isSlotAvailable(date, startTime, duration, existingBookings, includeBuffer = true) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  const bufferMinutes = includeBuffer ? BUFFER_TIME : 0;
  
  for (const booking of existingBookings) {
    const bookingStart = timeToMinutes(booking.time_slot);
    const bookingEnd = bookingStart + (booking.duration_minutes || 60);
    
    // Add buffer time to the booking end time
    const bookingEndWithBuffer = bookingEnd + bufferMinutes;
    const startWithBuffer = startMinutes - bufferMinutes;
    
    // Check for overlap (considering buffer time)
    // Case 1: New booking starts during existing booking (including buffer)
    if (startMinutes >= bookingStart && startMinutes < bookingEndWithBuffer) {
      return false;
    }
    
    // Case 2: New booking ends during existing booking
    if (endMinutes > bookingStart && endMinutes <= bookingEnd) {
      return false;
    }
    
    // Case 3: New booking completely encompasses existing booking
    if (startMinutes <= bookingStart && endMinutes >= bookingEnd) {
      return false;
    }
    
    // Case 4: Existing booking encompasses new booking
    if (bookingStart <= startMinutes && bookingEnd >= endMinutes) {
      return false;
    }
    
    // Case 5: New booking starts too close before existing booking (within buffer)
    if (endMinutes > (bookingStart - bufferMinutes) && endMinutes <= bookingStart) {
      return false;
    }
  }
  
  return true; // Slot is available
}

// Get information about why a slot is unavailable
function getSlotConflictInfo(date, startTime, duration, existingBookings) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = startMinutes + duration;
  
  for (const booking of existingBookings) {
    const bookingStart = timeToMinutes(booking.time_slot);
    const bookingEnd = bookingStart + (booking.duration_minutes || 60);
    const bookingEndWithBuffer = bookingEnd + BUFFER_TIME;
    
    // Check all overlap scenarios
    if (
      (startMinutes >= bookingStart && startMinutes < bookingEndWithBuffer) ||
      (endMinutes > bookingStart && endMinutes <= bookingEnd) ||
      (startMinutes <= bookingStart && endMinutes >= bookingEnd) ||
      (bookingStart <= startMinutes && bookingEnd >= endMinutes) ||
      (endMinutes > (bookingStart - BUFFER_TIME) && endMinutes <= bookingStart)
    ) {
      return {
        conflict: true,
        conflictingBooking: {
          time: booking.time_slot,
          duration: booking.duration_minutes,
          endTime: addMinutesToTime(booking.time_slot, booking.duration_minutes),
          service: booking.service_name
        }
      };
    }
  }
  
  return { conflict: false };
}

function validateIsoDate(dateStr) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

// GET /api/bookings/customer/:email - Get bookings by customer email
router.get('/customer/:email', (req, res) => {
  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  
  const query = `
    SELECT 
      id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      service_name, 
      date, 
      time_slot, 
      duration_minutes,
      vehicle_type,
      notes,
      status, 
      created_at
    FROM bookings
    WHERE customer_email = ?
    ORDER BY date DESC, time_slot DESC
  `;
  
  db.all(query, [email], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, bookings: rows });
  });
});

// GET /api/bookings - Get all bookings (for admin/owner)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      id, 
      customer_name, 
      customer_email, 
      customer_phone, 
      service_name, 
      date, 
      time_slot, 
      duration_minutes,
      vehicle_type,
      service_type,
      notes,
      status, 
      created_at
    FROM bookings
    ORDER BY date DESC, time_slot DESC
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true, bookings: rows });
  });
});

// GET /api/bookings/availability?date=YYYY-MM-DD&duration=120&requiresDaytime=true
router.get('/availability', (req, res) => {
  const { date, duration, requiresDaytime } = req.query;
  if (!date || !validateIsoDate(date)) {
    return res.status(400).json({ error: 'Invalid date', message: 'Use YYYY-MM-DD' });
  }

  const serviceDuration = parseInt(duration) || 60;
  const isDaytimeRequired = requiresDaytime === 'true';
  const allSlots = generateDailySlots(date, serviceDuration);
  
  if (allSlots.length === 0) {
    return res.json({ 
      success: true, 
      date, 
      slots: [], 
      closed: true,
      message: 'Closed on this day'
    });
  }

  // Get all existing bookings for the date (including service names for better info)
  db.all(
    `SELECT time_slot, duration_minutes, service_name, customer_name FROM bookings WHERE date = ? AND status != 'cancelled' ORDER BY time_slot`,
    [date],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Filter out slots that would overlap with existing bookings
      let availableSlots = [];
      const unavailableSlots = [];
      
      allSlots.forEach(slot => {
        if (isSlotAvailable(date, slot, serviceDuration, rows)) {
          availableSlots.push(slot);
        } else {
          const conflictInfo = getSlotConflictInfo(date, slot, serviceDuration, rows);
          unavailableSlots.push({
            time: slot,
            reason: conflictInfo.conflict ? 'Overlaps with existing booking' : 'Unknown',
            conflictingBooking: conflictInfo.conflictingBooking
          });
        }
      });
      
      // Apply daytime filtering for coating/polish services
      if (isDaytimeRequired) {
        availableSlots = availableSlots.filter(slot => {
          const [hours, minutes] = slot.split(':').map(Number);
          const slotTime = hours + (minutes / 60);
          const endTime = slotTime + (serviceDuration / 60);
          
          // Ensure service can complete before 2am (shop closes at 2am)
          // Add 2-hour buffer before closing time
          const maxStartTime = 24 - (serviceDuration / 60) - 2;
          
          return slotTime <= maxStartTime;
        });
      }
      
      res.json({ 
        success: true, 
        date, 
        slots: availableSlots, 
        unavailableSlots: unavailableSlots,
        existingBookings: rows.map(b => ({
          time: b.time_slot,
          duration: b.duration_minutes,
          service: b.service_name,
          endTime: addMinutesToTime(b.time_slot, b.duration_minutes)
        })),
        closed: false, 
        duration: serviceDuration,
        bufferTime: BUFFER_TIME
      });
    }
  );
});

// POST /api/bookings
// body: { name, email, phone, service, date (YYYY-MM-DD), timeSlot, notes, vehicleType, serviceType, packageId, serviceId, duration }
router.post('/', (req, res) => {
  const { name, email, phone, service, date, timeSlot, notes, vehicleType, serviceType, packageId, serviceId, duration } = req.body || {};

  if (!name || !email || !date || !timeSlot) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'name, email, date and timeSlot are required'
    });
  }

  if (!validateIsoDate(date)) {
    return res.status(400).json({ error: 'Invalid date', message: 'Use YYYY-MM-DD' });
  }

  const serviceDuration = parseInt(duration) || 60;
  const validSlots = new Set(generateDailySlots(date, serviceDuration));
  if (!validSlots.has(timeSlot)) {
    return res.status(400).json({ error: 'Invalid timeSlot', message: 'Outside business hours or closed' });
  }

  // Check for overlapping bookings
  db.all(
    `SELECT time_slot, duration_minutes FROM bookings WHERE date = ? AND status != 'cancelled'`,
    [date],
    (err, existingBookings) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Check if the slot is available
      if (!isSlotAvailable(date, timeSlot, serviceDuration, existingBookings)) {
        const conflictInfo = getSlotConflictInfo(date, timeSlot, serviceDuration, existingBookings);
        return res.status(409).json({ 
          error: 'Time slot not available',
          message: `This time slot conflicts with an existing booking. Another service is scheduled from ${conflictInfo.conflictingBooking.time} to ${conflictInfo.conflictingBooking.endTime}. Please choose a different time.`,
          conflictingBooking: conflictInfo.conflictingBooking,
          suggestedAction: 'Please select another available time slot'
        });
      }

      const stmt = db.prepare(`
        INSERT INTO bookings (customer_name, customer_email, customer_phone, service_name, date, time_slot, notes, vehicle_type, service_type, package_id, service_id, duration_minutes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `);
      stmt.run(name, email, phone || null, service || null, date, timeSlot, notes || null, vehicleType || null, serviceType || 'package', packageId || null, serviceId || null, serviceDuration, function (insertErr) {
        if (insertErr) {
          console.error('Database error:', insertErr);
          return res.status(500).json({ error: 'Failed to create booking' });
        }
        
        const bookingId = this.lastID;
        
        // Send email notification to owner
        const ownerEmailData = {
          to: 'autobath36@gmail.com',
          subject: `New Booking #${bookingId} - ${service || 'Service'}`,
          template: 'booking',
          data: {
            bookingId,
            name,
            email,
            phone: phone || 'Not provided',
            service: service || 'Not specified',
            date,
            timeSlot,
            vehicleType: vehicleType || 'Not specified',
            notes: notes || 'No notes',
            timestamp: new Date().toLocaleString()
          }
        };

        // Send email notification (don't block response if it fails)
        sendEmail(ownerEmailData).catch(e => {
          console.error('Owner notification email failed:', e.message || e);
        });

        // Send confirmation email to customer
        const customerEmailData = {
          to: email,
          subject: 'Booking Confirmation - AUTOBATH',
          template: 'bookingConfirmation',
          data: {
            name,
            service: service || 'Service',
            date,
            timeSlot,
            bookingId
          }
        };

        sendEmail(customerEmailData).catch(e => {
          console.error('Customer confirmation email failed:', e.message || e);
        });

        res.json({ success: true, id: bookingId, message: 'Booking created' });
      });
      stmt.finalize();
    }
  );
});

// GET /api/bookings/quick/:token - Quick booking link (like Haidilao)
router.get('/quick/:token', (req, res) => {
  const { token } = req.params;
  
  // Decode the booking token
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const bookingData = JSON.parse(decoded);
    
    // Return booking form with pre-filled data
    res.json({
      success: true,
      bookingData,
      message: 'Quick booking link valid'
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid booking link' });
  }
});

// POST /api/bookings/quick - Create quick booking from link
router.post('/quick', async (req, res) => {
  const { token, name, phone } = req.body;
  
  if (!token || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const bookingData = JSON.parse(decoded);
    
    // Create booking with pre-filled data
    const { service, date, timeSlot, duration, email: defaultEmail } = bookingData;
    const serviceDuration = parseInt(duration) || 60;
    
    // Check availability
    db.all(
      `SELECT time_slot, duration_minutes FROM bookings WHERE date = ? AND status != 'cancelled'`,
      [date],
      (err, existingBookings) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (!isSlotAvailable(date, timeSlot, serviceDuration, existingBookings)) {
          return res.status(409).json({ error: 'Slot no longer available' });
        }
        
        // Create booking
        const stmt = db.prepare(`
          INSERT INTO bookings (customer_name, customer_email, customer_phone, service_name, date, time_slot, duration_minutes, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
        `);
        
        stmt.run(name, defaultEmail, phone || null, service, date, timeSlot, serviceDuration, function (insertErr) {
          if (insertErr) {
            console.error('Database error:', insertErr);
            return res.status(500).json({ error: 'Failed to create booking' });
          }
          
          const bookingId = this.lastID;
          
          // Send confirmation email if email provided
          if (defaultEmail) {
            const emailData = {
              to: defaultEmail,
              subject: 'Booking Confirmation - AUTOBATH',
              template: 'bookingConfirmation',
              data: { name, service, date, timeSlot, bookingId }
            };
            
            sendEmail(emailData).catch(e => console.error('Email failed:', e));
          }
          
          res.json({ success: true, id: bookingId, message: 'Booking confirmed!' });
        });
        stmt.finalize();
      }
    );
  } catch (error) {
    res.status(400).json({ error: 'Invalid booking link' });
  }
});

// GET /api/bookings/generate-link - Generate a quick booking link
router.post('/generate-link', (req, res) => {
  const { service, date, timeSlot, duration, email } = req.body;
  
  if (!service || !date || !timeSlot) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Create booking data
  const bookingData = {
    service,
    date,
    timeSlot,
    duration: duration || 60,
    email: email || ''
  };
  
  // Encode to base64 token
  const token = Buffer.from(JSON.stringify(bookingData)).toString('base64');
  const bookingUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/quick-booking/${token}`;
  
  res.json({
    success: true,
    token,
    bookingUrl,
    qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(bookingUrl)}`
  });
});

// PUT /api/bookings/:id - Update booking status (admin endpoint)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, reason } = req.body;

  if (!status) {
    return res.status(400).json({
      error: 'Missing required field',
      message: 'Status is required'
    });
  }

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: 'Status must be one of: pending, confirmed, cancelled, completed'
    });
  }

  const stmt = db.prepare(`
    UPDATE bookings 
    SET status = ?
    WHERE id = ?
  `);

  stmt.run(status, id, function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        error: 'Database error',
        message: 'Failed to update booking status'
      });
    }

    if (this.changes === 0) {
      return res.status(404).json({
        error: 'Booking not found',
        message: 'No booking found with the given ID'
      });
    }

    // Fetch booking to get customer email for notifications
    db.get(
      `SELECT customer_name, customer_email, service_name, date, time_slot FROM bookings WHERE id = ?`,
      [id],
      async (fetchErr, row) => {
        if (fetchErr) {
          console.error('Database error:', fetchErr);
          return res.json({ success: true, message: `Booking status updated to ${status}` });
        }

        // Notify customer via email depending on status
        const shouldNotify = ['confirmed', 'cancelled'].includes(status) && row && row.customer_email;
        if (shouldNotify) {
          try {
            if (status === 'confirmed') {
              await sendEmail({
                to: row.customer_email,
                subject: 'Booking Confirmed - AUTOBATH',
                template: 'bookingStatusUpdate',
                data: {
                  statusLabel: 'Confirmed',
                  name: row.customer_name,
                  service: row.service_name,
                  date: row.date,
                  timeSlot: row.time_slot,
                }
              });
            } else if (status === 'cancelled') {
              await sendEmail({
                to: row.customer_email,
                subject: 'Booking Cancelled - AUTOBATH',
                template: 'bookingCancelled',
                data: {
                  name: row.customer_name,
                  service: row.service_name,
                  date: row.date,
                  timeSlot: row.time_slot,
                  reason: reason || ''
                }
              });
            }
          } catch (e) {
            console.error('Status email failed:', e && e.message ? e.message : e);
          }
        }

        res.json({ success: true, message: `Booking status updated to ${status}` });
      }
    );
  });

  stmt.finalize();
});

module.exports = router;


