import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Button,
  Grid,
  Paper,
  Divider,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  Fade
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  Gavel as GavelIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
  CameraAlt as CameraIcon,
  Engineering as EngineeringIcon,
  Groups as GroupsIcon,
  Sell as SellIcon,
  ShoppingCart as BuyIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  BugReport as BugIcon,
  Description as DocumentIcon,
  Security as WarrantyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const WidgetCard = styled(motion.div)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
}));

const SectionDivider = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  '&::before, &::after': {
    content: '""',
    flex: 1,
    height: 1,
    background: 'rgba(255, 255, 255, 0.2)',
  },
  '& > *': {
    margin: `0 ${theme.spacing(2)}`,
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    opacity: 0.9,
  }
}));

const PersonRow = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
  }
}));

const RoleLabel = styled(Typography)(({ theme }) => ({
  minWidth: 150,
  fontSize: '0.875rem',
  fontWeight: 500,
  opacity: 0.9,
  marginRight: theme.spacing(2),
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  fontSize: '0.8rem',
  opacity: 0.85,
  '& > div': {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  }
}));

const SearchDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    minWidth: 400,
    maxWidth: 600,
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(3),
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      backgroundColor: 'white',
    }
  }
}));

// Mock contacts data - replace with actual API call
const mockContacts = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', type: 'buyer' },
  { id: 2, name: 'Jane Doe', email: 'jane.doe@email.com', phone: '(555) 234-5678', type: 'seller' },
  { id: 3, name: 'Mike Johnson', email: 'mike.j@realty.com', phone: '(555) 345-6789', type: 'agent' },
  { id: 4, name: 'Sarah Williams', email: 'sarah.w@lending.com', phone: '(555) 456-7890', type: 'lender' },
  { id: 5, name: 'Tom Brown', email: 'tom.b@escrow.com', phone: '(555) 567-8901', type: 'escrow' },
  { id: 6, name: 'Emily Davis', email: 'emily.d@title.com', phone: '(555) 678-9012', type: 'title' },
  { id: 7, name: 'Chris Wilson', email: 'chris.w@inspect.com', phone: '(555) 789-0123', type: 'inspector' },
  { id: 8, name: 'Lisa Anderson', email: 'lisa.a@appraise.com', phone: '(555) 890-1234', type: 'appraiser' },
  { id: 9, name: 'Amy Chen', email: 'amy.c@tcservices.com', phone: '(555) 901-2345', type: 'tc' },
  { id: 10, name: 'Robert Lee', email: 'robert.l@pestcontrol.com', phone: '(555) 012-3456', type: 'termite' },
  { id: 11, name: 'Maria Garcia', email: 'maria.g@nhd.com', phone: '(555) 123-4567', type: 'nhd' },
  { id: 12, name: 'David Kim', email: 'david.k@warranty.com', phone: '(555) 234-5678', type: 'warranty' },
];

// Helper function to get role icon
const getRoleIcon = (role) => {
  const icons = {
    buyer: <BuyIcon />,
    seller: <SellIcon />,
    buyerAgent: <BusinessIcon />,
    buyerTC: <AssignmentIcon />,
    sellerAgent: <BusinessIcon />,
    listingTC: <AssignmentIcon />,
    loanOfficer: <MoneyIcon />,
    escrowOfficer: <AccountBalanceIcon />,
    titleOfficer: <GavelIcon />,
    homeInspector: <BuildIcon />,
    termiteInspector: <BugIcon />,
    nhdRep: <DocumentIcon />,
    homeWarrantyRep: <WarrantyIcon />,
    appraiser: <AssignmentIcon />,
    photographer: <CameraIcon />,
    contractor: <EngineeringIcon />,
  };
  return icons[role] || <PersonIcon />;
};

// Helper function to get initials
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

function PeopleWidget({ data, expanded, onExpand, onUpdate }) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState(mockContacts);
  
  if (!data) data = {}; // Initialize empty data if null

  // Define all roles organized by section
  const buyerRoles = [
    { key: 'buyer', label: 'Buyer', icon: <BuyIcon />, color: '#00d4ff' },
    { key: 'buyerAgent', label: 'Buyer\'s Agent', icon: <BusinessIcon />, color: '#4facfe' },
    { key: 'buyerTC', label: 'Buyer\'s TC', icon: <AssignmentIcon />, color: '#00f2fe' },
  ];

  const sellerRoles = [
    { key: 'seller', label: 'Seller', icon: <SellIcon />, color: '#667eea' },
    { key: 'sellerAgent', label: 'Listing Agent', icon: <BusinessIcon />, color: '#764ba2' },
    { key: 'listingTC', label: 'Listing TC', icon: <AssignmentIcon />, color: '#9c27b0' },
  ];

  const vendorRoles = [
    { key: 'loanOfficer', label: 'Lender', icon: <MoneyIcon />, color: '#ffd700' },
    { key: 'escrowOfficer', label: 'Escrow Officer', icon: <AccountBalanceIcon />, color: '#ff9800' },
    { key: 'titleOfficer', label: 'Title Officer', icon: <GavelIcon />, color: '#8e44ad' },
    { key: 'homeInspector', label: 'Home Inspector', icon: <BuildIcon />, color: '#4ecdc4' },
    { key: 'termiteInspector', label: 'Termite Inspector', icon: <BugIcon />, color: '#44a8b3' },
    { key: 'nhdRep', label: 'NHD Rep', icon: <DocumentIcon />, color: '#f093fb' },
    { key: 'homeWarrantyRep', label: 'Home Warranty', icon: <WarrantyIcon />, color: '#f5576c' },
    { key: 'appraiser', label: 'Appraiser', icon: <AssignmentIcon />, color: '#00ff88' },
  ];

  // Count filled positions
  const totalPositions = buyerRoles.length + sellerRoles.length + vendorRoles.length;
  const filledPositions = [...buyerRoles, ...sellerRoles, ...vendorRoles].filter(role => data[role.key]).length;

  const handleAddClick = (role) => {
    setSelectedRole(role);
    setSearchDialogOpen(true);
    setSearchQuery('');
    setFilteredContacts(mockContacts);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = mockContacts.filter(contact => 
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.email.toLowerCase().includes(query.toLowerCase()) ||
      contact.phone.includes(query)
    );
    setFilteredContacts(filtered);
  };

  const handleSelectContact = (contact) => {
    if (onUpdate && selectedRole) {
      onUpdate('people', selectedRole.key, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        contactId: contact.id
      });
    }
    setSearchDialogOpen(false);
    setSelectedRole(null);
  };

  const renderPerson = (role) => {
    const person = data[role.key] || 
                  (role.key === 'buyerTC' && data.transactionCoordinator) || 
                  (role.key === 'listingTC' && data.listingTransactionCoordinator);
    const isEmpty = !person;

    return (
      <PersonRow
        key={role.key}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <RoleLabel>{role.label}</RoleLabel>
        
        {isEmpty ? (
          <>
            <Box flex={1} />
            <IconButton
              size="small"
              sx={{ 
                color: 'white', 
                border: '2px solid rgba(255, 255, 255, 0.5)',
                width: 32,
                height: 32,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  borderColor: 'rgba(255, 255, 255, 0.8)',
                  transform: 'scale(1.1)',
                }
              }}
              onClick={() => handleAddClick(role)}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: role.color,
                fontSize: '0.75rem',
                marginRight: 1.5,
              }}
            >
              {getInitials(person.name)}
            </Avatar>
            <Box flex={1}>
              <Typography variant="body2" fontWeight={500}>
                {person.name}
              </Typography>
              {(person.email || person.phone) && (
                <ContactInfo>
                  {person.email && (
                    <Box>
                      <EmailIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{person.email}</Typography>
                    </Box>
                  )}
                  {person.phone && (
                    <Box>
                      <PhoneIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{person.phone}</Typography>
                    </Box>
                  )}
                </ContactInfo>
              )}
            </Box>
            <IconButton
              size="small"
              sx={{ 
                color: 'white', 
                opacity: 0.7,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                }
              }}
              onClick={() => {
                // Handle edit
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </PersonRow>
    );
  };

  return (
    <>
      <WidgetCard>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              People & Contacts
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {filledPositions} of {totalPositions} positions filled
            </Typography>
          </Box>
          <Chip
            icon={<GroupsIcon />}
            label={`${filledPositions}/${totalPositions}`}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Buyer Section */}
        <SectionDivider>
          <span>Buyer</span>
        </SectionDivider>
        {buyerRoles.map(renderPerson)}

        {/* Seller Section */}
        <SectionDivider>
          <span>Seller</span>
        </SectionDivider>
        {sellerRoles.map(renderPerson)}

        {/* Vendors Section */}
        <SectionDivider>
          <span>Vendors</span>
        </SectionDivider>
        {vendorRoles.map(renderPerson)}
      </WidgetCard>

      {/* Search Dialog */}
      <SearchDialog
        open={searchDialogOpen}
        onClose={() => setSearchDialogOpen(false)}
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              Add {selectedRole?.label}
            </Typography>
            <IconButton onClick={() => setSearchDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <SearchField
            fullWidth
            placeholder="Search contacts by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          
          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(contact => (
                <ListItemButton
                  key={contact.id}
                  onClick={() => handleSelectContact(contact)}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    '&:hover': {
                      bgcolor: 'rgba(79, 172, 254, 0.1)',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4facfe' }}>
                      {getInitials(contact.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <>
                        {contact.email}<br />
                        {contact.phone}
                      </>
                    }
                  />
                  <CheckIcon sx={{ color: '#4facfe' }} />
                </ListItemButton>
              ))
            ) : (
              <Box textAlign="center" py={4}>
                <Typography color="text.secondary">
                  No contacts found matching "{searchQuery}"
                </Typography>
              </Box>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              // Handle creating new contact
              // console.log('Create new contact');
            }}
          >
            Create New Contact
          </Button>
        </DialogActions>
      </SearchDialog>
    </>
  );
}

export default PeopleWidget;