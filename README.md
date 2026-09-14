# 🛍️ RetailVision AI — Intelligent Retail Management System

RetailVision AI is a full-stack intelligent retail management platform that combines retail operations, inventory management, business analytics, customer intelligence, and Machine Learning-based decision support.

## 🚀 Live Demo

**[🌐 Open RetailVision AI](https://retailvision-ai.vercel.app)**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-RetailVision%20AI-success?style=for-the-badge)](https://retailvision-ai.vercel.app)

## ✨ Features

- Product and inventory management
- Customer management
- Point of Sale (POS)
- Order and invoice management
- Sales and business analytics
- Customer intelligence
- Demand forecasting
- Stock-out risk analysis
- Customer segmentation using K-Means
- Sales anomaly detection using Isolation Forest
- AI-powered business insights
- JWT authentication and role-based access control
- Cloudinary-based product image management

## 🤖 Machine Learning

### Demand Forecasting
Uses historical sales data to predict future product demand and support inventory replenishment decisions.

### Stock-Out Risk Analysis
Analyzes predicted demand and available inventory to identify products that may require replenishment.

### Customer Segmentation
Uses RFM-based customer features and K-Means clustering to identify customer segments based on purchasing behavior.

### Sales Anomaly Detection
Uses Isolation Forest to detect unusual patterns in sales data.

## 📊 Business Dashboard

The dashboard provides key retail metrics including revenue, orders, customers, products, sales trends, category performance, product performance, and inventory status.

## 🛒 Retail Operations

RetailVision AI provides product management, inventory tracking, POS transactions, customer management, order processing, and invoice management through a unified platform.

## 🏗️ Architecture

```text
React Frontend
      │
      ▼
Node.js + Express Backend
      │
      ├──────────────► MongoDB Atlas
      │
      ▼
Python + FastAPI ML Service
      │
      ├── Demand Forecasting
      ├── Customer Segmentation
      └── Anomaly Detection

## 🛠️ Technology Stack

**Frontend:** React, Vite, React Router, Axios, Recharts, Lucide React

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Cloudinary

**Machine Learning:** Python, FastAPI, Pandas, Scikit-learn, Joblib

**Deployment:** Vercel, Render, MongoDB Atlas, Cloudinary

## 🔐 Security

- JWT-based authentication
- Protected API routes
- Role-based access control
- Environment-based configuration for sensitive credentials

## 🗄️ Database

MongoDB Atlas is used for persistent application data including users, customers, products, orders, invoices, historical sales, and application settings.

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **ML Service:** Render
- **Database:** MongoDB Atlas
- **Image Storage:** Cloudinary

## 🎯 Objective

RetailVision AI aims to transform traditional retail management into a data-driven system by combining operational management, analytics, and Machine Learning-based decision support.

## 👨‍💻 Author

**Aditya**

B.Tech Computer Science & Engineering — AI & ML

[GitHub Profile](https://github.com/ak5g12)
