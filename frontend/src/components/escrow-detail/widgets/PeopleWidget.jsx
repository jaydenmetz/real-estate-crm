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
  Paper
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
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const WidgetCard = styled(motion.div)(({ theme, gradient }) => ({
  background: gradient || 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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

const CircularLayout = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 250,
  height: 250,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const PersonAvatar = styled(motion.div)(({ theme, angle, radius = 100 }) => {
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  
  return {
    position: 'absolute',
    transform: `translate(${x}px, ${y}px)`,
    transition: 'all 0.3s ease',
  };
});

const RoleBadge = styled(Chip)(({ theme, rolecolor }) => ({
  position: 'absolute',
  bottom: -5,
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '0.625rem',
  height: 20,
  backgroundColor: rolecolor,
  color: 'white',
  fontWeight: 'bold',
  '& .MuiChip-label': {
    padding: '0 6px',
  }
}));

const ContactCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const ConnectionLine = styled('svg')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
}));

function PeopleWidget({ data, expanded, onExpand, onUpdate }) {
  const [selectedPerson, setSelectedPerson] = useState(null);
  
  if (!data) return null;

  // Define people with their roles and positions
  const peopleConfig = [
    { key: 'buyer', label: 'Buyer', icon: <PersonIcon />, angle: 0, color: '#4caf50' },
    { key: 'seller', label: 'Seller', icon: <PersonIcon />, angle: 60, color: '#2196f3' },
    { key: 'buyerAgent', label: 'Buyer Agent', icon: <BusinessIcon />, angle: 120, color: '#ff9800' },
    { key: 'sellerAgent', label: 'Seller Agent', icon: <BusinessIcon />, angle: 180, color: '#f44336' },
    { key: 'escrowOfficer', label: 'Escrow', icon: <AccountBalanceIcon />, angle: 240, color: '#9c27b0' },
    { key: 'referralAgent', label: 'Referral', icon: <MoneyIcon />, angle: 300, color: '#00bcd4' },
  ];

  const activePeople = peopleConfig.filter(config => data[config.key]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <WidgetCard
      gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      onClick={onExpand}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            People
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {activePeople.length} participants
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{ color: 'white' }}
          onClick={(e) => {
            e.stopPropagation();
            // Handle add person
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>

      {/* Circular Avatar Layout */}
      <CircularLayout>
        {/* Connection Lines */}
        <ConnectionLine viewBox="0 0 250 250">
          {activePeople.map((person, index) => {
            const nextPerson = activePeople[(index + 1) % activePeople.length];
            const x1 = 125 + Math.cos((person.angle * Math.PI) / 180) * 100;
            const y1 = 125 + Math.sin((person.angle * Math.PI) / 180) * 100;
            const x2 = 125 + Math.cos((nextPerson.angle * Math.PI) / 180) * 100;
            const y2 = 125 + Math.sin((nextPerson.angle * Math.PI) / 180) * 100;
            
            return (
              <motion.line
                key={`line-${person.key}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2"
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            );
          })}
        </ConnectionLine>

        {/* Center Icon */}
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <HomeIcon sx={{ fontSize: 30 }} />
        </Box>

        {/* People Avatars */}
        {activePeople.map((person, index) => {
          const personData = data[person.key];
          if (!personData) return null;

          return (
            <PersonAvatar
              key={person.key}
              angle={person.angle}
              radius={100}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPerson(person.key);
              }}
            >
              <Tooltip title={personData.name || person.label}>
                <Box position="relative">
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: person.color,
                      border: '3px solid white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    {personData.name ? getInitials(personData.name) : person.icon}
                  </Avatar>
                  <RoleBadge
                    label={person.label}
                    size="small"
                    rolecolor={person.color}
                  />
                </Box>
              </Tooltip>
            </PersonAvatar>
          );
        })}
      </CircularLayout>

      {/* Selected Person Details */}
      <AnimatePresence>
        {selectedPerson && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 24 }}
          >
            <ContactCard>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Typography variant="h6">
                  {data[selectedPerson]?.name || 'Unknown'}
                </Typography>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPerson(null);
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                {data[selectedPerson]?.email && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" />
                      <Typography variant="body2">
                        {data[selectedPerson].email}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {data[selectedPerson]?.phone && (
                  <Grid item xs={12}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PhoneIcon fontSize="small" />
                      <Typography variant="body2">
                        {data[selectedPerson].phone}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </ContactCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Content */}
      <Collapse in={expanded}>
        <Box mt={3}>
          <Typography variant="h6" gutterBottom>
            All Contacts
          </Typography>
          {peopleConfig.map((person) => {
            const personData = data[person.key];
            if (!personData) return null;

            return (
              <ContactCard key={person.key}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar sx={{ bgcolor: person.color }}>
                      {personData.name ? getInitials(personData.name) : person.icon}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="subtitle2">
                      {personData.name || 'Not specified'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {person.label}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton
                      size="small"
                      sx={{ color: 'white' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle edit
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Grid>
                </Grid>
              </ContactCard>
            );
          })}

          {/* Add New Contact Button */}
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
              // Handle add new contact
            }}
          >
            Add Contact
          </Button>
        </Box>
      </Collapse>

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