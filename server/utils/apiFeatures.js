/**
 * Query utilities builder — applies searching, filtering, sorting,
 * field selection and pagination to any Mongoose query in a chainable,
 * consistent way.
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .search(['name', 'description'])
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const { data, pagination } = await features.query; // + features.pagination
 */
export default class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = {};
  }

  /** Case-insensitive regex search across the given fields. */
  search(fields) {
    const term = this.queryString.search;
    if (term && fields.length) {
      const regex = term.split(/\s+/).map((w) => new RegExp(w, 'i'));
      this.query = this.query.find({
        $or: fields.map((f) => ({ [f]: { $in: regex } })),
      });
    }
    return this;
  }

  /** Filter by exact match, with gte/lte/gt/lt operators for ranges. */
  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'sort', 'limit', 'fields', 'search'];
    excluded.forEach((k) => delete queryObj[k]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (m) => `$${m}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    this.pagination = { page, limit, skip };
    return this;
  }

  /** Attach total documents for building response pagination meta. */
  async countTotal() {
    const filter = this.query.getFilter();
    this.pagination.total = await this.query.model.countDocuments(filter);
    this.pagination.pages = Math.ceil(this.pagination.total / this.pagination.limit);
    return this.pagination;
  }
}
