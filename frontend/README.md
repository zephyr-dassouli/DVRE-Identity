# D-VRE Frontend

This is the frontend for the D-VRE decentralized group management application. It is built with [Next.js](https://nextjs.org/) and [TypeScript](https://www.typescriptlang.org/), and interacts with Ethereum smart contracts for group creation and membership management.

## Features

- **Wallet Connection:** Connect your Ethereum wallet (MetaMask) to interact with the app.
- **Group Management:** Create new groups on-chain.
- **Group Selection:** View and select from all deployed groups.
- **Membership Management:** Join or leave groups directly from the UI.
- **Session Persistence:** Keeps your wallet and group memberships in session storage.

## Folder Structure

- `app/` - Next.js app directory (main entry: `page.tsx`)
- `components/` - React components (UI and forms)
- `hooks/` - Custom React hooks (e.g., `useAuth`)
- `abis/` - Contract ABIs for interacting with smart contracts
- `public/` - Static assets

## Getting Started

### Prerequisites

- Node.js
- npm
- MetaMask browser extension