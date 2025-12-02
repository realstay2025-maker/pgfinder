# PG Management System

A comprehensive MERN stack application for managing Paying Guest (PG) accommodations with separate dashboards for Admin, Owner, and Tenant roles.

## Features

### Admin Dashboard
- Property approval management
- User management
- System settings and configuration

### Owner Dashboard
- Property management (CRUD operations)
- Room and tenant management
- Payment tracking and invoice generation
- Notice management (tenant leave requests)
- Booking and contact request handling
- Real-time dashboard metrics

### Tenant Dashboard
- Profile management
- Payment history and invoice downloads
- Complaint submission
- Notice submission for leaving PG
- Document management

## Tech Stack

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Heroicons** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Puppeteer** for PDF generation
- **Nodemailer** for email services

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Git

### Clone Repository
```bash
git clone <repository-url>
cd project
```

### Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your API URL
npm run dev
```

## Environment Variables

### Server (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pgmanagement
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:5173
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000
```

## Deployment

### Backend (Render/Railway)
1. Create new web service
2. Connect GitHub repository
3. Set root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables

### Frontend (Netlify/Vercel)
1. Create new site
2. Connect GitHub repository
3. Set root directory: `client`
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Add environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties/public` - Get public properties
- `GET /api/properties/my` - Get owner properties
- `POST /api/properties` - Create property

### Rooms
- `GET /api/rooms/:propertyId` - Get property rooms
- `POST /api/rooms` - Create room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Notices
- `POST /api/notices/submit` - Submit notice (tenant)
- `GET /api/notices/owner` - Get owner notices
- `PUT /api/notices/:id/status` - Update notice status

## Project Structure

```
project/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   ├── config/        # Configuration files
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Backend Node.js app
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.