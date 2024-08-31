//Paypal configs =================================
import config from "../../config";

const paypal = require('@paypal/checkout-server-sdk');

const environment = new paypal.core.SandboxEnvironment(config.paypal_client_id, config.paypal_client_secret);
const client = new paypal.core.PayPalHttpClient(environment);

export const paypalConfigs = { client,paypal };


// SSLCommerze configs =================================

