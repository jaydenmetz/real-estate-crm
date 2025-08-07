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
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction
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
  ShoppingCart as BuyIcon
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

const PersonCard = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
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

// Helper function to format role label
const formatRoleLabel = (role) => {
  const labels = {
    buyer: 'Buyer',
    seller: 'Seller',
    buyerAgent: 'Buyer\'s Agent',
    sellerAgent: 'Listing Agent',
    escrowOfficer: 'Escrow Officer',
    titleOfficer: 'Title Officer',
    loanOfficer: 'Loan Officer',
    homeInspector: 'Home Inspector',
    appraiser: 'Appraiser',
    photographer: 'Photographer',
    contractor: 'Contractor',
    transactionCoordinator: 'Transaction Coordinator',
    referralAgent: 'Referral Agent'
  };
  return labels[role] || role;
};

function PeopleWidget({ data, expanded, onExpand, onUpdate }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showContactInfo, setShowContactInfo] = useState({});
  
  if (!data) return null;

  // Organize people by party - using consistent color palette
  const buyerParty = [
    { key: 'buyer', data: data.buyer, role: 'Buyer', color: '#00d4ff' },
    { key: 'buyerAgent', data: data.buyerAgent, role: 'Buyer\'s Agent', color: '#4facfe' },
    { key: 'loanOfficer', data: data.loanOfficer, role: 'Loan Officer', color: '#00f2fe' },
  ].filter(p => p.data);

  const sellerParty = [
    { key: 'seller', data: data.seller, role: 'Seller', color: '#667eea' },
    { key: 'sellerAgent', data: data.sellerAgent, role: 'Listing Agent', color: '#764ba2' },
    { key: 'escrowOfficer', data: data.escrowOfficer, role: 'Escrow Officer', color: '#9c27b0' },
    { key: 'titleOfficer', data: data.titleOfficer, role: 'Title Officer', color: '#8e44ad' },
  ].filter(p => p.data);

  const vendors = [
    { key: 'homeInspector', data: data.homeInspector, role: 'Home Inspector', color: '#4ecdc4' },
    { key: 'appraiser', data: data.appraiser, role: 'Appraiser', color: '#44a8b3' },
    { key: 'photographer', data: data.photographer, role: 'Photographer', color: '#f093fb' },
    { key: 'contractor', data: data.contractor, role: 'Contractor', color: '#f5576c' },
    { key: 'transactionCoordinator', data: data.transactionCoordinator, role: 'TC', color: '#ffd700' },
    { key: 'referralAgent', data: data.referralAgent, role: 'Referral', color: '#00ff88' },
  ].filter(p => p.data);

  const totalPeople = buyerParty.length + sellerParty.length + vendors.length;

  const toggleContactInfo = (key) => {
    setShowContactInfo(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderPerson = (person) => (
    <PersonCard
      key={person.key}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={() => toggleContactInfo(person.key)}
    >
      <Avatar
        sx={{
          width: 36,
          height: 36,
          bgcolor: person.color,
          marginRight: 1.5,
          fontSize: '0.875rem'
        }}
      >
        {person.data.name ? getInitials(person.data.name) : getRoleIcon(person.key)}
      </Avatar>
      <Box flex={1}>
        <Typography variant="body2" fontWeight={500}>
          {person.data.name || 'Not specified'}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.8 }}>
          {person.role}
        </Typography>
        <AnimatePresence>
          {showContactInfo[person.key] && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ContactInfo>
                {person.data.email && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <EmailIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{person.data.email}</Typography>
                  </Box>
                )}
                {person.data.phone && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <PhoneIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">{person.data.phone}</Typography>
                  </Box>
                )}
              </ContactInfo>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
      <IconButton
        size="small"
        sx={{ color: 'white', opacity: 0.7 }}
        onClick={(e) => {
          e.stopPropagation();
          // Handle edit
        }}
      >
        <EditIcon fontSize="small" />
      </IconButton>
    </PersonCard>
  );

  return (
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
            {totalPeople} participants • Click names for contact info
          </Typography>
        </Box>
        <Chip
          icon={<GroupsIcon />}
          label={`${totalPeople} Total`}
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
            {buyerParty.length > 0 ? (
              buyerParty.map(renderPerson)
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', py: 2 }}>
                No buyer party members added
              </Typography>
            )}
          </PartySection>
        </Grid>

        {/* Seller Party */}
        <Grid item xs={12} md={6}>
          <PartySection>
            <SectionTitle>
              <SellIcon /> Seller Side
            </SectionTitle>
            {sellerParty.length > 0 ? (
              sellerParty.map(renderPerson)
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', py: 2 }}>
                No seller party members added
              </Typography>
            )}
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
            {vendors.length > 0 ? (
              <Grid container spacing={1}>
                {vendors.map(vendor => (
                  <Grid item xs={12} sm={6} key={vendor.key}>
                    {renderPerson(vendor)}
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.6, textAlign: 'center', py: 2 }}>
                No vendors added yet
              </Typography>
            )}
            
            {/* Add Vendor Button */}
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
                // Handle add vendor
              }}
            >
              Add Vendor
            </Button>
          </PartySection>
        </Box>
      </Collapse>

      {/* Quick Stats */}
      <Box mt={3} display="flex" justifyContent="space-around">
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {buyerParty.length}
          </Typography>
          <Typography variant="caption">Buyer Side</Typography>
        </Box>
        <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {sellerParty.length}
          </Typography>
          <Typography variant="caption">Seller Side</Typography>
        </Box>
        {vendors.length > 0 && (
          <>
            <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
            <Box textAlign="center">
              <Typography variant="h6" fontWeight="bold">
                {vendors.length}
              </Typography>
              <Typography variant="caption">Vendors</Typography>
            </Box>
          </>
        )}
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
  );
}

export default PeopleWidget;