# NANMA Family Fest 2025 - Registration Website

A complete Next.js application for family event registration with admin dashboard, built for NANMA Puthiyakavu Mahallu Association, Dubai Committee.

## Features

### 🎯 Registration System
- **Complete Form**: Exact replica of Google Form structure with 11 fields
- **Validation**: Real-time form validation with Zod schema
- **Phone Formatting**: Auto-format UAE phone numbers (+971)
- **Duplicate Prevention**: Prevent duplicate registrations by mobile number
- **Responsive Design**: Mobile-first design with Tailwind CSS

### 📊 Admin Dashboard
- **Statistics Cards**: Total registrations, adults, children, and attendees
- **Data Management**: Sortable and searchable registration table
- **CSV Export**: Download registrations with custom filename
- **Payment Status**: Update payment status for each registration
- **Real-time Updates**: Live data refresh functionality

### 🔐 Security
- **Admin Authentication**: Simple email/password authentication
- **Route Protection**: Middleware-protected admin routes
- **Session Management**: HTTP-only cookies for secure sessions
- **Input Validation**: Server-side validation for all inputs

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **TypeScript**: Full type safety throughout
- **Database**: MongoDB with Mongoose ODM
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Export**: React CSV for data export

## Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database (local or Atlas)
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Update `.env.local` with your values:
   ```env
   MONGODB_URI="your-mongodb-connection-string"
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   JWT_SECRET="your_jwt_secret"
   ADMIN_EMAIL="admin@nanma.com"
   ADMIN_PASSWORD="your_admin_password"
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

### Vercel (Recommended)
1. Connect repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically

### Manual Deployment
```bash
npm run build
npm start
```

## Admin Access
- URL: `/admin`
- Use credentials from environment variables
- Full dashboard with export capabilities

---

**NANMA Puthiyakavu Mahallu Association, Dubai Committee**  
*Building stronger communities, one family at a time.*
