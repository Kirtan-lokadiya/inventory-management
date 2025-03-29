# Inventory Management System

A comprehensive inventory management system for spare parts, built with Next.js and Supabase.

## Features

- User Authentication (Single Admin)
- Inventory Management
  - Add, edit, and delete spare parts
  - Track stock levels
  - Search functionality
  - Location tracking
- Billing and Invoicing
  - Generate bills
  - PDF invoice generation
  - Search bills
- Reports and Analytics
  - Stock overview
  - Top selling items
  - Monthly sales trends
  - Total sales and stock
- Low Stock Alerts
  - Configurable threshold
  - Real-time notifications

## Prerequisites

- Node.js 16.x or later
- npm or yarn
- Supabase account

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd inventory-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Supabase project:
   - Go to [Supabase](https://supabase.com)
   - Create a new project
   - Copy the project URL and anon key

4. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

5. Set up the database:
   - Go to your Supabase project's SQL editor
   - Run the SQL commands from the `supabase/schema.sql` file
   - Run the SQL commands from the `supabase/functions/update_alert_threshold.sql` file
   - Run the SQL commands from the `supabase/functions/update_part_quantity.sql` file

6. Run the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
inventory-management/
├── app/
│   ├── dashboard/
│   │   ├── alerts/
│   │   ├── billing/
│   │   ├── inventory/
│   │   └── reports/
│   ├── login/
│   └── layout.tsx
├── components/
│   └── BillPDF.tsx
├── lib/
│   └── supabase.ts
├── supabase/
│   ├── functions/
│   │   ├── update_alert_threshold.sql
│   │   └── update_part_quantity.sql
│   └── schema.sql
└── README.md
```

## Database Schema

The system uses the following tables:

- `users`: Admin user authentication
- `parts`: Spare parts inventory
- `customers`: Customer information
- `bills`: Sales bills
- `bill_items`: Individual items in bills
- `alerts`: Low stock alerts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
