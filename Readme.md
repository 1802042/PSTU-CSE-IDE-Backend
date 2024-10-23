# PSTU CSE IDE Backend

This repository contains the backend code for the **PSTU CSE IDE** platform. It offers a robust and secure backend system that manages user registration, authentication, email verification, and code execution across multiple programming languages such as C/C++, Java, Python, and JavaScript. The backend is equipped with JWT-based authentication (with access and refresh tokens), and supports password reset, code submission, execution, result tracking, and analytics in a secure sandboxed environment powered by jude0.

---

## Features

- **User Registration**: Validates user data and stores securely in MongoDB.
- **Email Verification**: Uses short-lived JWT tokens for verifying user email.
- **Login/Logout**: Secure authentication using access and refresh tokens.
- **Token Refresh**: Supports access token regeneration using refresh tokens.
- **Code Submission**: Supports multiple languages (C/C++, Java, Python, JavaScript).
- **Code Execution**: Runs code against test case.
- **Sandboxed Code Execution**: All code execution is securely sandboxed in the jude0 engine.
- **Execution Analytics**: Provides analysis for code submissions.

---

## Getting Started

Follow these steps to set up and run the backend locally.

### Prerequisites

Ensure the following are installed on your system:

- **Node.js**
- **Redis**
- **MongoDB**
- **Docker**
- **Docker Compose**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/1802042/IDE-Backend.git
   cd IDE-Backend
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### Configuration

#### 1. Start Redis Instance

Ensure Redis is running locally. You can use Docker to run Redis:

```bash
docker run -d --name redis-email-server -p 6379:6379 redis redis-server --requirepass your_redis_password
```

#### 2. Start MongoDB Instance

Start MongoDB using Docker:

```bash
docker run -d    --name mongodb-container    -e MONGO_INITDB_ROOT_USERNAME=your-username    -e MONGO_INITDB_ROOT_PASSWORD=your-password    -p 27017:27017    mongo
```

#### 3. Start the Code Execution Engine

Update the `jude0.conf` file and then run the following commands:

```bash
cd CEE
sudo docker compose up -d db redis
sleep 10s
sudo docker compose up -d
sleep 5s
```

#### 4. Set Up Environment Variables

Create and configure the `.env` file by copying from the example:

```bash
cp .env.example .env
```

Update variables like MongoDB URI, Redis settings, and others as necessary.

### Running the Server

To start the development server, run:

```bash
npm run dev
```

The server should now be running on `http://localhost:PORT`, where `PORT` is defined in your `.env` file.

---

## API Documentation

[API Documentation](https://documenter.getpostman.com/view/37232184/2sAY4rEjvM)

### Authentication Routes

- **POST** `/api/v1/users/register`: Registers a new user.
- **POST** `/api/v1/users/login`: Logs in a user and returns access and refresh tokens.
- **GET** `/api/v1/users/logout`: Logs out a user by invalidating refresh tokens.

### Code Submission Routes

- **POST** `/api/v1/submissions/submit`: Submits code in any supported language and runs it against test cases.
- **POST** `/api/v1/submissions/result/:token`: Runs the submitted code with a custom input file.

This section can be expanded with detailed request/response examples.

---

## System Architecture

<!-- ```markdown
![System Architecture](./images/system-architecture.png)
``` -->

---

## Available Scripts

- **`npm run dev`**: Runs the app in development mode with hot-reloading.
- **`npm run start`**: Runs the app in production mode.

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## License
