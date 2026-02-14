#!/bin/bash
set -e

# Install k6 on macOS
echo "Installing k6 load testing tool..."

# Method 1: Using Homebrew (recommended)
if command -v brew &> /dev/null; then
    echo "Installing k6 via Homebrew..."
    brew install k6 || { echo "Homebrew installation failed"; exit 1; }
else
    echo "Homebrew not found. Installing via direct download..."
    
    # Method 2: Direct download
    K6_VERSION="v0.47.0"
    K6_DIR="k6-${K6_VERSION}-macos-amd64"
    
    curl -L "https://github.com/grafana/k6/releases/download/${K6_VERSION}/${K6_DIR}.tar.gz" | tar -xz || { echo "Download failed"; exit 1; }
    sudo mv "${K6_DIR}/k6" /usr/local/bin/ || { echo "Move failed"; exit 1; }
    rm -rf "${K6_DIR}"
fi

# Verify installation
echo "Verifying k6 installation..."
k6 version || { echo "k6 verification failed"; exit 1; }

echo "k6 installation complete!"
echo "Run tests with: npm run test:light"