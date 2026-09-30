from flask import Flask, request, jsonify, send_from_directory, session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import uuid
from collections import defaultdict
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__, static_folder=".", static_url_path="")
@app.route("/")
def home():
    return send_from_directory(".", "index.html")
CORS(app)  # Enable cross-origin resource sharing for frontend integration

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    subcategory = db.Column(db.String(100))
    price = db.Column(db.Numeric(10, 2), nullable=False)
    original_price = db.Column(db.Numeric(10, 2))
    discount = db.Column(db.String(20))
    image = db.Column(db.String(500))
    stock_quantity = db.Column(db.Integer, default=0)

class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(db.String(50), primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_address = db.Column(db.Text, nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    payment_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default="Confirmed")

    items = db.relationship(
        "OrderItem",
        backref="order",
        cascade="all, delete-orphan"
    )


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    order_id = db.Column(
        db.String(50),
        db.ForeignKey("orders.id"),
        nullable=False
    )

    product_id = db.Column(
        db.Integer,
        db.ForeignKey("products.id"),
        nullable=False
    )

    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)

@app.route("/api/products", methods=["GET"])
def get_products():
    products = Product.query.all()

    result = []

    for product in products:
        result.append({
            "id": product.id,
            "title": product.title,
            "category": product.category,
            "subcategory": product.subcategory,
            "price":float(product.price),
            "originalPrice":float(product.original_price) if product.original_price else None,
            "discount": product.discount,
            "image": product.image,
            "stockQuantity": product.stock_quantity
        })

    return jsonify(result)

@app.route("/api/products/<int:product_id>/stock", methods=["GET"])
def check_product_stock(product_id):
    product = db.session.get(Product, product_id)

    if not product:
        return jsonify({
            "error": "Product not found"
        }), 404

    return jsonify({
        "productId": product.id,
        "stockQuantity": product.stock_quantity
    })

@app.route("/api/test-order-stock/<int:product_id>", methods=["GET"])
def test_order_stock(product_id):
    product = db.session.get(Product, product_id)

    if not product:
        return jsonify({
            "success": False,
            "error": "Product not found"
        }), 404

    return jsonify({
        "success": True,
        "productId": product.id,
        "title": product.title,
        "price": float(product.price),
        "stockQuantity": product.stock_quantity
    })

# --- CONFIGURATION ---
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
ADMIN_SECRET_KEY = os.getenv("ADMIN_SECRET_KEY")


# WhatsApp Cloud API Configuration (Replace with your Meta/Twilio credentials when live)
WHATSAPP_API_URL = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages"
WHATSAPP_TOKEN = "YOUR_WHATSAPP_ACCESS_TOKEN"

# --- DATABASE & INVENTORY SETUP ---
def init_db():
    conn = sqlite3.connect('royal_naari.db')
    cursor = conn.cursor()
    
    # Orders Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            date TEXT,
            customer_name TEXT,
            customer_phone TEXT,
            customer_address TEXT,
            total REAL,
            payment_type TEXT,
            status TEXT
        )
    ''')
    
    # Customers Directory Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            date TEXT
        )
    ''')

    # Inventory / Products Stock Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY,
            title TEXT,
            category TEXT,
            price REAL,
            stock_quantity INTEGER
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# --- FEATURE 1: ADMIN EMAIL NOTIFICATION SERVICE ---
def send_admin_email(order_data):
    try:
        items_text = "\n".join([f"- {item['title']} (Qty: {item.get('quantity', 1)}) : ₹{item['price']}" for item in order_data['items']])
        
        msg = MIMEMultipart()
        msg['From'] = ADMIN_EMAIL
        msg['To'] = ADMIN_EMAIL
        msg['Subject'] = f"🚨 New Order Received! [{order_data['id']}]"
        
        body = f"""
        A new order has been placed on Royal Naari!
        
        Order ID: {order_data['id']}
        Date: {order_data['date']}
        Total Amount: ₹{order_data['total']}
        Payment Method: {order_data['paymentType']}
        
        Customer Name: {order_data.get('customerName', 'N/A')}
        Phone: {order_data.get('customerPhone', 'N/A')}
        Address: {order_data.get('customerAddress', 'N/A')}
        
        Items Ordered:
        {items_text}
        """
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(ADMIN_EMAIL, EMAIL_PASSWORD)
        server.sendmail(ADMIN_EMAIL, ADMIN_EMAIL, msg.as_string())
        server.quit()
        print("Admin notification email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

# --- FEATURE 6: WHATSAPP NOTIFICATION SERVICE ---
def send_whatsapp_confirmation(order_data):
    phone = order_data.get('customerPhone')
    if not phone:
        return
        
    try:
        # Formatted message template for customer confirmation
        message_body = (
            f"👑 *Royal Naari Order Confirmation*\n\n"
            f"Thank you for shopping with us, {order_data.get('customerName', 'Queen')}!\n"
            f"Your Order ID *{order_data['id']}* has been successfully confirmed.\n\n"
            f"Total Amount: ₹{order_data['total']}\n"
            f"We will notify you once your royal package ships out! 🚚"
        )
        
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {"body": message_body}
        }
        
        headers = {
            "Authorization": f"Bearer {WHATSAPP_TOKEN}",
            "Content-Type": "application/json"
        }
        
        # Uncomment below when you have live Meta Cloud API credentials plugged in:
        # response = requests.post(WHATSAPP_API_URL, json=payload, headers=headers)
        # print("WhatsApp API Response:", response.json())
        print(f"WhatsApp notification queued successfully for phone: {phone}")
    except Exception as e:
        print(f"Failed to send WhatsApp message: {e}")

# --- API ENDPOINTS ---

@app.route('/api/orders', methods=['POST'])
def handle_order():
    order_data = request.get_json()

    if not order_data:
        return jsonify({
            "success": False,
            "error": "No order data provided"
        }), 400

    try:
        # -----------------------------
        # 1. Get order items
        # -----------------------------
        items = order_data.get("items", [])

        if not items:
            return jsonify({
                "success": False,
                "error": "Order must contain at least one item"
            }), 400

        # -----------------------------
        # 2. Validate customer details
        # -----------------------------
        required_fields = [
            "customerName",
            "customerPhone",
            "customerAddress",
            "paymentType"
        ]

        for field in required_fields:
            if not order_data.get(field):
                return jsonify({
                    "success": False,
                    "error": f"{field} is required"
                }), 400

        # -----------------------------
        # 3. Combine duplicate products
        # -----------------------------
        product_quantities = defaultdict(int)

        for item in items:
            product_id = item.get("id")
            quantity = item.get("quantity", 0)

            if not product_id or quantity <= 0:
                return jsonify({
                    "success": False,
                    "error": "Invalid product or quantity"
                }), 400

            product_quantities[product_id] += quantity

        # -----------------------------
        # 4. Create order ID
        # -----------------------------
        order_id = "RN-" + str(uuid.uuid4())[:8].upper()

        # -----------------------------
        # 5. Calculate total from DB
        # -----------------------------
        calculated_total = 0
        order_items = []

        for product_id, quantity in product_quantities.items():
            product = db.session.get(Product, product_id)

            if not product:
                return jsonify({
                    "success": False,
                    "error": f"Product {product_id} not found"
                }), 404

            if quantity > product.stock_quantity:
                return jsonify({
                    "success": False,
                    "error": (
                        f"Only {product.stock_quantity} item(s) "
                        f"available for {product.title}"
                    )
                }), 400

            item_total = product.price * quantity
            calculated_total += item_total

            order_items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=product.price
                )
            )

        # -----------------------------
        # 6. Create order
        # -----------------------------
        order = Order(
            id=order_id,
            customer_name=order_data.get("customerName"),
            customer_phone=order_data.get("customerPhone"),
            customer_address=order_data.get("customerAddress"),
            total=calculated_total,
            payment_type=order_data.get("paymentType"),
            status="Confirmed"
        )

        # -----------------------------
        # 7. Attach order items
        # -----------------------------
        order.items = order_items

        # -----------------------------
        # 8. Reduce stock
        # -----------------------------
        for product_id, quantity in product_quantities.items():
            product = db.session.get(Product, product_id)
            product.stock_quantity -= quantity

        # -----------------------------
        # 9. Save everything
        # -----------------------------
        db.session.add(order)
        db.session.commit()

        # -----------------------------
        # 10. Return success
        # -----------------------------
        return jsonify({
            "success": True,
            "message": "Order placed successfully",
            "orderId": order_id,
            "total": float(calculated_total)
        }), 201

    except Exception as error:
        db.session.rollback()

        print("Order Error:", error)

        return jsonify({
            "success": False,
            "error": "Unable to process order"
        }), 500


@app.route('/api/customers', methods=['GET'])
def get_customers():
    auth_error = require_admin()

    if auth_error:
        return auth_error

    try:
        orders = Order.query.order_by(Order.id.desc()).all()

        customers = {}

        for order in orders:
            phone = order.customer_phone

            if phone not in customers:
                customers[phone] = {
                    "customerName": order.customer_name,
                    "customerPhone": order.customer_phone,
                    "customerAddress": order.customer_address,
                    "totalOrders": 0,
                    "totalSpent": 0
                }

            customers[phone]["totalOrders"] += 1
            customers[phone]["totalSpent"] += float(order.total)

        return jsonify(list(customers.values()))

    except Exception as error:
        print("Get Customers Error:", error)

        return jsonify({
            "success": False,
            "error": "Unable to fetch customers"
        }), 500

# --- SECURE ADMIN AUTHENTICATION ENDPOINT ---
@app.route('/api/admin/verify', methods=['POST'])
def verify_admin():
    auth_data = request.json

    if auth_data and auth_data.get('key') == ADMIN_SECRET_KEY:

        session["admin_logged_in"] = True

        return jsonify({
            "success": True,
            "message": "Admin authenticated successfully."
        })

    return jsonify({
        "success": False,
        "error": "Unauthorized access."
    }), 401
def require_admin():
    if not session.get("admin_logged_in"):
        return jsonify({
            "success": False,
            "error": "Unauthorized access"
        }), 401

    return None
@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    session.pop("admin_logged_in", None)

    return jsonify({
        "success": True,
        "message": "Admin logged out successfully."
    })
@app.route('/api/orders', methods=['GET'])
def get_orders():
    auth_error = require_admin()

    if auth_error:
        return auth_error
    conn = sqlite3.connect('royal_naari.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM orders ORDER BY date DESC')
    rows = cursor.fetchall()
    conn.close()
    
    orders = []
    for row in rows:
        orders.append({
            "id": row[0],
            "date": row[1],
            "customerName": row[2],
            "customerPhone": row[3],
            "customerAddress": row[4],
            "total": row[5],
            "paymentType": row[6],
            "status": row[7]
        })
    return jsonify(orders)

if __name__ == "__main__":
    app.run(debug=True)

