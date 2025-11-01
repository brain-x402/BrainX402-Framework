# Solana-Powered AI Chatbot

## Overview

This is a web application that combines AI-powered chat functionality with Solana blockchain rewards. Users connect their Solana wallet, chat with an AI assistant powered by Mistral AI, and earn 0.001 USDC on the Solana devnet for each interaction. The application features a modern chat interface with real-time transaction tracking and wallet integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: Shadcn/ui with Radix UI primitives, styled with Tailwind CSS using a custom design system based on the "new-york" style

**Design Philosophy**: Conversation-first layout inspired by modern chat interfaces (ChatGPT, Claude) with minimal chrome to maintain focus on message content. Uses Inter font for readability and JetBrains Mono for wallet addresses and transaction IDs.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. Local component state using React hooks for UI interactions.

**Routing**: Wouter for lightweight client-side routing

**Key Design Decisions**:
- Full-height viewport layout with fixed header and scrollable chat container
- Message-centric UI with clear visual separation between user and AI messages
- Seamless wallet integration that doesn't disrupt chat flow
- Responsive spacing using Tailwind's spacing primitives (2, 4, 6, 8 units)

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API with two main endpoints:
- `/api/validate-wallet` - Validates Solana wallet addresses
- `/api/chat` - Processes chat messages, generates AI responses, and initiates USDC transfers

**Development Setup**: Custom Vite middleware integration for HMR during development, with separate production build using esbuild

**Error Handling**: Zod schema validation for request/response data with centralized error handling

**Session Management**: Uses connect-pg-simple for session storage (PostgreSQL-backed sessions)

### Data Storage

**Database**: PostgreSQL (via Neon serverless)

**ORM**: Drizzle ORM for type-safe database operations

**Schema Management**: Drizzle Kit for migrations with schema defined in `shared/schema.ts`

**Current Storage Strategy**: Chat messages are ephemeral and stored client-side only. The storage layer (`server/storage.ts`) is designed for future expansion to persist conversations and transaction history.

**Rationale**: The minimal storage approach keeps the initial implementation simple while the modular storage interface allows easy extension for conversation persistence without architectural changes.

### Authentication and Authorization

**Wallet-Based Authentication**: Users authenticate by connecting their Solana wallet address

**Validation Process**: 
1. Client submits wallet address
2. Server validates address format (32-44 characters)
3. Server checks wallet existence on Solana devnet via RPC
4. No traditional username/password authentication required

**Security Considerations**: 
- Wallet address validation prevents malformed inputs
- Private key stored server-side as environment variable for USDC transfers
- No sensitive user data collected or stored

### External Dependencies

**AI Service**: Mistral AI
- Model: `mistral-large-latest`
- Handles natural language understanding and response generation
- Conversation history maintained client-side and sent with each request
- Requires `MISTRAL_API_KEY` environment variable

**Blockchain Infrastructure**: Solana Devnet
- RPC Endpoint: `https://api.devnet.solana.com`
- Token: USDC devnet mint (`4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`)
- Transfer amount: 1000 (0.001 USDC with 6 decimals)
- Uses `@solana/web3.js` and `@solana/spl-token` for blockchain interactions
- Requires `SOLANA_PRIVATE_KEY` (base58 encoded) for transaction signing

**Database**: Neon Serverless PostgreSQL
- Connection via `@neondatabase/serverless` driver
- Requires `DATABASE_URL` environment variable
- Supports edge/serverless deployment patterns

**UI Libraries**:
- Radix UI for accessible component primitives
- Tailwind CSS for styling with custom design tokens
- Lucide React for icons
- React Hook Form with Zod resolvers for form validation

**Build Tools**:
- Vite for frontend bundling and development server
- esbuild for backend bundling in production
- TypeScript for type safety across the stack
- PostCSS with Autoprefixer for CSS processing

**Development Tools** (Replit-specific):
- `@replit/vite-plugin-runtime-error-modal` for error overlay
- `@replit/vite-plugin-cartographer` for code mapping
- `@replit/vite-plugin-dev-banner` for development indicators