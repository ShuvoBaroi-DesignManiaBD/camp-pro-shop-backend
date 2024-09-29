## [Camp Pro Shop](https://camp-pro-shop-backend.shuvobaroi.com/)

Welcome to the backend of Camp Pro Shop, an e-commerce web application designed to offer a seamless shopping experience for outdoor enthusiasts. Explore a wide range of products, manage your cart, place orders, and discover more about us through this feature-rich platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
  - [Development](#development)
  - [Production](#production)
- [Building the Application](#building-the-application)
- [Linting and Formatting](#linting-and-formatting)
- [Technology Stack](#technology-stack)

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (v14 or higher)
- npm (v6 or higher)


## Installation of the backend

1. Clone the repository:

   ```sh
   git clone https://github.com/ShuvoBaroi-DesignManiaBD/camp-pro-shop-backend.git
   cd camp-pro-shop-backend
   ```

2. Install the dependencies:

   ```sh
   npm install
   ```

### Configuration:

Create a `.env` file in the root directory and add the following environment variables:

```env
PORT=your_key
database_url=your_key
NODE_ENV=your_key
bcrypt_salt_rounds=your_key
JWT_ACCESS_SECRET=your_key
JWT_REFRESH_SECRET=your_key
JWT_ACCESS_EXPIRES_IN=your_key
JWT_REFRESH_EXPIRES_IN=your_key
FRONTEND_URL=your_key
BACKEND_URL=your_key
PAYPAL_CLIENT_ID=your_key
PAYPAL_CLIENT_SECRET=your_key
STORE_ID=your_key
STORE_PASSWD=your_key
IS_LIVE=your_key
```

These secret keys should be in the `.env` file for running the app properly.

### Running the Application:

#### Development

To run the application in development mode with hot reloading:

```sh
npm run dev
```

#### Production

To run the application in production mode:

1. Build the project:

   ```sh
   npm run build
   ```

2. Start the application:

   ```sh
   npm run prod
   ```

### Building the Application:

To build the TypeScript project:

```sh
npm run build
```

This will compile the TypeScript files into JavaScript and place them in the `dist` folder.

### Linting and Formatting:

To lint the code:

```sh
npm run lint
```

## Technology Stack
- **TypeScript**: Used as the programming language.
- **Express.js**: Used as the web framework.
- **Mongoose**: Used as the Object Data Modeling (ODM) and validation library for MongoDB.
- **Zod**: Used for advanced data validations.
- **JWT**: Used for generating tokens for authentication and authorization.
- **Paypal**: Payment gateway integration.
- **SSLCommerz**: Payment gateway integration.
- **Multer**: Used for uploading files.
- **Sharp**: Used for file optimization.
---
#### Live link: [https://camp-pro-shop-backend.shuvobaroi.com/](https://camp-pro-shop-backend.shuvobaroi.com/)

#### GitHub Repo: [https://github.com/ShuvoBaroi-DesignManiaBD/camp-pro-shop-backend.git](https://github.com/ShuvoBaroi-DesignManiaBD/camp-pro-shop-backend.git)

```
