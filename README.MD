# Cardano Swap Guard

## Overview
A safety tool for Cardano DeFi swaps. It checks for high slippage, low liquidity, and more before executing—preventing losses. Built with React, Mesh.js, Charli3 API (from SteelSwap), and UTXOs.dev.

## Features
- Fetches real-time and 24h average prices.
- Enforces rules: Max 1% slippage, min output, etc.
- Builds and signs transactions only if safe.
- Testnet ready (Preprod).

## Setup
1. Clone repo: `git clone https://github.com/yourusername/cardano-swap-guard.git`
2. Install: `npm install`
3. Add .env with keys (see .env.example).
4. Run: `npm start`

## How It Works
- User enters swap amount.
- App fetches data from Charli3.
- Guard checks policies.
- If safe, uses Mesh.js to build tx and wallet to sign.

## Tech Stack
- Frontend: React + TypeScript
- Blockchain: Mesh.js, Blockfrost (Preprod)
- API: Charli3 (SteelSwap aggregator)
- Signing: Cardano wallet or UTXOs.dev

## Future Ideas
- Real DEX integration (e.g., full SteelSwap routes).
- Mobile via React Native.

## Credits
Built by Benjamin Ngumba for Blockchain Centre Hackathon.