# 🇨🇦 Canadian Grocery Price Comparison

A modern web application that helps Canadian families find the best grocery prices across major Canadian retail chains. Search for any product and compare prices in real-time to make smarter shopping decisions and save money.

## 🏪 Supported Canadian Stores

- **Real Canadian Superstore** - Loblaws' flagship discount chain
- **Safeway** - Premium grocery chain with locations across Canada  
- **No Frills** - Loblaws' no-frills discount grocery stores
- **Sobeys** - One of Canada's largest grocery retailers
- **Save-On-Foods** - Western Canadian grocery chain
- **Walmart Canada** - Walmart's Canadian grocery operations

## ✨ Features

- 🔍 **Progressive Search**: Real-time results with live updates as stores are scraped
- 🏪 **Multi-Store Support**: Compare prices across multiple grocery stores
- 📊 **Price Comparison**: Select products from different stores and compare side-by-side
- 💰 **Savings Calculator**: See exactly how much you can save by choosing the best price
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ⚡ **Fast & Clean UI**: Modern, intuitive interface built with React and Tailwind CSS
- 🔄 **Live Updates**: Progressive loading shows results as they become available
- 🎯 **Expandable Store Results**: Collapse/expand individual store results for better organization

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for beautiful, consistent icons
- **Axios** for API communication

### Backend
- **Node.js** with Express.js framework
- **Puppeteer** for web scraping with headless Chrome
- **CORS** enabled for cross-origin requests
- **dotenv** for environment configuration

### Architecture
- **Modular Store Adapters**: Extensible pattern for easy addition of new stores
- **Base Store Class**: Shared functionality for all store implementations
- **Progressive Loading**: Streaming search results for better UX
- **Component-based Frontend**: Organized by feature domains
- **TypeScript Types**: Comprehensive type definitions for all data structures

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Chrome/Chromium** (for Puppeteer web scraping)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd groceries
   ```

2. **Install dependencies for both server and client:**
   ```bash
   npm run install:all
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following variables:
   ```env
   PORT=3001
   NODE_ENV=development
   DEBUG_SCRAPING=false
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   This starts:
   - Backend server on `http://localhost:3001`
   - Frontend development server on `http://localhost:5173`

5. **Open your browser and navigate to `http://localhost:5173`**

## 📁 Project Structure

```
groceries/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/              # React components organized by feature
│   │   │   ├── search/              # Search-related components
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── ProgressiveSearchResults.tsx
│   │   │   │   └── index.ts
│   │   │   ├── comparison/          # Price comparison components
│   │   │   │   ├── PriceComparison.tsx
│   │   │   │   └── index.ts
│   │   │   ├── common/              # Shared/common components
│   │   │   │   ├── ProductCard.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── StoreList.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts             # Component barrel exports
│   │   ├── services/                # API and external services
│   │   │   └── streamingApi.ts      # Progressive search API client
│   │   ├── types/                   # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── constants/               # Application constants
│   │   │   ├── stores.ts            # Store definitions and metadata
│   │   │   └── index.ts
│   │   ├── utils/                   # Utility functions
│   │   │   ├── price.ts             # Price formatting and calculations
│   │   │   └── index.ts
│   │   ├── App.tsx                  # Main application component
│   │   ├── main.tsx                 # Application entry point
│   │   └── index.css                # Global styles
│   ├── package.json
│   └── vite.config.ts
├── server/                          # Node.js backend application
│   ├── stores/                      # Store adapter implementations
│   │   ├── base.js                  # Base store class with shared functionality
│   │   ├── realCanadianSuperstore.js
│   │   ├── safeway.js
│   │   ├── noFrills.js
│   │   ├── sobeys.js
│   │   ├── saveOnFoods.js
│   │   ├── walmart.js
│   │   └── index.js                 # Store registry and management
│   ├── routes/                      # Express.js route handlers
│   │   └── stores.js                # Store-related API endpoints
│   ├── middleware/                  # Express middleware
│   │   └── errorHandler.js          # Global error handling
│   ├── utils/                       # Server utilities
│   │   └── logger.js                # Enhanced logging utility
│   ├── config/                      # Configuration management
│   │   └── index.js                 # Application configuration
│   └── index.js                     # Server entry point
└── package.json                     # Root package.json with scripts
```

## 🔌 API Endpoints

### Store Management
- `GET /api/stores` - Get list of all available stores
- `GET /api/stores/search/stream?q=<search_term>` - Progressive search with server-sent events for real-time results
- `GET /api/stores/:storeId/product/:productId` - Get detailed product information

## 🏗 Adding New Canadian Stores

The application uses an extensible store adapter pattern. To add a new Canadian grocery store:

1. **Create a new store adapter** in `server/stores/`:
   ```javascript
   // server/stores/newStore.js
   const BaseStore = require('./base');

   class NewStore extends BaseStore {
     constructor() {
       super('New Store Name', 'https://newstore.ca');
     }

     getSelectors() {
       return {
         products: ['.product-item', '.product-card'],
         name: '.product-name',
         price: '.price',
         image: '.product-image img'
       };
     }

     getSearchUrl(searchTerm) {
       return `${this.baseUrl}/search?q=${encodeURIComponent(searchTerm)}`;
     }

     async extractProducts(page, searchTerm) {
       // Implement store-specific product extraction logic
       return await page.evaluate(() => {
         // Extract product data from page
       });
     }
   }

   module.exports = NewStore;
   ```

2. **Register the store** in `server/stores/index.js`:
   ```javascript
   const NewStore = require('./newStore');
   
   const stores = {
     // ... existing stores
     'new-store': new NewStore(),
   };
   ```

3. **Add store metadata** in `client/src/constants/stores.ts`:
   ```typescript
   export const CANADIAN_STORES: StoreInfo[] = [
     // ... existing stores
     {
       id: 'new-store',
       name: 'New Store',
       displayName: 'New Store',
       color: 'bg-purple-600',
       website: 'https://newstore.ca',
     },
   ];
   ```

## 🧪 Development Scripts

```bash
# Development
npm run dev              # Start both frontend and backend in development mode
npm run server:dev       # Start only the backend server with nodemon
npm run client:dev       # Start only the frontend with Vite

# Building
npm run build           # Build the frontend for production
npm start              # Start the production server

# Maintenance
npm run install:all    # Install dependencies for both client and server
npm run clean         # Clean node_modules and reinstall everything
npm run lint          # Run ESLint on the client code

# Testing
npm run test:api      # Test API endpoints with curl
```

## 🌍 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Scraping Configuration
DEBUG_SCRAPING=false

# Frontend URL (for production CORS)
FRONTEND_URL=https://your-domain.com
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Rate Limiting & Ethics

- **Respectful Scraping**: Implements delays and rate limiting to avoid overwhelming store servers
- **User-Agent Rotation**: Uses realistic browser user agents
- **Error Handling**: Graceful fallbacks when stores are unavailable
- **Caching**: Results are not cached to ensure real-time pricing

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and personal use only. Please respect the terms of service of the grocery store websites. Web scraping should be done ethically and in compliance with robots.txt files and reasonable rate limiting.

**Note**: This tool is designed specifically for Canadian grocery stores and may not work with international retailers due to different website structures and currencies.

---

**Made with ❤️ for Canadian families looking to save money on groceries** 🇨🇦
