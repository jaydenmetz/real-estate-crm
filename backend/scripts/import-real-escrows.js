#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  host: 'ballast.proxy.rlwy.net',
  port: 20017,
  user: 'postgres',
  password: 'ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

const userId = '65483115-0e3e-43f3-8a4a-488a6f0df017';

// Parse currency string to number
function parseCurrency(value) {
  if (!value || value === '') return null;
  if (typeof value === 'number') return value;
  return parseFloat(value.toString().replace(/[$,]/g, ''));
}

// Parse percentage to decimal
function parsePercentage(value) {
  if (!value || value === '') return null;
  if (typeof value === 'number') return value;
  const num = parseFloat(value.toString().replace(/%/g, ''));
  return num > 1 ? num / 100 : num;
}

// Parse date string (handles multiple formats)
function parseDate(value) {
  if (!value || value === '') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

// Parse boolean
function parseBoolean(value) {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'boolean') return value;
  return value.toString().toLowerCase() === 'yes' || value.toString().toLowerCase() === 'true';
}

// Calculate days between dates
function daysBetween(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const escrowData = [
  // ESC-001 through ESC-016: Basic File Escrows (2023-2024)
  {
    "_uniqueId": "ESC-001",
    "Address": "9081 Soledad Road, Mojave",
    "Agent": "Jayden Metz",
    "Close Date": "4/12/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$2,800.00",
    "Escrow Company": "Studio Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$7,000.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Google LSA",
    "Loan Company": "Logix",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$280,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-002",
    "Address": "123 North 10th Street #109",
    "Agent": "Jayden Metz",
    "Close Date": "5/22/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$750.00",
    "Escrow Company": "Placer",
    "Escrow Status": "Closed",
    "Gross Commission": "$1,875.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Agent SOI",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$75,000.00"
  },
  {
    "_uniqueId": "ESC-003",
    "Address": "84596 11th Street, Trona",
    "Agent": "Jayden Metz",
    "Close Date": "6/5/2023",
    "Closing Type": "Buyer",
    "Commission %": "3.00%",
    "Commission Received": "$1,560.00",
    "Escrow Company": "All California Title & Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$3,900.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Sign Call",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "my NHD",
    "Purchase Price": "$130,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-004",
    "Address": "341-301 Bodfish Canyon",
    "Agent": "Jayden Metz",
    "Close Date": "6/8/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.00%",
    "Commission Received": "$1,260.00",
    "Escrow Company": "Chicago",
    "Escrow Status": "Closed",
    "Gross Commission": "$4,200.00",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Agent Referral",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "my NHD",
    "Purchase Price": "$210,000.00"
  },
  {
    "_uniqueId": "ESC-005",
    "Address": "Golden Spur",
    "Agent": "Jayden Metz",
    "Close Date": "6/13/2023",
    "Closing Type": "Buyer",
    "Commission %": "5.00%",
    "Commission Received": "$650.00",
    "Escrow Company": "All California Title & Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$1,300.00",
    "Lead Source": "Zillow",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$26,000.00"
  },
  {
    "_uniqueId": "ESC-006",
    "Address": "1700 Bodfish Street",
    "Agent": "Jayden Metz",
    "Close Date": "6/23/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.25%",
    "Commission Received": "$919.13",
    "Escrow Company": "Summit Settlement",
    "Escrow Status": "Closed",
    "Gross Commission": "$1,838.25",
    "Lead Source": "Zillow",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$81,700.00"
  },
  {
    "_uniqueId": "ESC-007",
    "Address": "3821 Marjal Avenue",
    "Agent": "Jayden Metz",
    "Close Date": "6/23/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.00%",
    "Commission Received": "$3,400.00",
    "Escrow Company": "Placer",
    "Escrow Status": "Closed",
    "Gross Commission": "$6,800.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Sign Call",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$340,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-008",
    "Address": "616 42nd Street",
    "Agent": "Jayden Metz",
    "Close Date": "7/31/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$437.50",
    "Escrow Company": "All California Title & Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$875.00",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "GMB/Website",
    "Loan Company": "21st Mortgage",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$35,000.00"
  },
  {
    "_uniqueId": "ESC-009",
    "Address": "828 White Oak Drive",
    "Agent": "Jayden Metz",
    "Close Date": "8/4/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$3,500.00",
    "Escrow Company": "Greenhedge Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$7,000.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "First American",
    "Lead Source": "Zillow",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "Ny NHD",
    "Purchase Price": "$280,000.00",
    "Termite Company": "Stafford"
  },
  {
    "_uniqueId": "ESC-010",
    "Address": "10431 San Fernando",
    "Agent": "Jayden Metz",
    "Close Date": "9/21/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$937.50",
    "Escrow Company": "All California Title & Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$1,875.00",
    "Lead Source": "Zillow",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$75,000.00"
  },
  {
    "_uniqueId": "ESC-011",
    "Address": "3425 Lake Isabella",
    "Agent": "Jayden Metz",
    "Close Date": "9/25/2023",
    "Closing Type": "Buyer",
    "Commission %": "3.00%",
    "Commission Received": "$2,325.00",
    "Escrow Company": "Vida Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$4,650.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Zillow",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$155,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-012",
    "Address": "3406 Brook Grove Lane",
    "Agent": "Jayden Metz",
    "Close Date": "10/3/2023",
    "Closing Type": "Buyer",
    "Commission %": "2.00%",
    "Commission Received": "$3,404.00",
    "Escrow Company": "Lennar Title",
    "Escrow Status": "Closed",
    "Gross Commission": "$9,010.00",
    "Lead Source": "Radio - KUZZ",
    "Loan Company": "Lennar Mortgage",
    "NHD Company": "First American",
    "Purchase Price": "$450,500.00"
  },
  {
    "_uniqueId": "ESC-013",
    "Address": "6801 Redwing Court",
    "Agent": "Jayden Metz",
    "Close Date": "11/1/2023",
    "Closing Type": "Buyer",
    "Commission %": "3.00%",
    "Commission Received": "$5,160.00",
    "Escrow Company": "All California Title & Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$12,900.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Radio - KUZZ",
    "Loan Company": "Cash",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$430,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-014",
    "Address": "7605 Cranberry Way",
    "Agent": "Jayden Metz",
    "Close Date": "11/22/2023",
    "Closing Type": "Buyer",
    "Commission %": "3.00%",
    "Commission Received": "$7,018.50",
    "Escrow Company": "First American",
    "Escrow Status": "Closed",
    "Gross Commission": "$14,037.00",
    "Lead Source": "Zillow",
    "Loan Company": "LGI Mortgage Solutions",
    "NHD Company": "First American",
    "Purchase Price": "$467,900.00"
  },
  {
    "_uniqueId": "ESC-015",
    "Address": "171 & 175 North Cottage Street",
    "Agent": "Jayden Metz",
    "Close Date": "1/19/2024",
    "Closing Type": "Buyer",
    "Commission %": "2.50%",
    "Commission Received": "$4,176.25",
    "Escrow Company": "Chicago Title Company",
    "Escrow Status": "Closed",
    "Gross Commission": "$6,425.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Lender Referall",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$257,000.00",
    "Termite Company": "RCB Inspections And Termite Control"
  },
  {
    "_uniqueId": "ESC-016",
    "Address": "319 Sunset Lane",
    "Agent": "Jayden Metz",
    "Close Date": "4/1/2024",
    "Closing Type": "Buyer",
    "Commission %": "2.00%",
    "Commission Received": "$2,005.00",
    "Escrow Company": "West Coast Escrow",
    "Escrow Status": "Closed",
    "Gross Commission": "$6,500.00",
    "Home Warranty Company": "American Home Shield",
    "Lead Source": "Zillow",
    "Loan Company": "Cornerstone Mortgage",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$325,000.00"
  },
  // ESC-017: Detailed Notion File - 13720 Colorado Lane
  {
    "_uniqueId": "ESC-017",
    "Address": "13720 Colorado Lane",
    "AVID": "Yes",
    "Acceptance Date": "March 28, 2025",
    "Appraisal Ordered": "Yes",
    "Appraisal Received": "Yes",
    "Buyer's Agent": "Jayden Metz",
    "CD": "Yes",
    "COE Date": "April 28, 2025",
    "CR": "Yes",
    "Cash to Close Paid": "Yes",
    "Clear to Close": "Yes",
    "Client(s)": "Cindy Brown, Alyssa Brown",
    "Commission %": "3%",
    "Contingencies Date": "April 14, 2025",
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "Yes",
    "EMD Date": "March 31, 2025",
    "Escrow Officer": "Robert Garcia",
    "Escrow Status": "Closed",
    "Gross Commission": "$15,450.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Inspection Ordered": "Yes",
    "Home Inspection Received": "Yes",
    "Home Warranty Company": "Home Warranty of America",
    "LE": "Yes",
    "Lead Source": "Family",
    "Listing Agent": "Bo Goulet",
    "Loan Docs Signed": "Yes",
    "Loan Funded": "Yes",
    "Loan Officer": "Tyler Smith",
    "Locked Rate": "Yes",
    "MLS Status Update": "Yes",
    "My Commission": "$11,052.50",
    "Purchase Price": "$515,000.00",
    "RR": "Yes",
    "Recorded": "Yes",
    "Scheduled COE Date": "April 28, 2025",
    "Seller Disclosures": "Yes",
    "Solar Transfer Initiated": "Yes",
    "TC Email": "Yes",
    "TC Glide Invite": "Yes",
    "Transaction Coordinator(s)": "Karin Munoz",
    "VP": "Yes"
  },
  // ESC-018: 5609 Monitor Street (Transaction #1 - Cancelled)
  {
    "_uniqueId": "ESC-018",
    "Address": "5609 Monitor Street (Cancelled)",
    "Transaction_Note": "First transaction - Cancelled",
    "AVID": "Yes",
    "Acceptance Date": "April 3, 2025",
    "Add Contacts to Notion": "Yes",
    "Add Contacts to Phone": "Yes",
    "Appraisal Ordered": "Yes",
    "Appraisal Received": "Yes",
    "Buyer's Agent": "Jesus Mora",
    "CD": "Yes",
    "COE Date": "May 5, 2025",
    "CR": "Yes",
    "Cash to Close Paid": "Yes",
    "Clear to Close": "Yes",
    "Client(s)": "Jesus Sandoval Vargas",
    "Commission %": "3%",
    "Commission Adjustments": "$1,600.00",
    "Contingencies Date": "April 20, 2025",
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "Yes",
    "EMD Date": "April 6, 2025",
    "Escrow Officer": "Samantha Mascola",
    "Escrow Status": "Cancelled",
    "Expense Adjustments": "$0.00",
    "Gross Commission": "$7,010.00",
    "Home Inspection Ordered": "Yes",
    "Home Inspection Received": "Yes",
    "LE": "Yes",
    "Lead Source": "Past Client Referral",
    "Listing Agent": "Jayden Metz",
    "Loan Docs Signed": "Yes",
    "Loan Funded": "Yes",
    "Loan Officer": "Omar Navarro",
    "Locked Rate": "Yes",
    "MLS Status Update": "Yes",
    "My Commission": "$4,972.50",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$287,000.00",
    "RR": "Yes",
    "Recorded": "Yes",
    "Scheduled COE Date": "May 5, 2025",
    "Seller Disclosures": "Yes",
    "Solar Transfer Initiated": "Yes",
    "TC Email": "Yes",
    "TC Glide Invite": "Yes",
    "Transaction Coordinator(s)": "Karin Munoz",
    "VP": "Yes"
  },
  // ESC-019: 9753 Sunglow Street
  {
    "_uniqueId": "ESC-019",
    "Address": "9753 Sunglow Street",
    "AVID": "No",
    "Acceptance Date": "April 30, 2025",
    "Appraisal Ordered": "No",
    "Appraisal Received": "No",
    "Buyer's Agent": "Edwin Sanchez, Catalina Sanchez",
    "CD": "No",
    "COE Date": "May 28, 2025",
    "CR": "No",
    "Cash to Close Paid": "No",
    "Clear to Close": "No",
    "Client(s)": "Veronica Zelaya",
    "Commission %": "1%",
    "Contingencies Date": "May 17, 2025",
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "No",
    "EMD Date": "May 3, 2025",
    "Escrow Officer": "Alicia Smith",
    "Escrow Status": "Closed",
    "Expense Adjustments": "$750.00",
    "Gross Commission": "$7,590.00",
    "Home Inspection Company": "Home Inspection Experts",
    "Home Inspection Ordered": "No",
    "Home Inspection Received": "No",
    "Home Warranty Company": "Home Warranty of America",
    "LE": "No",
    "Lead Source": "Agent Referral",
    "Listing Agent": "Jayden Metz, Daniela Diaz",
    "Loan Docs Signed": "No",
    "Loan Funded": "No",
    "Loan Officer": "Jenese Bravo",
    "Locked Rate": "No",
    "MLS Status Update": "No",
    "My Commission": "$4,657.50",
    "Purchase Price": "$759,000.00",
    "RR": "No",
    "Recorded": "No",
    "Scheduled COE Date": "May 28, 2025",
    "Seller Disclosures": "No",
    "Solar Transfer Initiated": "No",
    "TC Email": "No",
    "TC Glide Invite": "No",
    "Termite Inspection Company": "Ace Tech Exterminators",
    "Transaction Coordinator(s)": "Darcy Organ",
    "VP": "No"
  },
  // ESC-020: 9602 Cecilia Street
  {
    "_uniqueId": "ESC-020",
    "Address": "9602 Cecilia Street",
    "AVID": "Yes",
    "Acceptance Date": "March 23, 2025",
    "Appraisal Ordered": "Yes",
    "Appraisal Received": "Yes",
    "Buyer's Agent": "Daniela Diaz",
    "CD": "Yes",
    "COE Date": "May 30, 2025",
    "CR": "Yes",
    "Cash to Close Paid": "Yes",
    "Clear to Close": "Yes",
    "Client(s)": "Cindy Brown",
    "Commission %": "3%",
    "Commission Adjustments": "$2,500.00",
    "Contingencies Date": "April 9, 2025",
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "Yes",
    "EMD Date": "March 26, 2025",
    "Escrow Officer": "Samantha Mascola",
    "Escrow Status": "Closed",
    "Expense Adjustments": "$400.00",
    "Gross Commission": "$21,650.00",
    "Home Inspection Ordered": "Yes",
    "Home Inspection Received": "Yes",
    "LE": "Yes",
    "Lead Source": "Family",
    "Listing Agent": "Jayden Metz",
    "Loan Docs Signed": "Yes",
    "Loan Funded": "Yes",
    "Loan Officer": "Tyler Smith",
    "Locked Rate": "Yes",
    "MLS Status Update": "Yes",
    "My Commission": "$15,552.50",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$805,000.00",
    "RR": "Yes",
    "Recorded": "Yes",
    "Scheduled COE Date": "May 30, 2025",
    "Seller Disclosures": "Yes",
    "Solar Transfer Initiated": "Yes",
    "TC Email": "Yes",
    "TC Glide Invite": "Yes",
    "Transaction Coordinator(s)": "Karin Munoz",
    "VP": "Yes"
  },
  // ESC-021: 313 Darling Point Drive
  {
    "_uniqueId": "ESC-021",
    "Address": "313 Darling Point Drive",
    "AVID": "Yes",
    "Acceptance Date": "April 5, 2025",
    "Appraisal Ordered": "Yes",
    "Appraisal Received": "Yes",
    "Buyer's Agent": "Jayden Metz",
    "CD": "Yes",
    "COE Date": "June 4, 2025",
    "CR": "Yes",
    "Cash to Close Paid": "Yes",
    "Clear to Close": "Yes",
    "Client(s)": "Jesus Sandoval Vargas, Elizabeth Sanchez Mendez",
    "Commission %": "3%",
    "Contingencies Date": "April 22, 2025",
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "Yes",
    "EMD Date": "April 8, 2025",
    "Escrow Officer": "Samantha Mascola",
    "Escrow Status": "Closed",
    "Expense Adjustments": "$0.00",
    "Gross Commission": "$11,250.00",
    "Home Inspection Company": "At Home Inspections",
    "Home Inspection Ordered": "Yes",
    "Home Inspection Received": "Yes",
    "Home Warranty Company": "Home Warranty of America",
    "LE": "Yes",
    "Lead Source": "Past Client Referral",
    "Listing Agent": "Jeanne Radsick",
    "Loan Docs Signed": "Yes",
    "Loan Funded": "No",
    "Loan Officer": "Tyler Smith",
    "Locked Rate": "Yes",
    "MLS Status Update": "Yes",
    "My Commission": "$8,152.50",
    "NHD Company": "First American NHD",
    "Purchase Price": "$375,000.00",
    "RR": "Yes",
    "Recorded": "No",
    "Scheduled COE Date": "June 4, 2025",
    "Seller Disclosures": "Yes",
    "Solar Transfer Initiated": "Yes",
    "TC Email": "Yes",
    "TC Glide Invite": "Yes",
    "Termite Inspection Company": "RCB Inspection and Termite Control",
    "Transaction Coordinator(s)": "Karin Munoz",
    "VP": "Yes"
  },
  // ESC-022: 5609 Monitor Street (Transaction #2 - Closed)
  {
    "_uniqueId": "ESC-022",
    "Address": "5609 Monitor Street",
    "Transaction_Note": "Second transaction - Successfully closed",
    "AVID": "Yes",
    "Acceptance Date": "May 14, 2025",
    "Appraisal Ordered": "Yes",
    "Appraisal Received": "Yes",
    "Buyer's Agent": "Joshua Perez",
    "CD": "Yes",
    "COE Date": "June 4, 2025",
    "CR": "No",
    "Cash to Close Paid": "Yes",
    "Clear to Close": "Yes",
    "Client(s)": "Jesus Sandoval Vargas",
    "Commission %": "3%",
    "Commission Adjustments": "$1,600.00",
    "Contingencies Date": "May 31, 2025",
    "Days to COE": 21,
    "Days to Contingency": 17,
    "Days to EMD": 3,
    "EMD": "Yes",
    "EMD Date": "May 17, 2025",
    "Escrow Officer": "Samantha Mascola",
    "Escrow Status": "Closed",
    "Expense Adjustments": "$0.00",
    "Gross Commission": "$7,100.00",
    "Home Inspection Company": "Signature Property Inspections, Inc.",
    "Home Inspection Ordered": "Yes",
    "Home Inspection Received": "Yes",
    "Home Warranty Company": "American Home Shield",
    "LE": "Yes",
    "Lead Source": "Past Client Referral",
    "Listing Agent": "Jayden Metz",
    "Loan Docs Signed": "Yes",
    "Loan Funded": "No",
    "Loan Officer": "Emmanuel Duran",
    "Locked Rate": "Yes",
    "MLS Status Update": "Yes",
    "My Commission": "$5,040.00",
    "NHD Company": "Property ID Max",
    "Purchase Price": "$290,000.00",
    "RR": "Yes",
    "Recorded": "No",
    "Seller Disclosures": "Yes",
    "Solar Transfer Initiated": "Yes",
    "TC Email": "Yes",
    "TC Glide Invite": "Yes",
    "Termite Inspection Company": "Golden Empire Pest Control",
    "Transaction Coordinator(s)": "Karin Munoz",
    "VP": "Yes"
  },
  // ESC-023 through ESC-028: Cancelled Escrows (Basic File)
  {
    "_uniqueId": "ESC-023",
    "Address": "400 Owls Clover Road",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  },
  {
    "_uniqueId": "ESC-024",
    "Address": "3712 Suhre",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  },
  {
    "_uniqueId": "ESC-025",
    "Address": "200 Jones",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  },
  {
    "_uniqueId": "ESC-026",
    "Address": "28060 Carlyle Springs",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  },
  {
    "_uniqueId": "ESC-027",
    "Address": "0 Wagon Wheel",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  },
  {
    "_uniqueId": "ESC-028",
    "Address": "7330 Stockdale Highway #5",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$0.00"
  }
];

async function importEscrows() {
  const client = await pool.connect();

  try {
    let insertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    console.log('🚀 Starting import of 28 real escrows...\n');

    // Get the next numeric_id for display_id generation
    const seqResult = await client.query("SELECT nextval('escrows_numeric_id_seq') as next_id");
    let currentNumericId = parseInt(seqResult.rows[0].next_id);

    for (const escrow of escrowData) {
      try {
        // Check for duplicate based on address
        const checkQuery = `
          SELECT id, display_id FROM escrows
          WHERE property_address = $1
        `;

        const existing = await client.query(checkQuery, [escrow.Address]);

        if (existing.rows.length > 0) {
          console.log(`⏭️  SKIPPED: ${escrow.Address} (already exists as ${existing.rows[0].display_id})`);
          skippedCount++;
          continue;
        }

        // Build people JSONB
        const people = {};
        if (escrow["Buyer's Agent"]) {
          people.buyersAgent = { name: escrow["Buyer's Agent"] };
        }
        if (escrow["Listing Agent"]) {
          people.listingAgent = { name: escrow["Listing Agent"] };
        }
        if (escrow["Loan Officer"]) {
          people.loanOfficer = { name: escrow["Loan Officer"] };
        }
        if (escrow["Escrow Officer"]) {
          people.escrowOfficer = { name: escrow["Escrow Officer"] };
        }

        // Build timeline JSONB for detailed records
        const timeline = [];
        if (escrow["EMD Date"]) {
          timeline.push({
            date: parseDate(escrow["EMD Date"]),
            event: "EMD Deposited",
            completed: parseBoolean(escrow["EMD"])
          });
        }
        if (escrow["Acceptance Date"]) {
          timeline.push({
            date: parseDate(escrow["Acceptance Date"]),
            event: "Acceptance",
            completed: true
          });
        }
        if (escrow["Contingencies Date"]) {
          timeline.push({
            date: parseDate(escrow["Contingencies Date"]),
            event: "Contingencies Removed",
            completed: true
          });
        }
        if (escrow["COE Date"] || escrow["Close Date"]) {
          timeline.push({
            date: parseDate(escrow["COE Date"] || escrow["Close Date"]),
            event: "Close of Escrow",
            completed: escrow["Escrow Status"] === "Closed"
          });
        }

        // Generate display_id manually
        const displayId = `ESC-${currentNumericId}`;
        currentNumericId++;

        const insertQuery = `
          INSERT INTO escrows (
            display_id,
            property_address,
            escrow_status,
            purchase_price,
            earnest_money_deposit,
            commission_percentage,
            gross_commission,
            my_commission,
            closing_date,
            acceptance_date,
            actual_coe_date,
            lead_source,
            escrow_company,
            lender_name,
            nhd_company,
            transaction_coordinator,
            avid,
            zillow_url,
            people,
            timeline,
            created_by,
            team_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
            $21, $22
          ) RETURNING id, display_id
        `;

        const values = [
          displayId,
          escrow.Address,
          escrow['Escrow Status'],
          parseCurrency(escrow['Purchase Price']),
          parseCurrency(escrow.EMD),
          parsePercentage(escrow['Commission %']),
          parseCurrency(escrow['Gross Commission']),
          parseCurrency(escrow['My Commission'] || escrow['Commission Received']),
          parseDate(escrow['COE Date'] || escrow['Close Date']),
          parseDate(escrow['Acceptance Date']),
          parseDate(escrow['COE Date']),
          escrow['Lead Source'],
          escrow['Escrow Company'],
          escrow['Loan Company'],
          escrow['NHD Company'],
          escrow['Transaction Coordinator(s)'],
          parseBoolean(escrow.AVID),
          escrow['Zillow URL'],
          JSON.stringify(people),
          JSON.stringify(timeline),
          userId,
          null  // team_id
        ];

        const result = await client.query(insertQuery, values);
        console.log(`✅ INSERTED: ${escrow.Address.substring(0, 50)} (ID: ${result.rows[0].display_id})`);
        insertedCount++;

      } catch (error) {
        console.error(`❌ ERROR inserting ${escrow.Address}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 IMPORT SUMMARY:');
    console.log(`✅ Inserted: ${insertedCount}`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total records processed: ${escrowData.length}`);

  } catch (error) {
    console.error('❌ Fatal error importing escrows:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importEscrows();
