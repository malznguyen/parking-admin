# 🚗 HaUI Smart Parking Management System

Admin Dashboard cho Hệ thống Quản lý Bãi xe Thông minh - Trường ĐH Công nghiệp Hà Nội

## ✨ Features

- 📊 Dashboard Overview với real-time statistics
- 🚗 Quản lý xe đang đỗ và lịch sử ra/vào
- 📝 Quản lý đăng ký xe thuê bao (sinh viên, CBGV)
- ⚠️ Xử lý ngoại lệ LPR (License Plate Recognition)
- 📈 Báo cáo & thống kê doanh thu, tỉ lệ sử dụng
- 🛰 Giám sát trạng thái hệ thống (cameras, barriers, sensors)

## 🏗 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand (with localStorage persistence)
- **Charts**: Recharts
- **Mock Data**: 300+ vehicles, 5000+ sessions, realistic Vietnamese data

## 📦 Installation

\\\ash
# Clone repository
git clone https://github.com/YOUR_USERNAME/haui-parking-admin.git
cd haui-parking-admin

# Install dependencies
npm install

# Run development server
npm run dev
\\\

Open http://localhost:3000

## 📂 Project Structure

\\\
haui-parking-admin/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # Dashboard routes
│   └── api/                  # API routes
├── components/
│   ├── dashboard/            # Dashboard-specific components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── mock-data/            # Mock database & generators
│   ├── constants.ts          # App constants
│   └── utils.ts              # Utility functions
├── types/
│   └── database.ts           # TypeScript type definitions
└── public/
    └── mock-images/          # Placeholder images
\\\

## 🧪 Mock Data

Demo system includes:
- 200 registered student vehicles
- 100 staff/faculty vehicles
- 5000+ parking sessions (30 days)
- 115 LPR exceptions (15 pending)
- Real-time system status monitoring

## 🛠 Development

\\\ash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
\\\

## 📜 License

MIT License - Free for educational purposes

## 👨‍💻 Author

Developed as part of MBSE/SysML design project for HaUI Smart Parking System

---

**Note**: This is a demo application using mock data. No real database is connected.
