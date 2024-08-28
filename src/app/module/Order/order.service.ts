/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IOrder } from "./order.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import DataNotFoundError from "../../errors/DataNotFoundError";
import { paypalConfigs } from "../Payment/payment.utils";
import config from "../../config";
import Order from "./order.model";
import Product from "../Product/product.model";

const createOrder = async (order: IOrder) => {
  const request = new paypalConfigs.paypal.orders.OrdersCreateRequest();
  let approvalUrl;
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: parseFloat(order?.totalPrice.toFixed(2)), // Replace with the actual amount
        },
      },
    ],
    application_context: {
      return_url: `${config.frontend_url}/order-success`,
      cancel_url: `${config.frontend_url}`,
    },
  });

  try {
    const orderInPaypal = await paypalConfigs.client.execute(request);
    approvalUrl = orderInPaypal.result.links.find(
      (link: { rel: string }) => link?.rel === "approve"
    ).href;
    // console.log(orderInPaypal, approvalUrl.split("=")[1]);
    const transactionId = `TXN-${approvalUrl.split("=")[1]}`;
    const updatedOrder = { ...order, transactionId, status: "pending" };
    // console.log(approvalUrl);
    await Order.create(updatedOrder);
    console.log(updatedOrder, approvalUrl);

    return approvalUrl;
  } catch (err) {
    // console.log(err);

    throw new AppError(httpStatus.BAD_REQUEST, `Something went wrong!`);
  }
};


const captureOrder = async ({ orderId }: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Start transaction

    const request = new paypalConfigs.paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await paypalConfigs.client.execute(request);

    if (capture?.statusCode === 201) {
      const order = await Order.findOne({ transactionId: `TXN-${orderId}` }).session(session); // Use session
      console.log("Order found (line 74): ", order);

      // Check if order is found
      if (order) {
        // Updating the stock for each product
        for (const product of order.products) {
          console.log("Processing product: ", product);

          // Convert product.id to ObjectId
          const productId = new mongoose.Types.ObjectId(product.id);
          
          // Find the product using session
          const foundProduct = await Product.findById(productId).session(session);
          console.log("Found Product:", foundProduct);
          
          if (foundProduct) {
            const stockQuantity = foundProduct.stockQuantity;
            
            // Update stock quantity using session
            await Product.findByIdAndUpdate(
              productId,
              { stockQuantity: Number(stockQuantity - product?.quantity) },
              { new: true, session } // Ensure session is used here
            );
          } else {
            console.error(`Product not found with ID: ${product.id}`);
            throw new AppError(httpStatus.NOT_FOUND, `Product with ID ${product.id} not found!`);
          }
        }

        // Update order status and add payer details using session
        const updatedOrder = await Order.findOneAndUpdate(
          { transactionId: `TXN-${orderId}` },
          { status: "paid", payerDetails: capture?.result?.payer || {} },
          { new: true, session } // Ensure session is used here
        );

        await session.commitTransaction(); // Commit transaction after all operations
        console.log("Transaction committed successfully.");
        return updatedOrder;
      } else {
        throw new AppError(httpStatus.NOT_FOUND, "Order not found in the database!");
      }
    }
  } catch (err: any) {
    console.error("Error capturing order:", err);
    await session.abortTransaction(); // Abort transaction on error

    if (err?.statusCode === 404) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found in the database!");
    } else if (err?.statusCode === 422) {
      const getOrder = await Order.find({ transactionId: `TXN-${orderId}` });
      console.log("Order already captured: ", getOrder);
      return getOrder[0];
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Something went wrong!");
    }
  } finally {
    session.endSession(); // End session
  }
};

export const orderServices = {
  createOrder,
  captureOrder,
};
