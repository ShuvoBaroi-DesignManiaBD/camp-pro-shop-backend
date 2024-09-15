import dotenv from "dotenv";
dotenv.config();

export default {
  port: process.env.PORT,
  database_url: process.env.database_url,
  frontend_url: process.env.FRONTEND_URL,
  node_env: process.env.NODE_ENV,
  bcrypt_salt_rounds: process.env.bcrypt_salt_rounds,
  jwt_access_key: process.env.JWT_ACCESS_SECRET,
  jwt_refresh_key: process.env.JWT_REFRESH_SECRET as string,
  jwt_access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN,
  jwt_refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
  paypal_client_id: process.env.PAYPAL_CLIENT_ID,
  paypal_client_secret: process.env.PAYPAL_CLIENT_SECRET,
  STORE_ID: process.env.STORE_ID,
  STORE_PASSWD: process.env.STORE_PASSWD,
  IS_LIVE: false,
  backend_url: process.env.BACKEND_URL,
};
