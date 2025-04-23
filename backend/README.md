# Seller Navi Backend

This is the backend service for the Seller Navi e-commerce research tool. It provides APIs for product search, seller analysis, and subscription management.

## Features

- Product search and ranking from Mercari
- Seller performance analysis
- Subscription management with Square payment integration
- Imported product detection and analysis

## Setup

### Requirements

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install the required dependencies:

```bash
pip install -r requirements.txt
```

4. Set up environment variables:

```bash
# Create a .env file in the backend directory
SQUARE_API_KEY=your_square_api_key  # Only needed if using Square payments
FLASK_ENV=development  # Use 'production' for production environment
```

## Running the Server

To start the development server:

```bash
python app.py
```

The server will start on http://localhost:5000 by default.

## API Endpoints

### Product Search
- `POST /api/search` - Search for products with filters

### Rankings
- `GET /api/rankings` - Get product rankings

### Subscription
- `POST /api/subscription/check` - Check subscription status
- `POST /api/subscription/create` - Create a new subscription
- `POST /api/subscription/cancel` - Cancel a subscription

## Development

### Project Structure

- `app.py` - Main application entry point
- `utils/` - Utility modules
  - `scraper.py` - Web scraping utilities
  - `subscription.py` - Subscription management
- `config/` - Configuration files
- `resources/` - API resource definitions
- `static/` - Static files
- `templates/` - HTML templates (if needed)

### Adding New Features

To add new endpoints, create a new resource in the `resources` directory and register it in `app.py`.

## Deployment

For production deployment, it's recommended to:

1. Use Gunicorn as a WSGI server
2. Set up a reverse proxy (like Nginx)
3. Use a process manager (like Supervisor)

Example Gunicorn command:

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
``` 