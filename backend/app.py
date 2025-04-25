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

@app.route('/api/subscription/limits', methods=['GET'])
def get_subscription_limits():
    """
    Get the usage limits for a user based on their subscription plan
    """
    user_id = request.args.get('user_id')
    
    # In a real application, this would fetch the user's plan and usage data
    # from a database
    
    # Define limits based on subscription plans
    limits = {
        'basic': {
            'search': {
                'limit': 3,
                'used': 0
            },
            'competitor_analysis': {
                'limit': 3,
                'used': 0
            },
            'csv_export': {
                'limit': 0,
                'used': 0
            },
            'search_history_days': 0,
            'can_use_ai': False,
            'can_use_custom_tags': False,
            'priority_support': False
        },
        'standard': {
            'search': {
                'limit': 50,
                'used': 0
            },
            'competitor_analysis': {
                'limit': 50,
                'used': 0
            },
            'csv_export': {
                'limit': 5,
                'used': 0
            },
            'search_history_days': 7,
            'can_use_ai': False,
            'can_use_custom_tags': True,
            'priority_support': False
        },
        'premium': {
            'search': {
                'limit': -1,  # -1 indicates unlimited
                'used': 0
            },
            'competitor_analysis': {
                'limit': -1,
                'used': 0
            },
            'csv_export': {
                'limit': -1,
                'used': 0
            },
            'search_history_days': -1,
            'can_use_ai': True,
            'can_use_custom_tags': True,
            'priority_support': True
        }
    }
    
    # Get mock user data
    # In a real app, fetch from database
    user_plan = 'standard'
    user_usage = {
        'search': 12,
        'competitor_analysis': 8,
        'csv_export': 2
    }
    
    # Get limits for user's plan
    plan_limits = limits.get(user_plan, limits['basic']).copy()
    
    # Update used counts
    plan_limits['search']['used'] = user_usage['search']
    plan_limits['competitor_analysis']['used'] = user_usage['competitor_analysis']
    plan_limits['csv_export']['used'] = user_usage['csv_export']
    
    response = {
        'plan': user_plan,
        'limits': plan_limits
    }
    
    return jsonify(response)

@app.route('/api/subscription/update_usage', methods=['POST'])
def update_usage():
    """
    Update a user's feature usage count
    """
    data = request.get_json()
    user_id = data.get('user_id')
    feature = data.get('feature')
    increment = data.get('increment', 1)
    
    if not user_id or not feature:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Valid features
    valid_features = ['search', 'competitor_analysis', 'csv_export']
    
    if feature not in valid_features:
        return jsonify({'error': f'Invalid feature. Must be one of: {", ".join(valid_features)}'}), 400
    
    # In a real app, update usage count in database
    # For demo, just return a success message
    
    return jsonify({
        'success': True,
        'message': f'Updated {feature} usage for user {user_id}',
        'new_count': 10  # This would be the actual new count from database
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True) 