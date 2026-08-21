#!/bin/bash

# Configuration
API_URL="http://localhost:5000/api"

echo "=== RescueRoute End-to-End Test Sequence ==="

# 1. Seed Database (Run this before starting the server)
# Ensure you have run: node server/scripts/seed.js

echo "1. Creating a new Donation..."
DONATION_RESPONSE=$(curl -s -X POST $API_URL/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Grand Banquet Hall",
    "foodCategory": "Cooked Meals",
    "quantityServings": 50,
    "dietaryType": "Any",
    "address": "400 Grand Ave, Cityville",
    "location": {
      "type": "Point",
      "coordinates": [-73.960000, 40.760000]
    },
    "shelfLifeHours": 3
  }')

echo "$DONATION_RESPONSE"
echo ""

# Extract Donation ID and Volunteer ID for subsequent calls
# Assuming jq is installed or we use grep/sed. For simplicity, we just extract it via simple bash if possible, but the user can copy-paste.
# We will assume jq is available to make it automated, or just output instructions.
DONATION_ID=$(echo $DONATION_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -z "$DONATION_ID" ]; then
  echo "Failed to create donation or extract ID. Exiting."
  exit 1
fi

echo "Created Donation ID: $DONATION_ID"

echo "2. Fetching available Volunteers..."
VOLUNTEERS_RESPONSE=$(curl -s -X GET $API_URL/volunteers)
echo "$VOLUNTEERS_RESPONSE"
echo ""

VOLUNTEER_ID=$(echo $VOLUNTEERS_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | grep -o '[^"]*$')

if [ -z "$VOLUNTEER_ID" ]; then
  echo "Failed to fetch volunteer. Exiting."
  exit 1
fi

echo "Using Volunteer ID: $VOLUNTEER_ID"

echo "3. Volunteer claims the donation..."
CLAIM_RESPONSE=$(curl -s -X POST $API_URL/volunteers/donations/$DONATION_ID/claim \
  -H "Content-Type: application/json" \
  -d "{
    \"volunteerId\": \"$VOLUNTEER_ID\"
  }")

echo "$CLAIM_RESPONSE"
echo ""


echo "4. Volunteer delivers the donation..."
DELIVER_RESPONSE=$(curl -s -X POST $API_URL/volunteers/donations/$DONATION_ID/deliver)

echo "$DELIVER_RESPONSE"
echo ""

echo "=== Test Sequence Completed ==="
