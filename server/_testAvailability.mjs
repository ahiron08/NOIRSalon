/**
 * Integration test for the stylist-availability feature against the live API.
 *
 * Boots the real Express app, seeds test data, and asserts:
 *   A. Availability endpoint (Part 22 scenario).
 *   B. Booking creation: overlap rejected (409), back-to-back accepted, out-of-hours rejected.
 *   C. Concurrency (Part 23): two simultaneous 14:00 bookings -> ONE succeeds.
 *   D. Admin confirmation protection (Part 13) via direct controller call.
 *   E. Cancelled appointment does not block.
 *
 * Run (from server/ so dotenv finds server/.env):
 *   npm run test:availability -w server
 *
 * NOTE: imports are dynamic so the SALON_OPEN_TIME override below is applied
 * before config/index.js is first evaluated (ESM static imports hoist above the
 * module body, which would otherwise read the real default opening time).
 */
import 'dotenv/config';
import dns from 'node:dns';
import http from 'node:http';
import mongoose from 'mongoose';

process.env.SALON_OPEN_TIME = '09:00';
process.env.SALON_CLOSE_TIME = '19:00';
process.env.SALON_SLOT_INTERVAL_MINUTES = '30';
dns.setServers(['1.1.1.1', '8.8.8.8']);

const appModule = await import('./app.js');
const app = appModule.default;
const { connectToDatabase, disconnectFromDatabase } = await import('./config/database.js');
const Service = (await import('./models/Service.model.js')).default;
const Stylist = (await import('./models/Stylist.model.js')).default;
const Appointment = (await import('./models/Appointment.model.js')).default;
const BookingCalendar = (await import('./models/BookingCalendar.model.js')).default;
const avail = await import('./services/availability.service.js');
const appts = await import('./controllers/appointment.controller.js');

let BASE = null;
let server;
let passed = 0;
let failed = 0;
const assertions = [];
function assert(name, cond, extra = '') {
  (cond ? passed++ : failed++);
  assertions.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
}
async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { status: res.status, json };
}

const main = async () => {
  await connectToDatabase();
  await BookingCalendar.init();
  const DAY = '2026-09-20';
  const dStart = avail.dayStartIST(DAY);
  const at = (t) => avail.dateTimeIST(DAY, t);

  await Service.deleteMany({ name: { $in: ['Test Haircut', 'Test Hair Spa'] } });
  await Stylist.deleteMany({ name: 'Test Sarah' });
  await Appointment.deleteMany({ date: dStart });
  await BookingCalendar.deleteMany({ date: dStart });

  const haircut = await Service.create({ name: 'Test Haircut', price: 500, duration: 60, active: true, slug: 'test-haircut' });
  const hairSpa = await Service.create({ name: 'Test Hair Spa', price: 1200, duration: 90, active: true, slug: 'test-hair-spa' });
  const sarah = await Stylist.create({ name: 'Test Sarah', role: 'Stylist', active: true, bookable: true });

  const confirmed = await Appointment.create({
    services: [haircut._id], stylist: sarah._id, stylistName: sarah.name,
    guestName: 'Setup', status: 'confirmed',
    date: dStart, time: '10:00', startTime: at('10:00'), endTime: new Date(at('10:00').getTime() + 60 * 60000), duration: 60, total: 500,
  });
  await avail.reserveSlot({ appointmentId: confirmed._id, stylistId: sarah._id, startTime: confirmed.startTime, endTime: confirmed.endTime, dayStart: dStart });

  // ---- A. Availability (Part 22) ----
  {
    const rs = await api('GET', `/api/v1/appointments/availability?stylistId=${sarah._id}&serviceId=${haircut._id}&date=${DAY}`);
    assert('A: availability 200', rs.status === 200, JSON.stringify(rs.json));
    const sl = rs.json?.data?.availableSlots || [];
    assert('A: duration 60 in response', rs.json?.data?.duration === 60);
    assert('A: 09:00 available', sl.includes('09:00'), `slots=[${sl}]`);
    assert('A: 10:00 unavailable', !sl.includes('10:00'), `slots=[${sl}]`);
    assert('A: 10:30 unavailable', !sl.includes('10:30'), `slots=[${sl}]`);
    assert('A: 11:00 available (back-to-back)', sl.includes('11:00'), `slots=[${sl}]`);
    assert('A: 18:30 not offered for 60-min (ends 19:30 > close)', !sl.includes('18:30'), `slots=[${sl}]`);
  }

  // ---- B. Booking creation ----
  {
    const r10 = await api('POST', '/api/v1/appointments/book', {
      services: [hairSpa._id], combos: [], stylist: sarah._id, date: DAY, time: '10:30',
      name: 'Test', phone: '111', email: 't1@x.in',
    });
    assert('B: HairSpa 10:30 (10:30-12:00 overlaps 10:00-11:00) -> 409', r10.status === 409, JSON.stringify(r10.json));

    const r11 = await api('POST', '/api/v1/appointments/book', {
      services: [hairSpa._id], combos: [], stylist: sarah._id, date: DAY, time: '11:00',
      name: 'Test', phone: '112', email: 't2@x.in',
    });
    assert('B: HairSpa 11:00 (11:00-12:30, no overlap) -> 201', r11.status === 201, JSON.stringify(r11.json));

    const outOfHours = await api('POST', '/api/v1/appointments/book', {
      services: [haircut._id], combos: [], stylist: sarah._id, date: DAY, time: '18:30',
      name: 'Test', phone: '113', email: 't3@x.in',
    });
    assert('B: 18:30 Haircut (ends 19:30 > close) -> 400', outOfHours.status === 400, JSON.stringify(outOfHours.json));
  }

  // ---- C. Concurrency (Part 23) ----
  {
    const [ra, rb] = await Promise.all([
      api('POST', '/api/v1/appointments/book', { services: [haircut._id], combos: [], stylist: sarah._id, date: DAY, time: '14:00', name: 'A', phone: '1', email: 'a@x.in' }),
      api('POST', '/api/v1/appointments/book', { services: [haircut._id], combos: [], stylist: sarah._id, date: DAY, time: '14:00', name: 'B', phone: '2', email: 'b@x.in' }),
    ]);
    const ok = [ra.status, rb.status].sort((x, y) => x - y).join(',');
    assert(`C: simultaneous 14:00 -> one 201 + one 409 (got ${ok})`, ok === '201,409', JSON.stringify({ ra, rb }));
    const rem = await Appointment.find({ date: dStart, time: '14:00', status: { $ne: 'cancelled' } }).lean();
    assert('C: exactly one 14:00 appointment remains', rem.length === 1, `remaining=${rem.length} ${JSON.stringify(rem.map((a) => ({ status: a.status, id: a._id })))}`);
    const gate = await BookingCalendar.findOne({ stylist: sarah._id, date: dStart });
    const fourteen = (gate?.slots || []).filter((s) => avail.formatTimeIST(s.start) === '14:00');
    assert('C: gate holds exactly one 14:00 slot', fourteen.length === 1, `gate14=${fourteen.length}`);
  }

  // ---- D. Admin confirmation protection (Part 13) ----
  {
    const pend = await Appointment.create({
      services: [haircut._id], stylist: sarah._id, stylistName: sarah.name,
      guestName: 'Conflict', status: 'pending',
      date: dStart, time: '10:00', startTime: at('10:00'), endTime: new Date(at('10:00').getTime() + 60 * 60000), duration: 60, total: 500,
    });
    // 1) The overlap detector (used by updateStatus) finds the confirmed appointment.
    const conflict = await avail.findConflictingAppointment(pend);
    assert('D: overlap detector finds conflicting confirmed appointment', !!conflict);
    // 2) updateStatus must NOT blindly confirm an overlapping pending appointment.
    await appts.updateStatus(
      { params: { id: String(pend._id) }, body: { status: 'confirmed' } },
      { status: () => ({ json: () => {} }), json: () => {} },
      () => {}
    );
    const after = await Appointment.findById(pend._id);
    assert('D: confirmation rejected — appointment stays pending', after.status === 'pending', `actual=${after.status}`);
    await Appointment.findByIdAndDelete(pend._id);
  }

  // ---- E. Cancelled appointment does not block ----
  {
    const canc = await Appointment.create({
      services: [haircut._id], stylist: sarah._id, stylistName: sarah.name,
      guestName: 'CancelMe', status: 'cancelled',
      date: dStart, time: '16:00', startTime: at('16:00'), endTime: new Date(at('16:00').getTime() + 60 * 60000), duration: 60, total: 500,
    });
    await avail.reserveSlot({ appointmentId: canc._id, stylistId: sarah._id, startTime: canc.startTime, endTime: canc.endTime, dayStart: dStart });
    await avail.releaseSlot(canc._id);
    const rs = await api('GET', `/api/v1/appointments/availability?stylistId=${sarah._id}&serviceId=${haircut._id}&date=${DAY}`);
    const sl = rs.json?.data?.availableSlots || [];
    assert('E: cancelled 16:00 slot is bookable again', sl.includes('16:00'), `slots=[${sl}]`);
  }

  console.log('\n================ RESULT ================');
  assertions.forEach((a) => console.log(a));
  console.log(`\n${passed} passed, ${failed} failed`);

  await Service.deleteMany({ name: { $in: ['Test Haircut', 'Test Hair Spa'] } });
  await Stylist.deleteMany({ name: 'Test Sarah' });
  await Appointment.deleteMany({ date: dStart });
  await BookingCalendar.deleteMany({ date: dStart });
  await disconnectFromDatabase();
  server.close(() => process.exit(failed === 0 ? 0 : 1));
};

const run = async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => (server.listening ? resolve() : server.once('listening', resolve)));
  BASE = `http://127.0.0.1:${server.address().port}`;
  await main();
};

run().catch((e) => {
  console.error('TEST ERROR', e);
  if (server) server.close();
  disconnectFromDatabase().catch(() => {});
  process.exit(1);
});