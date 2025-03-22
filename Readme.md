# Kia Ora Trails

## Project Overview
Kia Ora Trails is a Web3 mobile application with a familiar Web2 interface designed to revolutionize trail maintenance reporting and management. The platform connects hikers, local communities, and management authorities through an immersive digital twin experience, blockchain transparency, and community-driven decision-making.

## Project Architecture

### Frontend Architecture
The frontend is built using Next.js 15 with React 19, providing a modern, responsive mobile-first experience:

- **UI Framework**: Uses Tailwind CSS with shadcn/ui components for a consistent design system.
- **Authentication**: Integrated with Privy for seamless Web3 authentication without requiring users to understand cryptocurrency.
- **Maps Integration**: Google Maps API for location services with satellite view capabilities.
- **State Management**: React Context API for global state management.

**Key frontend components:**
- Interactive trail reporting system
- Digital twin visualization
- Community voting interface
- Wallet and token management
- User profile and activity tracking

### Backend Architecture
The backend uses a combination of traditional Web2 services and Web3 infrastructure:

- **API Layer**: RESTful endpoints for data exchange between frontend and blockchain.
- **Authentication**: Privy authentication service for wallet connection and management.
- **Storage**: AWS S3 for image storage and media content.
- **Geospatial Services**: Integration with mapping services for location data.

### Web3 Architecture
The blockchain components provide transparency, security, and incentivization:

- **Smart Contracts**: Ethereum-based contracts for:
  - Fund management and allocation
  - Token rewards distribution
  - Multisig wallet implementation for democratic voting
  - Task creation and completion verification

- **Token System**: TRL (Trail) tokens for:
  - Rewarding user participation
  - Voting on maintenance priorities
  - Tracking contributions and reputation

- **Wallet Integration**: Privy for simplified wallet management, allowing users to interact with blockchain functionality without cryptocurrency knowledge.

## Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Authentication**: Privy
- **Maps**: Google Maps API
- **Blockchain**: Ethereum, Smart Contracts
- **Storage**: AWS S3
- **Form Handling**: React Hook Form, Zod
- **Data Visualization**: Recharts