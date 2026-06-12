# VendorBridge - Procurement ERP System

**VendorBridge** is a modern, responsive, full-stack Procurement Enterprise Resource Planning (ERP) application built with the MERN stack. It streamlines the procurement lifecycle, facilitating seamless interaction between internal corporate teams (Procurement Officers, Managers, Admins) and external Vendors.

## 🚀 Key Features

* **Role-Based Access Control (RBAC):** Tailored dashboards and permissions for `Admin`, `Manager`, `Procurement Officer`, and `Vendor`.
* **Vendor Management:** Onboard, categorize, track, and manage external suppliers safely.
* **Request for Quotation (RFQ) Engine:** Easily broadcast RFQs to active vendors.
* **Quotation Management & Comparison:** Vendors can submit bids, and Officers can view an automated side-by-side comparison to find the best price.
* **Approval Workflows:** Managers securely review and approve Purchase Orders and significant procurement decisions.
* **Purchase Orders & Invoices:** Maintain clear financial trails from the issuance of POs to final invoice tracking.
* **Deep Analytics & Reports:** Interactive charts (via Recharts) displaying vital KPI metrics across operations.
* **Modern UI/UX:** 
  * Comprehensive Light & Dark mode.
  * Glassmorphism & vibrant component states.
  * Fully responsive mobile, tablet, and desktop layout.
* **Audit & Activity Logs:** Keeps an absolute history of system actions for accountability.

## 🛠 Tech Stack

**Frontend:**
* [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
* [React Router v6](https://reactrouter.com/) (Routing & Navigation)
* [Bootstrap 5](https://getbootstrap.com/) (Layout and Grid)
* Custom CSS Design System (Dynamic Theming / Dark Mode)
* [Recharts](https://recharts.org/) (Data Visualization)
* [Axios](https://axios-http.com/) (HTTP Requests)

**Backend:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) (Database & Modeling)
* [JSON Web Tokens (JWT)](https://jwt.io/) (Authentication & Sessions)

## 📁 Project Structure

```text
vendor-bridge/
├── client/                     # React Frontend
│   ├── public/                 # Static Assets
│   ├── src/                    
│   │   ├── components/         # Reusable UI elements (Layout, Navbar, Sidebar, Modals)
│   │   ├── context/            # Context API (Auth, Theme, App states)
│   │   ├── pages/              # Module Pages (Dashboard, RFQs, Users, etc.)
│   │   ├── services/           # Axios API configuration
│   │   ├── utils/              # Helper functions mapped across the app
│   │   ├── App.jsx             # Main Route Configuration
│   │   └── index.css           # Global Theme & Typography
│   └── package.json            # Client Dependencies
│
└── server/                     # Node/Express Backend
    ├── src/
    │   ├── config/             # DB & Environment Variables setup
    │   ├── controllers/        # Business Logic Modules
    │   ├── middleware/         # Auth, Error handlers, Roles validation
    │   ├── models/             # Mongoose Schemas (Vendor, User, RFQ, etc.)
    │   ├── routes/             # Express API routing 
    │   └── utils/              # Node Utilities
    └── package.json            # Server Dependencies
```

## ⚙️ Local Development Setup

Follow these steps to set up the project on your local machine.

### Prerequisites
* Node.js (v16+ recommended)
* Running local instance of MongoDB or an active MongoDB Atlas URI.

### 1. Backend Setup (Server)

1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/vendorbridge
   JWT_SECRET=your_super_secret_jwt_key
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (Client)

1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🔒 User Roles Overview

1. **Admin:** Full access to User Management, roles adjustments, deleting global records, and total system insights.
2. **Manager:** Focuses strictly on the Dashboard reports and the Approvals workflow (cannot alter overarching system users).
3. **Procurement Officer:** The core internal user—handles creating RFQs, generating Purchase Orders, handling invoices, and adding Vendors.
4. **Vendor:** External entity. Can view RFQs they are invited to, submit Quotations, and view their specific POs and Invoices.

## ✨ Highlights
* **Optimized Rendering:** Uses `react-dom` Portals for absolute-positioned modals to bypass z-index and CSS animation clashes.
* **Security First:** Implements rigorous password hashing (bcrypt), token-based API gates, and route protection elements on the frontend.
