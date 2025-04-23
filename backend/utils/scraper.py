import requests
from bs4 import BeautifulSoup
import time
import random
import json
import logging

logger = logging.getLogger(__name__)

class MercariScraper:
    """
    A utility class to scrape product data from Mercari
    """
    
    def __init__(self):
        self.base_url = "https://jp.mercari.com"
        self.search_url = f"{self.base_url}/search"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9,ja;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        }
    
    def search_products(self, keyword, category=None, status="sold_out", sort="created_time", limit=100):
        """
        Search for products on Mercari with specific filters
        
        Args:
            keyword (str): Search keyword
            category (str, optional): Category ID
            status (str, optional): Filter by status ('on_sale', 'sold_out')
            sort (str, optional): Sort order ('created_time', 'price_asc', 'price_desc')
            limit (int, optional): Maximum number of products to fetch
            
        Returns:
            list: List of product dictionaries
        """
        params = {
            "keyword": keyword,
            "status": status,
            "sort": sort,
        }
        
        if category:
            params["category_id"] = category
        
        try:
            # This is a placeholder - in a real implementation, we would 
            # make requests to Mercari's API or scrape the website
            logger.info(f"Searching Mercari with params: {params}")
            
            # Simulate API request delay
            time.sleep(random.uniform(1, 3))
            
            # Return mock data for demonstration
            return self._get_mock_data(limit)
            
        except Exception as e:
            logger.error(f"Error searching products: {str(e)}")
            return []
    
    def get_seller_products(self, seller_id, period_days=90, status="sold_out"):
        """
        Get products from a specific seller within a time period
        
        Args:
            seller_id (str): Seller's ID
            period_days (int): Number of days to look back
            status (str): Filter by status ('on_sale', 'sold_out')
            
        Returns:
            list: List of product dictionaries
        """
        try:
            # In a real implementation, we would fetch the seller's page
            # and extract all their products
            logger.info(f"Getting products for seller {seller_id} over {period_days} days")
            
            # Simulate API request delay
            time.sleep(random.uniform(1, 3))
            
            # Return mock data
            return self._get_mock_seller_data(seller_id, period_days)
            
        except Exception as e:
            logger.error(f"Error getting seller products: {str(e)}")
            return []
    
    def _get_mock_data(self, limit):
        """Generate mock product data for testing"""
        products = []
        for i in range(limit):
            price = random.randint(1000, 10000)
            sold_count = random.randint(1, 50)
            
            product = {
                "id": f"m{random.randint(10000000, 99999999)}",
                "title": f"Mock Product {i+1} - Imported Item",
                "price": price,
                "sold_count": sold_count,
                "revenue": price * sold_count,
                "sold_date": f"2025-{random.randint(1, 4)}-{random.randint(1, 28)}",
                "image_url": f"https://static.mercdn.net/item/detail/orig/photos/m{random.randint(10000000, 99999999)}_1.jpg",
                "competition": random.randint(1, 10),
                "is_import": random.choice([True, True, True, False]),  # Biased towards imports
            }
            products.append(product)
        
        return products
    
    def _get_mock_seller_data(self, seller_id, period_days):
        """Generate mock seller data for testing"""
        total_products = random.randint(20, 100)
        products = []
        
        for i in range(total_products):
            price = random.randint(1000, 10000)
            sold_count = random.randint(1, 20)
            days_ago = random.randint(1, period_days)
            
            product = {
                "id": f"m{random.randint(10000000, 99999999)}",
                "title": f"Seller {seller_id} Product {i+1}",
                "price": price,
                "sold_count": sold_count,
                "revenue": price * sold_count,
                "sold_date": f"{period_days - days_ago} days ago",
                "image_url": f"https://static.mercdn.net/item/detail/orig/photos/m{random.randint(10000000, 99999999)}_1.jpg",
                "seller_id": seller_id,
                "is_import": random.choice([True, True, False]),  # Biased towards imports
            }
            products.append(product)
        
        return products


# Utility functions for data analysis

def calculate_competition(products, keyword=None):
    """
    Calculate competition level for a keyword or set of products
    
    Args:
        products (list): List of product dictionaries
        keyword (str, optional): Specific keyword to filter by
        
    Returns:
        dict: Competition metrics
    """
    if keyword:
        # Filter products by keyword
        products = [p for p in products if keyword.lower() in p.get('title', '').lower()]
    
    if not products:
        return {
            "competition_level": "Unknown",
            "seller_count": 0,
            "average_price": 0,
            "price_range": [0, 0]
        }
    
    # Count unique sellers
    sellers = set([p.get('seller_id') for p in products if p.get('seller_id')])
    seller_count = len(sellers)
    
    # Calculate price metrics
    prices = [p.get('price', 0) for p in products]
    avg_price = sum(prices) / len(prices) if prices else 0
    price_range = [min(prices), max(prices)] if prices else [0, 0]
    
    # Determine competition level
    if seller_count <= 3:
        competition_level = "Low"
    elif seller_count <= 10:
        competition_level = "Medium"
    else:
        competition_level = "High"
    
    return {
        "competition_level": competition_level,
        "seller_count": seller_count,
        "average_price": avg_price,
        "price_range": price_range
    } 