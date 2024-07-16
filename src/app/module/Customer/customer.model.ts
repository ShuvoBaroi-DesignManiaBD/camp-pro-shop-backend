import { Schema, model } from "mongoose";
import { customerModel, TCustomer } from "./customer.interface";
import { User } from "../User/user.model";

const customerSchema = new Schema<TCustomer>({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, 'User ID is required'],
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  cart: {
    type: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
}, {timestamps: true});


customerSchema.statics.isUserExistsById = async function (id: string) {
  return await User.findById(id).select("+password");
};

customerSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};


export const Customer = model<TCustomer, customerModel>("Customer", customerSchema);
