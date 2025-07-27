# 🍃 MongoDB Viewer

A modern web application to visualize and explore your MongoDB databases. Built with React, Vite, and Express.

## Features

- 🔌 Connect to any MongoDB instance using connection string
- 📊 Browse databases and collections
- 📋 View documents with pretty JSON formatting
- 🖥️ Clean, modern interface
- ⚡ Fast and responsive

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance (local or remote)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Application

Run both frontend and backend:

```bash
npm start
```

Or run them separately:

```bash
# Terminal 1 - Backend server
npm run server

# Terminal 2 - Frontend development server
npm run dev
```

### 3. Open the Application

Navigate to `http://localhost:5173` in your browser.

## Connection Examples

### Local MongoDB

```
mongodb://localhost:27017
```

### MongoDB Atlas

```
mongodb+srv://username:password@cluster.mongodb.net/
```

### MongoDB with Authentication

```
mongodb://username:password@host:port/database
```

## Project Structure

```
mongodb-viewer/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Application styles
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── server.js            # Express backend server
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## API Endpoints

The backend provides these REST endpoints:

- `POST /api/connect` - Connect to MongoDB
- `GET /api/databases` - List all databases
- `GET /api/collections/:dbName` - List collections in a database
- `GET /api/documents/:dbName/:collectionName` - Get documents from a collection
- `GET /api/stats/:dbName/:collectionName` - Get collection statistics
- `POST /api/disconnect` - Disconnect from MongoDB
- `GET /api/health` - Health check

## Development

### Frontend Only

```bash
npm run dev
```

### Backend Only

```bash
npm run server
```

### Build for Production

```bash
npm run build
```

## Security Notes

- This application is intended for development/testing purposes
- Always use strong authentication for production MongoDB instances
- Consider network security when exposing MongoDB connections
- The backend runs on port 3001, frontend on port 5173

## Technologies Used

- **Frontend**: React 19, Vite, Axios
- **Backend**: Express.js, MongoDB Node.js Driver
- **Styling**: Modern CSS with Flexbox/Grid
- **Development**: Concurrently for running multiple processes

## License

MIT License - feel free to use this project for your own purposes!+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
