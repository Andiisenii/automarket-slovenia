# AutoMarket Slovenia

A car marketplace web application for the Slovenian market.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** PHP + MySQL (XAMPP)
- **Features:**
  - User authentication (login/register)
  - Car listings with CRUD operations
  - Filters by brand, model, city, fuel type
  - Favorites system
  - Buyer-seller messaging
  - Payment flow (EUR 5 for publishing, boost packages)
  - Contact options: Phone, WhatsApp, Viber

## Setup

### Backend (XAMPP)

1. Install XAMPP with PHP and MySQL
2. Copy `api/` folder to `C:\xampp\htdocs\`
3. Create database `automarket` in phpMyAdmin
4. Import `api/schema.sql` for database structure

### Frontend

```bash
npm install
npm run dev
```

## API Endpoints

- `/api/auth.php` - Authentication
- `/api/cars.php` - Car listings
- `/api/brands.php` - Brands and models
- `/api/cities.php` - Cities
- `/api/favorites.php` - Favorites
- `/api/messages.php` - Messages
- `/api/payments.php` - Payments
- `/api/admin.php` - Admin operations

## Database Tables

- `users` - User accounts
- `cars` - Car listings
- `brands` - Car brands
- `brand_models` - Car models
- `cities` - Slovenian cities
- `favorites` - User favorites
- `messages` - Messages between users
- `purchases` - Package purchases
- `user_sessions` - Active sessions
- `site_settings` - Site configuration

## Development

```bash
# Create new branch for features
git checkout -b feature-name

# Commit changes
git add .
git commit -m "Your message"

# Switch to main branch
git checkout main

# Merge feature
git merge feature-name
```

## License

Private project for AutoMarket Slovenia
