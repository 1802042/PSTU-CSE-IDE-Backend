# IDE-Backend

This repository contains the backend code for the **Knightshade.IDE** platform. It manages tasks such as handling user registration and validation, submissions, compiling code, and evaluating solutions against test cases.

## Getting Started

Follow the steps below to set up and run the backend locally.

### Prerequisites

Before you start, ensure you have the following installed:

- **Node.js**
- **Redis**
- **MongoDB**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/1802042/IDE-Backend.git
   cd OnlineJudge-Backend
   ```

2. Install all dependencies:

   ```bash
   npm install
   ```

### Configuration

1. **Start Redis instance:**  
   Ensure you have Redis running locally. You can start Redis with:

   ```bash
   redis-server
   ```

   Or run with docker image.

   ```bash
   docker run -d --name redis-email-server -p 6379:6379 redis redis-server --requirepass your_redis_password
   ```

2. **Start MongoDB instance:**  
   Make sure MongoDB is running. You can start it locally or use free cloud services.

3. **Configure environment variables:**  
   Create and configure the `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Update the necessary environment variables such as MongoDB URI, Redis settings, and any other configurations required.

### Running the Server

To start the development server:

```bash
npm run dev
```

The server should now be running on `http://localhost:PORT`, the port should be specified in your `.env` file.

### Available Scripts

- **`npm run dev`**: Runs the app in development mode with hot-reloading.

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the [MIT License](LICENSE).
