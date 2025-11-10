# Delivery App Mobile

React Native mobile application built with Expo, TypeScript, and TailwindCSS.

## Features

- **Unified App**: Single app supporting Client, Driver, and Admin roles
- **Real-time Updates**: Socket.io integration for live order tracking
- **Modern UI**: TailwindCSS with NativeWind for beautiful, responsive design
- **Type Safety**: Full TypeScript support
- **State Management**: Redux Toolkit + React Query

## Tech Stack

- Expo SDK 51
- React Native 0.74
- TypeScript
- NativeWind (TailwindCSS)
- Expo Router (File-based routing)
- Redux Toolkit
- React Query (TanStack Query)
- Axios
- Socket.io Client

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Expo CLI

### Installation

```bash
# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:4000/api
SOCKET_URL=http://localhost:4000
```

### Running the App

```bash
# Start the development server
npm start
# or
yarn start
# or
pnpm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (client)/          # Client app screens
│   ├── (driver)/          # Driver app screens
│   └── (admin)/           # Admin app screens
├── src/
│   ├── components/        # Reusable components
│   ├── services/          # API and services
│   ├── store/             # Redux store
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript types
│   └── theme/             # Theme configuration
└── assets/                # Static assets
```

## Development

### Phase 1: Setup & Core Features ✅
- [x] Expo project setup
- [x] TailwindCSS configuration
- [x] Authentication flow
- [x] Expo Router setup
- [x] API integration

### Phase 2: Client App Features ✅
- [x] Client screens (Home, Orders, Profile)
- [x] Address management
- [x] Order creation and tracking
- [x] Basic chat functionality
- [ ] Ratings and complaints (in progress)

### Phase 3: Driver App Features (Coming Soon)
- Driver screens
- Order management
- Location tracking
- Navigation

### Phase 4: Real-time Features (Coming Soon)
- Socket.io integration
- Real-time updates
- Notifications

### Phase 5: Admin App (Coming Soon)
- Admin dashboard
- User management
- Analytics

## License

MIT


