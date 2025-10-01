# Railway Database Command Line Access

## Method 1: Using Railway CLI

### Install Railway CLI
```bash
# On macOS using Homebrew
brew install railway

# Or using npm
npm install -g @railway/cli
```

### Login to Railway
```bash
railway login
```

### Connect to your project
```bash
# Navigate to your backend directory
cd /Users/jaydenmetz/Desktop/real-estate-crm/backend

# Link to your Railway project
railway link
```

### Access PostgreSQL directly
```bash
# Open psql connected to your Railway database
railway run psql

# Or run a SQL file
railway run psql -f src/scripts/add-production-escrow.sql

# Or run a single command
railway run psql -c "SELECT COUNT(*) FROM escrows;"
```

## Method 2: Direct psql Connection

### Get your DATABASE_URL from Railway
1. Go to your Railway project dashboard
2. Click on your PostgreSQL service
3. Go to the "Variables" tab
4. Copy the DATABASE_URL value

### Connect using psql
```bash
# Using the full connection string
psql "postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"

# Or set it as an environment variable
export DATABASE_URL="postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"
psql $DATABASE_URL
```

### Run SQL commands
```bash
# Run a SQL file
psql $DATABASE_URL -f /Users/jaydenmetz/Desktop/real-estate-crm/backend/src/scripts/add-production-escrow.sql

# Run a single command
psql $DATABASE_URL -c "INSERT INTO escrows (id, property_address, escrow_status, purchase_price) VALUES ('ESC-TEST-001', '123 Test St', 'Active', 500000);"

# Interactive mode
psql $DATABASE_URL
```

## Method 3: Using a Node.js Script

Create a script that uses your production environment:

```bash
# Create a production environment file
export DATABASE_URL="your-railway-database-url"
node scripts/add-escrow-to-production.js
```

## Common Commands

### View all escrows
```bash
railway run psql -c "SELECT id, property_address, escrow_status, purchase_price FROM escrows;"
```

### Add a new escrow
```bash
railway run psql -c "INSERT INTO escrows (id, property_address, escrow_status, purchase_price, earnest_money_deposit, down_payment, loan_amount, commission_percentage, gross_commission, net_commission, acceptance_date, closing_date, property_type, lead_source) VALUES ('ESC-2025-002', '456 Beach Rd, Venice, CA', 'Active', 850000, 8500, 170000, 680000, 2.5, 21250, 10625, '2025-07-20', '2025-09-01', 'Condo', 'Zillow');"
```

### Delete an escrow
```bash
railway run psql -c "DELETE FROM escrows WHERE id = 'ESC-TEST-001';"
```

### Count escrows
```bash
railway run psql -c "SELECT COUNT(*) as total_escrows FROM escrows;"
```