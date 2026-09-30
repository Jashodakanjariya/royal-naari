from app import app, db, Product

products = [
    {
        "id": 1,
        "title": "Royal Zircon Solitaire Ring",
        "category": "Rings",
        "subcategory": "Solitaire Rings",
        "price": 599,
        "original_price": 1299,
        "discount": "-54%",
        "image": "images/rings/1.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 2,
        "title": "Classic Gold Band Ring",
        "category": "Rings",
        "subcategory": "Zircon Bands",
        "price": 499,
        "original_price": 999,
        "discount": "-50%",
        "image": "images/rings/2.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 3,
        "title": "Vintage Emerald Ring",
        "category": "Rings",
        "subcategory": "Traditional Kundan Rings",
        "price": 799,
        "original_price": 1599,
        "discount": "-50%",
        "image": "images/rings/3.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 4,
        "title": "Pearl Elegance Ring",
        "category": "Rings",
        "subcategory": "Solitaire Rings",
        "price": 649,
        "original_price": 1299,
        "discount": "-50%",
        "image": "images/rings/4.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 5,
        "title": "Diamond Studded Band",
        "category": "Rings",
        "subcategory": "Zircon Bands",
        "price": 899,
        "original_price": 1799,
        "discount": "-50%",
        "image": "images/rings/5.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 6,
        "title": "Rose Gold Twirl Ring",
        "category": "Rings",
        "subcategory": "Traditional Kundan Rings",
        "price": 549,
        "original_price": 1099,
        "discount": "-50%",
        "image": "images/rings/6.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 7,
        "title": "Sapphire Crown Ring",
        "category": "Rings",
        "subcategory": "Solitaire Rings",
        "price": 999,
        "original_price": 1999,
        "discount": "-50%",
        "image": "images/rings/7.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 8,
        "title": "Floral Motif Ring",
        "category": "Rings",
        "subcategory": "Zircon Bands",
        "price": 450,
        "original_price": 900,
        "discount": "-50%",
        "image": "images/rings/8.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 9,
        "title": "Statement Cocktail Ring",
        "category": "Rings",
        "subcategory": "Traditional Kundan Rings",
        "price": 1199,
        "original_price": 2399,
        "discount": "-50%",
        "image": "images/rings/9.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 10,
        "title": "Minimalist Stackable Ring",
        "category": "Rings",
        "subcategory": "Solitaire Rings",
        "price": 399,
        "original_price": 799,
        "discount": "-50%",
        "image": "images/rings/10.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 11,
        "title": "Antique Polki Ring",
        "category": "Rings",
        "subcategory": "Traditional Kundan Rings",
        "price": 1399,
        "original_price": 2799,
        "discount": "-50%",
        "image": "images/rings/11.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 12,
        "title": "Infinity Love Ring",
        "category": "Rings",
        "subcategory": "Zircon Bands",
        "price": 599,
        "original_price": 1199,
        "discount": "-50%",
        "image": "images/rings/12.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 13,
        "title": "Royal Heirloom Ring",
        "category": "Rings",
        "subcategory": "Solitaire Rings",
        "price": 1499,
        "original_price": 2999,
        "discount": "-50%",
        "image": "images/rings/13.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 14,
        "title": "Kashmiri Statement Kundan Jhumkas",
        "category": "Earrings",
        "subcategory": "Kashmiri Jhumkas",
        "price": 899,
        "original_price": 1799,
        "discount": "-50%",
        "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
        "stock_quantity": 0
    },
    {
        "id": 15,
        "title": "Classic Gold-Plated Loose Bracelet",
        "category": "Bracelets",
        "subcategory": "Loose Bracelets",
        "price": 1199,
        "original_price": 2399,
        "discount": "-50%",
        "image": "https://images.unsplash.com/photo-1611591475871-2ee392297fbc?auto=format&fit=crop&w=600&q=80",
        "stock_quantity": 0
    },
    {
        "id": 16,
        "title": "Luxury Rose Gold Analog Watch 1",
        "category": "Watches",
        "subcategory": "Rose Gold Analog",
        "price": 1899,
        "original_price": 3799,
        "discount": "-50%",
        "image": "images/watches/1.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 17,
        "title": "Luxury Rose Gold Analog Watch 2",
        "category": "Watches",
        "subcategory": "Rose Gold Analog",
        "price": 1899,
        "original_price": 3799,
        "discount": "-50%",
        "image": "images/watches/2.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 18,
        "title": "Classic Silver Mesh Watch",
        "category": "Watches",
        "subcategory": "Classic Silver",
        "price": 1699,
        "original_price": 3399,
        "discount": "-50%",
        "image": "images/watches/3.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 19,
        "title": "Chic Korean Party Clutch",
        "category": "Clutches",
        "subcategory": "Korean Party Clutches",
        "price": 1499,
        "original_price": 2999,
        "discount": "-50%",
        "image": "images/sources/1.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 20,
        "title": "Regal Layered Statement Necklace",
        "category": "Necklace",
        "subcategory": "Layered Statement",
        "price": 2499,
        "original_price": 4999,
        "discount": "-50%",
        "image": "images/soft necklace/1.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 21,
        "title": "Traditional Bridal Choker",
        "category": "Necklace",
        "subcategory": "Chokers",
        "price": 2199,
        "original_price": 4399,
        "discount": "-50%",
        "image": "images/soft necklace/2.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 22,
        "title": "Soft Elegant Necklace 1",
        "category": "Necklace",
        "subcategory": "Layered Statement",
        "price": 3499,
        "original_price": 6999,
        "discount": "-50%",
        "image": "images/soft necklace/3.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 23,
        "title": "Soft Elegant Necklace 2",
        "category": "Necklace",
        "subcategory": "Layered Statement",
        "price": 3799,
        "original_price": 7599,
        "discount": "-50%",
        "image": "images/soft necklace/4.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 24,
        "title": "Soft Elegant Necklace 3",
        "category": "Necklace",
        "subcategory": "Layered Statement",
        "price": 3999,
        "original_price": 7999,
        "discount": "-50%",
        "image": "images/soft necklace/5.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 25,
        "title": "Royal Antique Long Haram Set 1",
        "category": "Necklace",
        "subcategory": "Long Haram Sets",
        "price": 3499,
        "original_price": 6999,
        "discount": "-50%",
        "image": "images/necklace/1.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 26,
        "title": "Royal Antique Long Haram Set 2",
        "category": "Necklace",
        "subcategory": "Long Haram Sets",
        "price": 3799,
        "original_price": 7599,
        "discount": "-50%",
        "image": "images/necklace/2.jpeg",
        "stock_quantity": 0
    },
    {
        "id": 27,
        "title": "Royal Antique Long Haram Set 3",
        "category": "Necklace",
        "subcategory": "Long Haram Sets",
        "price": 3999,
        "original_price": 7999,
        "discount": "-50%",
        "image": "images/necklace/3.jpeg",
        "stock_quantity": 0
    }
]

with app.app_context():
    for data in products:
        product = Product(**data)
        db.session.add(product)

    db.session.commit()

print("27 products imported successfully!")