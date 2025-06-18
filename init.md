# TransCare EMS Digital Operations - Project Initialization Guide

This guide will help you set up the TransCare EMS Digital Operations project on your local development environment.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL** database
- **Git** for version control

## 1. Environment Setup

### Creating the .env File

Create a `.env.local` file in the root directory of the project with the following environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/transcare_db"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"

```

### Environment Variables Explanation

| Variable                        | Description                                  | Required |
| ------------------------------- | -------------------------------------------- | -------- |
| `DATABASE_URL`                  | PostgreSQL connection string for Drizzle ORM | ✅       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL                    | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key                | ✅       |

**Important Notes:**

- Replace `username`, `password`, and `transcare_db` with your actual PostgreSQL credentials
- Get your Supabase credentials from your Supabase dashboard

## 2. Installation

Install all project dependencies:

```bash
npm install
```

## 3. Database Setup and Migration

This project uses **Drizzle ORM** with PostgreSQL for database management.

### Available Database Scripts

| Script              | Command            | Description                                  |
| ------------------- | ------------------ | -------------------------------------------- |
| Generate Migrations | `npm run generate` | Generate migration files from schema changes |
| Run Migrations      | `npm run migrate`  | Apply pending migrations to the database     |

### Database Setup Steps

1. **Generate initial migration files:**

   ```bash
   npm run generate
   ```

   This creates migration files in the `drizzle/` directory based on your schema definitions.

2. **Apply migrations to your database:**

   ```bash
   npm run migrate
   ```

   This executes all pending migrations against your PostgreSQL database.

### Migration Workflow

When you make changes to the database schema:

1. Update your schema files in `src/db/schema/`
2. Run `npm run generate` to create new migration files
3. Run `npm run migrate` to apply the changes to your database

## 4. Development

### Available Development Scripts

| Script             | Command         | Description                                 |
| ------------------ | --------------- | ------------------------------------------- |
| Development Server | `npm run dev`   | Start the development server with Turbopack |
| Build Production   | `npm run build` | Build the application for production        |
| Start Production   | `npm run start` | Start the production server                 |
| Lint Code          | `npm run lint`  | Run ESLint to check code quality            |

### Starting Development

1. **Start the development server:**
   ```bash
   npm run dev
   ```
2. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

The development server uses **Turbopack** for faster build times and hot reloading.

## 5. Project Structure Overview

```
transcare/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # Reusable UI components
│   ├── db/                  # Database configuration and schemas
│   ├── actions/             # Server actions
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── utils/               # Utility functions
├── drizzle/                 # Database migrations
├── public/                  # Static assets
└── .env.local              # Environment variables (create this)
```

## 6. Technology Stack

- **Framework:** Next.js 15 with App Router
- **Database:** PostgreSQL with Drizzle ORM
- **Authentication:** Supabase Auth
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Form Handling:** React Hook Form with Zod validation
- **Build Tool:** Turbopack

## 7. Troubleshooting

### Common Issues

1. **Database Connection Error:**

   - Verify your `DATABASE_URL` in `.env.local`
   - Ensure PostgreSQL is running
   - Check database credentials and permissions

2. **Supabase Authentication Issues:**

   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Check Supabase project settings

3. **Migration Errors:**
   - Ensure your database is accessible
   - Check for schema conflicts
   - Verify migration files in `drizzle/` directory

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure all dependencies are installed
4. Check database connectivity

## 8. Next Steps

After successful setup:

1. Explore the application structure
2. Review the authentication flow
3. Check the admin and staff dashboard layouts
4. Familiarize yourself with the database schema
5. Start developing new features

---

**Note:** Make sure to never commit your `.env.local` file to version control as it contains sensitive information.
