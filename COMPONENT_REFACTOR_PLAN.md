# Component Architecture Refactor Plan

## Current Problem
Components are mixing concerns - they have both:
- Pure input logic
- Action buttons (X/checkmark)
- Modal wrappers
- Inline mode flags

## New Architecture

### 1. Setters (Pure Components)
**Location:** `frontend/src/components/common/setters/`

Pure input components with NO action buttons, NO modals. Just the input logic.

```jsx
// DateSetter.jsx
export const DateSetter = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  showCurrentValue = true
}) => (
  <>
    {/* Label */}
    <Typography>{ label}</Typography>

    {/* Current Value Display (optional) */}
    {showCurrentValue && <Typography>{formatDate(value)}</Typography>}

    {/* Manual Input */}
    <TextField type="date" value={value} onChange={onChange} />

    {/* Calendar */}
    <CustomCalendar selectedDate={value} onSelectDate={onChange} />
  </>
);
```

**Other Setters:**
- `CurrencySetter.jsx`
- `AddressSetter.jsx`
- `PhoneSetter.jsx`
- `EmailSetter.jsx`
- `CommissionSetter.jsx`

### 2. Editors (Setters + X/Checkmark)
**Location:** `frontend/src/components/common/editors/`

Wrappers that add X/checkmark buttons around setters for standalone editing.

```jsx
// DateEditor.jsx
export const DateEditor = ({ open, onClose, onSave, label, value, ...props }) => {
  const [editValue, setEditValue] = useState(value);

  const handleSave = async () => {
    await onSave(editValue);
    onClose();
  };

  return (
    <Editor open={open} onClose={onClose} onSave={handleSave} color={props.color}>
      <DateSetter
        label={label}
        value={editValue}
        onChange={setEditValue}
        {...props}
      />
    </Editor>
  );
};
```

**Generic Editor Wrapper:**
```jsx
// Editor.jsx - Generic wrapper component
export const Editor = ({ open, onClose, onSave, children, color }) => (
  <ModalDialog open={open} onClose={onClose} color={color}>
    <Box>
      {children}

      {/* Action Buttons */}
      <Box>
        <IconButton onClick={onClose}><Close /></IconButton>
        <IconButton onClick={onSave}><Check /></IconButton>
      </Box>
    </Box>
  </ModalDialog>
);
```

### 3. Modal Flows (Setters + Arrow Navigation)
**Usage:** NewEscrowModal, multi-step wizards

Setters are wrapped in ModalStepPage (arrow navigation, NO X/checkmark).

```jsx
// NewEscrowModal.jsx
<ModalStepPage
  onNext={handleNext}
  onBack={handleBack}
  currentStep={step}
>
  <DateSetter
    label="Acceptance Date"
    value={formData.acceptanceDate}
    onChange={(date) => setFormData({ ...formData, acceptanceDate: date })}
    showCurrentValue={false} // Don't show "current value" in creation flow
  />
</ModalStepPage>
```

## Component Hierarchy

### Standalone Edit (from dashboard)
```
DateEditor (X/checkmark modal)
  └── Editor (generic wrapper with X/checkmark)
      └── DateSetter (pure input)
```

### Modal Flow (NewEscrowModal)
```
NewEscrowModal
  └── ModalStepPage (arrow navigation)
      └── DateSetter (pure input)
```

## Migration Steps

1. **Create Setters**
   - Extract pure input logic from current `SetDate`, `SetCurrency`, etc.
   - Remove all button logic, modal wrappers, inline flags
   - Move to `frontend/src/components/common/setters/`

2. **Create Generic Editor**
   - Create `Editor.jsx` wrapper component
   - Handles X/checkmark buttons, modal dialog, save logic

3. **Create Specific Editors**
   - `DateEditor.jsx` - wraps `DateSetter` in `Editor`
   - `CurrencyEditor.jsx` - wraps `CurrencySetter` in `Editor`
   - etc.

4. **Update Dashboard Components**
   - Replace `<SetDate inline={false} />` with `<DateEditor />`
   - Replace `<SetCurrency inline={false} />` with `<CurrencyEditor />`

5. **Update Modal Flows**
   - Replace `<SetDate inline={true} />` with `<DateSetter showCurrentValue={false} />`
   - Remove all `inline` prop usage

6. **Rename `shared` to `inputs`**
   - `editors/shared/` → `inputs/`
   - Update all imports
   - These are primitive input components (CurrencyInput, PhoneInput, etc.)

7. **Remove Old Files**
   - Delete `editors/fields/SetDate.jsx` (replaced by setters/DateSetter.jsx + editors/DateEditor.jsx)
   - Delete `editors/fields/SetCurrency.jsx`
   - etc.

## Final Directory Structure

```
frontend/src/components/common/
├── setters/                    # Pure input components (NO buttons)
│   ├── DateSetter.jsx
│   ├── CurrencySetter.jsx
│   ├── AddressSetter.jsx
│   ├── PhoneSetter.jsx
│   ├── EmailSetter.jsx
│   └── CommissionSetter.jsx
├── editors/                    # Setters + X/checkmark buttons
│   ├── Editor.jsx             # Generic wrapper
│   ├── DateEditor.jsx
│   ├── CurrencyEditor.jsx
│   ├── AddressEditor.jsx
│   └── specialized/
│       └── (escrow-specific editors)
├── inputs/                     # Primitive inputs (renamed from "shared")
│   ├── CurrencyInput.jsx
│   ├── PercentageInput.jsx
│   ├── PhoneInput.jsx
│   ├── CustomCalendar.jsx
│   └── ModalDialog.jsx
└── ModalStepPage.jsx          # Arrow navigation wrapper
```

## Benefits

1. **Separation of Concerns**: Input logic ≠ Button logic ≠ Navigation logic
2. **Reusability**: Setters work in ANY context (modal, inline, wizard)
3. **Clarity**: No more `inline={true/false}` flags
4. **Consistency**: All editors use same wrapper, all flows use same modal page
5. **Maintainability**: Change button style in ONE place (Editor.jsx)
