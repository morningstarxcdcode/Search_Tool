import asyncio
import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import json
import re
from urllib.parse import urljoin
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
import time
from app.schemas.search import SearchResult
from app.utils.logger import setup_logger
from motor.motor_asyncio import AsyncIOMotorDatabase
from concurrent.futures import ThreadPoolExecutor

logger = setup_logger(__name__)

# Set Windows event loop policy
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

@dataclass
class ProductData:
    id: str
    name: str
    price: int
    price_text: str
    url: str
    image_url: str
    brand: Optional[str] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    seller_name: Optional[str] = None
    description: Optional[str] = None

class MercariScraper:
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
        self.base_url = "https://jp.mercari.com"
        self.driver = None
        self.executor = ThreadPoolExecutor(max_workers=1)
    
    def _start_browser_sync(self):
        """Start the browser with optimized settings"""
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.set_window_size(1920, 1080)
    
    async def start_browser(self):
        """Start the browser in a thread pool"""
        await asyncio.get_event_loop().run_in_executor(self.executor, self._start_browser_sync)
    
    def _close_browser_sync(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
    
    async def close_browser(self):
        """Close the browser in a thread pool"""
        await asyncio.get_event_loop().run_in_executor(self.executor, self._close_browser_sync)
    
    def validate_data(self, data: dict) -> bool:
        """Validate extracted data quality"""
        if not data.get('name') or data['name'] == 'Unknown':
            return False
        if not data.get('price_text') or data['price_text'] == '¥0':
            return False
        if not data.get('url'):
            return False
        return True
    
    def extract_text_safely(self, soup, selectors: List[str], default: str = None) -> Optional[str]:
        """Safely extract text using multiple selectors"""
        for selector in selectors:
            try:
                element = soup.select_one(selector)
                if element:
                    result = element.get_text(strip=True)
                    if result and result != default:
                        return result
            except Exception as e:
                logger.warning(f"Selector '{selector}' failed: {e}")
                continue
        return default

    def extract_attribute_safely(self, soup, selectors: List[str], attribute: str, default: str = None) -> Optional[str]:
        """Safely extract attribute using multiple selectors"""
        for selector in selectors:
            try:
                element = soup.select_one(selector)
                if element:
                    result = element.get(attribute, '')
                    if result and result != default:
                        return result
            except Exception as e:
                logger.warning(f"Selector '{selector}' failed: {e}")
                continue
        return default

    def _collect_product_urls_sync(self, keyword: str, min_price: Optional[int] = None, max_price: Optional[int] = None, 
                           category: Optional[str] = None, sort_by: Optional[str] = None, limit: int = 5) -> List[str]:
        """Collect product URLs up to the limit"""
        logger.info(f"Collecting {limit} product URLs for '{keyword}'...")
        
        search_url = f"{self.base_url}/search?keyword={keyword}"
        if min_price:
            search_url += f"&price_min={min_price}"
        if max_price:
            search_url += f"&price_max={max_price}"
        if category:
            search_url += f"&category_id={category}"
        if sort_by:
            search_url += f"&sort={sort_by}"
        
        self.driver.get(search_url)
        time.sleep(3)
        
        all_urls = []
        page_num = 1
        
        while len(all_urls) < limit:
            logger.info(f"Page {page_num} - Found: {len(all_urls)}/{limit}")
            
            for _ in range(5):
                self.driver.execute_script("window.scrollBy(0, 2000);")
                time.sleep(1)
            
            html_content = self.driver.page_source
            soup = BeautifulSoup(html_content, 'html.parser')
            
            link_selectors = [
                'a[data-testid="thumbnail-link"]',
                'a[href*="/item/"]',
                'a[href*="/product/"]',
                'a[href*="/shops/product/"]'
            ]
            
            item_links = []
            for selector in link_selectors:
                links = soup.select(selector)
                item_links.extend(links)
            
            unique_hrefs = list(set([link.get('href') for link in item_links if link.get('href')]))
            page_urls = [urljoin(self.base_url, href) for href in unique_hrefs]
            
            new_urls = [url for url in page_urls if url not in all_urls]
            all_urls.extend(new_urls)
            
            if len(all_urls) >= limit:
                break
            
            if not new_urls:
                next_button = soup.select_one('a[data-testid="pagination-next-button"], a:contains("次へ"), a[aria-label*="次"]')
                if not next_button:
                    break
                
                next_url = urljoin(self.base_url, next_button.get('href', ''))
                self.driver.get(next_url)
                time.sleep(2)
                page_num += 1
        
        return all_urls[:limit]

    async def collect_product_urls(self, keyword: str, min_price: Optional[int] = None, max_price: Optional[int] = None, 
                           category: Optional[str] = None, sort_by: Optional[str] = None, limit: int = 20) -> List[str]:
        """Collect product URLs in a thread pool"""
        return await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self._collect_product_urls_sync,
            keyword, min_price, max_price, category, sort_by, limit
        )

    def _extract_product_details_sync(self, url: str) -> Optional[ProductData]:
        """Extract product details"""
        try:
            logger.info(f"Processing: {url}")
            
            self.driver.get(url)
            time.sleep(2)
            
            html_content = self.driver.page_source
            soup = BeautifulSoup(html_content, 'html.parser')
            
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
            
            name_selectors = [
                'span[data-testid="thumbnail-item-name"]',
                'h1.heading__a7d91561',
                'h1[data-testid="product-name"]',
                'h1[class*="heading"]',
                '.itemName__a6f874a2',
                'h1'
            ]
            
            name = self.extract_text_safely(soup, name_selectors, 'Unknown')
            
            price_selectors = [
                'span.number__6b270ca7',
                'div[data-testid="price"] span:last-child',
                '.merPrice .number__6b270ca7',
                'span[class*="price"]',
                'div[class*="price"] span'
            ]
            
            price_text = self.extract_text_safely(soup, price_selectors, '¥0')
            price = 0
            
            if price_text:
                price_match = re.search(r'[\d,]+', price_text)
                if price_match:
                    price_str = price_match.group(0).replace(',', '')
                    try:
                        price = int(price_str)
                    except ValueError:
                        price = 0
            
            image_selectors = [
                'img[data-testid="product-image"]',
                'img[loading="eager"]',
                'img[decoding="async"]',
                'img[data-xblocker="passed"]',
                'img[fetchpriority="auto"]',
                'img[class*="product-image"]',
                'img[class*="item-image"]',
            ]
            
            image_url = self.extract_attribute_safely(soup, image_selectors, 'src')
            if not image_url:
                image_url = self.extract_attribute_safely(soup, image_selectors, 'data-src')
            
            if not image_url:
                image_url = "https://static.mercdn.net/thumb/photos/m123456789_1.jpg"
            
            if image_url and not image_url.startswith(('http://', 'https://')):
                image_url = urljoin(self.base_url, image_url)
            
            brand_selectors = [
                'span[data-testid="brand"]',
                'div:contains("ブランド") + div',
                'div:contains("Brand") + div',
                '.brand'
            ]
            
            brand = self.extract_text_safely(soup, brand_selectors)
            
            category_selectors = [
                'span[class*="merTextLink sc-3acb98-0 dtocME"]',
                'a[href*="/category/"]',
                'a[data-location="item_details:item_info:category_link"]',
            ]

            category = self.extract_text_safely(soup, category_selectors)
            breadcrumb_selectors = [
                'nav[data-testid="breadcrumb"] a',
                '.breadcrumb a',
                'nav[aria-label*="breadcrumb"] a'
            ]
            
            for selector in breadcrumb_selectors:
                try:
                    category_links = soup.select(selector)
                    if category_links:
                        categories = [link.get_text(strip=True) for link in category_links if link.get_text(strip=True)]
                        if categories:
                            category = ' > '.join(categories)
                            break
                except Exception:
                    continue
            
            condition_selectors = [
                'span[data-testid="商品の状態"]',
                'div:contains("商品の状態") + div',
                'div:contains("Condition") + div',
                '.condition'
            ]
            
            condition = self.extract_text_safely(soup, condition_selectors)
            
            seller_selectors = [
                'a[data-testid="seller-link"] p.bold__5616e150',
                'div[data-testid="shops-information"] p.bold__5616e150',
                'p.bold__5616e150',
                '.seller-name'
            ]
            
            seller_name = self.extract_text_safely(soup, seller_selectors)
            
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
            
            product_data = {
                'id': item_id,
                'name': name,
                'price': price,
                'price_text': price_text,
                'url': url,
                'image_url': image_url,
                'brand': brand,
                'category': category,
                'condition': condition,
                'seller_name': seller_name,
                'description': description
            }
            
            if not self.validate_data(product_data):
                logger.warning(f"Data validation failed for {url}")
                return None
            
            return ProductData(**product_data)
            
        except Exception as e:
            logger.error(f"Error processing {url}: {e}")
            return None

    async def extract_product_details(self, url: str) -> Optional[ProductData]:
        """Extract product details in a thread pool"""
        return await asyncio.get_event_loop().run_in_executor(
            self.executor,
            self._extract_product_details_sync,
            url
        )

    async def search_items(
        self,
        keyword: str,
        min_price: Optional[int] = None,
        max_price: Optional[int] = None,
        category: Optional[str] = None,
        sort_by: Optional[str] = None,
        limit: int = 10
    ) -> tuple[List[SearchResult], Optional[Dict[str, Any]]]:
        """Search for items on Mercari and return results"""
        try:
            logger.info(f"Starting search for keyword: {keyword}")
            await self.start_browser()
            
            product_urls = await self.collect_product_urls(
                keyword=keyword,
                min_price=min_price,
                max_price=max_price,
                category=category,
                sort_by=sort_by,
                limit=limit
            )
            
            if not product_urls:
                logger.warning(f"No product URLs found for keyword: {keyword}")
                return [], None
            
            results = []
            for i, url in enumerate(product_urls, 1):
                try:
                    logger.info(f"Processing {i}/{len(product_urls)}: {url}")
                    product = await self.extract_product_details(url)
                    if product:
                        search_result = SearchResult(
                            id=product.id,
                            name=product.name,
                            price=product.price,
                            price_text=product.price_text,
                            url=product.url,
                            image_url=product.image_url,
                            brand=product.brand,
                            category=product.category,
                            condition=product.condition,
                            seller_name=product.seller_name,
                            description=product.description
                        )
                        results.append(search_result)
                except Exception as e:
                    logger.error(f"Error processing URL {url}: {str(e)}")
                    continue
            
            logger.info(f"Search completed. Found {len(results)} valid products")
            
            search_data = None
            if self.db and results:
                search_data = {
                    "keyword": keyword,
                    "results": [result.model_dump() for result in results],
                    "created_at": time.time()
                }
            
            return results, search_data
            
        except Exception as e:
            logger.error(f"Error in search_items: {str(e)}", exc_info=True)
            raise
        finally:
            try:
                await self.close_browser()
            except Exception as e:
                logger.error(f"Error closing browser: {str(e)}") 