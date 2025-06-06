from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin
from dataclasses import dataclass
from typing import List, Optional
import time
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
from datetime import datetime

print("Starting Mercari Scraper...")

@dataclass
class ProductData:
    id: str
    name: str
    price: int
    price_text: str
    url: str
    image_url: str
    category: Optional[str] = None
    condition: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = None
    updated_at: datetime = None

class FixedMercariScraper:
    def __init__(self, mongo_client: AsyncIOMotorClient = None):
        print("Initializing scraper...")
        self.base_url = "https://jp.mercari.com"
        self.all_products = []
        self.playwright = None
        self.browser = None
        self.page = None
        # Initialize MongoDB connection
        if mongo_client is not None:
            self.db = mongo_client.mercari_search
            self.products_collection = self.db.products
        else:
            self.db = None
            self.products_collection = None
    
    async def start_browser(self):
        """Start the browser with optimized settings"""
        try:
            print("Starting browser...")
            self.playwright = await async_playwright().start()
            print("Playwright started successfully")
            
            self.browser = await self.playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-dev-shm-usage']
            )
            print("Browser launched successfully")
            
            self.page = await self.browser.new_page()
            print("New page created")
            
            await self.page.set_extra_http_headers({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            })
            print("Browser setup complete")
            
        except Exception as e:
            print(f"Error starting browser: {str(e)}")
            raise
    
    async def close_browser(self):
        """Close the browser"""
        if self.browser:
            await self.browser.close()
        if self.playwright:
            await self.playwright.stop()
    
    def validate_data(self, data: dict) -> bool:
        """Validate extracted data quality"""
        # Check if essential fields are present and valid
        if not data.get('name') or data['name'] == 'Unknown':
            return False
        if not data.get('price_text') or data['price_text'] == '¥0':
            return False
        if not data.get('url'):
            return False
        return True
    
    def extract_text_safely(self, soup, selectors: List[str], default: str = None) -> Optional[str]:
        """Safely extract text using multiple selectors with fallbacks"""
        # Filter out None values from selectors list
        selectors = [s for s in selectors if s is not None]
        
        for selector in selectors:
            try:
                # Add null check for selector
                if selector is None:
                    continue
                    
                if ':contains(' in selector:
                    # Handle contains selector differently
                    text_to_find = selector.split(':contains(')[1].split(')')[0].strip('"\'')
                    elements = soup.find_all(string=re.compile(text_to_find))
                    if elements:
                        parent = elements[0].parent
                        if parent:
                            result = parent.get_text(strip=True)
                            if result and result != default:
                                return result
                else:
                    element = soup.select_one(selector)
                    if element:
                        result = element.get_text(strip=True)
                        if result and result != default:
                            return result
            except Exception as e:
                print(f"   Warning: Selector '{selector}' failed: {e}")
                continue
        return default

    def extract_attribute_safely(self, soup, selectors: List[str], attribute: str, default: str = None) -> Optional[str]:
        """Safely extract attribute using multiple selectors"""
        # Filter out None values from selectors list
        selectors = [s for s in selectors if s is not None]
        
        for selector in selectors:
            try:
                # Add null check for selector
                if selector is None:
                    continue
                    
                element = soup.select_one(selector)
                if element:
                    result = element.get(attribute, '')
                    if result and result != default:
                        return result
            except Exception as e:
                print(f"   Warning: Selector '{selector}' failed: {e}")
                continue
        return default

    async def collect_product_urls(self, limit: int) -> List[str]:
        """Collect product URLs from the ranking page up to the limit"""
        print(f"🔍 Collecting {limit} product URLs from ranking page...")
        
        ranking_url = f"{self.base_url}/ranking"
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                # Try with a longer timeout and different wait strategy
                await self.page.goto(ranking_url, wait_until="domcontentloaded", timeout=60000)
                await self.page.wait_for_timeout(5000)  # Additional wait time
                
                # Scroll to load more products
                for _ in range(5):
                    await self.page.mouse.wheel(0, 2000)
                    await self.page.wait_for_timeout(2000)
                
                # Get the HTML content
                html_content = await self.page.content()
                soup = BeautifulSoup(html_content, 'html.parser')
                
                # Find product links using multiple selectors
                link_selectors = [
                    'a[data-testid="thumbnail-link"]',
                    'a[href*="/item/"]',
                    'a[href*="/product/"]',
                    'a[href*="/shops/product/"]',
                    'a[class*="ranking-item"]',
                    'a[class*="ranking-product"]'
                ]
                
                item_links = []
                for selector in link_selectors:
                    links = soup.select(selector)
                    item_links.extend(links)
                
                # Remove duplicates and create URLs
                unique_hrefs = list(set([link.get('href') for link in item_links if link.get('href')]))
                page_urls = [urljoin(self.base_url, href) for href in unique_hrefs]
                
                if page_urls:
                    print(f"✅ Successfully collected {len(page_urls)} URLs")
                    return page_urls[:limit]
                
                retry_count += 1
                print(f"⚠️ No URLs found, retrying ({retry_count}/{max_retries})...")
                await self.page.wait_for_timeout(5000)  # Wait before retry
                
            except Exception as e:
                retry_count += 1
                print(f"⚠️ Error collecting URLs: {str(e)}")
                print(f"Retrying ({retry_count}/{max_retries})...")
                await self.page.wait_for_timeout(5000)  # Wait before retry
        
        print("❌ Failed to collect URLs after maximum retries")
        return []

    async def extract_product_details(self, url: str) -> Optional[ProductData]:
        """Extract product details with improved data filtering"""
        try:
            print(f"📦 Processing: {url}")
            
            # Navigate to the page and wait for content to load
            try:
                await self.page.goto(url, wait_until="networkidle", timeout=30000)
                await self.page.wait_for_timeout(3000)  # Increased wait time
            except Exception as e:
                print(f"   Warning: Initial page load timeout, retrying with domcontentloaded: {e}")
                await self.page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await self.page.wait_for_timeout(3000)
            
            # Wait for key elements to be present
            try:
                await self.page.wait_for_selector('h1', timeout=5000)
            except Exception as e:
                print(f"   Warning: Could not find h1 element: {e}")
            
            html_content = await self.page.content()
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Print page title for debugging
            print(f"   Debug - Page title: {await self.page.title()}")
            
            # Extract item ID from URL with multiple patterns
            item_id = None
            id_patterns = [
                r'/item/([^/?]+)',
                r'/product/([^/?]+)',
                r'/shops/product/([^/?]+)'
            ]
            
            for pattern in id_patterns:
                match = re.search(pattern, url)
                if match:
                    item_id = match.group(1)
                    break
            
            # Extract name with updated selectors
            name_selectors = [
                'h1[data-testid="product-name"]',
                'h1[class*="heading"]',
                'h1[class*="title"]',
                'h1[class*="name"]',
                'h1',
                '[data-testid*="name"]',
                '.product-name',
                '.item-name',
                'span[data-testid="thumbnail-item-name"]'
            ]
            
            name = self.extract_text_safely(soup, name_selectors, 'Unknown')
            print(f"   Debug - Name found: {name}")
            
            # Extract price with updated selectors
            price_text = '¥0'
            price = 0
            
            price_selectors = [
                'div[class*="sc-d804af5a-9 bjxcBV mer-spacing-t-8 mer-spacing-b-16"]',
                'div[class*="sc-c5724afb-0 feUXIG sc-75176d5b-1 knGNCr mer-spacing-r-8"]',
                'div[data-testid="product-price"]'
            ]
            
            price_raw = self.extract_text_safely(soup, price_selectors, '0')
            print(f"   Debug - Raw price found: {price_raw}")
            
            if price_raw and price_raw != '0':
                # Clean price text
                price_clean = re.sub(r'[^\d,]', '', price_raw)
                if price_clean:
                    try:
                        price = int(price_clean.replace(',', ''))
                        price_text = f"¥{price_clean}"
                    except ValueError:
                        price = 0
                        price_text = '¥0'
            
            print(f"   Debug - Cleaned price: {price_text}")
            
            # Extract image with updated selectors and filtering
            image_selectors = [
                'img[data-testid="product-image"]',
                'img[class*="product-image"]',
                'img[class*="item-image"]',
                'img[alt*="商品画像"]',
                'img[alt*="product"]',
                'img[src*="mercari"]',
                'img[src*="mercari-shops-static"]',
                'img[src*="assets.mercari"]',
                'img'
            ]
            
            # Get all images and filter out tracking pixels
            all_images = []
            for selector in image_selectors:
                try:
                    images = soup.select(selector)
                    for img in images:
                        src = img.get('src', '')
                        if src and not any(x in src.lower() for x in ['bat.bing.com', 'tracking', 'pixel', 'analytics']):
                            all_images.append(src)
                except Exception as e:
                    print(f"   Warning: Image selector '{selector}' failed: {e}")
            
            # Use the first valid image URL
            image_url = next((url for url in all_images if url), '')
            print(f"   Debug - Image URL found: {image_url}")

            # --- Improved Category Extraction ---
            # Get all breadcrumb items and join them
            breadcrumb = soup.select('nav[aria-label="パンくずリスト"], nav[aria-label="breadcrumb"]')
            category = None
            
            # List of known non-category values to filter out
            non_category_values = [
                'iwaki', '松屋', '甲羅組', 'NIKE', 'ネイル工房', 'Lucille', 'SCHICK', 
                'IRIS OHAYAMA', '西川', 'ブランド', 'Brand', '出品者', 'Seller'
            ]
            
            if breadcrumb:
                items = breadcrumb[0].find_all(['a', 'span', 'div'], recursive=True)
                categories = [item.get_text(strip=True) for item in items if item.get_text(strip=True)]
                
                # Filter out non-category values
                categories = [cat for cat in categories if not any(non_cat.lower() in cat.lower() for non_cat in non_category_values)]
                
                if categories:
                    # Get the second category (main category) if it exists
                    if len(categories) >= 2:
                        category = categories[1]  # Second item is the main category
                    else:
                        category = categories[0]  # Fallback to first item if only one exists
            
            # Fallback: try category-specific selectors
            if not category:
                category_selectors = [
                    'a[href*="/search/category"]',
                    'span[data-testid="カテゴリ"]',
                    'div[class*="merBreadcrumbItem"]',
                    'div[role="listitem"]',
                    'div:contains("カテゴリ") + div'
                ]
                
                for selector in category_selectors:
                    found = soup.select(selector)
                    if found:
                        links = [link.get_text(strip=True) for link in found if link.get_text(strip=True)]
                        # Filter out non-category values
                        links = [link for link in links if not any(non_cat.lower() in link.lower() for non_cat in non_category_values)]
                        if links:
                            # Get the second category if it exists
                            if len(links) >= 2:
                                category = links[1]
                            else:
                                category = links[0]
                            break
            
            # Additional fallback: try to find category in product details
            if not category:
                detail_selectors = [
                    'div[data-testid="商品の詳細"]',
                    'div[class*="product-details"]',
                    'div[class*="item-details"]'
                ]
                
                for selector in detail_selectors:
                    details = soup.select(selector)
                    if details:
                        for detail in details:
                            text = detail.get_text(strip=True)
                            if 'カテゴリ' in text:
                                # Try to extract category after "カテゴリ"
                                parts = text.split('カテゴリ')
                                if len(parts) > 1:
                                    potential_category = parts[1].strip().split('\n')[0].strip()
                                    # Filter out non-category values
                                    if not any(non_cat.lower() in potential_category.lower() for non_cat in non_category_values):
                                        category = potential_category
                                        break
            
            # Final validation: ensure category is not empty and not a non-category value
            if category and any(non_cat.lower() in category.lower() for non_cat in non_category_values):
                category = None
                
            print(f"   Debug - Category found: {category}")

            # Extract condition
            condition_selectors = [
                'span[data-testid="商品の状態"]',
                'div:contains("商品の状態") + div',
                'div:contains("Condition") + div',
                '.condition'
            ]
            condition = self.extract_text_safely(soup, condition_selectors)
            print(f"   Debug - Condition found: {condition}")

            # Extract seller name with improved selectors
            seller_selectors = [
                'a[data-testid="seller-link"] p.bold__5616e150',
                'div[data-testid="shops-information"] p.bold__5616e150',
                'p.bold__5616e150',
                '.seller-name',
                'a[data-testid="seller-link"]',
                'div[data-testid="shops-information"]',
                'div[class*="seller"]',
                'div[class*="shops"]',
                'div:contains("出品者") + div',
                'div:contains("Seller") + div'
            ]
            seller_name = self.extract_text_safely(soup, seller_selectors)
            # Clean up seller name if it contains unwanted text
            if seller_name:
                seller_name = seller_name.replace('出品者', '').replace('Seller', '').strip()
            print(f"   Debug - Seller name found: {seller_name}")

            # Extract description
            desc_selectors = [
                'pre[data-testid="description"]',
                'div[data-testid="description"]',
                '.description',
                '.product-description'
            ]
            description_raw = self.extract_text_safely(soup, desc_selectors)
            description = None
            if description_raw:
                description = description_raw[:200] + "..." if len(description_raw) > 200 else description_raw
            print(f"   Debug - Description found: {description}")
            
            # Create product data
            product_data = {
                'id': item_id,
                'name': name,
                'price': price,
                'price_text': price_text,
                'url': url,
                'image_url': image_url,
                'category': category,
                'condition': condition,
                'seller_name': seller_name,
                'description': description
            }
            
            # Print validation details
            print("   Debug - Validation details:")
            print(f"     Name valid: {bool(product_data['name'] and product_data['name'] != 'Unknown')}")
            print(f"     Price valid: {bool(product_data['price_text'] and product_data['price_text'] != '¥0')}")
            print(f"     URL valid: {bool(product_data['url'])}")
            
            # Validate data quality
            if not self.validate_data(product_data):
                print(f"   ⚠️  Data validation failed for {url}")
                return None
            
            return ProductData(**product_data)
            
        except Exception as e:
            print(f"❌ Error processing {url}: {e}")
            return None

    async def save_products_to_mongodb(self, products: List[ProductData]):
        """Save products to MongoDB"""
        if self.products_collection is None:
            print("❌ MongoDB connection not available")
            return

        try:
            saved_count = 0
            updated_count = 0
            
            for product in products:
                # Convert product to dict
                product_dict = {
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'price_text': product.price_text,
                    'url': product.url,
                    'image_url': product.image_url,
                    'category': product.category,
                    'condition': product.condition,
                    'seller_name': product.seller_name,
                    'description': product.description,
                    'updated_at': datetime.utcnow()
                }

                # Check if product exists
                existing_product = await self.products_collection.find_one({'url': product.url})
                
                if existing_product:
                    # Update existing product
                    await self.products_collection.update_one(
                        {'url': product.url},
                        {'$set': product_dict}
                    )
                    updated_count += 1
                else:
                    # Insert new product
                    product_dict['created_at'] = datetime.utcnow()
                    await self.products_collection.insert_one(product_dict)
                    saved_count += 1

            print(f"💾 MongoDB Update Summary:")
            print(f"   ✓ New products saved: {saved_count}")
            print(f"   ✓ Existing products updated: {updated_count}")
            
        except Exception as e:
            print(f"❌ Error saving to MongoDB: {str(e)}")
            raise

    async def scrape_products(self, limit: int):
        """Scrape products from ranking page with improved filtering"""
        start_time = time.time()
        
        # Collect URLs
        product_urls = await self.collect_product_urls(limit)
        print(f"✅ Found {len(product_urls)} URLs")
        
        # Process each URL
        batch_products = []
        failed_count = 0
        
        for i, url in enumerate(product_urls, 1):
            print(f"⚡ Processing {i}/{len(product_urls)}")
            product = await self.extract_product_details(url)
            if product:
                batch_products.append(product)
                print(f"   ✓ {product.name[:50]}... - {product.price_text}")
                print(f"     Category: {product.category or 'N/A'}")
                print(f"     Seller: {product.seller_name or 'N/A'}")
            else:
                failed_count += 1
                print(f"   ✗ Failed to extract valid data")
        
        # Save to MongoDB
        if batch_products:
            await self.save_products_to_mongodb(batch_products)
            self.all_products.extend(batch_products)
        
        # Summary
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 60)
        print(f"✅ SCRAPING COMPLETED!")
        print(f"🎯 Requested: {limit} products")
        print(f"📦 Successfully scraped: {len(batch_products)} products")
        print(f"❌ Failed extractions: {failed_count}")
        print(f"⏱️  Total time: {duration:.2f} seconds")
        if product_urls:
            print(f"📊 Success rate: {len(batch_products)/len(product_urls)*100:.1f}%")
        print("=" * 60)
        
        return batch_products

    async def run_interactive(self, limit: int):
        """Run the scraper in interactive mode"""
        try:
            await self.start_browser()
            
            # Initial scrape
            print(f"🚀 Starting scrape of {limit} products from ranking page")
            await self.scrape_products(limit)
            
            while True:
                print("\nOptions:")
                print("  'r' - Scrape more products")
                print("  'q' - Quit")
                
                user_input = input("\n➤ Your choice: ").strip().lower()
                
                if user_input == 'q':
                    print("\n👋 Goodbye!")
                    break
                elif user_input == 'r':
                    print(f"\n🔄 Scraping next {limit} products...")
                    await self.scrape_products(limit)
                else:
                    print("❌ Invalid option")
                    
        finally:
            await self.close_browser()

async def main():
    """Main function"""
    try:
        print("\n🚀 MERCARI RANKING SCRAPER")
        print("=" * 60)
        
        # Connect to MongoDB
        mongo_client = AsyncIOMotorClient('mongodb://localhost:27017')
        
        # Use fixed limit of 35
        limit = 60
        print(f"📦 Scraping {limit} products from ranking page")
        
        # Start scraping
        scraper = FixedMercariScraper(mongo_client)
        await scraper.run_interactive(limit)
        
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
    except Exception as e:
        print(f"❌ Error in main: {str(e)}")
        print("Stack trace:")
        import traceback
        traceback.print_exc()
    finally:
        if 'mongo_client' in locals():
            mongo_client.close()

if __name__ == "__main__":
    print("Script started")
    asyncio.run(main())