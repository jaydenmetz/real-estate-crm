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
  Check as CheckIcon
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
  minHeight: 200,
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
  background: isEmpty ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.08)',
  borderRadius: theme.spacing(1),
  border: isEmpty ? '1px dashed rgba(255, 255, 255, 0.3)' : '1px solid transparent',
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
];

// Helper function to get role icon
const getRoleIcon = (role) => {
  const icons = {
    buyer: <BuyIcon />,
    seller: <SellIcon />,
    buyerAgent: <BusinessIcon />,
    sellerAgent: <BusinessIcon />,
    escrowOfficer: <AccountBalanceIcon />,
    titleOfficer: <GavelIcon />,
    loanOfficer: <MoneyIcon />,
    homeInspector: <BuildIcon />,
    appraiser: <AssignmentIcon />,
    photographer: <CameraIcon />,
    contractor: <EngineeringIcon />,
    transactionCoordinator: <AssignmentIcon />,
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

  // Define all roles with buyer party on left, seller party on right
  const buyerPartyRoles = [
    { key: 'buyer', label: 'Buyer', icon: <BuyIcon />, color: '#00d4ff' },
    { key: 'buyerAgent', label: 'Buyer\'s Agent', icon: <BusinessIcon />, color: '#4facfe' },
    { key: 'loanOfficer', label: 'Loan Officer', icon: <MoneyIcon />, color: '#00f2fe' },
  ];

  const sellerPartyRoles = [
    { key: 'seller', label: 'Seller', icon: <SellIcon />, color: '#667eea' },
    { key: 'sellerAgent', label: 'Listing Agent', icon: <BusinessIcon />, color: '#764ba2' },
    { key: 'escrowOfficer', label: 'Escrow Officer', icon: <AccountBalanceIcon />, color: '#9c27b0' },
    { key: 'titleOfficer', label: 'Title Officer', icon: <GavelIcon />, color: '#8e44ad' },
  ];

  const vendorRoles = [
    { key: 'homeInspector', label: 'Home Inspector', icon: <BuildIcon />, color: '#4ecdc4' },
    { key: 'appraiser', label: 'Appraiser', icon: <AssignmentIcon />, color: '#44a8b3' },
    { key: 'photographer', label: 'Photographer', icon: <CameraIcon />, color: '#f093fb' },
    { key: 'contractor', label: 'Contractor', icon: <EngineeringIcon />, color: '#f5576c' },
    { key: 'transactionCoordinator', label: 'Transaction Coordinator', icon: <AssignmentIcon />, color: '#ffd700' },
    { key: 'referralAgent', label: 'Referral Agent', icon: <BusinessIcon />, color: '#00ff88' },
  ];

  // Count filled positions
  const buyerPartyCount = buyerPartyRoles.filter(role => data[role.key]).length;
  const sellerPartyCount = sellerPartyRoles.filter(role => data[role.key]).length;
  const vendorCount = vendorRoles.filter(role => data[role.key]).length;
  const totalPeople = buyerPartyCount + sellerPartyCount + vendorCount;

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

  const renderPerson = (role) => {
    const person = data[role.key];
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
            border: isEmpty ? '2px dashed rgba(255, 255, 255, 0.3)' : 'none',
          }}
        >
          {person?.name ? getInitials(person.name) : role.icon}
        </Avatar>
        <Box flex={1}>
          <Typography variant="body2" fontWeight={500} sx={{ opacity: isEmpty ? 0.5 : 1 }}>
            {person?.name || role.label}
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
            opacity: isEmpty ? 1 : 0.7,
            bgcolor: isEmpty ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.2)',
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
              {totalPeople} of {buyerPartyRoles.length + sellerPartyRoles.length + vendorRoles.length} positions filled
            </Typography>
          </Box>
          <Chip
            icon={<GroupsIcon />}
            label={`${totalPeople} Added`}
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
            <PartySection>
              <SectionTitle>
                <BuildIcon /> Vendors & Services
              </SectionTitle>
              <Grid container spacing={1}>
                {vendorRoles.map(role => (
                  <Grid item xs={12} sm={6} key={role.key}>
                    {renderPerson(role)}
                  </Grid>
                ))}
              </Grid>
            </PartySection>
          </Box>
        </Collapse>

        {/* Quick Stats */}
        <Box mt={3} display="flex" justifyContent="space-around">
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {buyerPartyCount}/{buyerPartyRoles.length}
            </Typography>
            <Typography variant="caption">Buyer Side</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {sellerPartyCount}/{sellerPartyRoles.length}
            </Typography>
            <Typography variant="caption">Seller Side</Typography>
          </Box>
          <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="bold">
              {vendorCount}/{vendorRoles.length}
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