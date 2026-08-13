import mongoose from 'mongoose';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/apiFeatures.js';
import { deleteCloudinaryAssetByUrl } from '../services/media.service.js';

/**
 * Generic REST controller factory for CMS-managed resources.
 * `populate` may be a string of paths to populate.
 */

// Field names that can hold a media URL. Cloudinary assets referenced by these
// are removed from Cloudinary when an item is deleted, or replaced on update.
const MEDIA_FIELDS = ['image', 'images', 'avatar', 'cover', 'thumbnail', 'photo'];

function collectMediaUrls(doc) {
  if (!doc || typeof doc !== 'object') return [];
  const urls = [];
  for (const key of MEDIA_FIELDS) {
    const value = doc[key];
    if (Array.isArray(value)) urls.push(...value.filter((v) => typeof v === 'string'));
    else if (typeof value === 'string') urls.push(value);
  }
  return urls;
}

/** Delete Cloudinary assets on `oldDoc` that are no longer referenced on `newDoc`. */
async function cleanupReplacedMedia(oldDoc, newDoc) {
  if (!oldDoc) return;
  const oldUrls = collectMediaUrls(oldDoc);
  const newUrls = new Set(collectMediaUrls(newDoc));
  await Promise.all(
    oldUrls.filter((url) => !newUrls.has(url)).map((url) => deleteCloudinaryAssetByUrl(url))
  );
}

export function createFactory(Model, { populate = '', searchFields = [], categoryRef = null } = {}) {
  const list = catchAsync(async (req, res) => {
    // Work on a copy so we never mutate the caller's req.query.
    const queryString = { ...req.query };

    // When the model stores `category` as an ObjectId reference, a raw string can
    // never match it. Resolve the requested category (by slug, exact name, or a
    // raw ObjectId) into the referenced Category _id before the generic filter
    // runs. Used by /content/services & /content/products (& their admin routes).
    if (categoryRef && queryString.category) {
      const raw = String(queryString.category).trim();
      const cat = await categoryRef
        .findOne({
          $or: [
            { slug: raw.toLowerCase() },
            { name: new RegExp(`^${raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          ],
        })
        .select('_id')
        .lean();
      if (cat) {
        queryString.category = cat._id;
      } else if (!mongoose.isValidObjectId(raw)) {
        // Unknown category name → force an empty result set (all-zeros ObjectId).
        queryString.category = '000000000000000000000000';
      }
      // else: raw is already a valid ObjectId → keep it.
    }

    let query = Model.find().populate(populate);
    const features = new APIFeatures(query, queryString).search(searchFields).filter().sort().limitFields().paginate();
    const [data, meta] = await Promise.all([features.query, features.countTotal()]);
    res.json({ success: true, count: data.length, data, pagination: meta });
  });

  const getOne = catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populate);
    if (!doc) return next(new AppError('Resource not found', 404));
    res.json({ success: true, data: doc });
  });

  const getBySlug = catchAsync(async (req, res, next) => {
    const doc = await Model.findOne({ slug: req.params.slug }).populate(populate);
    if (!doc) return next(new AppError('Resource not found', 404));
    res.json({ success: true, data: doc });
  });

  const create = catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  });

  const update = catchAsync(async (req, res, next) => {
    const previous = await Model.findById(req.params.id);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate(populate);
    if (!doc) return next(new AppError('Resource not found', 404));
    // Remove any Cloudinary asset that was just replaced (no longer referenced).
    await cleanupReplacedMedia(previous, doc);
    res.json({ success: true, data: doc });
  });

  const remove = catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id);
    if (!doc) return next(new AppError('Resource not found', 404));
    // Delete the item's own Cloudinary assets (only assets it references).
    await Promise.all(collectMediaUrls(doc).map((url) => deleteCloudinaryAssetByUrl(url)));
    await doc.deleteOne();
    res.json({ success: true, message: 'Deleted successfully' });
  });

  return { list, getOne, getBySlug, create, update, remove };
}
