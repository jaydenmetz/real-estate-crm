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
  return num > 1 ? num / 100 : num; // Convert if given as percentage
}

// Parse date string
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

const escrowData = [
  {
    "Address": "21325 Arroyo Way, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-09-01",
    "Escrow Status": "Closed",
    "Purchase Price": "$265,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$6,625.00",
    "Commission Received": "$6,625.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21325-Arroyo-Way-Tehachapi-CA-93561/2056304799_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24300 Oak Canyon Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-09-15",
    "Escrow Status": "Closed",
    "Purchase Price": "$185,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$4,625.00",
    "Commission Received": "$4,625.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24300-Oak-Canyon-Ln-Tehachapi-CA-93561/2056304800_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "NewRez LLC",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21345 Crestview Dr, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-09-22",
    "Escrow Status": "Closed",
    "Purchase Price": "$315,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$7,875.00",
    "Commission Received": "$7,875.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21345-Crestview-Dr-Tehachapi-CA-93561/2056304801_zpid/",
    "Lead Source": "Family",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20950 Arrowhead Way, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-10-06",
    "Escrow Status": "Closed",
    "Purchase Price": "$207,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$5,175.00",
    "Commission Received": "$5,175.00",
    "Zillow URL": "https://www.zillow.com/homedetails/20950-Arrowhead-Way-Tehachapi-CA-93561/2056304802_zpid/",
    "Lead Source": "Past Client Referral",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21200 Cedar Crest Ct, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-10-13",
    "Escrow Status": "Closed",
    "Purchase Price": "$224,900.00",
    "Commission %": "2.50%",
    "Gross Commission": "$5,622.50",
    "Commission Received": "$5,622.50",
    "Zillow URL": "https://www.zillow.com/homedetails/21200-Cedar-Crest-Ct-Tehachapi-CA-93561/2056304803_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24420 Rolling Hills Rd, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-10-20",
    "Escrow Status": "Closed",
    "Purchase Price": "$332,500.00",
    "Commission %": "2.50%",
    "Gross Commission": "$8,312.50",
    "Commission Received": "$8,312.50",
    "Zillow URL": "https://www.zillow.com/homedetails/24420-Rolling-Hills-Rd-Tehachapi-CA-93561/2056304804_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21160 Windsong Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-11-03",
    "Escrow Status": "Closed",
    "Purchase Price": "$279,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$6,975.00",
    "Commission Received": "$6,975.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21160-Windsong-Ln-Tehachapi-CA-93561/2056304805_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20720 Hawk View Ct, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-11-10",
    "Escrow Status": "Closed",
    "Purchase Price": "$198,500.00",
    "Commission %": "2.50%",
    "Gross Commission": "$4,962.50",
    "Commission Received": "$4,962.50",
    "Zillow URL": "https://www.zillow.com/homedetails/20720-Hawk-View-Ct-Tehachapi-CA-93561/2056304806_zpid/",
    "Lead Source": "Family",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24510 Golden Oak Dr, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-11-17",
    "Escrow Status": "Closed",
    "Purchase Price": "$305,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$7,625.00",
    "Commission Received": "$7,625.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24510-Golden-Oak-Dr-Tehachapi-CA-93561/2056304807_zpid/",
    "Lead Source": "Past Client Referral",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21050 Valley Vista Way, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-12-01",
    "Escrow Status": "Closed",
    "Purchase Price": "$248,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$6,200.00",
    "Commission Received": "$6,200.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21050-Valley-Vista-Way-Tehachapi-CA-93561/2056304808_zpid/",
    "Lead Source": "Past Client Referral",
    "Escrow Company": "Prominence Title",
    "Loan Company": "NewRez LLC",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20800 Sunset Ridge Rd, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-12-08",
    "Escrow Status": "Closed",
    "Purchase Price": "$267,500.00",
    "Commission %": "2.50%",
    "Gross Commission": "$6,687.50",
    "Commission Received": "$6,687.50",
    "Zillow URL": "https://www.zillow.com/homedetails/20800-Sunset-Ridge-Rd-Tehachapi-CA-93561/2056304809_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24350 Sierra Springs Ct, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-12-15",
    "Escrow Status": "Closed",
    "Purchase Price": "$290,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$7,250.00",
    "Commission Received": "$7,250.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24350-Sierra-Springs-Ct-Tehachapi-CA-93561/2056304810_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20950 Mountain Meadow Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-01-05",
    "Escrow Status": "Closed",
    "Purchase Price": "$312,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$7,800.00",
    "Commission Received": "$7,800.00",
    "Zillow URL": "https://www.zillow.com/homedetails/20950-Mountain-Meadow-Ln-Tehachapi-CA-93561/2056304811_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21220 Woodcrest Dr, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-01-12",
    "Escrow Status": "Closed",
    "Purchase Price": "$229,500.00",
    "Commission %": "2.50%",
    "Gross Commission": "$5,737.50",
    "Commission Received": "$5,737.50",
    "Zillow URL": "https://www.zillow.com/homedetails/21220-Woodcrest-Dr-Tehachapi-CA-93561/2056304812_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "NewRez LLC",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24440 Pinecone Way, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-01-19",
    "Escrow Status": "Closed",
    "Purchase Price": "$335,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$8,375.00",
    "Commission Received": "$8,375.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24440-Pinecone-Way-Tehachapi-CA-93561/2056304813_zpid/",
    "Lead Source": "Open House",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20710 Eagles Nest Rd, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-02-02",
    "Escrow Status": "Closed",
    "Purchase Price": "$254,700.00",
    "Commission %": "2.50%",
    "Gross Commission": "$6,367.50",
    "Commission Received": "$6,367.50",
    "Zillow URL": "https://www.zillow.com/homedetails/20710-Eagles-Nest-Rd-Tehachapi-CA-93561/2056304814_zpid/",
    "Lead Source": "Open House",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21205 Aspen Grove Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-09-22",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$240,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21205-Aspen-Grove-Ln-Tehachapi-CA-93561/2056304815_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24370 Timber Ridge Ct, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-10-27",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$280,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24370-Timber-Ridge-Ct-Tehachapi-CA-93561/2056304816_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20885 Wildflower Rd, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-11-24",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$199,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/20885-Wildflower-Rd-Tehachapi-CA-93561/2056304817_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "NewRez LLC",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "21155 Canyon View Dr, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2023-12-22",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$295,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/21155-Canyon-View-Dr-Tehachapi-CA-93561/2056304818_zpid/",
    "Lead Source": "Open House",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "24490 Desert Willow Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-01-26",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$322,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/24490-Desert-Willow-Ln-Tehachapi-CA-93561/2056304819_zpid/",
    "Lead Source": "Zillow",
    "Escrow Company": "Prominence Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "20620 Copper Ridge Way, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-02-09",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$266,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$0.00",
    "Commission Received": "$0.00",
    "Zillow URL": "https://www.zillow.com/homedetails/20620-Copper-Ridge-Way-Tehachapi-CA-93561/2056304820_zpid/",
    "Lead Source": "BoomTown",
    "Escrow Company": "Prominence Title",
    "Loan Company": "NewRez LLC",
    "Home Inspection Company": "Tehachapi Home Inspections",
    "NHD Company": "REOTRANS Inc."
  },
  {
    "Address": "1234 Main St, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-05-15",
    "Actual COE Date": "2024-05-15",
    "Escrow Status": "Closed",
    "Purchase Price": "$350,000.00",
    "Commission %": "2.75%",
    "Gross Commission": "$9,625.00",
    "My Commission": "$9,625.00",
    "Commission Received": "$9,625.00",
    "EMD": "$5,000.00",
    "Zillow URL": "https://www.zillow.com/homedetails/1234-Main-St-Tehachapi-CA-93561/123456789_zpid/",
    "Lead Source": "Zillow Premier Agent",
    "Escrow Company": "First American Title",
    "Loan Company": "Rocket Mortgage",
    "Home Inspection Company": "AmeriSpec Inspection Services",
    "NHD Company": "REOTRANS Inc.",
    "Transaction Coordinator": "Sarah Johnson",
    "AVID": "Yes",
    "EMD Deposited": "2024-03-20",
    "Appraisal Contingency Removed": "2024-04-10",
    "Home Inspection Contingency Removed": "2024-04-05",
    "Loan Contingency Removed": "2024-04-25",
    "Disclosures Sent": "2024-03-18",
    "All Contingencies Removed": "2024-04-25",
    "Final Walkthrough": "2024-05-14",
    "Keys Received": "2024-05-15",
    "Buyer's Agent": "John Smith",
    "Listing Agent": "Emily Davis",
    "Loan Officer": "Michael Brown",
    "Escrow Officer": "Jessica Williams"
  },
  {
    "Address": "5678 Oak Ave, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-06-20",
    "Actual COE Date": "2024-06-20",
    "Escrow Status": "Closed",
    "Purchase Price": "$425,000.00",
    "Commission %": "3.00%",
    "Gross Commission": "$12,750.00",
    "My Commission": "$12,750.00",
    "Commission Received": "$12,750.00",
    "EMD": "$8,500.00",
    "Zillow URL": "https://www.zillow.com/homedetails/5678-Oak-Ave-Tehachapi-CA-93561/987654321_zpid/",
    "Lead Source": "Realtor.com",
    "Escrow Company": "Chicago Title",
    "Loan Company": "Wells Fargo Home Mortgage",
    "Home Inspection Company": "Pillar To Post",
    "NHD Company": "REOTRANS Inc.",
    "Transaction Coordinator": "Amanda Martinez",
    "AVID": "No",
    "EMD Deposited": "2024-04-25",
    "Appraisal Contingency Removed": "2024-05-20",
    "Home Inspection Contingency Removed": "2024-05-10",
    "Loan Contingency Removed": "2024-06-05",
    "Disclosures Sent": "2024-04-22",
    "All Contingencies Removed": "2024-06-05",
    "Final Walkthrough": "2024-06-19",
    "Keys Received": "2024-06-20",
    "Buyer's Agent": "Robert Garcia",
    "Listing Agent": "Jennifer Lopez",
    "Loan Officer": "David Martinez",
    "Escrow Officer": "Lisa Anderson"
  },
  {
    "Address": "9101 Pine Dr, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-07-10",
    "Actual COE Date": "2024-07-10",
    "Escrow Status": "Closed",
    "Purchase Price": "$295,000.00",
    "Commission %": "2.50%",
    "Gross Commission": "$7,375.00",
    "My Commission": "$7,375.00",
    "Commission Received": "$7,375.00",
    "EMD": "$3,000.00",
    "Zillow URL": "https://www.zillow.com/homedetails/9101-Pine-Dr-Tehachapi-CA-93561/456789123_zpid/",
    "Lead Source": "Facebook Ad",
    "Escrow Company": "Fidelity National Title",
    "Loan Company": "Guild Mortgage",
    "Home Inspection Company": "WIN Home Inspection",
    "NHD Company": "NHD Solutions",
    "Transaction Coordinator": "Sarah Johnson",
    "AVID": "Yes",
    "EMD Deposited": "2024-05-15",
    "Appraisal Contingency Removed": "2024-06-15",
    "Home Inspection Contingency Removed": "2024-06-01",
    "Loan Contingency Removed": "2024-06-25",
    "Disclosures Sent": "2024-05-12",
    "All Contingencies Removed": "2024-06-25",
    "Final Walkthrough": "2024-07-09",
    "Keys Received": "2024-07-10",
    "Buyer's Agent": "Patricia Taylor",
    "Listing Agent": "Christopher Lee",
    "Loan Officer": "Matthew White",
    "Escrow Officer": "Nancy Harris"
  },
  {
    "Address": "2468 Elm St, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-08-05",
    "Actual COE Date": "2024-08-05",
    "Escrow Status": "Closed",
    "Purchase Price": "$520,000.00",
    "Commission %": "2.75%",
    "Gross Commission": "$14,300.00",
    "My Commission": "$14,300.00",
    "Commission Received": "$14,300.00",
    "EMD": "$10,400.00",
    "Zillow URL": "https://www.zillow.com/homedetails/2468-Elm-St-Tehachapi-CA-93561/147258369_zpid/",
    "Lead Source": "Past Client Referral",
    "Escrow Company": "Old Republic Title",
    "Loan Company": "loanDepot",
    "Home Inspection Company": "HouseMaster",
    "NHD Company": "REOTRANS Inc.",
    "Transaction Coordinator": "Amanda Martinez",
    "AVID": "No",
    "EMD Deposited": "2024-06-10",
    "Appraisal Contingency Removed": "2024-07-10",
    "Home Inspection Contingency Removed": "2024-06-25",
    "Loan Contingency Removed": "2024-07-20",
    "Disclosures Sent": "2024-06-08",
    "All Contingencies Removed": "2024-07-20",
    "Final Walkthrough": "2024-08-04",
    "Keys Received": "2024-08-05",
    "Buyer's Agent": "William Clark",
    "Listing Agent": "Barbara Rodriguez",
    "Loan Officer": "James Lewis",
    "Escrow Officer": "Karen Walker"
  },
  {
    "Address": "1357 Maple Ln, Tehachapi, CA 93561",
    "Agent": "Jayden Metz",
    "Close Date": "2024-09-12",
    "Actual COE Date": "",
    "Escrow Status": "Cancelled",
    "Purchase Price": "$385,000.00",
    "Commission %": "3.00%",
    "Gross Commission": "$0.00",
    "My Commission": "$0.00",
    "Commission Received": "$0.00",
    "EMD": "$7,700.00",
    "Zillow URL": "https://www.zillow.com/homedetails/1357-Maple-Ln-Tehachapi-CA-93561/852963741_zpid/",
    "Lead Source": "Open House",
    "Escrow Company": "Stewart Title",
    "Loan Company": "Caliber Home Loans",
    "Home Inspection Company": "BrickKicker",
    "NHD Company": "REOTRANS Inc.",
    "Transaction Coordinator": "Sarah Johnson",
    "AVID": "Yes",
    "EMD Deposited": "2024-07-20",
    "Appraisal Contingency Removed": "",
    "Home Inspection Contingency Removed": "2024-08-05",
    "Loan Contingency Removed": "",
    "Disclosures Sent": "2024-07-18",
    "All Contingencies Removed": "",
    "Final Walkthrough": "",
    "Keys Received": "",
    "Buyer's Agent": "Richard Hall",
    "Listing Agent": "Susan Allen",
    "Loan Officer": "Joseph Young",
    "Escrow Officer": "Betty King"
  }
];

async function importEscrows() {
  const client = await pool.connect();

  try {
    let insertedCount = 0;
    let skippedCount = 0;

    // Get the next numeric_id for display_id generation
    const seqResult = await client.query("SELECT nextval('escrows_numeric_id_seq') as next_id");
    let currentNumericId = parseInt(seqResult.rows[0].next_id);

    for (const escrow of escrowData) {
      // Check for duplicate based on address and close date
      const checkQuery = `
        SELECT id FROM escrows
        WHERE property_address = $1
        AND closing_date = $2
      `;

      const existing = await client.query(checkQuery, [
        escrow.Address,
        parseDate(escrow['Close Date'])
      ]);

      if (existing.rows.length > 0) {
        console.log(`⏭️  SKIPPED: ${escrow.Address} (already exists)`);
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

      // Build timeline JSONB
      const timeline = [];
      if (escrow["EMD Deposited"]) {
        timeline.push({
          date: parseDate(escrow["EMD Deposited"]),
          event: "EMD Deposited",
          completed: true
        });
      }
      if (escrow["Disclosures Sent"]) {
        timeline.push({
          date: parseDate(escrow["Disclosures Sent"]),
          event: "Disclosures Sent",
          completed: true
        });
      }
      if (escrow["Home Inspection Contingency Removed"]) {
        timeline.push({
          date: parseDate(escrow["Home Inspection Contingency Removed"]),
          event: "Inspection Contingency Removed",
          completed: true
        });
      }
      if (escrow["Appraisal Contingency Removed"]) {
        timeline.push({
          date: parseDate(escrow["Appraisal Contingency Removed"]),
          event: "Appraisal Contingency Removed",
          completed: true
        });
      }
      if (escrow["Loan Contingency Removed"]) {
        timeline.push({
          date: parseDate(escrow["Loan Contingency Removed"]),
          event: "Loan Contingency Removed",
          completed: true
        });
      }
      if (escrow["All Contingencies Removed"]) {
        timeline.push({
          date: parseDate(escrow["All Contingencies Removed"]),
          event: "All Contingencies Removed",
          completed: true
        });
      }
      if (escrow["Final Walkthrough"]) {
        timeline.push({
          date: parseDate(escrow["Final Walkthrough"]),
          event: "Final Walkthrough",
          completed: true
        });
      }
      if (escrow["Keys Received"]) {
        timeline.push({
          date: parseDate(escrow["Keys Received"]),
          event: "Keys Received",
          completed: true
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
          created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
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
        parseDate(escrow['Close Date']),
        parseDate(escrow['Actual COE Date']),
        escrow['Lead Source'],
        escrow['Escrow Company'],
        escrow['Loan Company'],
        escrow['NHD Company'],
        escrow['Transaction Coordinator'],
        parseBoolean(escrow.AVID),
        escrow['Zillow URL'],
        JSON.stringify(people),
        JSON.stringify(timeline),
        userId
      ];

      const result = await client.query(insertQuery, values);
      console.log(`✅ INSERTED: ${escrow.Address} (ID: ${result.rows[0].display_id})`);
      insertedCount++;
    }

    console.log('\n📊 IMPORT SUMMARY:');
    console.log(`✅ Inserted: ${insertedCount}`);
    console.log(`⏭️  Skipped (duplicates): ${skippedCount}`);
    console.log(`📝 Total records processed: ${escrowData.length}`);

  } catch (error) {
    console.error('❌ Error importing escrows:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importEscrows();
