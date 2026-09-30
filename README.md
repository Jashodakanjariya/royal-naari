# Royal Naari

## Full-Stack E-Commerce Web Application

Royal Naari is a full-stack e-commerce web application for showcasing and selling imitation jewelry and fashion accessories.

This project was developed as a portfolio project to practice and demonstrate full-stack web development using Python, Flask, MySQL, SQLAlchemy, JavaScript, HTML, and CSS.

## Features

* Product catalog
* Product categories and subcategories
* Product search and filtering
* Shopping cart
* Product stock validation
* Quantity management
* Checkout and order creation
* MySQL database integration
* SQLAlchemy ORM
* Flask REST APIs
* Database migrations with Flask-Migrate
* Admin authentication using Flask sessions
* Protected admin order API
* Protected customer API
* Environment variables for sensitive configuration

## Technologies Used

### Backend

* Python
* Flask
* Flask-SQLAlchemy
* Flask-Migrate
* MySQL
* REST API

### Frontend

* HTML5
* CSS3
* JavaScript
* Fetch API
* Local Storage

### Development Tools

* Git
* GitHub
* Python virtual environment
* `.env` configuration

## Application Flow

```text
Customer
   ↓
Frontend
   ↓
JavaScript Fetch API
   ↓
Flask REST API
   ↓
SQLAlchemy
   ↓
MySQL
```

## Database

The application uses MySQL with SQLAlchemy ORM.

Main entities include:

* Products
* Orders
* Order Items

Products are connected to orders through order items, allowing the application to store the product, quantity, and price associated with each order.

## Order Processing

When an order is submitted:

1. The frontend sends the order information to Flask.
2. Flask validates the customer information.
3. Product IDs and quantities are validated.
4. Product stock is checked.
5. The server calculates the order total from database prices.
6. The order and order items are stored in MySQL.
7. Product stock is reduced.
8. The server returns the generated order ID.

## Admin Authentication

Admin access uses Flask sessions.

The admin authentication flow is:

```text
Admin Secret
     ↓
/api/admin/verify
     ↓
Flask Session
     ↓
Protected Admin APIs
```

Protected APIs include:

* `/api/orders`
* `/api/customers`

## Security Practices

* Sensitive configuration is stored in `.env`.
* `.env` is excluded from Git using `.gitignore`.
* Admin APIs require authentication.
* Server-side stock validation is performed before creating orders.
* Order totals are calculated using database product prices rather than trusting frontend prices.

## Project Status

This is a working portfolio project.

The core e-commerce flow, database integration, REST APIs, inventory validation, order processing, and admin authentication have been implemented.

Possible future improvements include:

* Customer account authentication
* Production payment verification
* Automated testing
* Additional security hardening
* Production deployment and monitoring
* More advanced admin dashboard functionality

## Learning Goals

This project was built to gain practical experience with:

* Full-stack application architecture
* Flask backend development
* REST API development
* MySQL database design
* SQLAlchemy ORM
* Database migrations
* Frontend/backend integration
* Authentication and sessions
* Inventory and order management
* Git and GitHub

## Author

Built as a full-stack development portfolio project.
