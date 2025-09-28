# Grocery Price Comparison App

A web application that helps you find the best prices for grocery items across multiple stores. Search for any product and compare prices to save money on your shopping.

## Features

- 🔍 **Smart Search**: Search for grocery items across multiple stores
- 🏪 **Multi-Store Support**: Currently supports Real Canadian Superstore (more stores coming soon)
- 📊 **Price Comparison**: Select products from different stores and compare prices side-by-side
- 💰 **Savings Calculator**: See how much you can save by choosing the best price
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⚡ **Fast & Clean UI**: Simple, intuitive interface focused on getting you results quickly

## How It Works

1. **Search**: Enter a product name (e.g., "Cut Macaroni Pasta")
2. **Select**: Choose similar products from different stores
3. **Compare**: View prices side-by-side and find the best deal

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Web Scraping**: Cheerio + Axios
- **Architecture**: Extensible store adapter pattern for easy addition of new stores

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd groceries
   ```

2. Install dependencies for both server and client:
   ```bash
   npm run install:all
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 3001) and frontend development server (port 5173).

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
groceries/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── App.tsx         # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── stores/             # Store adapters
│   │   ├── base.js         # Base store interface
│   │   ├── realCanadianSuperstore.js
│   │   └── index.js        # Store registry
│   ├── routes/             # API routes
│   └── index.js            # Server entry point
└── package.json
```

## Adding New Stores

The application is designed to be easily extensible. To add a new grocery store:

1. Create a new store adapter in `server/stores/` that extends the `BaseStore` class
2. Implement the required methods: `searchProducts()` and `getProductDetails()`
3. Register the new store in `server/stores/index.js`

Example:
```javascript
// server/stores/newStore.js
const BaseStore = require('./base');

class NewStore extends BaseStore {
  constructor() {
    super('New Store Name', 'https://newstore.com');
  }

  async searchProducts(searchTerm) {
    // Implement store-specific search logic
  }

  async getProductDetails(productId) {
    // Implement store-specific product details logic
  }
}

module.exports = NewStore;
```

## API Endpoints

- `GET /api/stores` - Get list of available stores
- `GET /api/stores/search?q=<search_term>` - Search products across all stores
- `GET /api/stores/:storeId/product/:productId` - Get detailed product information

## Development

### Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run server:dev` - Start only the backend server
- `npm run client:dev` - Start only the frontend development server
- `npm run build` - Build the frontend for production
- `npm start` - Start the production server

### Environment Variables

Create a `.env` file in the root directory:

```
PORT=3001
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- [ ] Add more grocery stores (Metro, Loblaws, etc.)
- [ ] Product image optimization and caching
- [ ] Price history tracking
- [ ] User accounts and shopping lists
- [ ] Mobile app
- [ ] Price alerts and notifications
- [ ] Store location integration

## License

MIT License - see LICENSE file for details

## Disclaimer

This application is for educational and personal use only. Please respect the terms of service of the grocery store websites and use responsibly. Web scraping should be done ethically and in compliance with robots.txt and rate limiting.
