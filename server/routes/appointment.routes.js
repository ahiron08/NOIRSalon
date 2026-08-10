import { Router } from 'express';
import * as appts from '../controllers/appointment.controller.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const r = Router();

// public + authenticated booking
r.post('/book', appts.createBooking);
r.get('/slots', appts.getSlots);

// user's own appointments
r.use('/mine', protect);
r.get('/mine', appts.myAppointments);

// admin management
r.get('/', protectAdmin, appts.getAll);
r.patch('/:id/status', protectAdmin, appts.updateStatus);

export default r;
