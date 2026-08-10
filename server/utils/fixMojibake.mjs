/**
 * Safe, targeted database migration — fixes the single known mojibake value
 * introduced by the corrupted seed.js (Video title containing U+FFFD).
 *
 * This script does a GLOBAL-SCAN-then-REPORT; it only UPDATEs documents whose
 * specific field contains the U+FFFD replacement character, and only on the
 * Video collection (the only seeded data that was corrupted).  It never performs
 * a blind string replacement across all collections.
 *
 * Usage:  node server/utils/fixMojibake.mjs
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('[fixMojibake] MONGODB_URI is not set in environment.');
  process.exit(1);
}

const videoSchema = new mongoose.Schema({ title: String }, { strict: false, strictQuery: false });
const Video = mongoose.model('Video', videoSchema);

async function run() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10_000 });
  console.log('[fixMojibake] Connected to MongoDB: ' + mongoose.connection.name);

  const docs = await Video.find({ title: { $regex: '\uFFFD' } });
  console.log('[fixMojibake] Found ' + docs.length + ' Video document(s) with U+FFFD in title.');

  let fixed = 0;
  for (const doc of docs) {
    const before = doc.title;
    // Targeted fix: the only known corrupted title was the video entry.
    const after = before.replace(/\uFFFD/g, '—'); // restore em-dash
    if (after !== before) {
      doc.title = after;
      await doc.save();
      console.log('  Fixed: "' + before + '" -> "' + after + '"');
      fixed++;
    }
  }

  console.log('[fixMojibake] Updated ' + fixed + ' document(s). Re-run seed.js to fully re-seed if needed.');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('[fixMojibake] Error:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
