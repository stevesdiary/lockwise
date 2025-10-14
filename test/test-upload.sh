#!/bin/bash

# Create a test file
echo "This is a test file for upload" > test-file.txt

# Test upload endpoint without authentication
curl -X POST \
  http://localhost:3002/api/v1/upload/test-upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-file.txt"

# Clean up
rm test-file.txt