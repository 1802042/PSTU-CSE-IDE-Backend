# PSTU CSE IDE Backend

<div align="center">
  
  A robust backend system for the PSTU CSE IDE platform, providing secure user management, code execution, and analytics.
  
  [![GitHub License](https://img.shields.io/github/license/1802042/IDE-Backend)](https://github.com/1802042/IDE-Backend/blob/main/LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/1802042/IDE-Backend)](https://github.com/1802042/IDE-Backend/stargazers)
  [![GitHub Issues](https://img.shields.io/github/issues/1802042/IDE-Backend)](https://github.com/1802042/IDE-Backend/issues)
  [![API Docs](https://img.shields.io/badge/API-Documentation-blue)](https://documenter.getpostman.com/view/37232184/2sAY4rEjvM)
</div>

## 🚀 Features

### 👤 User Management
- Secure user registration with data validation
- Email verification using short-lived JWT tokens
- Login/Logout functionality with JWT-based authentication
- Password reset capabilities
- Access and refresh token system

### 💻 Code Execution
- Support for multiple programming languages:
  - C/C++
  - Java
  - Python
  - JavaScript
- Secure sandboxed execution environment
- Test case validation
- Real-time execution feedback

### 📊 Analytics & Tracking
- Comprehensive submission history
- Code execution analytics
- Performance metrics
- User activity tracking

### 🔒 Security
- JWT-based authentication
- Secure password handling
- Rate limiting
- Sandboxed code execution
- Input validation and sanitization

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Redis](https://redis.io/)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## 📥 Installation

1. **Clone the repository**
```bash
git clone https://github.com/1802042/IDE-Backend.git
cd IDE-Backend
```

2. **Install dependencies**
```bash
npm install
```

## ⚙️ Configuration

### 1. Redis Setup
```bash
docker run -d \
  --name redis-email-server \
  -p 6379:6379 \
  redis \
  redis-server --requirepass your_redis_password
```

### 2. MongoDB Setup
```bash
docker run -d \
  --name mongodb-container \
  -e MONGO_INITDB_ROOT_USERNAME=your-username \
  -e MONGO_INITDB_ROOT_PASSWORD=your-password \
  -p 27017:27017 \
  mongo
```

### 3. Code Execution Engine Setup
```bash
cd CEE
sudo docker compose up -d db redis
sleep 10s
sudo docker compose up -d
sleep 5s
```

### 4. Environment Configuration
```bash
cp .env.example .env
```

Update the `.env` file with your configuration

## 🚀 Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run start
```

The server will be available at `http://localhost:PORT` (default PORT: 5000)

## 🔗 API Routes

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | User login |
| GET | `/api/v1/users/logout` | User logout |
| POST | `/api/v1/users/verify-email` | Verify email address |
| POST | `/api/v1/users/forgot-password` | Request password reset |
| POST | `/api/v1/users/reset-password` | Reset password |

### Code Execution
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/submissions/submit` | Submit code for execution |
| GET | `/api/v1/submissions/result/:token` | Get execution results |
| GET | `/api/v1/submissions/history` | Get submission history |

For detailed API documentation, visit our [Postman Documentation](https://documenter.getpostman.com/view/37232184/2sAY4rEjvM)

## 🏗️ System Architecture

The system follows a microservices architecture with the following components:

1. **Authentication Service**
   - Handles user registration and authentication
   - Manages JWT tokens
   - Handles email verification

2. **Code Execution Service**
   - Manages code submission
   - Handles language-specific compilation
   - Executes code in sandbox environment

3. **Analytics Service**
   - Tracks user submissions
   - Generates execution metrics
   - Provides performance analytics

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run start` | Start production server |
| `npm run test` | Run test suite |
| `npm run lint` | Run linting checks |

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Patuakhali Science and Technology University  
Dumki, Patuakhali - 8602

- **Email**: rony16@cse.pstu.ac.bd
- **Phone**: (+880) 1742-059121

---

© 2024 PSTU CSE IDE. All rights reserved.
