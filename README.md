# Appointment Management System

A full-stack Next.js application for managing appointments with public search and admin management features.

## Features

### Public Features
- **Appointment Search**: Search for appointments by first and last name
- **Upcoming Appointments**: View all future appointments for a person
- **Responsive Design**: Mobile-friendly interface

### Admin Features
- **Secure Authentication**: Protected admin dashboard with email/password login
- **Full CRUD Operations**: Create, read, update, and delete appointments
- **Advanced Filtering**: Filter by name, staff, and date range
- **Pagination**: Paginated results for large datasets
- **Sortable Columns**: Click to sort by time or staff
- **Session Management**: Persistent login with JWT tokens

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Forms & Validation**: react-hook-form + zod
- **Database**: Prisma ORM with SQLite (easily switchable to PostgreSQL)
- **Authentication**: NextAuth.js (Auth.js) with Credentials provider
- **State Management**: TanStack Query (React Query)
- **Time Handling**: All times stored in UTC, displayed in local timezone

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up the environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD_HASH="your-bcrypt-hash-here"
```

To generate a new password hash, run:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

3. Initialize the database and seed data:

```bash
npm run db:push
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Default Credentials

- **Email**: admin@example.com
- **Password**: admin123

**IMPORTANT**: Change these credentials in production!

## API Routes

### Public Endpoints

- `POST /api/appointments/search` - Search appointments by name
  - Body: `{ firstName: string, lastName: string }`
  - Returns: Array of matching appointments
  - Rate limited: 10 requests per minute per IP

### Protected Admin Endpoints (Requires Authentication)

- `GET /api/admin/appointments` - List appointments with filters
  - Query params: `q`, `staff`, `from`, `to`, `page`, `pageSize`
  - Returns: Paginated appointment list

- `POST /api/admin/appointments` - Create appointment
  - Body: `{ firstName, lastName, startUtc, staff, notes? }`
  - Validates that appointment is in the future

- `PUT /api/admin/appointments/:id` - Update appointment
  - Body: Partial appointment data

- `DELETE /api/admin/appointments/:id` - Delete appointment

## Database Schema

### Appointment
- `id` - Unique identifier (CUID)
- `firstName` - Patient first name
- `lastName` - Patient last name
- `startUtc` - Appointment start time (UTC)
- `staff` - Staff member name
- `notes` - Optional notes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### AdminUser
- `id` - Unique identifier (CUID)
- `email` - Admin email (unique)
- `password` - Bcrypt hashed password
- `createdAt` - Creation timestamp

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push Prisma schema to database
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
├── app/
│   ├── admin/
│   │   ├── login/page.tsx        # Admin login page
│   │   ├── page.tsx               # Admin dashboard
│   │   └── layout.tsx             # Admin layout with SessionProvider
│   ├── api/
│   │   ├── auth/[...nextauth]/    # NextAuth routes
│   │   ├── appointments/search/   # Public search endpoint
│   │   └── admin/appointments/    # Protected CRUD endpoints
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Public search page
│   ├── providers.tsx              # Query client provider
│   └── globals.css                # Global styles
├── components/
│   └── AppointmentModal.tsx       # Create/edit appointment modal
├── lib/
│   ├── auth.ts                    # NextAuth configuration
│   ├── auth-helpers.ts            # Auth utility functions
│   ├── db.ts                      # Prisma client singleton
│   └── validations.ts             # Zod schemas
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seed script
└── types/
    └── next-auth.d.ts             # NextAuth type extensions
```

## Security Features

- **Authentication**: JWT-based session management
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Built-in rate limiting for public search
- **Input Validation**: Server-side validation with Zod
- **Protected Routes**: Session checks on all admin endpoints
- **SQL Injection Prevention**: Prisma ORM parameterized queries

## Deployment

### Environment Variables for Production

Make sure to set these in your production environment:

- `DATABASE_URL` - PostgreSQL connection string (recommended for production)
- `NEXTAUTH_SECRET` - Strong random secret (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL` - Your production URL
- `ADMIN_EMAIL` - Admin email
- `ADMIN_PASSWORD_HASH` - Bcrypt hash of admin password

### Switching to PostgreSQL

1. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `DATABASE_URL` in `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

3. Run migrations:

```bash
npm run db:push
npm run db:seed
```

## Acceptance Criteria ✅

- ✅ Public form searches by name and shows upcoming appointments
- ✅ Admin can log in, view, filter, create, edit, and delete appointments
- ✅ All times stored in UTC, displayed in local time
- ✅ Session persists on page refresh
- ✅ No unauthenticated access to admin routes
- ✅ Case-insensitive name matching
- ✅ Rate limiting on public endpoints
- ✅ Input validation on all forms
- ✅ Responsive, accessible UI

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.


## Short Version:
Step-by-Step Setup (For Future Use)

  If you need to start fresh or restart:

  1. Install Dependencies (Already Done)

  npm install

  2. Set Up Database (Already Done)

  # This creates the SQLite database and applies the schema
  npm run db:push

  # This seeds the database with admin user and sample appointments
  npm run db:seed

  You only need to do this once! The database file (prisma/dev.db) persists, so you don't need to rebuild it
  every time.

  3. Start the Development Server

  npm run dev

  Quick Access

  - Public Page: http://localhost:3000
  - Admin Login: http://localhost:3000/admin/login
  - Admin Dashboard: http://localhost:3000/admin

  Test Credentials:

  - Email: admin@example.com
  - Password: admin123

  Test the Public Search:

  - Search for "John Doe" or "Jane Smith" to see the sample appointments

  If You Need to Restart

  If the dev server stops, just run:
  npm run dev

  No database rebuild needed - the data persists in prisma/dev.db!

  Other Useful Commands

  # View database in browser GUI
  npm run db:studio

  # Reset database (if needed)
  rm prisma/dev.db
  npm run db:push
  npm run db:seed