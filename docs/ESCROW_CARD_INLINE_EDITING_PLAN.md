# Escrow Card Inline Editing & Contact Selection

**Created:** 2025-10-13
**Purpose:** Implementation plan for inline editing and contact selection in escrow cards
**Status:** In Progress

---

## Overview

Add inline editing for all key escrow fields and contact selection from database for all people roles. Users can click to edit any field directly on the escrow card without navigating to a detail page.

---

## Phase 1: Fix Archive Functionality ✅

### Issue
Archive button (X) on escrow cards not working reliably.

### Investigation
- ✅ API endpoint exists: `PUT /v1/escrows/:id/archive`
- ✅ Frontend calls `escrowsAPI.archive(id)`
- ✅ Dashboard handler `handleArchive` exists
- ⏳ Need to test actual API response

### Solution
1. Add better error handling to `handleArchive`
2. Log full API response to debug
3. Check backend controller for issues
4. Verify deleted_at timestamp is being set

---

## Phase 2: Inline Editing Foundation ✅

### Completed
- ✅ Added editing states to EscrowCard
- ✅ Created memoized editing handlers
- ✅ Added onUpdate prop

### Code Structure
```javascript
// States
const [editingField, setEditingField] = useState(null); // 'address', 'price', etc.
const [editValue, setEditValue] = useState('');
const [saving, setSaving] = useState(false);

// Handlers
handleStartEdit(field, currentValue, e)  // Opens edit mode
handleCancelEdit(e)                       // Cancels edit
handleSaveEdit(field, e)                  // Saves to API
```

---

## Phase 3: Editable Field Components

### Create EditableTextField Component

**File:** `frontend/src/components/common/EditableTextField.jsx`

```javascript
import { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import { Check, Close, Edit } from '@mui/icons-material';

export const EditableTextField = ({
  value,
  onSave,
  type = 'text',
  label,
  format,
  ...props
}) => {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(tempValue);
      setEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempValue(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          type={type}
          size="small"
          autoFocus
          disabled={saving}
          onClick={(e) => e.stopPropagation()}
          {...props}
        />
        <IconButton
          size="small"
          onClick={handleSave}
          disabled={saving}
          sx={{ color: 'success.main' }}
        >
          {saving ? <CircularProgress size={16} /> : <Check />}
        </IconButton>
        <IconButton
          size="small"
          onClick={handleCancel}
          disabled={saving}
          sx={{ color: 'error.main' }}
        >
          <Close />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        cursor: 'pointer',
        '&:hover .edit-icon': { opacity: 1 },
      }}
    >
      <Box>{format ? format(value) : value}</Box>
      <Edit
        className="edit-icon"
        sx={{ fontSize: 14, opacity: 0, transition: 'opacity 0.2s' }}
      />
    </Box>
  );
};
```

### Create EditableDateField Component

**File:** `frontend/src/components/common/EditableDateField.jsx`

```javascript
import { EditableTextField } from './EditableTextField';
import { format } from 'date-fns';

export const EditableDateField = ({ value, onSave, label }) => {
  return (
    <EditableTextField
      value={value ? format(new Date(value), 'yyyy-MM-dd') : ''}
      onSave={onSave}
      type="date"
      label={label}
      format={(val) => val ? format(new Date(val), 'MMM dd, yyyy') : 'Not set'}
    />
  );
};
```

### Create EditableNumberField Component

```javascript
export const EditableNumberField = ({ value, onSave, label, prefix = '$', format }) => {
  return (
    <EditableTextField
      value={value}
      onSave={onSave}
      type="number"
      label={label}
      format={(val) => prefix + Number(val).toLocaleString()}
    />
  );
};
```

---

## Phase 4: Add Inline Editing to Escrow Card

### Fields to Make Editable

#### In Small View Panel (Left side)
1. **Property Address**
   - Field: `property_address`
   - Type: text
   - Component: EditableTextField

2. **Purchase Price**
   - Field: `purchase_price`
   - Type: number
   - Component: EditableNumberField
   - Prefix: '$'

3. **Commission**
   - Field: `my_commission`
   - Type: number
   - Component: EditableNumberField
   - Prefix: '$'
   - Toggle visibility (keep existing)

#### Below Card (Date badges)
4. **Acceptance Date**
   - Field: `acceptance_date`
   - Type: date
   - Component: EditableDateField

5. **Closing Date (COE)**
   - Field: `closing_date`
   - Type: date
   - Component: EditableDateField

### Implementation in EscrowCard.jsx

**Address Field:**
```javascript
// Before:
<Typography variant="h6">
  {address}
</Typography>

// After:
<EditableTextField
  value={escrow.property_address}
  onSave={(newValue) => onUpdate(escrow.id, { property_address: newValue })}
  label="Property Address"
  sx={{ fontWeight: 700, fontSize: '1.1rem' }}
/>
```

**Price Field:**
```javascript
<EditableNumberField
  value={purchasePrice}
  onSave={(newValue) => onUpdate(escrow.id, { purchase_price: newValue })}
  label="Price"
  prefix="$"
/>
```

**Commission Field:**
```javascript
<EditableNumberField
  value={commission}
  onSave={(newValue) => onUpdate(escrow.id, { my_commission: newValue })}
  label="Commission"
  prefix="$"
  sx={{ display: showCommission ? 'flex' : 'none' }}
/>
```

**Closing Date:**
```javascript
<EditableDateField
  value={closingDate}
  onSave={(newValue) => onUpdate(escrow.id, { closing_date: newValue })}
  label="Close of Escrow"
/>
```

---

## Phase 5: Contact Selection Modal

### Create ContactSelectionModal Component

**File:** `frontend/src/components/modals/ContactSelectionModal.jsx`

```javascript
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Box,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { contactsAPI } from '../../services/api.service';

export const ContactSelectionModal = ({
  open,
  onClose,
  onSelect,
  roleType,
  currentContactId,
}) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      fetchContacts();
    }
  }, [open, roleType]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      // Filter by role if provided
      const params = roleType ? { role: roleType } : {};
      const response = await contactsAPI.getAll(params);
      setContacts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const query = searchQuery.toLowerCase();
    return (
      contact.full_name?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company_name?.toLowerCase().includes(query)
    );
  });

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Select {roleType ? roleType.replace('_', ' ') : 'Contact'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {filteredContacts.map((contact) => (
              <ListItemButton
                key={contact.id}
                onClick={() => {
                  onSelect(contact);
                  onClose();
                }}
                selected={contact.id === currentContactId}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    }}
                  >
                    {getInitials(contact.full_name)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {contact.full_name || 'Unnamed Contact'}
                      </Typography>
                      {contact.roles && contact.roles.length > 0 && (
                        <Chip
                          label={contact.roles[0].type}
                          size="small"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      {contact.company_name && (
                        <Typography variant="caption" display="block">
                          {contact.company_name}
                        </Typography>
                      )}
                      {contact.email && (
                        <Typography variant="caption" display="block">
                          {contact.email}
                        </Typography>
                      )}
                      {contact.phone && (
                        <Typography variant="caption" display="block">
                          {contact.phone}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItemButton>
            ))}
            {filteredContacts.length === 0 && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No contacts found
                </Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
};
```

### Add to EscrowCard

```javascript
import { ContactSelectionModal } from '../modals/ContactSelectionModal';

// Inside component:
const [contactModalOpen, setContactModalOpen] = useState(false);
const [selectedRole, setSelectedRole] = useState(null);

const handlePersonClick = (role, e) => {
  e.stopPropagation();
  setSelectedRole(role);
  setContactModalOpen(true);
};

const handleContactSelect = async (contact) => {
  try {
    const peopleUpdate = {
      [`${selectedRole}_name`]: contact.full_name,
      [`${selectedRole}_email`]: contact.email,
      [`${selectedRole}_company`]: contact.company_name,
    };
    await onUpdate(escrow.id, peopleUpdate);
  } catch (error) {
    console.error('Failed to update person:', error);
  }
};

// In render:
<ContactSelectionModal
  open={contactModalOpen}
  onClose={() => setContactModalOpen(false)}
  onSelect={handleContactSelect}
  roleType={selectedRole}
/>

// Update each person box:
<Box
  onClick={(e) => handlePersonClick('buyer', e)}
  sx={{ cursor: 'pointer' }}
>
  {/* Buyer content */}
</Box>
```

---

## Phase 6: Backend Updates

### Extract Lender and Escrow Officer from JSONB

**File:** `backend/src/controllers/escrows.controller.js`

Update the listQuery to extract lender and escrow officer:

```sql
SELECT
  e.*,
  -- ... existing fields ...
  people->'lender'->>'name' as lender_name,
  people->'lender'->>'company' as lender_company,
  people->'lender'->>'email' as lender_email,
  people->'lender'->>'phone' as lender_phone,
  people->'escrow_officer'->>'name' as escrow_officer_name,
  people->'escrow_officer'->>'company' as escrow_company,
  people->'escrow_officer'->>'email' as escrow_officer_email,
  people->'escrow_officer'->>'phone' as escrow_officer_phone
FROM escrows e
```

### Update Escrow People Endpoint

Already exists: `PUT /v1/escrows/:id/people`

Ensure it:
1. Updates the JSONB `people` field
2. Auto-adds role to contact in contacts table
3. Returns updated escrow with extracted fields

---

## Phase 7: Wire Up EscrowsDashboard

### Add onUpdate Handler

**File:** `frontend/src/components/dashboards/EscrowsDashboard.jsx`

```javascript
const handleUpdateEscrow = async (escrowId, updateData) => {
  try {
    const response = await escrowsAPI.update(escrowId, updateData);
    if (response.success) {
      // Update local state
      setEscrows((prev) =>
        prev.map((e) =>
          e.id === escrowId ? { ...e, ...response.data } : e
        )
      );
    }
  } catch (error) {
    console.error('Failed to update escrow:', error);
  }
};
```

### Pass to EscrowCard

```javascript
<EscrowCard
  key={escrow.id}
  escrow={escrow}
  viewMode={viewMode}
  onArchive={handleArchive}
  onUpdate={handleUpdateEscrow}  // NEW
/>
```

---

## Phase 8: Testing & Validation

### Test Archive Functionality
1. Click X on escrow card
2. Verify API call succeeds
3. Confirm escrow moves to archived tab
4. Check deleted_at timestamp set

### Test Inline Editing
1. Click on address field
2. Edit value
3. Click check mark
4. Verify API update
5. Confirm value updates in card
6. Test cancel (X button)

### Test Contact Selection
1. Click on buyer name
2. Modal opens with contacts list
3. Search for contact
4. Select contact
5. Verify name/company updates
6. Check role added to contact

### Test Date Editing
1. Click on closing date
2. Date picker opens
3. Select new date
4. Verify update
5. Check days to close recalculates

---

## Summary

### Completed ✅
- Phase 1: Investigated archive issue
- Phase 2: Added editing foundation to EscrowCard

### In Progress ⏳
- Phase 3: Creating editable field components
- Phase 4: Adding inline editing UI

### Pending 📋
- Phase 5: Contact selection modal
- Phase 6: Backend JSONB extraction
- Phase 7: Wire up dashboard
- Phase 8: Testing

### Estimated Time
- Phase 3-4: 2-3 hours
- Phase 5: 2-3 hours
- Phase 6: 1 hour
- Phase 7: 30 minutes
- Phase 8: 1 hour
- **Total: 6-8 hours**

---

## Next Steps

1. Create EditableTextField component
2. Create EditableDateField component
3. Create EditableNumberField component
4. Update EscrowCard to use editable components
5. Create ContactSelectionModal
6. Update backend to extract lender/escrow officer
7. Wire up EscrowsDashboard
8. Test all functionality
