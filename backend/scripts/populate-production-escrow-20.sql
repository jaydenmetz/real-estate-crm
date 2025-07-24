-- Populate data for production escrow ESC-2025-0003 (numeric_id: 20)
-- This script adds all the missing helper table data

-- First verify the escrow exists
SELECT numeric_id, display_id, property_address FROM escrows WHERE numeric_id = 20;

-- Add checklist data
INSERT INTO escrow_checklists (escrow_display_id, checklist_items)
VALUES ('ESC-2025-0003', '[
  {
    "phase": "opening",
    "task_name": "Open Escrow",
    "task_description": "Officially open escrow with title company",
    "is_completed": true,
    "due_date": "2025-01-22",
    "completed_date": "2025-01-22",
    "order": 1
  },
  {
    "phase": "opening",
    "task_name": "Earnest Money Deposit",
    "task_description": "Collect and deposit earnest money",
    "is_completed": true,
    "due_date": "2025-01-25",
    "completed_date": "2025-01-24",
    "order": 2
  },
  {
    "phase": "opening",
    "task_name": "Preliminary Title Report",
    "task_description": "Order and review preliminary title report",
    "is_completed": true,
    "due_date": "2025-01-27",
    "completed_date": "2025-01-26",
    "order": 3
  },
  {
    "phase": "opening",
    "task_name": "Property Disclosures",
    "task_description": "Deliver all required property disclosures",
    "is_completed": false,
    "due_date": "2025-01-29",
    "order": 4
  },
  {
    "phase": "opening",
    "task_name": "Home Inspection",
    "task_description": "Schedule and complete home inspection",
    "is_completed": false,
    "due_date": "2025-02-01",
    "order": 5
  },
  {
    "phase": "processing",
    "task_name": "Loan Application",
    "task_description": "Submit complete loan application",
    "is_completed": false,
    "due_date": "2025-01-27",
    "order": 6
  },
  {
    "phase": "processing",
    "task_name": "Appraisal",
    "task_description": "Schedule and complete property appraisal",
    "is_completed": false,
    "due_date": "2025-02-06",
    "order": 7
  },
  {
    "phase": "processing",
    "task_name": "Loan Approval",
    "task_description": "Obtain final loan approval",
    "is_completed": false,
    "due_date": "2025-02-16",
    "order": 8
  },
  {
    "phase": "closing",
    "task_name": "Final Walkthrough",
    "task_description": "Complete final property walkthrough",
    "is_completed": false,
    "due_date": "2025-03-13",
    "order": 9
  },
  {
    "phase": "closing",
    "task_name": "Closing Documents",
    "task_description": "Review and sign closing documents",
    "is_completed": false,
    "due_date": "2025-03-14",
    "order": 10
  }
]'::jsonb)
ON CONFLICT (escrow_display_id) DO UPDATE SET checklist_items = EXCLUDED.checklist_items;

-- Add timeline events
INSERT INTO escrow_timeline (escrow_id, event_type, event_date, description, created_by, metadata)
VALUES 
('ESC-2025-0003', 'Escrow Opened', '2025-01-22', 'Escrow officially opened with First American Title', 'Jayden Metz', '{"title_company": "First American Title"}'::jsonb),
('ESC-2025-0003', 'EMD Received', '2025-01-24', 'Earnest money deposit of $287,500 received and deposited', 'Jayden Metz', '{"amount": 287500}'::jsonb),
('ESC-2025-0003', 'Offer Accepted', '2025-01-22', 'Offer accepted at $5,750,000', 'Jayden Metz', '{"offer_amount": 5750000}'::jsonb),
('ESC-2025-0003', 'Inspection Scheduled', '2025-01-30', 'Home inspection scheduled with ABC Inspections', 'Jayden Metz', '{"inspector": "ABC Inspections"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Add financial data
INSERT INTO escrow_financials (escrow_id, description, category, amount, payer, payee, notes)
VALUES 
('ESC-2025-0003', 'Purchase Price', 'purchase', 5750000.00, 'Buyer', 'Seller', 'Full purchase price'),
('ESC-2025-0003', 'Earnest Money Deposit', 'deposit', 287500.00, 'Buyer', 'Escrow', '5% earnest money'),
('ESC-2025-0003', 'Down Payment', 'payment', 1725000.00, 'Buyer', 'Escrow', '30% down payment'),
('ESC-2025-0003', 'Loan Amount', 'financing', 4025000.00, 'Lender', 'Escrow', '70% financing'),
('ESC-2025-0003', 'Buyer Agent Commission', 'commission', 71875.00, 'Escrow', 'Buyer Agent', '1.25% of purchase price'),
('ESC-2025-0003', 'Listing Agent Commission', 'commission', 71875.00, 'Escrow', 'Listing Agent', '1.25% of purchase price'),
('ESC-2025-0003', 'Title Insurance', 'insurance', 8625.00, 'Buyer', 'Title Company', 'Owner title policy'),
('ESC-2025-0003', 'Escrow Fee', 'fee', 5750.00, 'Buyer/Seller', 'Escrow Company', 'Split 50/50'),
('ESC-2025-0003', 'Home Inspection', 'inspection', 850.00, 'Buyer', 'Inspector', 'Property inspection'),
('ESC-2025-0003', 'Appraisal Fee', 'fee', 750.00, 'Buyer', 'Appraiser', 'Property appraisal')
ON CONFLICT DO NOTHING;

-- Add documents
INSERT INTO escrow_documents (escrow_id, name, type, status, uploaded_at, created_by)
VALUES 
('ESC-2025-0003', 'Purchase Agreement', 'contract', 'complete', '2025-01-22 10:00:00', 'Jayden Metz'),
('ESC-2025-0003', 'Earnest Money Receipt', 'receipt', 'complete', '2025-01-24 14:30:00', 'Jayden Metz'),
('ESC-2025-0003', 'Preliminary Title Report', 'title', 'complete', '2025-01-26 09:15:00', 'Title Company'),
('ESC-2025-0003', 'Property Disclosures', 'disclosure', 'pending', NULL, NULL),
('ESC-2025-0003', 'Home Inspection Report', 'inspection', 'pending', NULL, NULL),
('ESC-2025-0003', 'Loan Application', 'financing', 'pending', NULL, NULL),
('ESC-2025-0003', 'Appraisal Report', 'appraisal', 'pending', NULL, NULL),
('ESC-2025-0003', 'Insurance Policy', 'insurance', 'pending', NULL, NULL)
ON CONFLICT DO NOTHING;

-- Verify the data was added
SELECT 'Checklist items:' as info, COUNT(*) as count FROM escrow_checklists WHERE escrow_display_id = 'ESC-2025-0003'
UNION ALL
SELECT 'Timeline events:', COUNT(*) FROM escrow_timeline WHERE escrow_id = 'ESC-2025-0003'
UNION ALL
SELECT 'Financial items:', COUNT(*) FROM escrow_financials WHERE escrow_id = 'ESC-2025-0003'
UNION ALL
SELECT 'Documents:', COUNT(*) FROM escrow_documents WHERE escrow_id = 'ESC-2025-0003';