from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Seller Navi API is running'})

@app.route('/api/search', methods=['POST'])
def search_products():
    """
    Search for products based on specific criteria
    """
    data = request.get_json()
    
    # This is a placeholder - actual implementation would query Mercari or other platforms
    # and return real product data
    results = {
        'products': [
            {
                'id': '1',
                'title': 'Sample Product 1',
                'price': 3500,
                'sold_count': 12,
                'competition': 3,
                'last_sold_date': '2025-04-20',
            },
            {
                'id': '2',
                'title': 'Sample Product 2',
                'price': 5800,
                'sold_count': 8,
                'competition': 5,
                'last_sold_date': '2025-04-18',
            }
        ],
        'total': 2,
        'period': data.get('period', '30days')
    }
    
    return jsonify(results)

@app.route('/api/rankings', methods=['GET'])
def get_rankings():
    """
    Get product rankings based on sales, price, etc.
    """
    category = request.args.get('category', 'all')
    period = request.args.get('period', '30days')
    sort_by = request.args.get('sort_by', 'sales')
    
    # Placeholder data - would be replaced with actual data from scraping/API
    rankings = {
        'category': category,
        'period': period,
        'sort_by': sort_by,
        'products': [
            {
                'rank': 1,
                'title': 'Top Selling Product',
                'price': 4500,
                'sold_count': 45,
                'revenue': 202500,
                'competition': 7
            },
            {
                'rank': 2,
                'title': 'Second Best Product',
                'price': 6800,
                'sold_count': 32,
                'revenue': 217600,
                'competition': 4
            }
        ]
    }
    
    return jsonify(rankings)

@app.route('/api/subscription/check', methods=['POST'])
def check_subscription():
    """
    Check if a user's subscription is active
    """
    data = request.get_json()
    user_id = data.get('user_id')
    
    # Placeholder - would check against subscription database
    subscription = {
        'active': True,
        'expiration': '2025-12-31',
        'plan': 'premium'
    }
    
    return jsonify(subscription)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 