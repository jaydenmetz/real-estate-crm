import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Collapse,
  Button,
  Tooltip,
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
  ListItem,
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
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  ExpandMore as ExpandMoreIcon,
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
  Security as WarrantyIcon,
  AdminPanelSettings as AdminIcon
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
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.3)',
  }
}));

const PartySection = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
  minHeight: 180,
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-2px)',
  }
}));

const PersonCard = styled(motion.div)(({ theme, isEmpty }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  border: '1px solid transparent',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
    transform: 'translateX(4px)',
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  textTransform: 'uppercase',
  fontSize: '0.875rem',
  letterSpacing: '0.05em',
  opacity: 0.9,
}));

const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(0.5),
  paddingLeft: theme.spacing(5),
  fontSize: '0.75rem',
  opacity: 0.8,
}));

const FloatingIcon = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  opacity: 0.1,
  pointerEvents: 'none',
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
    referralAgent: <BusinessIcon />
  };
  return icons[role] || <PersonIcon />;
};

// Helper function to get initials
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

function PeopleWidget({ data, expanded, onExpand, onUpdate }) {
  const [showContactInfo, setShowContactInfo] = useState({});
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [filteredContacts, setFilteredContacts] = useState(mockContacts);
  
  if (!data) data = {}; // Initialize empty data if null

  // Define all roles - buyer party on left, seller party on right
  const buyerPartyRoles = [
    { key: 'buyer', label: 'Buyer', icon: <BuyIcon />, color: '#00d4ff' },
    { key: 'buyerAgent', label: 'Buyer\'s Agent', icon: <BusinessIcon />, color: '#4facfe' },
    { key: 'buyerTC', label: 'Buyer\'s TC', icon: <AssignmentIcon />, color: '#00f2fe' },
  ];

  const sellerPartyRoles = [
    { key: 'seller', label: 'Seller', icon: <SellIcon />, color: '#667eea' },
    { key: 'sellerAgent', label: 'Listing Agent', icon: <BusinessIcon />, color: '#764ba2' },
    { key: 'listingTC', label: 'Listing TC', icon: <AssignmentIcon />, color: '#9c27b0' },
  ];

  // Vendors section includes lender and escrow officer at top
  const primaryVendorRoles = [
    { key: 'loanOfficer', label: 'Lender / Loan Officer', icon: <MoneyIcon />, color: '#ffd700' },
    { key: 'escrowOfficer', label: 'Escrow Officer', icon: <AccountBalanceIcon />, color: '#ff9800' },
    { key: 'titleOfficer', label: 'Title Officer', icon: <GavelIcon />, color: '#8e44ad' },
  ];

  // Additional vendor roles that can be added
  const additionalVendorRoles = [
    { key: 'homeInspector', label: 'Home Inspector', icon: <BuildIcon />, color: '#4ecdc4' },
    { key: 'termiteInspector', label: 'Termite Inspector', icon: <BugIcon />, color: '#44a8b3' },
    { key: 'nhdRep', label: 'NHD Representative', icon: <DocumentIcon />, color: '#f093fb' },
    { key: 'homeWarrantyRep', label: 'Home Warranty Rep', icon: <WarrantyIcon />, color: '#f5576c' },
    { key: 'appraiser', label: 'Appraiser', icon: <AssignmentIcon />, color: '#00ff88' },
    { key: 'photographer', label: 'Photographer', icon: <CameraIcon />, color: '#e91e63' },
    { key: 'contractor', label: 'Contractor', icon: <EngineeringIcon />, color: '#607d8b' },
  ];

  // Get any additional vendor roles that have been added
  const addedVendorRoles = additionalVendorRoles.filter(role => data[role.key]);

  // Count filled positions
  const buyerPartyCount = buyerPartyRoles.filter(role => data[role.key]).length;
  const sellerPartyCount = sellerPartyRoles.filter(role => data[role.key]).length;
  const primaryVendorCount = primaryVendorRoles.filter(role => data[role.key]).length;
  const additionalVendorCount = addedVendorRoles.length;
  const totalPeople = buyerPartyCount + sellerPartyCount + primaryVendorCount + additionalVendorCount;

  const toggleContactInfo = (key) => {
    setShowContactInfo(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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

  const handleAddVendor = () => {
    // Show a list of vendor types to add
    const availableVendors = additionalVendorRoles.filter(role => !data[role.key]);
    if (availableVendors.length > 0) {
      // For simplicity, just add the first available vendor type
      // In production, show a menu to select which vendor type to add
      handleAddClick(availableVendors[0]);
    }
  };

  const renderPerson = (role) => {
    const person = data[role.key] || (role.key === 'buyerTC' && data.transactionCoordinator) || (role.key === 'listingTC' && data.listingTransactionCoordinator);
    const isEmpty = !person;

    return (
      <PersonCard
        key={role.key}
        isEmpty={isEmpty}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => !isEmpty && toggleContactInfo(role.key)}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: isEmpty ? 'rgba(255, 255, 255, 0.1)' : role.color,
            marginRight: 1.5,
            fontSize: '0.875rem',
            cursor: isEmpty ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {isEmpty ? role.icon : (person?.name ? getInitials(person.name) : role.icon)}
        </Avatar>
        <Box flex={1}>
          <Typography variant="body2" fontWeight={500} sx={{ opacity: isEmpty ? 0.6 : 1 }}>
            {isEmpty ? role.label : person?.name}
          </Typography>
          {!isEmpty && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {role.label}
            </Typography>
          )}
          <AnimatePresence>
            {showContactInfo[role.key] && person && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ContactInfo>
                  {person.email && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <EmailIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{person.email}</Typography>
                    </Box>
                  )}
                  {person.phone && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <PhoneIcon sx={{ fontSize: 14 }} />
                      <Typography variant="caption">{person.phone}</Typography>
                    </Box>
                  )}
                </ContactInfo>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
        <IconButton
          size="small"
          sx={{ 
            color: 'white', 
            bgcolor: isEmpty ? 'transparent' : 'transparent',
            border: isEmpty ? '2px solid rgba(255, 255, 255, 0.5)' : 'none',
            width: 32,
            height: 32,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              borderColor: isEmpty ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
              transform: 'scale(1.1)',
            }
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (isEmpty) {
              handleAddClick(role);
            } else {
              // Handle edit
            }
          }}
        >
          {isEmpty ? <AddIcon fontSize="small" /> : <EditIcon fontSize="small" />}
        </IconButton>
      </PersonCard>
    );
  };

  return (
    <>
      <WidgetCard
        onClick={onExpand}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Floating Background Icons */}
        <FloatingIcon
          animate={{
            y: [-20, 20],
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          style={{ top: 10, right: 10 }}
        >
          <GroupsIcon sx={{ fontSize: 100 }} />
        </FloatingIcon>

        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              People & Contacts
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {totalPeople} contacts added • Click to view details
            </Typography>
          </Box>
          <Chip
            icon={<GroupsIcon />}
            label={`${totalPeople} Active`}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 'bold'
            }}
          />
        </Box>

        {/* Main Content - Two Column Layout */}
        <Grid container spacing={2}>
          {/* Buyer Party */}
          <Grid item xs={12} md={6}>
            <PartySection>
              <SectionTitle>
                <BuyIcon /> Buyer Side
              </SectionTitle>
              {buyerPartyRoles.map(renderPerson)}
            </PartySection>
          </Grid>

          {/* Seller Party */}
          <Grid item xs={12} md={6}>
            <PartySection>
              <SectionTitle>
                <SellIcon /> Seller Side
              </SectionTitle>
              {sellerPartyRoles.map(renderPerson)}
            </PartySection>
          </Grid>
        </Grid>

        {/* Vendors Section - Expandable */}
        <Collapse in={expanded}>
          <Box mt={3}>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', my: 2 }} />
            
            {/* Primary Vendors */}
            <PartySection sx={{ mb: 2 }}>
              <SectionTitle>
                <AccountBalanceIcon /> Primary Vendors
              </SectionTitle>
              <Grid container spacing={1}>
                {primaryVendorRoles.map(role => (
                  <Grid item xs={12} key={role.key}>
                    {renderPerson(role)}
                  </Grid>
                ))}
              </Grid>
            </PartySection>

            {/* Additional Services */}
            <PartySection>
              <SectionTitle>
                <BuildIcon /> Additional Services
              </SectionTitle>
              
              {/* Show added vendor roles */}
              {addedVendorRoles.length > 0 ? (
                <Grid container spacing={1}>
                  {addedVendorRoles.map(role => (
                    <Grid item xs={12} sm={6} key={role.key}>
                      {renderPerson(role)}
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', py: 2 }}>
                  No additional services added yet
                </Typography>
              )}
              
              {/* Add Service Button */}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{
                  mt: 2,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddVendor();
                }}
              >
                Add Service Provider
              </Button>
              
              {/* Quick Add Buttons for Common Services */}
              <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
                {additionalVendorRoles
                  .filter(role => !data[role.key])
                  .slice(0, 4)
                  .map(role => (
                    <Chip
                      key={role.key}
                      label={`+ ${role.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddClick(role);
                      }}
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                    />
                  ))}
              </Box>
            </PartySection>
          </Box>
        </Collapse>

        {/* Quick Stats */}
        <Box mt={3} display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {buyerPartyCount}/3
            </Typography>
            <Typography variant="caption">Buyer Side</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {sellerPartyCount}/3
            </Typography>
            <Typography variant="caption">Seller Side</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {primaryVendorCount + additionalVendorCount}
            </Typography>
            <Typography variant="caption">Vendors</Typography>
          </Box>
        </Box>

        {/* Expand Indicator */}
        <Box display="flex" justifyContent="center" mt={2}>
          <IconButton
            size="small"
            sx={{ 
              color: 'white', 
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', 
              transition: 'transform 0.3s' 
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
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
              console.log('Create new contact');
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