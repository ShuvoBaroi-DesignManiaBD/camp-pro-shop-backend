import { z } from "zod";

const addressSchema = z.object({
  street: z.string().min(1, { message: "Street is required" }).trim(),
  city: z.string().min(1, { message: "City is required" }).trim(),
  state: z.string().min(1, { message: "State is required" }).trim(),
  zipCode: z.string().min(1, { message: "Zip Code is required" }).trim()
});

const newUserValidation = z.object({
  body: z.object({
    name: z
      .string({
        invalid_type_error: "Name must be a string",
      })
      .min(1, { message: "Name is required" }),

    email: z
      .string({
        invalid_type_error: "Invalid email address",
      })
      .email({ message: "Invalid email address" }),

    password: z
      .string({
        invalid_type_error: "Password must be a string",
      })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(20, { message: "Password can not be more than 20 characters" }),

    phone: z
      .string({
        invalid_type_error: "Phone number must be a string",
      })
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number can not be more than 15 digits" }),

    address: addressSchema
  }),
});

const userValidationSchema = z.object({
  pasword: z
    .string({
      invalid_type_error: "Password must be string",
    })
    .max(20, { message: "Password can not be more than 20 characters" })
    .optional(),
});

export const UserValidation = {
  userValidationSchema,
  newUserValidation,
};