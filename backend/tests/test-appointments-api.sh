#!/bin/bash

# Test script for Appointments API endpoints
# Make sure the server is running on port 3001

BASE_URL="http://localhost:3001/api/v1/appointments"
APPOINTMENT_ID=""

echo "========================================="
echo "Testing Appointments API Endpoints"
echo "========================================="

# Test 1: Create an appointment
echo -e "\n1. Creating a new appointment..."
CREATE_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Property Showing - 123 Main St",
    "type": "Showing",
    "date": "2025-02-01",
    "startTime": "14:00",
    "duration": 60,
    "location": "123 Main St, San Diego, CA",
    "propertyAddress": "123 Main St, San Diego, CA",
    "attendees": ["client_123456789012", "client_234567890123"],
    "description": "First-time buyer viewing single family home",
    "sendInvites": true,
    "reminders": ["1_day", "1_hour"],
    "videoMeetingRequired": false,
    "bufferTime": 15
  }')

echo "Response: $CREATE_RESPONSE"
APPOINTMENT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)
echo "Created appointment ID: $APPOINTMENT_ID"

# Test 2: Check for conflicts
echo -e "\n2. Checking for scheduling conflicts..."
curl -s -X POST "$BASE_URL/check-conflicts" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-02-01",
    "start": "14:00",
    "end": "15:00",
    "includeBufferTime": true
  }' | jq '.'

# Test 3: Get today's appointments
echo -e "\n3. Getting today's appointments..."
curl -s "$BASE_URL?filter=today&view=list" | jq '.'

# Test 4: Get appointments in calendar format
echo -e "\n4. Getting appointments in calendar format..."
curl -s "$BASE_URL?filter=this_week&view=calendar" | jq '.'

# Test 5: Get single appointment with details
echo -e "\n5. Getting appointment details..."
curl -s "$BASE_URL/$APPOINTMENT_ID" | jq '.'

# Test 6: Add preparation note
echo -e "\n6. Adding preparation note..."
curl -s -X POST "$BASE_URL/$APPOINTMENT_ID/preparation-notes" \
  -H "Content-Type: application/json" \
  -d '{
    "note": "Client prefers modern kitchens and open floor plans"
  }' | jq '.'

# Test 7: Send reminders
echo -e "\n7. Sending appointment reminders..."
curl -s -X POST "$BASE_URL/$APPOINTMENT_ID/reminders" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'

# Test 8: Get available slots
echo -e "\n8. Getting available time slots..."
curl -s "$BASE_URL/available-slots?date=2025-02-01&duration=60&startHour=9&endHour=17" | jq '.'

# Test 9: Update appointment (reschedule)
echo -e "\n9. Rescheduling appointment..."
curl -s -X PUT "$BASE_URL/$APPOINTMENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-02-02",
    "startTime": "15:00",
    "duration": 90
  }' | jq '.'

# Test 10: Mark appointment complete
echo -e "\n10. Marking appointment as complete..."
curl -s -X POST "$BASE_URL/$APPOINTMENT_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "Client interested in making an offer",
    "notes": "Loved the property, wants to discuss financing options",
    "followUpRequired": true,
    "followUpDate": "2025-02-05"
  }' | jq '.'

# Test 11: Get upcoming appointments
echo -e "\n11. Getting upcoming appointments (next 7 days)..."
curl -s "$BASE_URL/upcoming?days=7" | jq '.'

# Test 12: Get appointment statistics
echo -e "\n12. Getting appointment statistics..."
curl -s "$BASE_URL/stats?period=month" | jq '.'

# Test 13: Export appointment to ICS
echo -e "\n13. Exporting appointment to ICS format..."
curl -s "$BASE_URL/$APPOINTMENT_ID/export-ics" \
  -H "Accept: text/calendar" \
  -o "appointment-$APPOINTMENT_ID.ics"
echo "ICS file saved as appointment-$APPOINTMENT_ID.ics"

# Test 14: Create recurring appointment
echo -e "\n14. Creating recurring appointment..."
RECURRING_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Weekly Team Meeting",
    "type": "Other",
    "date": "2025-02-03",
    "startTime": "09:00",
    "duration": 60,
    "location": "Office Conference Room",
    "description": "Weekly real estate team sync",
    "isRecurring": true,
    "recurringPattern": {
      "frequency": "weekly",
      "interval": 1,
      "count": 4
    }
  }')
echo "Recurring appointment created"

# Test 15: Cancel an appointment
echo -e "\n15. Cancelling an appointment..."
curl -s -X POST "$BASE_URL/$APPOINTMENT_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Client requested to reschedule to next week",
    "sendNotification": true
  }' | jq '.'

# Test 16: Mark attendee as no-show
echo -e "\n16. Creating and marking attendee as no-show..."
NO_SHOW_RESPONSE=$(curl -s -X POST $BASE_URL \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buyer Consultation",
    "type": "Buyer Consultation",
    "date": "2025-02-01",
    "startTime": "10:00",
    "duration": 45,
    "location": "Office",
    "attendees": ["client_345678901234"]
  }')
NO_SHOW_ID=$(echo $NO_SHOW_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

curl -s -X POST "$BASE_URL/$NO_SHOW_ID/no-show" \
  -H "Content-Type: application/json" \
  -d '{
    "attendeeId": "client_345678901234",
    "reason": "Did not show up or call"
  }' | jq '.'

# Test 17: Get appointments by type
echo -e "\n17. Getting all showing appointments..."
curl -s "$BASE_URL?type=Showing&status=Scheduled" | jq '.'

# Test 18: Get appointments in agenda view
echo -e "\n18. Getting appointments in agenda view..."
curl -s "$BASE_URL?filter=this_week&view=agenda" | jq '.'

# Clean up - delete test appointment
echo -e "\n19. Cleaning up - deleting test appointment..."
curl -s -X DELETE "$BASE_URL/$NO_SHOW_ID" | jq '.'

echo -e "\n========================================="
echo "Appointment API tests completed!"
echo "========================================="