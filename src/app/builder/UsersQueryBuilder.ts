import { FilterQuery, Query } from "mongoose";

class UsersQueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query?: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query || {};
  }

  // Search by name, email, phone, and city
  search() {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
          { phone: { $regex: searchTerm, $options: "i" } },
          { "address.city": { $regex: searchTerm, $options: "i" } },
        ] as FilterQuery<T>[],
        isDeleted: false, // Exclude soft-deleted users
      });
    }
    return this;
  }

  // Filter by role
  filter() {
    const queryObj = { ...this.query }; // copy
    const excludeFields = [
      "searchTerm",
      "sort",
      "limit",
      "page",
      "fields",
      "minPrice",
      "maxPrice",
      "categories",
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    // Filtering by role
    if (this.query?.role) {
      queryObj.role = this.query.role;
    }

    queryObj.isDeleted = false; // Exclude soft-deleted users

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

  // Sort by createdAt field
  sort() {
    const sortQuery = this.query?.sort as string;

    if (sortQuery) {
      const sortOptions: Record<string, 1 | -1> = {};

      // Split by comma to handle multiple fields
      sortQuery.split(",").forEach((fieldOrder) => {
        const [field, order] = fieldOrder.split(":");
        sortOptions[field] = order === "asc" ? 1 : -1;
      });

      this.modelQuery = this.modelQuery.sort(sortOptions);
    } else {
      // Default sorting by createdAt in descending order (newest first)
      this.modelQuery = this.modelQuery.sort({ createdAt: -1 });
    }

    return this;
  }

  paginate() {
    const page = Number(this.query?.page) || 1;
    const limit = Number(this.query?.limit) || 10;
    const skip = (page - 1) * limit;

    this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    return this;
  }

  fields() {
    const fields =
      (this.query?.fields as string)?.split(",")?.join(" ") || "-__v";
    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }
}

export default UsersQueryBuilder;
