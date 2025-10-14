import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Avatar,
  Typography,
  IconButton,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';

/**
 * Team structure definitions for each role type
 */
const TEAM_STRUCTURES = {
  buyer: {
    title: 'Buyers',
    sections: [
      {
        name: 'Buyers',
        slots: 6,
        prefix: 'Buyer',
        addLabel: 'Add Buyer',
      },
    ],
  },
  seller: {
    title: 'Sellers',
    sections: [
      {
        name: 'Sellers',
        slots: 6,
        prefix: 'Seller',
        addLabel: 'Add Seller',
      },
    ],
  },
  buyer_agent: {
    title: "Buyer's Agent Team",
    sections: [
      { name: "Buyer's Agent", slots: 1, prefix: "Buyer's Agent", required: true },
      { name: "Co-Buyer's Agent", slots: 2, prefix: "Co-Buyer's Agent", addLabel: "Add Co-Agent" },
      { name: "Buyer's Agent's Brokerage", slots: 1, prefix: 'Brokerage' },
      { name: 'Transaction Coordinator', slots: 1, prefix: 'TC' },
      { name: "Buyer's Agent's Assistant", slots: 2, prefix: 'Assistant', addLabel: 'Add Assistant' },
    ],
  },
  listing_agent: {
    title: "Listing Agent Team",
    sections: [
      { name: 'Listing Agent', slots: 1, prefix: 'Listing Agent', required: true },
      { name: 'Co-Listing Agent', slots: 2, prefix: 'Co-Listing Agent', addLabel: 'Add Co-Agent' },
      { name: "Listing Agent's Brokerage", slots: 1, prefix: 'Brokerage' },
      { name: 'Transaction Coordinator', slots: 1, prefix: 'TC' },
      { name: "Listing Agent's Assistant", slots: 2, prefix: 'Assistant', addLabel: 'Add Assistant' },
    ],
  },
  lender: {
    title: 'Lender Team',
    sections: [
      { name: 'Lender', slots: 1, prefix: 'Lender', required: true },
      { name: 'Loan Processor', slots: 2, prefix: 'Processor', addLabel: 'Add Processor' },
      { name: 'Branch Manager', slots: 1, prefix: 'Manager' },
      { name: "Lender's Assistant", slots: 2, prefix: 'Assistant', addLabel: 'Add Assistant' },
      { name: 'Sales Rep', slots: 1, prefix: 'Sales Rep' },
    ],
  },
  escrow_officer: {
    title: 'Escrow Team',
    sections: [
      { name: 'Escrow Officer', slots: 1, prefix: 'Officer', required: true },
      { name: 'Escrow Assistant', slots: 2, prefix: 'Assistant', addLabel: 'Add Assistant' },
      { name: 'Office Manager', slots: 1, prefix: 'Manager' },
      { name: 'Sales Rep', slots: 1, prefix: 'Sales Rep' },
    ],
  },
};

/**
 * TeamManagementModal - Comprehensive team management for all role types
 *
 * Supports:
 * - Buyers (6 slots)
 * - Sellers (6 slots)
 * - Buyer's Agent Team (Buyer's Agent, Co-Agents, Brokerage, TC, Assistants)
 * - Listing Agent Team (Listing Agent, Co-Agents, Brokerage, TC, Assistants)
 * - Lender Team (Lender, Processors, Manager, Assistants, Sales Rep)
 * - Escrow Team (Officer, Assistants, Manager, Sales Rep)
 *
 * @param {boolean} open - Dialog open state
 * @param {Function} onClose - Close handler
 * @param {string} roleType - Role type (buyer, seller, buyer_agent, etc.)
 * @param {Object} teamData - Current team data { buyers: [], buyerAgent: {}, etc. }
 * @param {Object} color - Color scheme { primary, secondary }
 * @param {Function} onPersonClick - Handler for clicking a person to edit
 * @param {Function} onAddPerson - Handler for adding a new person
 * @param {Function} onRemovePerson - Handler for removing a person
 * @param {Function} getInitials - Helper to get initials
 * @param {Function} truncateName - Helper to truncate names
 */
const TeamManagementModal = ({
  open,
  onClose,
  roleType,
  teamData,
  color,
  onPersonClick,
  onAddPerson,
  onRemovePerson,
  getInitials,
  truncateName,
}) => {
  const theme = useTheme();
  const structure = TEAM_STRUCTURES[roleType];

  if (!structure) return null;

  // Render filled slot
  const renderPersonSlot = (person, section, slotIndex, personIndex) => (
    <Box
      key={`slot-${section.name}-${slotIndex}`}
      onClick={() => onPersonClick && onPersonClick(person, section, personIndex)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        p: 2,
        borderRadius: 2,
        border: `2px solid ${alpha(color.primary, 0.2)}`,
        background: alpha(color.primary, 0.02),
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.08),
          borderColor: alpha(color.primary, 0.4),
        },
      }}
    >
      <Avatar
        sx={{
          width: 48,
          height: 48,
          background: `linear-gradient(135deg, ${color.primary} 0%, ${color.secondary} 100%)`,
          fontWeight: 700,
          fontSize: '1.2rem',
        }}
      >
        {getInitials(person.name)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            fontSize: 10,
            fontWeight: 600,
            color: color.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            display: 'block',
          }}
        >
          {section.slots > 1 ? `${section.prefix} ${slotIndex + 1}` : section.name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: theme.palette.text.primary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={person.name}
        >
          {person.name}
        </Typography>
        {person.company && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 11,
              color: theme.palette.text.secondary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block',
            }}
          >
            {person.company}
          </Typography>
        )}
      </Box>
      {!section.required && onRemovePerson && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onRemovePerson(section, personIndex);
          }}
          sx={{ width: 32, height: 32, color: 'error.main' }}
        >
          <Remove sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );

  // Render empty slot
  const renderEmptySlot = (section, slotIndex) => (
    <Box
      key={`empty-slot-${section.name}-${slotIndex}`}
      onClick={() => onAddPerson(section)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        cursor: 'pointer',
        p: 2,
        borderRadius: 2,
        border: `2px dashed ${alpha(color.primary, 0.3)}`,
        background: alpha(color.primary, 0.02),
        transition: 'all 0.2s',
        '&:hover': {
          background: alpha(color.primary, 0.05),
          borderColor: alpha(color.primary, 0.5),
        },
      }}
    >
      <IconButton
        size="small"
        sx={{
          width: 36,
          height: 36,
          backgroundColor: alpha(color.primary, 0.1),
          color: color.primary,
          '&:hover': {
            backgroundColor: alpha(color.primary, 0.2),
          },
        }}
      >
        <Add sx={{ fontSize: 20 }} />
      </IconButton>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          color: alpha(color.primary, 0.7),
        }}
      >
        {section.addLabel || `Add ${section.prefix}`}
        {section.slots > 1 && ` ${slotIndex + 1}`}
      </Typography>
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: `2px solid ${alpha(color.primary, 0.1)}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: color.primary }}>
          {structure.title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {structure.sections.map((section, sectionIdx) => {
          // Get people for this section from teamData
          const sectionPeople = teamData[section.name] || [];
          const slots = [];

          // Create slots for this section
          for (let i = 0; i < section.slots; i++) {
            if (i < sectionPeople.length) {
              slots.push(renderPersonSlot(sectionPeople[i], section, i, i));
            } else {
              slots.push(renderEmptySlot(section, i));
            }
          }

          return (
            <Box key={section.name} sx={{ mb: sectionIdx < structure.sections.length - 1 ? 3 : 0 }}>
              {/* Section Header */}
              {structure.sections.length > 1 && (
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: theme.palette.text.secondary,
                      letterSpacing: '1px',
                    }}
                  >
                    {section.name}
                    {section.required && (
                      <Typography
                        component="span"
                        sx={{ ml: 1, fontSize: 10, color: 'error.main' }}
                      >
                        (Required)
                      </Typography>
                    )}
                  </Typography>
                  {sectionIdx > 0 && <Divider sx={{ mt: 1 }} />}
                </Box>
              )}

              {/* Slots */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {slots}
              </Box>
            </Box>
          );
        })}
      </DialogContent>
    </Dialog>
  );
};

export default TeamManagementModal;
