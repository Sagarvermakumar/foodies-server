# Zayka Express - Backend

Zayka Express is a fast-food delivery backend built using **Node.js**, **Express**, and **MongoDB**.  
It provides secure admin features, user management, menu management, and order processing for the Zayka Express application.

---

## 🚀 Features

### **Admin Features**
- **Secure Login with Secret Key**
- **Menu Management**
  - Add new menu items
  - Edit menu items
  - Delete menu items
  - Toggle menu availability
  - View all menu items
  - Get menu item by ID
- **User Management**
  - View all users
  - View user details
  - Block user
  - Unblock user
  - Update user role
- **Order Management**
  - View all orders
  - View order by ID
  - Update order status
  - Get order statistics
- **Analytics & Stats**
  - Get all statistics

---

### **User Features**
- **Authentication**
  - Change password
  - Get my profile
  - Update profile
  - Update profile picture
  - Delete profile
- **Order Management**
  - Place new order
  - Reorder
  - Cancel order
  - Check order status
  - Delete cancelled order
  - View all orders of a specific user
  - Get order by ID
- **Menu Browsing**
  - Get all menu items
  - Get menu item by ID
  - Get menu items by category
  - Get most rated menu items
  - Get menu items by price range
  - Get new menu items
  - Get popular menu items
- **Address Management**
  - Create new address
  - Update address
  - Delete address
  - Get all addresses
  - Get default address
  - Set default address

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Token)
- **File Uploads:** Multer / Cloudinary
- **Security:** bcrypt.js, Helmet, CORS
- **validation:** express validator

---


## ⚙️ Environment Variables

Before running the server, create a **`.env`** file in the root of the project and add the following variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI_CLOUD=your_mongodb_cloud_uri
MONGO_URI_LOCAL=your_local_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary (for images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP (for emails)
SMTP_PORT=587
SMTP_HOST=smtp.yourprovider.com
SMTP_USER=your_email_username
SMTP_PASS=your_email_password

# Email Settings
EMAIL_FROM_NAME=Zayka Express
EMAIL_FROM=no-reply@zaykaexpress.com
```




![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)






