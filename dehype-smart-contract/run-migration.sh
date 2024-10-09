#!/bin/bash

# Set the ANCHOR_PROVIDER_URL environment variable
export ANCHOR_PROVIDER_URL=http://localhost:8899
export ANCHOR

# Run the TypeScript migration script using ts-node
npx ts-node -r tsconfig-paths/register migrations/deploy.ts