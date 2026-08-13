import { Router } from 'express';
import * as appts from '../controllers/appointment.controller.js';
import { protect, protectAdmin } from '../middleware/auth.js';

const r = Router();

// public + authenticated booking
r.post('/book', appts.createBooking);
r.get('/slots', appts.getSlots);
r.get('/availability', appts.getAvailability);

// user's own appointments
r.use('/mine', protect);
r.get('/mine', appts.myAppointments);
r.get('/mine/:id', appts.myAppointment);
r.patch('/mine/:id/cancel', appts.cancelMyAppointment);

// admin management
r.get('/', protectAdmin, appts.getAll);
r.get('/:id', protectAdmin, appts.getOne);
r.patch('/:id', protectAdmin, appts.adminUpdate);
r.patch('/:id/status', protectAdmin, appts.updateStatus);

export default r;
