# Swift Investment Platform

A complete investment and savings platform with deposits, withdrawals, and flexible savings plans.

## 🚀 Quick Start

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Deploy to Railway

See [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md) for step-by-step instructions.

## 📁 Project Structure

```
Swift/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── models/   # Database schemas
│   │   ├── routes/   # API endpoints
│   │   └── middleware/ # Auth & security
│   ├── package.json
│   └── Dockerfile
├── frontend/         # React web app
│   ├── src/
│   │   ├── pages/    # React components
│   │   └── App.jsx
│   ├── package.json
│   └── Dockerfile
└── DEPLOY_GUIDE.md   # Deployment instructions
```

## ✨ Features

- ✅ User authentication (Register/Login)
- ✅ Wallet management (USDT balance)
- ✅ Deposits & withdrawals
- ✅ Savings plans (5% - 15% bonus)
- ✅ Transaction history
- ✅ Admin dashboard
- ✅ KYC verification

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT
- **Frontend**: React, Axios, React Router
- **Deployment**: Railway.app

## 📱 Access Anywhere

After deployment, access from:
- Desktop/Laptop
- Mobile phone
- Tablet
- Any internet-connected device

## 🔗 API Documentation

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get user info

### Transactions
- `POST /api/deposits/initiate` - Start deposit
- `POST /api/withdrawals/initiate` - Start withdrawal
- `GET /api/deposits/history` - View deposits

### Savings
- `POST /api/savings/create-plan` - Create savings plan
- `GET /api/savings/my-plans` - View plans
- `GET /api/savings/plans-info` - Available plans

## 📞 Support

For issues or questions, check the logs in Railway Dashboard.

---

**Made with ❤️ for investors**
