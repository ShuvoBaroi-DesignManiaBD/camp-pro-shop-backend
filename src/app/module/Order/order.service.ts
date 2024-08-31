/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { IOrder } from "./order.interface";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { paypalConfigs } from "../Payment/payment.utils";
import config from "../../config";
import Order from "./order.model";
import { User } from "../User/user.model";
import { ProductServices } from "../Product/product.service";
const SSLCommerzPayment = require("sslcommerz-lts");

// ======================== Paypal =================

const createOrderWithPaypal = async (order: IOrder) => {
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
      return_url: `${config.frontend_url}/order-success?gateway=paypal`,
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

const captureOrderForPaypal = async (orderId: any) => {
  console.log(orderId);
  
  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Start transaction

    const request = new paypalConfigs.paypal.orders.OrdersCaptureRequest(
      orderId
    );
    request.requestBody({});
    const capture = await paypalConfigs.client.execute(request);

    if (capture?.statusCode === 201) {
      const order = await Order.findOne({
        transactionId: `TXN-${orderId}`,
      }).session(session); // Use session
      console.log("Order found (line 74): ", order);

      
      order && ProductServices.updateProductsStock(order.products);
        // Update order status and add payer details using session
        const updatedOrder = await Order.findOneAndUpdate(
          { transactionId: `TXN-${orderId}` },
          { status: "paid", payerDetails: capture?.result?.payer || {} },
          { new: true, session } // Ensure session is used here
        );

        await session.commitTransaction(); // Commit transaction after all operations
        console.log("Transaction committed successfully.");
        return updatedOrder;
    }
  } catch (err: any) {
    console.error("Error capturing order:", err);
    await session.abortTransaction(); // Abort transaction on error

    if (err?.statusCode === 404) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "Order not found in the database!"
      );
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

// ======================== Paypal =================

// ===================== SSLCommerz ================


const createOrderWithSSLCZ = async (order: IOrder) => {
  try {
    console.log(order);
    const id = new mongoose.Types.ObjectId().toString();
    const TXNId = `TXN-${id}`;
    
    // Fetch user data
    const user = await User.findById(order?.userId);
    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found!");
    }

    const data = {
      total_amount: parseFloat(order?.totalPrice.toFixed(2)),
      currency: "USD",
      tran_id: id, // use unique tran_id for each API call
      success_url: `${config.frontend_url}/order-success?gateway=sslcommerz&token=${id}`,
      fail_url: `${config.frontend_url}/order-fail`,
      cancel_url: `${config.frontend_url}/order-cancel`,
      ipn_url: 'http://localhost:3030/ipn', // Make sure to use dynamic URLs
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: user.name,
      cus_email: user.email,
      cus_add1: user.address?.street,
      cus_add2: "N/A",
      cus_city: user.address?.city,
      cus_state: user.address?.state,
      cus_postcode: user.address?.zipCode,
      cus_country: "Bangladesh",
      cus_phone: user.phone,
      cus_fax: "01711111111",
      ship_name: "N/A",
      ship_add1: order.address?.street,
      ship_add2: "N/A",
      ship_city: order.address?.city,
      ship_state: order.address?.city,
      ship_postcode: order.address?.zip,
      ship_country: order.address?.country,
    };

    const sslcz = new SSLCommerzPayment(
      config.STORE_ID,
      config.STORE_PASSWD,
      config.IS_LIVE
    );

    // Initialize payment and await the response
    const apiResponse = await sslcz.init(data);
    const GatewayPageURL = apiResponse?.GatewayPageURL;

    if (!GatewayPageURL) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Payment gateway URL not received!");
    }

    // Update order with transaction details and status
    const updatedOrder = {
      ...order,
      transactionId: TXNId,
      status: "pending",
    };

    await Order.create(updatedOrder);
    console.log("Order created and redirecting to: ", GatewayPageURL);

    return GatewayPageURL;
  } catch (error:any) {
    console.error("Error creating order with SSLCZ:", error);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Something went wrong! ${error.message}`
    );
  }
};


const captureOrderForSSLCZ = async (token: any) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction(); // Start transaction

    const data = {
      tran_id: token,
    };

    const sslcz = new SSLCommerzPayment(
      config.STORE_ID,
      config.STORE_PASSWD,
      config.IS_LIVE
    );

    // Await the transaction query
    const isOrderCreatedInSSL = await sslcz.transactionQueryByTransactionId(data);
    console.log(isOrderCreatedInSSL);
    
    // Check for status codes 200 or 201
    if (isOrderCreatedInSSL?.APIConnect === 'DONE') {
      const order = await Order.findOne({ transactionId: `TXN-${token}` }).session(session); // Use session
      console.log("Order found (line 74): ", order, isOrderCreatedInSSL);

      if (order && order.status !== 'paid') {
        console.log(order?.products);

        // Await the product stock update
        await ProductServices.updateProductsStock(order?.products);
        const orderDataFromSSL = isOrderCreatedInSSL?.element[0];
        // Update order status and add payer details using session
        const updatedOrder = await Order.findOneAndUpdate(
          { transactionId: `TXN-${token}` },
          { status: "paid", paidBy: orderDataFromSSL.card_issuer, bank_tran_id: orderDataFromSSL.bank_tran_id, currency_rate: orderDataFromSSL.currency_rate, tran_date: orderDataFromSSL.tran_date },
          { new: true, session } // Ensure session is used here
        );

        await session.commitTransaction(); // Commit transaction after all operations
        console.log("Transaction committed successfully.");
        return updatedOrder;
      } else {
        if (order && order?.status === 'paid') {
          return order;
        }
        throw new AppError(httpStatus.NOT_FOUND, "Order not found in the database!");
      }
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid SSLCommerz transaction response!");
    }
  } catch (err: any) {
    console.error("Error capturing order:", err);
    await session.abortTransaction(); // Abort transaction on error

    // Handle specific errors based on statusCode or error type
    if (err?.statusCode === 404) {
      throw new AppError(httpStatus.NOT_FOUND, "Order not found in the database!");
    } else if (err?.statusCode === 422) {
      const getOrder = await Order.findOne({ transactionId: `TXN-${token}` });
      console.log("Order already captured: ", getOrder);
      return getOrder;
    } else {
      throw new AppError(httpStatus.BAD_REQUEST, `Something went wrong! ${err.message}`);
    }
  } finally {
    session.endSession(); // End session
  }
};

// ===================== SSLCommerz ================

export const orderServices = {
  createOrderWithPaypal,
  captureOrderForPaypal,
  createOrderWithSSLCZ,
  captureOrderForSSLCZ
};
