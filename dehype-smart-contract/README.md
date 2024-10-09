# DeHype Smart Contract

DeHype is a decentralized prediction marketplace platform built on the Solana blockchain, allowing users to create, participate in, and resolve prediction markets. This repository contains the smart contracts and instructions for the DeHype platform.

## Table of Contents

1. [Overview](#overview)
2. [Technologies](#technologies)
3. [Smart Contract Functionalities](#smart-contract-functionalities)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Program Instructions](#program-instructions)
7. [Market Resolution](#market-resolution)
8. [Testing](#testing)
9. [Contributing](#contributing)
10. [License](#license)

---

## Overview

DeHype leverages Solana's high throughput and low latency to facilitate the creation and interaction of prediction markets in a decentralized and trustless manner. Participants can create markets on specific topics, vote for potential outcomes, and resolve markets based on the outcome.

---

## Technologies

- **Solana**: Blockchain platform for scalable decentralized apps.
- **Anchor**: Framework for Solana smart contract development.
- **React Query**: For managing market-related queries.
- **Solana Wallet Adapter**: To interact with Solana wallets like Phantom.
- **Web3.js**: JavaScript API for Solana blockchain.
- **React**: For building the user interface.

---

## Smart Contract Functionalities

The DeHype smart contract supports the following operations:

1. **Create Market**: Allows users to create a new prediction market.
2. **Resolve Market**: The owner or resolver can resolve a market by declaring the winning outcome.
3. **Participate in Market**: Users can participate by placing bets on various outcomes.
4. **Fetch Market Data**: Retrieve market details including answers and outcomes.
5. **Get Market Answers**: Retrieve possible answers for a specific market.

---

## Installation

To get started with the DeHype smart contract, follow these steps:

### Prerequisites

Ensure that the following are installed on your system:

- Node.js v16.x.x or above
- Yarn or npm
- Solana CLI
- Anchor framework

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/your-org/dehype.git
   cd dehype
   ```

2. **Install Dependencies**

   Run the following command to install all required dependencies:

   ```bash
   yarn install
   ```

   or

   ```bash
   npm install
   ```

3. **Build the Smart Contract**

   ```bash
   anchor build
   ```

4. **Deploy the Contract**

   ```bash
   anchor deploy
   ```

---

## Usage

### Interacting with the Program

To interact with the DeHype contract, you can either use the provided SDK or connect via a wallet in the frontend application.

### Example: Creating a Market

You can create a new prediction market using the `createMarket` function, as shown below:

```typescript
createMarket.mutate({
  title: "Who will win the 2024 World Cup?",
  description: "Predict the winner of the 2024 Football World Cup.",
  answers: ["Team A", "Team B", "Team C"],
  creatorFeePercentage: new BN(5), // 5% creator fee
  serviceFeePercentage: new BN(2), // 2% service fee
});
```

---

## Program Instructions

1. **Create Market**
   - Takes in parameters like `title`, `description`, and `answers`.
   - Requires setting up PDAs for both the market and answer accounts.
   
   ```typescript
   program.methods
     .createMarket(marketKey, publicKey, title, description, answers, creatorFeePercentage, serviceFeePercentage)
     .accounts({
       marketAccount: marketPDA,
       answerAccount: answerPDA,
       configAccount: configPDA,
       owner: publicKey,
       systemProgram: SystemProgram.programId,
     })
     .transaction();
   ```

2. **Resolve Market**
   - Resolves a market to declare the winning outcome.
   
   ```typescript
   program.methods
     .resolveMarket(winningOutcome)
     .accounts({
       market: marketPubkey,
       user: publicKey,
     })
     .transaction();
   ```

---

## Market Resolution

Markets can be resolved when the event has concluded and the correct outcome is known. The market resolver (usually the creator or designated person) uses the `resolveMarket` function to mark the correct answer.

---

## Testing

To test the smart contract locally:

1. Start the Solana test validator:

   ```bash
   solana-test-validator
   ```

2. Run Anchor tests:

   ```bash
   anchor test
   ```

   Ensure that you have the latest Rust installed for compiling the program.

---

## Contributing

We welcome contributions from the community. Feel free to submit a pull request or report issues.

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Open a pull request when your changes are ready for review

---

## License

The DeHype smart contract is released under the MIT License.

---

This README provides the fundamental details needed to understand, install, and interact with the DeHype smart contract. Feel free to update sections as needed to reflect new functionalities or changes in the project.