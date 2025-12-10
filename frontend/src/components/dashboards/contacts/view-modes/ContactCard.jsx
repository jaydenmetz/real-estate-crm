import React from 'react';
import { Box, Typography, Avatar, IconButton, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Email, Phone, MoreVert } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

/**
 * ContactCard - Card component for displaying contacts in grid view
 */
export const ContactCard = ({ item: contact, config, onUpdate, onDelete, delay = 0 }) => {
  const navigate = useNavigate();

  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact';
  const initials = `${(contact.first_name || '')[0] || ''}${(contact.last_name || '')[0] || ''}`.toUpperCase() || '?';

  // Get role tags
  const roles = contact.roles || [];
  const primaryRole = roles.find(r => r.is_primary) || roles[0];

  const handleClick = () => {
    if (contact.id) {
      navigate(`/contacts/${contact.id}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay * 0.05 }}
    >
      <Box
        onClick={handleClick}
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2.5,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
            borderColor: 'primary.main',
          },
        }}
      >
        {/* Header with Avatar and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Avatar
            src={contact.avatar_url}
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#8B5CF6',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Open menu
            }}
            sx={{ color: 'text.secondary' }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            mb: 0.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fullName}
        </Typography>

        {/* Role Badge */}
        {primaryRole && (
          <Chip
            label={primaryRole.role_name || primaryRole.name || 'Contact'}
            size="small"
            sx={{
              mb: 1.5,
              height: 22,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: 'rgba(139, 92, 246, 0.1)',
              color: '#8B5CF6',
            }}
          />
        )}

        {/* Contact Info */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          {contact.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.8rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {contact.email}
              </Typography>
            </Box>
          )}
          {contact.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {contact.phone}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ContactCard;
