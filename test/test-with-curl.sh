#!/bin/bash

# Create a test file
echo "Test file content for upload" > test-upload-file.txt

# Make the upload request with curl
echo "Testing upload with curl..."
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test-upload-file.txt" \
  http://localhost:3002/api/v1/upload/test-upload \
  -v

# Clean up
rm test-upload-file.txt