#!/bin/bash

# Install k6 on macOS
echo "Installing k6 load testing tool..."

# Method 1: Using Homebrew (recommended)
if command -v brew &> /dev/null; then
    echo "Installing k6 via Homebrew..."
    brew install k6
else
    echo "Homebrew not found. Installing via direct download..."
    
    # Method 2: Direct download
    curl -L https://github.com/grafana/k6/releases/download/v0.47.0/k6-v0.47.0-macos-amd64.tar.gz | tar -xz
    sudo mv k6-v0.47.0-macos-amd64/k6 /usr/local/bin/
    rm -rf k6-v0.47.0-macos-amd64
fi

# Verify installation
echo "Verifying k6 installation..."
k6 version

echo "k6 installation complete!"
echo "Run tests with: npm run test:light"