import logging
import datetime
import json
import os
from typing import Dict, Optional, Any, List

logger = logging.getLogger(__name__)

class SubscriptionManager:
    """
    Manages user subscriptions and payment processing
    """
    
    def __init__(self, db_path=None):
        """
        Initialize the subscription manager
        
        Args:
            db_path (str, optional): Path to the JSON database file
        """
        self.db_path = db_path or os.path.join(os.path.dirname(__file__), '..', 'data', 'subscriptions.json')
        self._ensure_db_exists()
    
    def _ensure_db_exists(self):
        """Ensure the subscription database file exists"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        
        if not os.path.exists(self.db_path):
            with open(self.db_path, 'w') as f:
                json.dump({'subscriptions': []}, f)
    
    def _load_db(self) -> Dict:
        """Load the subscription database"""
        try:
            with open(self.db_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading subscription database: {str(e)}")
            return {'subscriptions': []}
    
    def _save_db(self, data: Dict):
        """Save data to the subscription database"""
        try:
            with open(self.db_path, 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving to subscription database: {str(e)}")
    
    def create_subscription(self, user_id: str, plan: str, payment_method: Dict) -> Dict:
        """
        Create a new subscription for a user
        
        Args:
            user_id (str): User's unique ID
            plan (str): Subscription plan name
            payment_method (dict): Payment method details
            
        Returns:
            dict: Subscription details
        """
        # In a real implementation, this would interface with a payment processor like Stripe
        
        # Set expiration date to 30 days from now
        now = datetime.datetime.now()
        expiration = (now + datetime.timedelta(days=30)).isoformat()
        
        subscription = {
            'user_id': user_id,
            'plan': plan,
            'status': 'active',
            'created_at': now.isoformat(),
            'expires_at': expiration,
            'payment_method': payment_method,
            'payment_history': [
                {
                    'amount': self._get_plan_price(plan),
                    'date': now.isoformat(),
                    'status': 'succeeded'
                }
            ]
        }
        
        # Save to database
        db = self._load_db()
        db['subscriptions'] = [s for s in db['subscriptions'] if s.get('user_id') != user_id]  # Remove existing
        db['subscriptions'].append(subscription)
        self._save_db(db)
        
        return subscription
    
    def check_subscription(self, user_id: str) -> Dict:
        """
        Check if a user has an active subscription
        
        Args:
            user_id (str): User's unique ID
            
        Returns:
            dict: Subscription status details
        """
        db = self._load_db()
        user_subs = [s for s in db['subscriptions'] if s.get('user_id') == user_id]
        
        if not user_subs:
            return {
                'active': False,
                'message': 'No subscription found'
            }
        
        subscription = user_subs[0]
        expires_at = datetime.datetime.fromisoformat(subscription['expires_at'])
        
        is_active = expires_at > datetime.datetime.now() and subscription['status'] == 'active'
        
        return {
            'active': is_active,
            'expires_at': subscription['expires_at'],
            'plan': subscription['plan'],
            'days_remaining': (expires_at - datetime.datetime.now()).days if is_active else 0,
            'status': subscription['status']
        }
    
    def cancel_subscription(self, user_id: str) -> Dict:
        """
        Cancel a user's subscription
        
        Args:
            user_id (str): User's unique ID
            
        Returns:
            dict: Result of the cancellation
        """
        db = self._load_db()
        user_subs = [s for s in db['subscriptions'] if s.get('user_id') == user_id]
        
        if not user_subs:
            return {
                'success': False,
                'message': 'No subscription found'
            }
        
        # Update subscription status
        for sub in db['subscriptions']:
            if sub.get('user_id') == user_id:
                sub['status'] = 'cancelled'
        
        self._save_db(db)
        
        return {
            'success': True,
            'message': 'Subscription cancelled successfully'
        }
    
    def _get_plan_price(self, plan: str) -> int:
        """Get the price for a subscription plan"""
        prices = {
            'basic': 2980,
            'standard': 4980,
            'premium': 9800
        }
        
        return prices.get(plan, 4980)  # Default to standard plan price


# Example Square payment processor integration
class SquarePaymentProcessor:
    """
    Integration with Square for payment processing
    This is a placeholder for real Square API integration
    """
    
    def __init__(self, api_key=None, environment='sandbox'):
        self.api_key = api_key or os.environ.get('SQUARE_API_KEY')
        self.environment = environment
        
        # In a real implementation, we would initialize the Square client here
    
    def create_payment(self, amount: int, currency: str, source_id: str, customer_id: Optional[str] = None) -> Dict:
        """
        Create a payment with Square
        
        Args:
            amount (int): Payment amount in smallest currency unit (e.g., cents)
            currency (str): Currency code (e.g., 'JPY')
            source_id (str): Payment source ID (e.g., card nonce)
            customer_id (str, optional): Square customer ID
            
        Returns:
            dict: Payment result
        """
        # This is a placeholder - in a real implementation we would call Square's API
        
        logger.info(f"Processing payment: {amount} {currency} from source {source_id}")
        
        # Simulate API call delay
        import time
        import random
        time.sleep(random.uniform(0.5, 1.5))
        
        # Mock successful payment
        return {
            'id': f"PAY_{random.randint(10000, 99999)}",
            'status': 'COMPLETED',
            'amount': amount,
            'currency': currency,
            'created_at': datetime.datetime.now().isoformat()
        }
    
    def create_customer(self, email: str, name: str, phone: Optional[str] = None) -> Dict:
        """
        Create a new customer in Square
        
        Args:
            email (str): Customer email
            name (str): Customer name
            phone (str, optional): Customer phone number
            
        Returns:
            dict: Customer details
        """
        # This is a placeholder for a real Square API call
        
        return {
            'id': f"CUST_{random.randint(10000, 99999)}",
            'email': email,
            'name': name,
            'phone': phone,
            'created_at': datetime.datetime.now().isoformat()
        } 