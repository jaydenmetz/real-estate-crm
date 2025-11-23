# Dropdown Navigation System - User Guide

**Last Updated:** 2025-01-23
**Feature:** Clickable Status Tab Dropdowns

---

## Overview

The dashboard navigation now features **intelligent dropdown menus** on status tabs. When you click a tab that's already selected, a dropdown appears showing all statuses within that category, allowing you to filter by specific statuses.

---

## How It Works

### Click Behavior

**Tab is NOT selected:**
- **Action:** Click tab
- **Result:** Switches to that category (shows all statuses in category)

**Tab IS ALREADY selected:**
- **Action:** Click tab again
- **Result:** Dropdown menu appears

### Dropdown Structure

```
[Category Display Name]     ← Header (e.g., "Active Listings")
─────────────────────────
● All [Category]            ← Show all statuses in category (has dot when selected)
─────────────────────────
○ Status 1                  ← Individual status filter
○ Status 2
○ Status 3
```

---

## Listings Dashboard Example

### Active Tab Dropdown
```
Active Listings
_______________
● All Active                 (currently showing all active listings)
_______________
  Active
  Active Under Contract
  Pending
```

**Actions:**
- Click "All Active" → Show all Active, ActiveUnderContract, and Pending listings
- Click "Active" → Show only Active listings
- Click "Active Under Contract" → Show only ActiveUnderContract listings
- Click "Pending" → Show only Pending listings

### Closed Tab Dropdown
```
Closed Listings
_______________
● All Closed
_______________
  Closed
```

**Actions:**
- Click "All Closed" → Show all Closed listings
- Click "Closed" → Show only Closed listings (same as All in this case)

### Cancelled Tab Dropdown
```
Cancelled Listings
_______________
● All Cancelled
_______________
  Cancelled
  Expired
  Withdrawn
```

**Actions:**
- Click "All Cancelled" → Show Cancelled, Expired, and Withdrawn listings
- Click "Cancelled" → Show only Cancelled listings
- Click "Expired" → Show only Expired listings
- Click "Withdrawn" → Show only Withdrawn listings

### All Listings Tab Dropdown
```
All Listings
_______________
● All All Listings
_______________
  Active
  Active Under Contract
  Pending
  Closed
  Cancelled
  Expired
  Withdrawn
```

**Actions:**
- Click "All All Listings" → Show every listing regardless of status
- Click any individual status → Filter to that specific status only

---

## Visual Indicators

### Colored Dot (●)
- **Visible** when that option is currently selected
- **Color** matches the status color from the configuration
- **Location:** Left side of the menu item

### Arrow Icon (⌄)
- **Appears** on selected tabs only
- **Rotates** 180° when dropdown is open
- **Animation:** Smooth transition

### Menu Highlighting
- **Selected item** has blue background tint
- **Bold text** for selected item
- **Hover effect** on all menu items

---

## Escrows Dashboard Example

### Active Tab Dropdown
```
Active Escrows
_______________
● All Active
_______________
  Active
```

### Closed Tab Dropdown
```
Closed Escrows
_______________
● All Closed
_______________
  Closed
```

### Cancelled Tab Dropdown
```
Cancelled Escrows
_______________
● All Cancelled
_______________
  Cancelled
```

---

## Use Cases

### Scenario 1: Viewing All Active Listings
1. Click **Active** tab (if not already selected)
2. You see all Active, ActiveUnderContract, and Pending listings
3. Click **Active** tab again to open dropdown
4. Select **All Active** (already selected by default)

### Scenario 2: Filtering to Only Pending Listings
1. Click **Active** tab (if not already selected)
2. Click **Active** tab again to open dropdown
3. Select **Pending**
4. Now viewing only Pending listings

### Scenario 3: Switching from Pending to Expired
1. Currently viewing Pending listings (Active tab)
2. Click **Cancelled** tab
3. Click **Cancelled** tab again to open dropdown
4. Select **Expired**
5. Now viewing only Expired listings

---

## Configuration

The dropdown system is powered by:

**Frontend Config:**
- `/frontend/src/config/statuses/statusDefinitions.js` - Status properties
- `/frontend/src/config/statuses/statusCategories.js` - Category groupings

**Component:**
- `/frontend/src/templates/Dashboard/components/StatusTabWithDropdown.jsx`

**Integration:**
- Automatically enabled when `tab.statuses` array exists
- Falls back to regular tabs for backward compatibility

---

## Adding Dropdowns to Other Dashboards

To enable dropdown navigation on **Escrows**, **Clients**, **Leads**, or **Appointments**:

1. Update status tabs file to use `getEntityTabs()`:

```javascript
// Example: /frontend/src/components/dashboards/escrows/navigation/tabs/EscrowStatusTabs.jsx
import { getEntityTabs } from '../../../../../config/statuses';

export const escrowStatusTabs = getEntityTabs('escrows');
```

2. Ensure entity config has `entity` property:

```javascript
// Example: /frontend/src/config/entities/escrows.config.js
export const escrowsConfig = {
  entity: 'escrows',  // ← Required for dropdown detection
  // ... rest of config
};
```

3. Done! Dropdowns will automatically appear on tabs.

---

## Customizing Statuses

When you need to add/remove/modify statuses:

### Add New Status
1. **Add to definitions:** `/frontend/src/config/statuses/statusDefinitions.js`
2. **Add to category:** `/frontend/src/config/statuses/statusCategories.js`
3. Dropdown automatically updates

### Add New Category
1. **Add category:** `/frontend/src/config/statuses/statusCategories.js`
2. Category becomes a new tab with dropdown

### Reorder Statuses
1. **Update sortOrder:** In statusDefinitions.js
2. Dropdown items reorder automatically

---

## Keyboard Navigation (Future)

Planned enhancements:
- `↓` / `↑` - Navigate dropdown items
- `Enter` - Select highlighted item
- `Esc` - Close dropdown
- `Tab` - Move to next tab

---

## Mobile Behavior

- Dropdowns adapt to mobile screens
- Touch-friendly hit targets
- Scrollable dropdown if needed
- Same click behavior as desktop

---

## Troubleshooting

### Dropdown Not Appearing
**Check:**
1. Is the tab already selected? (Dropdown only shows on selected tabs)
2. Does the tab config have `statuses` array?
3. Is `config.entity` set in entity config?

### Wrong Statuses in Dropdown
**Check:**
1. Category definition in `/frontend/src/config/statuses/statusCategories.js`
2. Ensure status IDs match exactly (case-sensitive)

### Dropdown Position Off-Screen
**Fix:** Dropdown auto-positions to stay on screen
**If broken:** Check MUI Menu `anchorOrigin` and `transformOrigin` props

---

## Related Documentation

- **Status Configuration:** `/docs/STATUS_CONFIGURATION.md`
- **Dashboard Template:** `/frontend/src/templates/Dashboard/`
- **Entity Configs:** `/frontend/src/config/entities/`

---

## Changelog

**2025-01-23:**
- Initial implementation for Listings dashboard
- Automatic detection of dropdown-enabled tabs
- Backward compatibility with old tab system
