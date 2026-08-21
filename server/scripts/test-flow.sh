#!/bin/bash

# Configuration
API_URL="http://localhost:5000/api"

echo "=== RescueRoute End-to-End Test Sequence (V2 Kolkata) ==="

echo "1. Creating a new Donation from Sector V, Kolkata..."
DONATION_RESPONSE=$(curl -s -X POST $API_URL/donations \
  -H "Content-Type: application/json" \
  -d '{
    "donorName": "Grand Celebration Banquet",
    "donorPhone": "+91 98765 43210",
    "foodCategory": "Cooked Meals",
    "exactFoodItems": ["Paneer Butter Masala", "Jeera Rice", "Dal Makhani", "Gulab Jamun"],
    "quantityServings": 180,
    "containerDetails": {
      "size": "Extra Large",
      "quantity": 2
    },
    "dietaryType": ["Veg", "Jain"],
    "address": "Sector V, Salt Lake, Kolkata",
    "location": {
      "type": "Point",
      "coordinates": [88.4330, 22.5740]
    },
    "shelfLifeHours": 3
  }')

echo "$DONATION_RESPONSE"
echo ""

# Extract Donation ID and Volunteer ID
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
CLAIM_RESPONSE=$(curl -s -X POST $API_URL/volunteers/claim \
  -H "Content-Type: application/json" \
  -d "{
    \"volunteerId\": \"$VOLUNTEER_ID\",
    \"donationId\": \"$DONATION_ID\"
  }")

echo "$CLAIM_RESPONSE"
echo ""


echo "4. Volunteer delivers the donation..."
DELIVER_RESPONSE=$(curl -s -X POST $API_URL/volunteers/deliver \
  -H "Content-Type: application/json" \
  -d "{
    \"volunteerId\": \"$VOLUNTEER_ID\",
    \"donationId\": \"$DONATION_ID\"
  }")

echo "$DELIVER_RESPONSE"
echo ""

echo "=== Test Sequence Completed ==="
