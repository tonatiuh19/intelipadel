# Intelipadel - Padel Court Booking Platform

A modern, production-ready padel court booking application built with React, Redux Toolkit, and deployed on Vercel.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit with async thunks
- **API Client**: Axios
- **Form Validation**: Formik + Yup
- **Animations**: Framer Motion
- **UI Components**: Radix UI + TailwindCSS 3
- **Routing**: React Router 6 (SPA mode)
- **Backend**: Vercel Serverless Functions
- **Deployment**: Vercel

## 📁 Project Structure

```
client/
├── pages/              # Route components
├── components/         # React components
│   └── ui/            # Radix UI component library
├── store/             # Redux Toolkit store
│   ├── index.ts       # Store configuration
│   ├── hooks.ts       # Typed hooks
│   └── slices/        # Redux slices
│       ├── clubsSlice.ts
│       └── bookingsSlice.ts
├── data/              # Static data
└── lib/               # Utilities

api/
└── index.ts           # Vercel serverless functions

shared/
└── api.ts             # Shared TypeScript types
```

## 🎨 Key Features

### State Management with Redux Toolkit

- Centralized state management
- Async operations with createAsyncThunk
- Type-safe with TypeScript
- Separate slices for clubs and bookings

### Form Validation

- Formik for form state management
- Yup for schema validation
- Real-time validation feedback

### Modern UI/UX

- **Liquid Glass Header**: Glassmorphism effect with backdrop blur
- **Animated Hero Section**: Framer Motion animations with floating gradients
- **Smooth Transitions**: Page transitions and hover effects
- **Responsive Design**: Mobile-first approach

### API Integration

- Axios for HTTP requests
- RESTful API structure
- Vercel serverless functions for backend

## 🛠️ Development

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (comes with Node.js)

### Installation

```bash
# Install dependencies
npm install
```

### Running Locally

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Type Checking

```bash
npm run typecheck
```

### Testing

```bash
npm test
```

## 🚀 Deployment to Vercel

### Option 1: Using Vercel CLI

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel
```

3. For production:

```bash
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

### Environment Variables

No environment variables are required for basic deployment. For production, you may want to add:

- `VITE_API_URL`: API base URL (optional)

## 📝 API Endpoints

### GET /api/clubs

Returns list of available padel clubs

**Response:**

```json
[
  {
    "id": 1,
    "name": "Club Elite Padel",
    "location": "Madrid, España",
    "pricePerHour": 45,
    "rating": 4.8,
    "reviews": 234
  }
]
```

### GET /api/bookings

Returns user's bookings

**Response:**

```json
[
  {
    "id": "1",
    "clubId": 1,
    "clubName": "Club Elite Padel",
    "date": "2025-12-25",
    "time": "10:00",
    "duration": 60,
    "status": "confirmed"
  }
]
```

### POST /api/bookings

Create a new booking

**Request:**

```json
{
  "clubId": 1,
  "clubName": "Club Elite Padel",
  "date": "2025-12-25",
  "time": "10:00",
  "duration": 60
}
```

**Response:**

```json
{
  "id": "123",
  "clubId": 1,
  "clubName": "Club Elite Padel",
  "date": "2025-12-25",
  "time": "10:00",
  "duration": 60,
  "status": "confirmed"
}
```

## 🎯 Redux Store Structure

### Clubs Slice

```typescript
{
  clubs: Club[],
  selectedClub: Club | null,
  loading: boolean,
  error: string | null
}
```

**Actions:**

- `fetchClubs()` - Fetch all clubs from API
- `selectClub(club)` - Select a club
- `clearSelectedClub()` - Clear selection

### Bookings Slice

```typescript
{
  bookings: Booking[],
  loading: boolean,
  error: string | null
}
```

**Actions:**

- `createBooking(data)` - Create new booking
- `fetchBookings()` - Fetch user's bookings
- `clearError()` - Clear error state

## 🎨 UI Components

All UI components are built with Radix UI and styled with TailwindCSS:

- Buttons, Cards, Badges
- Forms (Input, Select, Textarea)
- Dialogs, Dropdowns, Tooltips
- Calendar, Tabs, Accordion
- And 40+ more components

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Fully responsive navigation with mobile menu

## 🔒 Type Safety

The entire codebase is written in TypeScript with strict mode enabled for maximum type safety.

## 📄 License

Private project - All rights reserved

## 👥 Support

For issues or questions, please contact the development team.
