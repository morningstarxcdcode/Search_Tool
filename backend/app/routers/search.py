from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.services.mercari_scraper import MercariScraper
from app.schemas.search import SearchRequest, SearchResponse, SearchResult
from app.database import get_database
from app.utils.logger import setup_logger
import traceback
from typing import List, Tuple

router = APIRouter()
logger = setup_logger(__name__)

@router.post("/search", response_model=SearchResponse)
async def search_items(
    request: SearchRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> SearchResponse:
    """Search for items on Mercari"""
    scraper = None
    try:
        logger.info(f"Received search request: {request.model_dump()}")
        
        # Initialize scraper
        scraper = MercariScraper(db)
        
        # Perform search and await the results
        search_results: Tuple[List[SearchResult], dict] = await scraper.search_items(
            keyword=request.keyword,
            min_price=request.min_price,
            max_price=request.max_price,
            category=request.category,
            sort_by=request.sort_by,
            limit=request.limit
        )
        
        # Unpack the results
        results, search_data = search_results
        
        # Save search results to database if available
        if search_data:
            try:
                await db.searches.insert_one(search_data)
                logger.info("Search results saved to database")
            except Exception as e:
                logger.error(f"Error saving to database: {str(e)}", exc_info=True)
                # Continue even if database save fails
        
        logger.info(f"Search completed successfully. Found {len(results)} results")
        
        # Create and return response
        return SearchResponse(results=results)
        
    except Exception as e:
        error_msg = f"Error in search endpoint: {str(e)}\n{traceback.format_exc()}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Ensure browser is closed even if an error occurs
        if scraper:
            try:
                await scraper.close_browser()
            except Exception as e:
                logger.error(f"Error closing browser in finally block: {str(e)}") 