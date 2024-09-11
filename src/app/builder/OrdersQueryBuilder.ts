import { FilterQuery, Query } from "mongoose";

class OrdersQueryBuilder<T> {
  public modelQuery: Query<T[], T>;
  public query?: Record<string, unknown>;

  constructor(modelQuery: Query<T[], T>, query: Record<string, unknown>) {
    this.modelQuery = modelQuery;
    this.query = query || {};
  }

  search(searchFields: string[]) {
    const searchTerm = this.query?.searchTerm as string;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchFields.map(
          (field) =>
            ({
              [field]: { $regex: searchTerm, $options: "i" },
            }) as FilterQuery<T>
        ),
      });
    }
    return this;
  }

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

    // Filtering by totalPrice range
    if (this.query?.minPrice || this.query?.maxPrice) {
      queryObj.totalPrice = {
        ...(this.query.minPrice ? { $gte: Number(this.query.minPrice) } : {}),
        ...(this.query.maxPrice ? { $lte: Number(this.query.maxPrice) } : {}),
      };
    }

    // Filtering by currency
    if (this.query?.currency) {
      queryObj.currency = this.query.currency;
    }

    // Filtering by status
    if (this.query?.status) {
      queryObj.status = this.query.status;
    }

    // Additional filters if needed (e.g., by userId, transactionId)
    if (this.query?.userId) {
      queryObj.userId = this.query.userId;
    }

    if (this.query?.transactionId) {
      queryObj.transactionId = this.query.transactionId;
    }

    this.modelQuery = this.modelQuery.find(queryObj as FilterQuery<T>);
    return this;
  }

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

export default OrdersQueryBuilder;
