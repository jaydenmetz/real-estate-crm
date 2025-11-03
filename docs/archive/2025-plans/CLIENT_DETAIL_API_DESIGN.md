# Client Detail API Design - Complete Implementation

**Created:** 2025-10-29
**Purpose:** Define comprehensive client detail API structure with intelligent onboarding
**Status:** Active Reference - Implementation Ready

---

## Widget Strategy for Clients

### The 4 Essential Client Widgets

1. **Client Profile & Preferences** - Communication preferences, availability, personal interests
2. **Financial Snapshot** - Budget, pre-approval, down payment, gift funds, cash reserves
3. **Related People** - Spouse, lender, attorney, co-buyers, family members
4. **Client Journey** - Smart checklist that adapts based on client type (buyer/seller/both)

**Why These 4?**
- ✅ Works for both buyers AND sellers
- ✅ Captures everything a realtor needs to know
- ✅ Drives the onboarding process
- ✅ Creates accountability (no missed steps)

---

## Complete API Response Example

### GET /v1/clients/:id?include=full

```json
{
  "success": true,
  "data": {
    // ==========================================
    // 1. CORE CLIENT DATA (Hero Section)
    // ==========================================
    "id": "c8f3e4a1-9b2d-4c7a-8f1e-2d3c4b5a6e7f",
    "first_name": "Sarah",
    "last_name": "Johnson",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@gmail.com",
    "phone": "(661) 555-1234",
    "alternate_phone": "(661) 555-5678",
    "status": "active",
    "avatar": "https://cdn.jaydenmetz.com/clients/sarah-johnson.jpg",

    // Address
    "street_address": "1234 Oak Street",
    "city": "Bakersfield",
    "state": "CA",
    "zip": "93301",

    // Client Type & Dates
    "client_type": "buyer_and_seller",  // Options: buyer, seller, buyer_and_seller
    "lead_source": "zillow",
    "assigned_agent_id": "a1b2c3d4-...",
    "assigned_agent_name": "Jayden Metz",
    "client_since": "2025-10-01T12:00:00Z",
    "last_contact": "2025-10-28T15:30:00Z",
    "next_scheduled_contact": "2025-11-02T10:00:00Z",

    // Tags and Notes
    "tags": ["first_time_buyer", "pre_approved", "military_veteran", "urgent"],
    "priority": "high",
    "internal_notes": "Very motivated buyer, pre-approved, wants to close by end of year",

    // ==========================================
    // 2. COMPUTED FIELDS (Hero Stats)
    // ==========================================
    "computed": {
      "days_as_client": 28,
      "days_since_last_contact": 1,
      "response_rate_percentage": 95,  // How often they respond to calls/texts
      "total_properties_viewed": 12,
      "total_offers_made": 2,
      "estimated_lifetime_value": 450000,  // Expected transaction value
      "commission_potential": 13500,  // 3% of estimated value
      "onboarding_completion_percentage": 75,
      "relationship_health_score": 92  // AI-calculated score (0-100)
    },

    // ==========================================
    // 3. LEFT SIDEBAR - Quick Actions
    // ==========================================
    "sidebar_left": {
      "quick_actions": [
        {
          "id": "call",
          "label": "Call Client",
          "icon": "Phone",
          "action": "call",
          "enabled": true,
          "phone_number": "(661) 555-1234",
          "best_time_to_call": "Weekdays 5-8pm, Weekends 10am-2pm"
        },
        {
          "id": "text",
          "label": "Send Text",
          "icon": "MessageSquare",
          "action": "text",
          "enabled": true,
          "phone_number": "(661) 555-1234",
          "preferred_method": true  // Client prefers texts
        },
        {
          "id": "email",
          "label": "Send Email",
          "icon": "Mail",
          "action": "email",
          "enabled": true,
          "email": "sarah.johnson@gmail.com"
        },
        {
          "id": "schedule",
          "label": "Schedule Showing",
          "icon": "Calendar",
          "action": "schedule_showing",
          "enabled": true
        },
        {
          "id": "send_listings",
          "label": "Send Listings",
          "icon": "Home",
          "action": "send_listings",
          "enabled": true,
          "saved_search_count": 3
        },
        {
          "id": "add_note",
          "label": "Add Note",
          "icon": "FileText",
          "action": "add_note",
          "enabled": true
        }
      ],

      "upcoming_appointments": [
        {
          "id": "appt-001",
          "type": "showing",
          "title": "Property Showing - 5609 Monitor St",
          "date": "2025-11-02",
          "time": "10:00 AM",
          "location": "5609 Monitor Street, Bakersfield, CA",
          "status": "confirmed",
          "days_away": 4
        },
        {
          "id": "appt-002",
          "type": "consultation",
          "title": "Buyer Consultation",
          "date": "2025-11-05",
          "time": "2:00 PM",
          "location": "Office - 122 S Green St",
          "status": "pending",
          "days_away": 7
        }
      ],

      "recent_activity": [
        {
          "id": "act-001",
          "timestamp": "2025-10-28T15:30:00Z",
          "type": "communication",
          "icon": "MessageSquare",
          "description": "Sent text about new listing",
          "user": "Jayden Metz"
        },
        {
          "id": "act-002",
          "timestamp": "2025-10-28T14:00:00Z",
          "type": "property_view",
          "icon": "Eye",
          "description": "Viewed listing: 5609 Monitor St",
          "user": "Sarah Johnson"
        },
        {
          "id": "act-003",
          "timestamp": "2025-10-27T10:00:00Z",
          "type": "appointment",
          "icon": "Calendar",
          "description": "Completed showing at 1234 Main St",
          "user": "Jayden Metz"
        }
      ]
    },

    // ==========================================
    // 4. RIGHT SIDEBAR - Smart Context & Alerts
    // ==========================================
    "sidebar_right": {
      "important_alerts": [
        {
          "id": "alert-001",
          "type": "warning",
          "severity": "high",
          "icon": "AlertTriangle",
          "title": "Pre-Approval Expires Soon",
          "message": "Pre-approval letter expires in 14 days (Nov 12)",
          "action": "remind_client",
          "action_label": "Send Reminder"
        },
        {
          "id": "alert-002",
          "type": "info",
          "severity": "medium",
          "icon": "TrendingUp",
          "title": "New Listings Match Criteria",
          "message": "3 new properties match buyer criteria",
          "action": "send_listings",
          "action_label": "Send to Client"
        },
        {
          "id": "alert-003",
          "type": "success",
          "severity": "low",
          "icon": "CheckCircle",
          "title": "High Engagement Client",
          "message": "95% response rate - excellent communication",
          "action": null
        }
      ],

      "ai_insights": [
        {
          "type": "opportunity",
          "message": "Client has viewed same neighborhood 5 times - strong interest in area",
          "confidence": 0.92
        },
        {
          "type": "risk",
          "message": "No contact in 48 hours - consider follow-up",
          "confidence": 0.78
        },
        {
          "type": "suggestion",
          "message": "Client prefers evening showings (5-7pm based on history)",
          "confidence": 0.85
        }
      ],

      "key_dates": [
        {
          "date": "2025-11-12",
          "label": "Pre-Approval Expires",
          "days_away": 14,
          "type": "deadline",
          "critical": true
        },
        {
          "date": "2025-12-01",
          "label": "Target Move-In Date",
          "days_away": 33,
          "type": "goal",
          "critical": false
        },
        {
          "date": "2025-11-15",
          "label": "Current Lease Ends",
          "days_away": 17,
          "type": "deadline",
          "critical": true
        }
      ],

      "relationship_health": {
        "score": 92,
        "status": "excellent",
        "factors": [
          { "name": "Response Rate", "score": 95, "weight": 0.3 },
          { "name": "Appointment Attendance", "score": 100, "weight": 0.2 },
          { "name": "Communication Frequency", "score": 88, "weight": 0.2 },
          { "name": "Engagement Level", "score": 90, "weight": 0.3 }
        ]
      }
    },

    // ==========================================
    // 5. WIDGET 1: CLIENT PROFILE & PREFERENCES
    // ==========================================
    "widgets": {
      "profile_and_preferences": {
        "communication_preferences": {
          "preferred_method": "text",  // Options: call, text, email, in_person
          "secondary_method": "email",
          "do_not_call": false,
          "ok_to_text": true,
          "ok_to_email": true,

          "availability": {
            "weekday_morning": false,      // 8am-12pm
            "weekday_afternoon": false,    // 12pm-5pm
            "weekday_evening": true,       // 5pm-9pm
            "weekend_morning": true,       // 8am-12pm
            "weekend_afternoon": true,     // 12pm-5pm
            "weekend_evening": false,      // 5pm-9pm

            "best_time_notes": "Weekdays after 5pm, weekends before 5pm. Avoid calling during work hours (9-5)."
          },

          "contact_frequency": {
            "preferred_frequency": "weekly",  // Options: daily, weekly, bi_weekly, monthly, as_needed
            "max_contacts_per_week": 3,
            "quiet_hours_start": "21:00",  // 9 PM
            "quiet_hours_end": "08:00"     // 8 AM
          },

          "response_history": {
            "average_response_time_minutes": 45,
            "response_rate_percentage": 95,
            "preferred_response_window": "30-60 minutes",
            "total_communications_sent": 42,
            "total_responses_received": 40
          }
        },

        "personal_information": {
          "date_of_birth": "1988-05-15",
          "age": 37,
          "occupation": "Software Engineer",
          "employer": "Tech Corp Inc",
          "work_phone": "(661) 555-9999",
          "marital_status": "married",
          "has_children": true,
          "number_of_children": 2,
          "children_ages": [8, 5],

          "languages_spoken": ["English", "Spanish"],
          "preferred_language": "English",

          "military_status": "veteran",  // Options: active, veteran, family, none
          "veteran_benefits_eligible": true,

          "special_needs": "Wheelchair accessible properties only",
          "pets": [
            { "type": "dog", "breed": "Golden Retriever", "name": "Max" },
            { "type": "cat", "breed": "Tabby", "name": "Whiskers" }
          ]
        },

        "interests_and_motivations": {
          "primary_motivation": "Upgrading for growing family",
          "secondary_motivations": [
            "Better school district",
            "Larger yard for kids and pets",
            "Home office space for remote work"
          ],

          "must_haves": [
            "4+ bedrooms",
            "2+ bathrooms",
            "Large backyard",
            "Single-story (wheelchair accessible)",
            "Attached garage",
            "Good school district"
          ],

          "nice_to_haves": [
            "Swimming pool",
            "Updated kitchen",
            "Home office",
            "Solar panels",
            "Smart home features"
          ],

          "deal_breakers": [
            "HOA fees over $200/month",
            "Major repairs needed",
            "Busy street",
            "Small yard"
          ],

          "lifestyle_preferences": {
            "commute_to_work": "15 miles to downtown",
            "max_commute_time_minutes": 30,
            "preferred_neighborhoods": ["Seven Oaks", "Stockdale Estates", "Rio Bravo"],
            "school_district_priority": "high",
            "walkability_importance": "medium",
            "outdoor_activities": ["hiking", "biking", "playground access"]
          }
        },

        "urgency_and_timeline": {
          "urgency_level": "high",  // Options: low, medium, high, urgent
          "target_close_date": "2025-12-15",
          "must_close_by": "2025-12-31",
          "flexible_on_timing": false,
          "reason_for_timeline": "Current lease ends December 15th",

          "pre_shopping_phase": false,  // Just looking vs. ready to buy
          "ready_to_make_offer": true,
          "days_to_decision": 7  // How quickly they make decisions after viewing
        }
      },

      // ==========================================
      // 6. WIDGET 2: FINANCIAL SNAPSHOT
      // ==========================================
      "financial_snapshot": {
        "buyer_financials": {
          "pre_approval_status": "approved",  // Options: not_started, in_progress, approved, denied, expired
          "pre_approval_amount": 500000,
          "pre_approval_date": "2025-10-15",
          "pre_approval_expiration": "2025-11-12",
          "lender_name": "Wells Fargo Home Mortgage",
          "lender_contact": "John Smith",
          "lender_phone": "(661) 555-7777",
          "lender_email": "john.smith@wellsfargo.com",
          "loan_officer_id": "loan-officer-uuid",  // Link to people widget

          "loan_type": "conventional",  // Options: conventional, fha, va, usda, cash
          "down_payment_percentage": 20,
          "estimated_down_payment": 90000,

          "down_payment_sources": [
            {
              "source": "savings",
              "amount": 70000,
              "status": "verified",
              "verification_date": "2025-10-15"
            },
            {
              "source": "gift_from_parents",
              "amount": 20000,
              "status": "pending_verification",
              "gift_letter_required": true,
              "gift_letter_received": false,
              "donor_name": "Robert and Linda Johnson",
              "donor_relationship": "parents"
            }
          ],

          "cash_reserves": {
            "total_reserves": 25000,
            "months_of_reserves": 6,
            "verified": true,
            "verification_date": "2025-10-15"
          },

          "income_verification": {
            "annual_income": 120000,
            "spouse_annual_income": 80000,
            "total_household_income": 200000,
            "income_verified": true,
            "employment_verified": true,
            "paystubs_received": true,
            "tax_returns_received": true,
            "years_at_current_job": 5
          },

          "debt_to_income": {
            "monthly_debt_payments": 1800,
            "monthly_gross_income": 16667,
            "dti_ratio": 0.108,  // 10.8%
            "dti_ratio_with_new_loan": 0.32,  // 32% (includes new mortgage)
            "max_monthly_payment": 3500,
            "comfortable_monthly_payment": 3000
          },

          "credit_profile": {
            "credit_score": 780,
            "credit_score_date": "2025-10-10",
            "credit_report_pulled": true,
            "credit_issues": false,
            "bankruptcy_history": false,
            "foreclosure_history": false
          },

          "closing_cost_estimate": {
            "estimated_closing_costs": 12000,
            "closing_costs_covered_by": "buyer",  // buyer, seller, split
            "cash_needed_at_closing": 102000,  // Down payment + closing costs
            "earnest_money_deposit": 5000,
            "earnest_money_paid": true,
            "earnest_money_date": "2025-10-20"
          }
        },

        "seller_financials": {
          "current_home": {
            "property_address": "1234 Oak Street, Bakersfield, CA 93301",
            "property_id": "listing-uuid-123",  // Link to listing if listed
            "current_mortgage_balance": 180000,
            "original_purchase_price": 250000,
            "original_purchase_date": "2018-06-15",
            "estimated_current_value": 420000,
            "equity_position": 240000,
            "monthly_mortgage_payment": 1800,

            "liens_or_judgments": false,
            "hoa_dues": 0,
            "property_taxes_annual": 4200,
            "homeowners_insurance_annual": 1200,

            "improvements_made": [
              {
                "description": "Kitchen remodel",
                "cost": 35000,
                "date": "2022-03-01"
              },
              {
                "description": "New HVAC system",
                "cost": 8000,
                "date": "2023-01-15"
              }
            ],
            "total_improvements_cost": 43000
          },

          "selling_timeline": {
            "list_before_buying": true,
            "contingent_sale": true,
            "can_carry_two_mortgages": false,
            "bridge_loan_needed": false,
            "move_out_flexibility": "30 days after closing"
          },

          "expected_proceeds": {
            "estimated_sale_price": 420000,
            "mortgage_payoff": 180000,
            "selling_costs": 29400,  // 7% (commission + fees)
            "estimated_net_proceeds": 210600,
            "proceeds_for_down_payment": 90000,
            "proceeds_for_reserves": 25000,
            "remaining_proceeds": 95600
          }
        },

        "affordability_analysis": {
          "max_purchase_price": 500000,
          "comfortable_purchase_price": 450000,
          "ideal_purchase_price": 420000,
          "max_monthly_payment": 3500,
          "comfortable_monthly_payment": 3000,
          "ideal_monthly_payment": 2700,

          "budget_breakdown": {
            "principal_and_interest": 2200,
            "property_taxes": 350,
            "homeowners_insurance": 150,
            "hoa_fees": 100,
            "pmi": 0,  // 20% down = no PMI
            "total_monthly_piti": 2800
          },

          "financial_health_score": 88,  // 0-100 calculated score
          "approval_confidence": "high"  // low, medium, high, very_high
        }
      },

      // ==========================================
      // 7. WIDGET 3: RELATED PEOPLE
      // ==========================================
      "related_people": {
        "family_members": [
          {
            "id": "person-001",
            "relationship": "spouse",
            "first_name": "Michael",
            "last_name": "Johnson",
            "email": "michael.johnson@gmail.com",
            "phone": "(661) 555-4321",
            "date_of_birth": "1985-08-20",
            "occupation": "Marketing Manager",
            "employer": "Ad Agency LLC",
            "annual_income": 80000,
            "on_loan_application": true,
            "credit_score": 760,
            "primary_contact": false,  // Sarah is primary
            "can_sign_documents": true,
            "communication_preferences": {
              "ok_to_contact": true,
              "preferred_method": "email",
              "include_in_group_communications": true
            }
          },
          {
            "id": "person-002",
            "relationship": "child",
            "first_name": "Emma",
            "last_name": "Johnson",
            "age": 8,
            "school": "Roosevelt Elementary",
            "grade": 3,
            "notes": "Allergic to peanuts - relevant for neighborhood with peanut-free school"
          },
          {
            "id": "person-003",
            "relationship": "child",
            "first_name": "Noah",
            "last_name": "Johnson",
            "age": 5,
            "school": "Roosevelt Elementary",
            "grade": "Kindergarten"
          }
        ],

        "transaction_team": [
          {
            "id": "person-004",
            "role": "lender",
            "company": "Wells Fargo Home Mortgage",
            "first_name": "John",
            "last_name": "Smith",
            "title": "Senior Loan Officer",
            "email": "john.smith@wellsfargo.com",
            "phone": "(661) 555-7777",
            "mobile": "(661) 555-8888",
            "nmls_number": "123456",
            "license_state": "CA",

            "specialties": ["conventional", "fha", "va"],
            "average_response_time": "2 hours",
            "preferred_communication": "email",

            "relationship_quality": "excellent",  // poor, fair, good, excellent
            "on_time_closings_percentage": 95,
            "client_satisfaction_score": 4.8,

            "notes": "Very responsive, great with first-time buyers",
            "added_date": "2025-10-01",
            "last_contact": "2025-10-25"
          },
          {
            "id": "person-005",
            "role": "real_estate_attorney",
            "company": "Johnson & Associates Law",
            "first_name": "Emily",
            "last_name": "Rodriguez",
            "title": "Real Estate Attorney",
            "email": "emily@johnsonlaw.com",
            "phone": "(661) 555-9999",
            "bar_number": "CA-123456",
            "notes": "Recommended by client, handles all their legal matters"
          },
          {
            "id": "person-006",
            "role": "home_inspector",
            "company": "Bakersfield Home Inspections",
            "first_name": "David",
            "last_name": "Chen",
            "email": "david@bfhomeinspections.com",
            "phone": "(661) 555-0000",
            "license_number": "CA-HI-789",
            "notes": "Preferred inspector, very thorough"
          },
          {
            "id": "person-007",
            "role": "insurance_agent",
            "company": "State Farm Insurance",
            "first_name": "Lisa",
            "last_name": "Martinez",
            "email": "lisa@statefarm.com",
            "phone": "(661) 555-1111"
          }
        ],

        "support_network": [
          {
            "id": "person-008",
            "relationship": "parent",
            "first_name": "Robert",
            "last_name": "Johnson",
            "role_in_transaction": "gift_donor",
            "gift_amount": 20000,
            "gift_letter_signed": false,
            "contact_for_gift_letter": true,
            "email": "robert.j@gmail.com",
            "phone": "(661) 555-2222"
          },
          {
            "id": "person-009",
            "relationship": "parent",
            "first_name": "Linda",
            "last_name": "Johnson",
            "role_in_transaction": "gift_donor",
            "gift_amount": 20000,
            "email": "linda.j@gmail.com",
            "phone": "(661) 555-3333"
          },
          {
            "id": "person-010",
            "relationship": "friend",
            "first_name": "Amanda",
            "last_name": "Brown",
            "role_in_transaction": "referral_source",
            "notes": "Referred Sarah and Michael, previous client (closed 2023)",
            "referral_bonus_paid": true,
            "referral_bonus_amount": 500
          }
        ],

        "summary": {
          "total_people": 10,
          "family_members": 3,
          "transaction_team": 4,
          "support_network": 3,
          "people_needing_attention": [
            {
              "person_id": "person-008",
              "reason": "Gift letter not signed yet",
              "urgency": "high"
            }
          ]
        }
      },

      // ==========================================
      // 8. WIDGET 4: CLIENT JOURNEY (Smart Checklist)
      // ==========================================
      "client_journey": {
        "client_type": "buyer_and_seller",
        "active_checklists": ["buyer_checklist", "seller_checklist"],

        "overall_progress": {
          "total_steps": 45,
          "completed_steps": 34,
          "completion_percentage": 75,
          "estimated_days_to_completion": 21,
          "on_track": true
        },

        "buyer_checklist": {
          "id": "buyer_checklist",
          "name": "Buyer Journey Checklist",
          "type": "buyer",
          "active": true,
          "started_date": "2025-10-01",
          "target_completion_date": "2025-12-15",

          "phases": [
            {
              "phase": "initial_consultation",
              "phase_number": 1,
              "name": "Initial Consultation",
              "status": "completed",
              "completion_percentage": 100,
              "completed_date": "2025-10-01",

              "steps": [
                {
                  "id": "step-101",
                  "title": "Schedule buyer consultation",
                  "description": "Initial meeting to understand needs and goals",
                  "status": "completed",
                  "completed_by": "Jayden Metz",
                  "completed_date": "2025-10-01T10:00:00Z",
                  "due_date": "2025-10-01",
                  "priority": "high",
                  "automated_reminder": true,
                  "reminder_sent": true
                },
                {
                  "id": "step-102",
                  "title": "Complete client intake form",
                  "description": "Gather basic information and preferences",
                  "status": "completed",
                  "completed_by": "Sarah Johnson",
                  "completed_date": "2025-10-01T14:30:00Z",
                  "form_response_id": "form-response-001",
                  "automated": true
                },
                {
                  "id": "step-103",
                  "title": "Explain buyer representation agreement",
                  "description": "Review and sign buyer representation agreement",
                  "status": "completed",
                  "completed_by": "Jayden Metz",
                  "completed_date": "2025-10-01T15:00:00Z",
                  "document_signed": true,
                  "document_id": "doc-001"
                },
                {
                  "id": "step-104",
                  "title": "Discuss pre-approval process",
                  "description": "Explain mortgage pre-approval and recommend lenders",
                  "status": "completed",
                  "completed_by": "Jayden Metz",
                  "completed_date": "2025-10-01T15:30:00Z",
                  "lenders_recommended": ["Wells Fargo", "Bank of America", "Quicken Loans"]
                }
              ]
            },

            {
              "phase": "financial_preparation",
              "phase_number": 2,
              "name": "Financial Preparation",
              "status": "completed",
              "completion_percentage": 100,
              "completed_date": "2025-10-15",

              "steps": [
                {
                  "id": "step-201",
                  "title": "Get pre-approved for mortgage",
                  "description": "Submit loan application and receive pre-approval letter",
                  "status": "completed",
                  "completed_by": "Sarah Johnson",
                  "completed_date": "2025-10-15T12:00:00Z",
                  "due_date": "2025-10-10",
                  "overdue_days": 5,
                  "document_received": true,
                  "document_id": "doc-002",
                  "automated_reminder": true,
                  "reminder_count": 2
                },
                {
                  "id": "step-202",
                  "title": "Review pre-approval letter",
                  "description": "Confirm loan amount and terms are accurate",
                  "status": "completed",
                  "completed_by": "Jayden Metz",
                  "completed_date": "2025-10-15T14:00:00Z"
                },
                {
                  "id": "step-203",
                  "title": "Verify down payment funds",
                  "description": "Provide bank statements showing down payment availability",
                  "status": "completed",
                  "completed_by": "Sarah Johnson",
                  "completed_date": "2025-10-15T16:00:00Z",
                  "verification_method": "bank_statements",
                  "verified_amount": 70000
                },
                {
                  "id": "step-204",
                  "title": "Obtain gift letter (if applicable)",
                  "description": "Get signed gift letter from parents for $20k gift",
                  "status": "in_progress",
                  "assigned_to": "Sarah Johnson",
                  "due_date": "2025-11-05",
                  "priority": "high",
                  "blockers": ["Waiting for parents to sign"],
                  "automated_reminder": true,
                  "next_reminder_date": "2025-11-01",
                  "notes": "Robert and Linda Johnson - sent gift letter template on 10/20"
                },
                {
                  "id": "step-205",
                  "title": "Get homeowners insurance quotes",
                  "description": "Obtain at least 3 insurance quotes for comparison",
                  "status": "completed",
                  "completed_by": "Sarah Johnson",
                  "completed_date": "2025-10-18T10:00:00Z",
                  "quotes_received": 3,
                  "selected_provider": "State Farm"
                }
              ]
            },

            {
              "phase": "property_search",
              "phase_number": 3,
              "name": "Property Search",
              "status": "in_progress",
              "completion_percentage": 60,

              "steps": [
                {
                  "id": "step-301",
                  "title": "Set up MLS listing alerts",
                  "description": "Configure automated listing alerts based on criteria",
                  "status": "completed",
                  "completed_by": "Jayden Metz",
                  "completed_date": "2025-10-02T12:00:00Z",
                  "saved_searches": 3,
                  "automated": true
                },
                {
                  "id": "step-302",
                  "title": "Tour neighborhoods",
                  "description": "Drive through preferred neighborhoods to understand area",
                  "status": "completed",
                  "completed_by": "Sarah Johnson",
                  "completed_date": "2025-10-10T14:00:00Z",
                  "neighborhoods_toured": ["Seven Oaks", "Stockdale Estates", "Rio Bravo"]
                },
                {
                  "id": "step-303",
                  "title": "Schedule property showings",
                  "description": "View properties matching buyer criteria",
                  "status": "in_progress",
                  "assigned_to": "Jayden Metz",
                  "properties_shown": 12,
                  "properties_pending": 3,
                  "next_showing_date": "2025-11-02T10:00:00Z",
                  "automated_scheduling": true
                },
                {
                  "id": "step-304",
                  "title": "Compare properties",
                  "description": "Use comparison tool to evaluate pros/cons of each property",
                  "status": "in_progress",
                  "assigned_to": "Sarah Johnson",
                  "properties_compared": 12,
                  "favorites": 3
                },
                {
                  "id": "step-305",
                  "title": "Make offer on property",
                  "description": "Prepare and submit purchase offer when ready",
                  "status": "not_started",
                  "assigned_to": "Jayden Metz",
                  "estimated_date": "2025-11-08",
                  "dependencies": ["step-303", "step-304"]
                }
              ]
            },

            {
              "phase": "under_contract",
              "phase_number": 4,
              "name": "Under Contract",
              "status": "not_started",
              "completion_percentage": 0,

              "steps": [
                {
                  "id": "step-401",
                  "title": "Offer accepted",
                  "description": "Negotiate and reach accepted purchase agreement",
                  "status": "not_started",
                  "automated": true
                },
                {
                  "id": "step-402",
                  "title": "Pay earnest money deposit",
                  "description": "Wire earnest money to escrow within 3 days",
                  "status": "not_started",
                  "due_days_after_previous": 3,
                  "typical_amount": 5000,
                  "automated_reminder": true
                },
                {
                  "id": "step-403",
                  "title": "Order home inspection",
                  "description": "Schedule professional home inspection",
                  "status": "not_started",
                  "due_days_after_previous": 7,
                  "recommended_inspectors": ["David Chen - Bakersfield Home Inspections"],
                  "automated_reminder": true
                },
                {
                  "id": "step-404",
                  "title": "Review inspection report",
                  "description": "Analyze inspection findings with agent",
                  "status": "not_started",
                  "dependencies": ["step-403"]
                },
                {
                  "id": "step-405",
                  "title": "Request repairs (if needed)",
                  "description": "Submit repair request addendum to seller",
                  "status": "not_started",
                  "optional": true,
                  "dependencies": ["step-404"]
                },
                {
                  "id": "step-406",
                  "title": "Order appraisal",
                  "description": "Lender orders property appraisal",
                  "status": "not_started",
                  "assigned_to": "John Smith (Lender)",
                  "automated_reminder": true,
                  "remind_lender": true
                },
                {
                  "id": "step-407",
                  "title": "Complete loan application",
                  "description": "Submit all required documents to lender",
                  "status": "not_started",
                  "automated_reminder": true,
                  "typical_documents": [
                    "Paystubs (2 most recent)",
                    "W-2s (2 years)",
                    "Tax returns (2 years)",
                    "Bank statements (2 months)",
                    "Gift letter (if applicable)"
                  ]
                },
                {
                  "id": "step-408",
                  "title": "Title search and insurance",
                  "description": "Escrow company orders title report and insurance",
                  "status": "not_started",
                  "automated": true
                },
                {
                  "id": "step-409",
                  "title": "Final walkthrough",
                  "description": "Inspect property 24-48 hours before closing",
                  "status": "not_started",
                  "due_days_before_closing": 1,
                  "automated_reminder": true
                }
              ]
            },

            {
              "phase": "closing",
              "phase_number": 5,
              "name": "Closing",
              "status": "not_started",
              "completion_percentage": 0,

              "steps": [
                {
                  "id": "step-501",
                  "title": "Review closing disclosure",
                  "description": "Receive and review closing disclosure 3 days before closing",
                  "status": "not_started",
                  "due_days_before_closing": 3,
                  "automated_reminder": true
                },
                {
                  "id": "step-502",
                  "title": "Wire closing funds",
                  "description": "Wire remaining cash to close to escrow",
                  "status": "not_started",
                  "due_days_before_closing": 1,
                  "automated_reminder": true,
                  "wire_fraud_warning": true
                },
                {
                  "id": "step-503",
                  "title": "Attend closing appointment",
                  "description": "Sign final documents and receive keys",
                  "status": "not_started",
                  "estimated_duration_minutes": 60,
                  "bring_items": ["Photo ID", "Cashier's check (if not wiring)"]
                },
                {
                  "id": "step-504",
                  "title": "Receive keys",
                  "description": "Take possession of property",
                  "status": "not_started",
                  "automated": true
                }
              ]
            },

            {
              "phase": "post_closing",
              "phase_number": 6,
              "name": "Post-Closing",
              "status": "not_started",
              "completion_percentage": 0,

              "steps": [
                {
                  "id": "step-601",
                  "title": "Change locks",
                  "description": "Replace or rekey all exterior door locks",
                  "status": "not_started",
                  "recommended_timeline": "Within 24 hours",
                  "automated_reminder": true
                },
                {
                  "id": "step-602",
                  "title": "Set up utilities",
                  "description": "Transfer or establish utility accounts",
                  "status": "not_started",
                  "utilities_list": ["Electric", "Gas", "Water", "Trash", "Internet"]
                },
                {
                  "id": "step-603",
                  "title": "Update address",
                  "description": "File change of address with USPS and update accounts",
                  "status": "not_started",
                  "automated_reminder": true
                },
                {
                  "id": "step-604",
                  "title": "Request testimonial",
                  "description": "Ask client for review/testimonial",
                  "status": "not_started",
                  "assigned_to": "Jayden Metz",
                  "automated": true,
                  "send_days_after_closing": 7
                },
                {
                  "id": "step-605",
                  "title": "1-month check-in",
                  "description": "Follow up to ensure smooth transition",
                  "status": "not_started",
                  "assigned_to": "Jayden Metz",
                  "automated": true,
                  "send_days_after_closing": 30
                }
              ]
            }
          ],

          "summary": {
            "total_phases": 6,
            "completed_phases": 2,
            "current_phase": "property_search",
            "total_steps": 29,
            "completed_steps": 14,
            "in_progress_steps": 3,
            "not_started_steps": 12,
            "overdue_steps": 0,
            "completion_percentage": 48
          }
        },

        "seller_checklist": {
          "id": "seller_checklist",
          "name": "Seller Journey Checklist",
          "type": "seller",
          "active": true,
          "started_date": "2025-10-01",
          "target_completion_date": "2025-12-01",

          "phases": [
            {
              "phase": "pre_listing",
              "phase_number": 1,
              "name": "Pre-Listing Preparation",
              "status": "completed",
              "completion_percentage": 100,

              "steps": [
                {
                  "id": "step-701",
                  "title": "Schedule listing consultation",
                  "status": "completed",
                  "completed_date": "2025-10-01T10:00:00Z"
                },
                {
                  "id": "step-702",
                  "title": "Sign listing agreement",
                  "status": "completed",
                  "completed_date": "2025-10-01T15:00:00Z",
                  "document_signed": true
                },
                {
                  "id": "step-703",
                  "title": "Complete seller disclosure",
                  "status": "completed",
                  "completed_date": "2025-10-05T12:00:00Z"
                },
                {
                  "id": "step-704",
                  "title": "Prepare home for listing",
                  "description": "Declutter, clean, minor repairs",
                  "status": "completed",
                  "completed_date": "2025-10-15T18:00:00Z"
                },
                {
                  "id": "step-705",
                  "title": "Professional photography",
                  "status": "completed",
                  "completed_date": "2025-10-18T14:00:00Z",
                  "photographer": "Elite Real Estate Photos"
                }
              ]
            },

            {
              "phase": "active_listing",
              "phase_number": 2,
              "name": "Active Listing",
              "status": "in_progress",
              "completion_percentage": 40,

              "steps": [
                {
                  "id": "step-801",
                  "title": "List property on MLS",
                  "status": "completed",
                  "completed_date": "2025-10-20T09:00:00Z",
                  "mls_number": "BK-123456"
                },
                {
                  "id": "step-802",
                  "title": "Install lockbox and signage",
                  "status": "completed",
                  "completed_date": "2025-10-20T10:00:00Z"
                },
                {
                  "id": "step-803",
                  "title": "Schedule open houses",
                  "status": "in_progress",
                  "open_houses_held": 2,
                  "next_open_house": "2025-11-03T12:00:00Z"
                },
                {
                  "id": "step-804",
                  "title": "Review showing feedback",
                  "status": "in_progress",
                  "showings_completed": 15,
                  "positive_feedback": 12,
                  "neutral_feedback": 3
                },
                {
                  "id": "step-805",
                  "title": "Accept offer",
                  "status": "not_started",
                  "offers_received": 0
                }
              ]
            }
          ],

          "summary": {
            "total_phases": 4,  // Pre-listing, Active, Under Contract, Closing
            "completed_phases": 1,
            "current_phase": "active_listing",
            "total_steps": 16,
            "completed_steps": 12,
            "completion_percentage": 75
          }
        }
      }
    },

    // ==========================================
    // 9. ACTIVITY FEED (Bottom Tab)
    // ==========================================
    "activity_feed": {
      "recent_activity": [
        {
          "id": "activity-001",
          "timestamp": "2025-10-28T15:30:00Z",
          "type": "communication",
          "subtype": "text_message",
          "icon": "MessageSquare",
          "user": "Jayden Metz",
          "user_id": "agent-001",
          "action": "sent text message",
          "description": "Sent text about new listing at 5609 Monitor St",
          "details": {
            "message_preview": "Hi Sarah! Just found a great property that matches your...",
            "message_status": "delivered",
            "read_at": "2025-10-28T15:45:00Z"
          }
        },
        {
          "id": "activity-002",
          "timestamp": "2025-10-28T14:00:00Z",
          "type": "property_interaction",
          "subtype": "listing_view",
          "icon": "Eye",
          "user": "Sarah Johnson",
          "user_id": "c8f3e4a1-...",
          "action": "viewed listing",
          "description": "Viewed listing: 5609 Monitor Street",
          "details": {
            "property_id": "listing-uuid-789",
            "property_address": "5609 Monitor Street, Bakersfield, CA",
            "time_on_page_seconds": 180,
            "favorited": true
          }
        },
        {
          "id": "activity-003",
          "timestamp": "2025-10-27T10:00:00Z",
          "type": "appointment",
          "subtype": "showing_completed",
          "icon": "Home",
          "user": "Jayden Metz",
          "user_id": "agent-001",
          "action": "completed showing",
          "description": "Property showing at 1234 Main Street",
          "details": {
            "property_address": "1234 Main Street, Bakersfield, CA",
            "duration_minutes": 45,
            "client_feedback": "Liked the layout but too small",
            "agent_notes": "Buyer interested in larger backyard"
          }
        },
        {
          "id": "activity-004",
          "timestamp": "2025-10-26T16:20:00Z",
          "type": "document",
          "subtype": "document_signed",
          "icon": "FileCheck",
          "user": "Sarah Johnson",
          "user_id": "c8f3e4a1-...",
          "action": "signed document",
          "description": "Signed: Buyer Representation Agreement",
          "details": {
            "document_id": "doc-001",
            "document_name": "Buyer Representation Agreement",
            "signature_method": "docusign"
          }
        },
        {
          "id": "activity-005",
          "timestamp": "2025-10-25T11:00:00Z",
          "type": "checklist",
          "subtype": "step_completed",
          "icon": "CheckCircle",
          "user": "Sarah Johnson",
          "user_id": "c8f3e4a1-...",
          "action": "completed checklist step",
          "description": "Completed: Get homeowners insurance quotes",
          "details": {
            "checklist_id": "buyer_checklist",
            "step_id": "step-205",
            "phase": "financial_preparation"
          }
        }
      ],

      "activity_stats": {
        "total_activities": 145,
        "activities_last_7_days": 23,
        "activities_last_30_days": 87,
        "most_active_day": "2025-10-27",
        "most_common_activity_type": "communication"
      },

      "unread_activities": 3,
      "pinned_activities": []
    },

    // ==========================================
    // 10. METADATA
    // ==========================================
    "metadata": {
      "permissions": {
        "can_edit": true,
        "can_delete": false,
        "can_archive": true,
        "can_view_financials": true,
        "can_send_documents": true
      },

      "related_entities": {
        "active_listings": [
          {
            "id": "listing-uuid-123",
            "type": "seller_listing",
            "address": "1234 Oak Street, Bakersfield, CA",
            "status": "active",
            "list_price": 420000
          }
        ],
        "active_escrows": [],
        "past_transactions": [],
        "leads": [],
        "appointments": [
          {
            "id": "appt-001",
            "type": "showing",
            "date": "2025-11-02T10:00:00Z",
            "property": "5609 Monitor Street"
          }
        ]
      },

      "onboarding_status": {
        "onboarding_started": "2025-10-01T12:00:00Z",
        "onboarding_completed": false,
        "onboarding_completion_percentage": 75,
        "required_forms_completed": true,
        "profile_completed": true,
        "preferences_set": true,
        "first_appointment_scheduled": true,
        "representation_agreement_signed": true,
        "missing_items": [
          "Gift letter from parents",
          "Final property selection"
        ]
      },

      "data_freshness": {
        "last_updated": "2025-10-29T14:30:00Z",
        "last_synced": "2025-10-29T14:30:00Z",
        "stale_data_warnings": [],
        "needs_refresh": false
      }
    }
  }
}
```

---

## Onboarding Form Design

### Client Onboarding Workflow

When a lead converts to a client, trigger **smart onboarding checklist**:

1. **Trigger Event:** Lead status changes to "Client" OR new client created
2. **Auto-send:** Welcome email/text with onboarding link
3. **Form Sections:** Multi-step form (saves progress automatically)
4. **Reminders:** Automated reminders every 2 days until completed
5. **Agent Notification:** Alert agent when client completes onboarding

### Onboarding Form Structure

```javascript
{
  "onboarding_form": {
    "id": "onboarding-form-uuid",
    "client_id": "c8f3e4a1-...",
    "status": "in_progress",  // not_started, in_progress, completed
    "started_at": "2025-10-01T12:00:00Z",
    "completed_at": null,
    "completion_percentage": 65,

    "sections": [
      {
        "section": "basic_information",
        "title": "Tell Us About Yourself",
        "order": 1,
        "status": "completed",
        "fields": [
          // First name, last name, email, phone, address, DOB, etc.
        ]
      },

      {
        "section": "client_type",
        "title": "What Are You Looking For?",
        "order": 2,
        "status": "completed",
        "fields": [
          {
            "field": "client_type",
            "type": "select",
            "options": ["Buying a home", "Selling a home", "Both buying and selling"],
            "value": "Both buying and selling",
            "triggers_checklists": ["buyer_checklist", "seller_checklist"]
          }
        ]
      },

      {
        "section": "communication_preferences",
        "title": "How Should We Contact You?",
        "order": 3,
        "status": "completed",
        "fields": [
          {
            "field": "preferred_method",
            "type": "select",
            "options": ["Call", "Text", "Email", "In-Person"],
            "value": "Text"
          },
          {
            "field": "best_time_to_contact",
            "type": "checkbox_grid",
            "rows": ["Weekday Morning", "Weekday Afternoon", "Weekday Evening", "Weekend Morning", "Weekend Afternoon", "Weekend Evening"],
            "value": ["Weekday Evening", "Weekend Morning", "Weekend Afternoon"]
          },
          {
            "field": "contact_frequency",
            "type": "select",
            "options": ["Daily", "Weekly", "Bi-Weekly", "Monthly", "Only when I reach out"],
            "value": "Weekly"
          }
        ]
      },

      {
        "section": "buyer_details",
        "title": "Tell Us About Your Home Search",
        "order": 4,
        "status": "completed",
        "conditional_display": "client_type includes 'buyer'",
        "fields": [
          // Must-haves, nice-to-haves, budget, pre-approval status, etc.
        ]
      },

      {
        "section": "seller_details",
        "title": "Tell Us About Your Current Home",
        "order": 5,
        "status": "completed",
        "conditional_display": "client_type includes 'seller'",
        "fields": [
          // Current property info, mortgage balance, desired timeline, etc.
        ]
      },

      {
        "section": "financial_information",
        "title": "Financial Details (Confidential)",
        "order": 6,
        "status": "in_progress",
        "fields": [
          // Pre-approval, down payment, gift funds, etc.
        ]
      },

      {
        "section": "family_and_contacts",
        "title": "Who Else Is Involved?",
        "order": 7,
        "status": "not_started",
        "fields": [
          // Spouse, co-buyers, lender, attorney, etc.
        ]
      },

      {
        "section": "timeline_and_urgency",
        "title": "Your Timeline",
        "order": 8,
        "status": "not_started",
        "fields": [
          // Target close date, flexibility, reason for timeline, etc.
        ]
      }
    ],

    "reminders": {
      "enabled": true,
      "frequency_days": 2,
      "max_reminders": 5,
      "reminders_sent": 2,
      "next_reminder_date": "2025-11-01T09:00:00Z",
      "reminder_methods": ["text", "email"]
    }
  }
}
```

---

## Checklist Differentiation by Client Type

### Dynamic Checklist Assignment

**Rule:** Checklists are automatically assigned based on `client_type`:

| Client Type | Assigned Checklists | Total Steps |
|-------------|---------------------|-------------|
| `buyer` | Buyer Journey Checklist | 29 steps |
| `seller` | Seller Journey Checklist | 16 steps |
| `buyer_and_seller` | Both checklists (parallel) | 45 steps |

### Buyer Checklist Variations

**Customize checklist based on financial situation:**

```javascript
// First-Time Buyer (requires education steps)
if (client.first_time_buyer) {
  checklist.add_steps([
    "Attend first-time buyer workshop",
    "Learn about FHA loans",
    "Understand earnest money",
    "Review closing cost estimates"
  ]);
}

// VA Loan Buyer (requires VA-specific steps)
if (client.loan_type === 'va') {
  checklist.add_steps([
    "Obtain VA certificate of eligibility",
    "Find VA-approved lender",
    "Understand VA funding fee",
    "Order VA appraisal"
  ]);
}

// Cash Buyer (skip financing steps)
if (client.loan_type === 'cash') {
  checklist.remove_steps([
    "Get pre-approved for mortgage",
    "Complete loan application",
    "Order appraisal"
  ]);
  checklist.add_steps([
    "Provide proof of funds",
    "Verify cash availability"
  ]);
}
```

### Seller Checklist Variations

**Customize based on property situation:**

```javascript
// Contingent Sale (selling to buy)
if (client.list_before_buying) {
  checklist.add_steps([
    "Discuss sale contingency with buyer agent",
    "Prepare for dual transactions",
    "Coordinate closing dates"
  ]);
}

// Bridge Loan Needed
if (client.bridge_loan_needed) {
  checklist.add_steps([
    "Meet with bridge loan lender",
    "Get bridge loan pre-approval",
    "Understand bridge loan terms"
  ]);
}

// For-Sale-By-Owner (FSBO) Seller Converting
if (client.previous_fsbo_attempt) {
  checklist.add_steps([
    "Review challenges of FSBO",
    "Discuss pricing strategy",
    "Explain agent value proposition"
  ]);
}
```

---

## Automated Reminders & Accountability

### Reminder System Design

```javascript
{
  "reminder_engine": {
    "triggers": [
      {
        "trigger": "checklist_step_due_in_3_days",
        "action": "send_reminder",
        "recipients": ["client", "agent"],
        "methods": ["text", "email"],
        "template": "upcoming_deadline"
      },
      {
        "trigger": "checklist_step_overdue",
        "action": "send_urgent_reminder",
        "recipients": ["client", "agent"],
        "methods": ["text", "email", "push_notification"],
        "template": "overdue_task",
        "escalation": "daily_until_completed"
      },
      {
        "trigger": "pre_approval_expires_in_14_days",
        "action": "send_alert",
        "recipients": ["client", "agent"],
        "methods": ["text", "email"],
        "template": "pre_approval_expiring"
      },
      {
        "trigger": "no_client_contact_in_48_hours",
        "action": "send_followup",
        "recipients": ["agent"],
        "methods": ["dashboard_notification", "email"],
        "template": "client_engagement_low"
      },
      {
        "trigger": "onboarding_incomplete_after_7_days",
        "action": "send_reminder",
        "recipients": ["client"],
        "methods": ["text", "email"],
        "template": "complete_onboarding"
      }
    ]
  }
}
```

### Text/Email Templates

**Example: Pre-Approval Expiring**
```
Text (SMS):
Hi Sarah! This is Jayden. Just a heads up - your pre-approval letter expires in 14 days (Nov 12). Let's touch base about renewing it so we're ready when you find the perfect home! Reply YES to schedule a call.

Email:
Subject: Action Needed: Pre-Approval Expiring Soon

Hi Sarah,

I wanted to give you a heads up that your mortgage pre-approval letter will expire on November 12th (in 14 days).

To keep your home search on track, I recommend contacting John Smith at Wells Fargo to renew your pre-approval before it expires.

Would you like me to reach out to John on your behalf?

Best,
Jayden Metz
Jayden Metz Realty Group
```

---

## Database Schema Requirements

### New Tables Needed

```sql
-- Client preferences and profile details
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Communication preferences
  preferred_contact_method VARCHAR(20), -- call, text, email, in_person
  secondary_contact_method VARCHAR(20),
  ok_to_call BOOLEAN DEFAULT true,
  ok_to_text BOOLEAN DEFAULT true,
  ok_to_email BOOLEAN DEFAULT true,
  best_time_to_contact JSONB, -- { weekday_morning: false, ... }
  contact_frequency VARCHAR(20), -- daily, weekly, bi_weekly, monthly
  max_contacts_per_week INTEGER DEFAULT 3,
  quiet_hours_start TIME,
  quiet_hours_end TIME,

  -- Personal details
  date_of_birth DATE,
  occupation VARCHAR(100),
  employer VARCHAR(100),
  marital_status VARCHAR(20),
  has_children BOOLEAN,
  number_of_children INTEGER,
  languages_spoken TEXT[],
  preferred_language VARCHAR(50),
  military_status VARCHAR(20),
  special_needs TEXT,
  pets JSONB, -- [{ type: 'dog', breed: '...', name: '...' }]

  -- Interests and motivations
  primary_motivation TEXT,
  secondary_motivations TEXT[],
  must_haves TEXT[],
  nice_to_haves TEXT[],
  deal_breakers TEXT[],
  lifestyle_preferences JSONB,

  -- Urgency and timeline
  urgency_level VARCHAR(20), -- low, medium, high, urgent
  target_close_date DATE,
  must_close_by DATE,
  flexible_on_timing BOOLEAN,
  reason_for_timeline TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial information for buyers/sellers
CREATE TABLE client_financials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  -- Buyer financials
  pre_approval_status VARCHAR(20),
  pre_approval_amount NUMERIC(12, 2),
  pre_approval_date DATE,
  pre_approval_expiration DATE,
  lender_id UUID, -- Reference to related_people
  loan_type VARCHAR(20),
  down_payment_percentage INTEGER,
  estimated_down_payment NUMERIC(12, 2),
  down_payment_sources JSONB, -- [{ source: 'savings', amount: 70000, ... }]
  cash_reserves NUMERIC(12, 2),
  annual_income NUMERIC(12, 2),
  credit_score INTEGER,
  dti_ratio DECIMAL(5, 3),

  -- Seller financials
  current_mortgage_balance NUMERIC(12, 2),
  original_purchase_price NUMERIC(12, 2),
  original_purchase_date DATE,
  estimated_current_value NUMERIC(12, 2),
  equity_position NUMERIC(12, 2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Related people (family, transaction team, support network)
CREATE TABLE related_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  relationship_type VARCHAR(50), -- spouse, child, parent, lender, attorney, etc.
  relationship_category VARCHAR(20), -- family, transaction_team, support_network

  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(200),
  title VARCHAR(100),

  role_in_transaction VARCHAR(50),
  on_loan_application BOOLEAN DEFAULT false,
  can_sign_documents BOOLEAN DEFAULT false,

  additional_data JSONB, -- Flexible storage for role-specific fields
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client journey checklists
CREATE TABLE client_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  checklist_type VARCHAR(50), -- buyer_checklist, seller_checklist
  status VARCHAR(20), -- active, completed, archived
  started_date TIMESTAMP WITH TIME ZONE,
  target_completion_date DATE,
  completed_date TIMESTAMP WITH TIME ZONE,

  phases JSONB, -- Array of phase objects with steps

  total_steps INTEGER,
  completed_steps INTEGER,
  completion_percentage INTEGER,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checklist step completions (for tracking individual steps)
CREATE TABLE checklist_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES client_checklists(id) ON DELETE CASCADE,

  step_id VARCHAR(50), -- step-101, step-102, etc.
  phase VARCHAR(50),
  title VARCHAR(200),
  description TEXT,

  status VARCHAR(20), -- not_started, in_progress, completed, skipped
  assigned_to UUID, -- User or contact ID
  due_date DATE,
  completed_date TIMESTAMP WITH TIME ZONE,
  completed_by UUID,

  priority VARCHAR(20), -- low, medium, high
  automated_reminder BOOLEAN DEFAULT false,
  reminder_sent BOOLEAN DEFAULT false,
  next_reminder_date DATE,

  notes TEXT,
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Onboarding forms
CREATE TABLE onboarding_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES contacts(id) ON DELETE CASCADE,

  status VARCHAR(20), -- not_started, in_progress, completed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_percentage INTEGER DEFAULT 0,

  sections JSONB, -- Array of section objects with fields

  reminders_enabled BOOLEAN DEFAULT true,
  reminder_frequency_days INTEGER DEFAULT 2,
  max_reminders INTEGER DEFAULT 5,
  reminders_sent INTEGER DEFAULT 0,
  next_reminder_date DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Implementation Checklist

### Backend Implementation
- [ ] Create new database tables (client_profiles, client_financials, related_people, client_checklists, checklist_steps, onboarding_forms)
- [ ] Build service layer methods for detail data fetching
- [ ] Extend GET /v1/clients/:id with ?include=full parameter
- [ ] Build dynamic checklist assignment logic
- [ ] Implement automated reminder system
- [ ] Create onboarding form API endpoints

### Frontend Implementation
- [ ] Build 4 widget components (Profile & Preferences, Financial Snapshot, Related People, Client Journey)
- [ ] Update DetailTemplate to consume new payload structure
- [ ] Create onboarding form multi-step UI
- [ ] Build checklist progress tracking UI
- [ ] Implement reminder notification system

### Testing
- [ ] Test buyer-only checklist flow
- [ ] Test seller-only checklist flow
- [ ] Test buyer+seller parallel checklist flow
- [ ] Test automated reminders
- [ ] Test onboarding form with conditional sections

---

This design creates a **bulletproof client management system** where:
✅ Realtors have complete visibility into every client
✅ Clients are guided through onboarding with smart forms
✅ Checklists adapt based on client type (buyer/seller/both)
✅ Automated reminders ensure nothing falls through the cracks
✅ All data loads in **one API request** for blazing-fast performance
