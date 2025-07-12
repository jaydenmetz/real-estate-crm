import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Description,
  Close,
  CheckCircle,
} from '@mui/icons-material';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker with fallback
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.3.93/build/pdf.worker.min.js';
} catch (error) {
  console.warn('PDF.js worker setup failed, using fallback:', error);
  // Disable worker for development
  pdfjsLib.GlobalWorkerOptions.workerSrc = '';
}

const RPAParser = ({ onDataExtracted, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [extractedData, setExtractedData] = useState(null);

  // Parse RPA text to extract escrow data
  const parseRPAText = (text) => {
    const data = {
      propertyAddress: '',
      purchasePrice: '',
      acceptanceDate: null,
      closingDate: null,
      buyers: [],
      sellers: [],
      earnestMoneyDeposit: '',
      downPayment: '',
      loanAmount: '',
      escrowCompany: '',
      titleCompany: '',
      listingAgent: { name: '', email: '', phone: '', brokerage: '' },
      buyerAgent: { name: '', email: '', phone: '', brokerage: '' },
      inspectionDeadline: null,
      appraisalDeadline: null,
      loanContingencyDeadline: null,
    };

    // Track confidence scores for each field
    const confidence = {};

    try {
      // Property Address - look for various patterns
      const addressPatterns = [
        /Property Address[:\s]+([^\n]+)/i,
        /Real Property[:\s]+([^\n]+)/i,
        /Subject Property[:\s]+([^\n]+)/i,
        /Property Location[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of addressPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.propertyAddress = match[1].trim().replace(/\s+/g, ' ');
          confidence.propertyAddress = 'high';
          break;
        }
      }

      // Purchase Price - look for dollar amounts
      const pricePatterns = [
        /Purchase Price[:\s]+\$?([\d,]+)/i,
        /Sale Price[:\s]+\$?([\d,]+)/i,
        /Total Purchase Price[:\s]+\$?([\d,]+)/i,
        /Offer Price[:\s]+\$?([\d,]+)/i,
      ];
      
      for (const pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) {
          data.purchasePrice = match[1].replace(/,/g, '');
          confidence.purchasePrice = 'high';
          break;
        }
      }

      // Buyers - look for buyer names
      const buyerPatterns = [
        /Buyer[s]?[:\s]+([^\n]+)/i,
        /Purchaser[s]?[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of buyerPatterns) {
        const match = text.match(pattern);
        if (match) {
          const buyerText = match[1].trim();
          // Split by common separators and clean up
          const buyers = buyerText.split(/\s+and\s+|\s*,\s*|\s*&\s*/)
            .filter(name => name.length > 2)
            .map(name => ({
              name: name.trim().replace(/\([^)]*\)/g, '').trim(),
              email: '',
              phone: '',
              lender: '',
              preApproved: false
            }));
          data.buyers = buyers.slice(0, 3); // Limit to 3 buyers
          confidence.buyers = buyers.length > 0 ? 'high' : 'low';
          break;
        }
      }

      // Sellers - look for seller names
      const sellerPatterns = [
        /Seller[s]?[:\s]+([^\n]+)/i,
        /Vendor[s]?[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of sellerPatterns) {
        const match = text.match(pattern);
        if (match) {
          const sellerText = match[1].trim();
          const sellers = sellerText.split(/\s+and\s+|\s*,\s*|\s*&\s*/)
            .filter(name => name.length > 2)
            .map(name => ({
              name: name.trim().replace(/\([^)]*\)/g, '').trim(),
              email: '',
              phone: ''
            }));
          data.sellers = sellers.slice(0, 3); // Limit to 3 sellers
          break;
        }
      }

      // Earnest Money
      const earnestPatterns = [
        /Earnest Money[:\s]+\$?([\d,]+)/i,
        /Initial Deposit[:\s]+\$?([\d,]+)/i,
        /Good Faith Deposit[:\s]+\$?([\d,]+)/i,
      ];
      
      for (const pattern of earnestPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.earnestMoneyDeposit = match[1].replace(/,/g, '');
          break;
        }
      }

      // Down Payment
      const downPaymentPatterns = [
        /Down Payment[:\s]+\$?([\d,]+)/i,
        /Cash Down[:\s]+\$?([\d,]+)/i,
      ];
      
      for (const pattern of downPaymentPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.downPayment = match[1].replace(/,/g, '');
          break;
        }
      }

      // Loan Amount
      const loanPatterns = [
        /Loan Amount[:\s]+\$?([\d,]+)/i,
        /Financing[:\s]+\$?([\d,]+)/i,
        /Mortgage[:\s]+\$?([\d,]+)/i,
      ];
      
      for (const pattern of loanPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.loanAmount = match[1].replace(/,/g, '');
          break;
        }
      }

      // Escrow Company
      const escrowPatterns = [
        /Escrow Company[:\s]+([^\n]+)/i,
        /Escrow Agent[:\s]+([^\n]+)/i,
        /Settlement Agent[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of escrowPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.escrowCompany = match[1].trim();
          break;
        }
      }

      // Title Company
      const titlePatterns = [
        /Title Company[:\s]+([^\n]+)/i,
        /Title Insurance[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of titlePatterns) {
        const match = text.match(pattern);
        if (match) {
          data.titleCompany = match[1].trim();
          break;
        }
      }

      // Listing Agent
      const listingAgentPatterns = [
        /Listing Agent[:\s]+([^\n]+)/i,
        /Seller'?s Agent[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of listingAgentPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.listingAgent.name = match[1].trim();
          break;
        }
      }

      // Buyer's Agent
      const buyerAgentPatterns = [
        /Buyer'?s Agent[:\s]+([^\n]+)/i,
        /Selling Agent[:\s]+([^\n]+)/i,
      ];
      
      for (const pattern of buyerAgentPatterns) {
        const match = text.match(pattern);
        if (match) {
          data.buyerAgent.name = match[1].trim();
          break;
        }
      }

      // Dates - look for various date formats
      const datePatterns = [
        /Closing Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Settlement Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Acceptance Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Inspection[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
        /Appraisal[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i,
      ];

      // Parse dates
      const closingMatch = text.match(/Closing Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (closingMatch) {
        data.closingDate = new Date(closingMatch[1]);
      }

      const acceptanceMatch = text.match(/Acceptance Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (acceptanceMatch) {
        data.acceptanceDate = new Date(acceptanceMatch[1]);
      }

      const inspectionMatch = text.match(/Inspection[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (inspectionMatch) {
        data.inspectionDeadline = new Date(inspectionMatch[1]);
      }

      const appraisalMatch = text.match(/Appraisal[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
      if (appraisalMatch) {
        data.appraisalDeadline = new Date(appraisalMatch[1]);
      }

      // Ensure we have at least one buyer and seller
      if (data.buyers.length === 0) {
        data.buyers = [{ name: '', email: '', phone: '', lender: '', preApproved: false }];
      }
      if (data.sellers.length === 0) {
        data.sellers = [{ name: '', email: '', phone: '' }];
      }

      // Add confidence metadata
      data._confidence = confidence;
      
      return data;
    } catch (error) {
      console.error('Error parsing RPA text:', error);
      return data;
    }
  };

  // Extract text from PDF
  const extractTextFromPDF = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async function(event) {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          
          let fullText = '';
          const totalPages = pdf.numPages;
          
          for (let i = 1; i <= totalPages; i++) {
            setProgress((i / totalPages) * 80); // 80% for extraction
            
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Extract text from PDF
      setProgress(10);
      const text = await extractTextFromPDF(file);
      
      // Parse the extracted text
      setProgress(90);
      const data = parseRPAText(text);
      
      setProgress(100);
      setExtractedData(data);
      
      // Auto-populate the form after a brief delay
      setTimeout(() => {
        onDataExtracted(data);
        setLoading(false);
      }, 500);
      
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError('Failed to process PDF. Please ensure it\'s a valid RPA document.');
      setLoading(false);
      setProgress(0);
    }
  }, [onDataExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    disabled: loading
  });

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'background.paper',
          cursor: loading ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            borderColor: loading ? 'grey.300' : 'primary.main',
            backgroundColor: loading ? 'background.paper' : 'primary.50',
          }
        }}
      >
        <input {...getInputProps()} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" color="primary">
            Auto-Fill from RPA
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Processing RPA document...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ mb: 1, maxWidth: 300, mx: 'auto' }}
            />
            <Typography variant="caption" color="text.secondary">
              {progress < 80 ? 'Extracting text from PDF...' : 'Parsing escrow data...'}
            </Typography>
          </Box>
        ) : extractedData ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h6" color="success.main" gutterBottom>
              RPA Data Extracted Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The form has been auto-populated with data from your RPA
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
              {extractedData.propertyAddress && (
                <Chip 
                  label={`Property Address ${extractedData._confidence?.propertyAddress === 'high' ? '✓' : '~'}`} 
                  color={extractedData._confidence?.propertyAddress === 'high' ? 'success' : 'warning'} 
                  size="small" 
                />
              )}
              {extractedData.purchasePrice && (
                <Chip 
                  label={`Purchase Price ${extractedData._confidence?.purchasePrice === 'high' ? '✓' : '~'}`} 
                  color={extractedData._confidence?.purchasePrice === 'high' ? 'success' : 'warning'} 
                  size="small" 
                />
              )}
              {extractedData.buyers.length > 0 && extractedData.buyers[0].name && (
                <Chip 
                  label={`Buyers ${extractedData._confidence?.buyers === 'high' ? '✓' : '~'}`} 
                  color={extractedData._confidence?.buyers === 'high' ? 'success' : 'warning'} 
                  size="small" 
                />
              )}
              {extractedData.sellers.length > 0 && extractedData.sellers[0].name && <Chip label="Sellers ✓" color="success" size="small" />}
              {extractedData.closingDate && <Chip label="Closing Date ✓" color="success" size="small" />}
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center' }}>
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your RPA here...' : 'Drag & drop your Fully Executed RPA'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Upload a PDF of your Residential Purchase Agreement to auto-fill escrow details
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Description fontSize="small" />
              <Typography variant="caption">PDF files only</Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default RPAParser;