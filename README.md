# Rental Management 
we are very feel very greatful to start this project, the project is about the rental management problem, and we are making it solution from scratch, the project include storng authentication using token based auth technique and have rebust roll based system, where each role have some assigned permission by the admin, the solution also includes dashboard for admin, security deposit management, late ruturn fee management, pickup & return management, price & attributes, 

### Extra features
- Email Services using SMTP
- OAuth authentication using Google
- Chat system between two users, (allowed only for some special users)

### How to setup client directory @kakashi197
- coming soon

### How to setup server directory @harminvp00

#### 1. Prerequisites
```bash
node -v
npm -v
psql --version
git --version
```

#### 2. Clone the repo 
```bash
git init
git remote add origin https://github.com/kakashi197/rental-management-system.git
git pull origin main
```

#### 3. Install dependencies
```bash
npm install
```

#### 4. Create .env file:
```env
PORT=3000
NODE_ENV='production'
CLIENT_URL='http://localhost:5173/'

# replace username, password and db_name
DATABASE_URL="postgresql://username:password@localhost:5432/db_name"

JWT_SECRET_KEY=""

# SMTP_PORT=587
SMTP_HOST="smtp.gmail.com"
SMTP_USER="harmin@example.com"
SMTP_PASS=""

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

#### 5. Create Database in postgres 
- consider server/schema.sql to create schema into the your postgres database, 

#### 6. Prisma
```bash
npm run db:pull
npm run db:generate
```

#### 7. Start Development Server
```bash
npm run dev
```

if you feel any difficulty to setup this project you can contact developers
### Developers
| Name | Email | Github | Role
|---|---|---|---|
| Krish Solanki | ec2022.kirtansolanki@gmail.com | @kakashi197 | Frontend
| Harmin Vekariya | vekariyaharmin96@gmail.com | @harminvp00 | Backend


---

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

## License

This project is developed for educational and hackathon purposes.