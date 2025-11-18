# HaUI Smart Parking Management System

**Admin Dashboard for Intelligent Parking Management**

A comprehensive web-based dashboard for managing parking operations at Hanoi University of Industry (HaUI). Built with Next.js 14, TypeScript, and modern React patterns.

---

## Overview

This system provides real-time monitoring and management capabilities for a 500-spot parking facility, handling vehicle registration, entry/exit tracking, exception handling, and revenue management. Designed specifically for Vietnamese university context with support for local license plate formats and Vietnamese language.

### Key Features

- **Real-time Monitoring** - Live dashboard with occupancy tracking and activity visualization
- **Vehicle Management** - Complete CRUD operations for registered vehicles (students, staff, visitors)
- **Exception Handling** - Manual processing for LPR (License Plate Recognition) failures
- **Registration System** - Self-service vehicle registration with validation and duplicate checking
- **Analytics & Reports** - Revenue tracking, usage patterns, and exportable reports
- **Multi-gate Support** - Manage 4 entry/exit gates with individual status monitoring

### Demo Status

This is a **demonstration application** using mock data and localStorage for persistence. No actual database connection is required for evaluation purposes.

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Typography**: Plus Jakarta Sans, Inter, JetBrains Mono (Google Fonts)

### State Management
- **Store**: Zustand with immer middleware
- **Persistence**: localStorage with cross-tab sync

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Type Checking**: TypeScript 5.x

---

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9 or later

### Installation

1. Clone the repository:
```bash
git clone https://github.com/malznguyen/parking-admin.git
cd parking-admin
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

The production build will be optimized for performance with static generation where possible.

---

## Project Structure

```
parking-admin/
├── app/                          # Next.js app directory
│   ├── (dashboard)/             # Dashboard routes
│   │   ├── page.tsx             # Overview dashboard
│   │   ├── vehicles/            # Vehicle management
│   │   ├── exceptions/          # Exception handling
│   │   ├── registrations/       # Vehicle registration
│   │   ├── reports/             # Analytics & reports
│   │   └── settings/            # System settings
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles & theme
├── components/
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── hero-section.tsx
│   │   ├── metric-card.tsx
│   │   ├── activity-chart.tsx
│   │   ├── recent-sessions.tsx
│   │   └── gate-distribution.tsx
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── stores/                  # Zustand stores
│   │   ├── vehicle-store.ts
│   │   ├── session-store.ts
│   │   ├── exception-store.ts
│   │   └── ui-store.ts
│   ├── mock-data/               # Mock database
│   │   ├── vehicles.ts
│   │   ├── sessions.ts
│   │   └── generators.ts
│   ├── constants.ts             # Application constants
│   └── utils.ts                 # Utility functions
├── types/
│   └── database.ts              # TypeScript type definitions
└── public/                      # Static assets
```

---

## Mock Data

The demonstration system includes realistic mock data for comprehensive testing:

### Vehicles Database
- **200 Student Vehicles** - Active student registrations with unique license plates
- **100 Faculty/Staff Vehicles** - Administrative and teaching staff vehicles
- **Subscription Management** - Monthly/semester-based payment tracking

### Parking Sessions
- **5000+ Historical Sessions** - 30 days of parking activity
- **Real-time Active Sessions** - Currently parked vehicles
- **Gate Distribution** - Activity across 4 entry/exit gates (A, B, C, D)

### LPR Exceptions
- **115 Total Exceptions** - Failed or low-confidence plate recognitions
- **15 Pending Cases** - Awaiting manual processing
- **Status Tracking** - Resolved/pending/cancelled workflow

### System Monitoring
- **Camera Status** - 4 LPR cameras (entry/exit per gate)
- **Barrier Status** - 4 automatic barriers
- **Sensor Status** - Occupancy detection sensors

All mock data follows Vietnamese naming conventions, license plate formats (e.g., 30A-12345), and realistic usage patterns.

---

## Features Documentation

### Dashboard Overview

The main dashboard provides at-a-glance system status:

- **Capacity Monitoring** - Available spots, occupancy rate, visual progress bar
- **Revenue Metrics** - Today's revenue with trend comparison
- **Activity Visualization** - 24-hour traffic chart with entry/exit patterns
- **Recent Activity** - Latest vehicle entries and exits
- **Gate Distribution** - Usage breakdown by entry/exit gate
- **System Status** - Alerts for pending exceptions and system health

### Vehicle Management

Complete vehicle lifecycle management:

- **Search & Filter** - By license plate, owner name, vehicle type, status
- **Registration** - Add new vehicles with owner details and subscription
- **Update** - Modify vehicle information and subscription status
- **Delete** - Remove vehicles with confirmation
- **Import/Export** - Batch operations for data management

### Exception Handling

Manual processing for LPR failures:

- **Queue Management** - Pending exceptions requiring attention
- **Manual Correction** - Override incorrect plate recognition
- **Confidence Levels** - High/medium/low recognition quality
- **Resolution Tracking** - Approve, reject, or request reprocessing

### Registration Portal

Self-service vehicle registration:

- **Multi-step Form** - Owner info, vehicle details, subscription selection
- **Validation** - Duplicate checking, plate format verification
- **Payment Calculation** - Automatic fee calculation based on subscription type
- **Submission Queue** - Pending approval workflow

### Reports & Analytics

Data visualization and export:

- **Revenue Reports** - Daily/weekly/monthly income tracking
- **Usage Statistics** - Peak hours, average duration, occupancy trends
- **Vehicle Analytics** - Breakdown by type (student/staff/visitor)
- **Export Options** - CSV, PDF report generation

---

## Development

### Running the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000) with hot reloading enabled.

### Code Quality

```bash
# Run ESLint
npm run lint

# Build production bundle (checks for errors)
npm run build
```

### State Management

The application uses Zustand for state management with the following stores:

- **vehicleStore** - Vehicle database and CRUD operations
- **sessionStore** - Parking session tracking
- **exceptionStore** - LPR exception queue
- **uiStore** - Loading states, modals, toasts, confirmations

All stores use localStorage persistence with automatic cross-tab synchronization.

### Adding New Components

This project uses shadcn/ui for UI components. To add a new component:

```bash
npx shadcn@latest add [component-name]
```

Components are added to `components/ui/` and can be customized as needed.

---

## Deployment

### Vercel (Recommended)

This project is optimized for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in Vercel dashboard
3. Configure build settings (auto-detected for Next.js)
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Node.js:

```bash
# Build the production bundle
npm run build

# Start the production server
npm start
```

For static hosting, enable static export in `next.config.js` if your hosting platform requires it.

---

## Browser Support

- **Chrome** - Latest 2 versions (recommended)
- **Firefox** - Latest 2 versions
- **Safari** - Latest 2 versions
- **Edge** - Latest 2 versions

The application uses modern JavaScript features and CSS Grid/Flexbox. Internet Explorer is not supported.

---

## Design System

### Typography

The dashboard uses a professional three-font system:

- **Plus Jakarta Sans** - Display and headings (bold, modern)
- **Inter** - Body text and UI (readable, versatile)
- **JetBrains Mono** - Data and numbers (monospace, technical)

### Color Palette

- **Primary (Cyan)** - #00B894 - Actions, links, primary elements
- **Success (Green)** - #10B981 - Positive states, confirmations
- **Warning (Amber)** - #F59E0B - Caution states, moderate alerts
- **Danger (Red)** - #EF4444 - Errors, critical alerts, destructive actions
- **Info (Blue)** - #0EA5E9 - Informational states

### Layout Principles

- **Maximum Width** - 1600px (centered, optimal readability)
- **Spacing Scale** - 8px base unit (4, 8, 16, 24, 32, 40, 48)
- **Border Radius** - 8-16px (soft, modern corners)
- **Shadows** - Subtle elevation for depth and hierarchy

---

## License

MIT License

Copyright (c) 2025 HaUI Smart Parking Project

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Acknowledgments

This project was developed as part of a Model-Based Systems Engineering (MBSE) initiative for Hanoi University of Industry's smart parking system. It demonstrates modern web development practices, responsive design, and user-centered interface design for administrative dashboards.

**Note**: This is a demonstration application using mock data for evaluation and presentation purposes. For production deployment, integrate with appropriate backend services and databases.
