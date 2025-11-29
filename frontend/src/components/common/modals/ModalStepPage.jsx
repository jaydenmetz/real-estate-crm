import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, ArrowForward, CheckCircle, Close } from '@mui/icons-material';

/**
 * ModalStepPage - Reusable page wrapper for step-based modal flows
 *
 * Provides consistent navigation UI across all steps:
 * - Title (top-left)
 * - Close button (top-right, hover-to-show)
 * - Back arrow (bottom-left, hidden on first step)
 * - Forward/Submit arrow (bottom-right)
 * - Progress dots (bottom-center, 30px from bottom)
 *
 * @param {ReactNode} children - Step content (any setter component)
 * @param {string} title - Modal title (e.g., "Create New Escrow")
 * @param {string} color - Theme color for gradient background
 * @param {number} currentStep - Current step index (0-based)
 * @param {number} totalSteps - Total number of steps
 * @param {function} onNext - Next/Submit handler
 * @param {function} onBack - Back handler
 * @param {function} onClose - Close handler
 * @param {function} onStepClick - Jump to step handler (index) => void
 * @param {boolean} saving - Disable buttons during save
 * @param {boolean} isLastStep - Show checkmark instead of arrow
 */
export const ModalStepPage = ({
  children,
  title = '',
  color = '#3b82f6', // Default to blue hero color
  currentStep = 0,
  totalSteps = 1,
  onNext,
  onBack,
  onClose,
  onStepClick,
  saving = false,
  isLastStep = false,
}) => {
  const isFirstStep = currentStep === 0;

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.95)} 0%, ${alpha(color, 0.85)} 100%)`,
        backdropFilter: 'blur(20px)',
        border: `2px solid ${alpha(color, 0.3)}`,
        boxShadow: `0 20px 60px ${alpha(color, 0.4)}`,
        pt: 3, // Top padding for title
        px: 3,
        pb: 12.5, // 100px bottom padding to match top spacing
        width: 700, // Fixed width
        minHeight: 500, // Default minimum height (auto-expands for larger components)
        maxHeight: '90vh', // Maximum height constrained to viewport
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Title - Top-left */}
      {title && (
        <Typography
          variant="h5"
          sx={{
            color: 'white',
            fontWeight: 700,
            mb: 12.5, // 100px buffer between modal title and component label
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </Typography>
      )}

      {/* Close Button Hover Area - Top-right corner */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          zIndex: 1500,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          pt: '5px',
          pr: '5px',
          '&:hover .close-button': {
            opacity: 1,
          },
        }}
      >
        <IconButton
          className="close-button"
          onClick={onClose}
          disabled={saving}
          sx={{
            width: 30,
            height: 30,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            opacity: 0,
            transition: 'opacity 0.2s ease',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.6)',
            },
            '&:disabled': {
              opacity: 0.3,
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Step Content - Centered with flex spacers */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center', // Vertical center
        overflowY: 'auto',
        pr: 1,
        minHeight: 0,
      }}>
        {children}
      </Box>

      {/* Navigation Container - Fixed at 30px from bottom */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 30,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          zIndex: 10,
        }}
      >
        {/* Back Arrow - Bottom-left (only show if not first step) */}
        {!isFirstStep && onBack ? (
          <IconButton
            onClick={onBack}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.3)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <Box sx={{ width: 48, height: 48 }} /> // Spacer for alignment
        )}

        {/* Progress Dots - Centered */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: currentStep === index ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: currentStep === index
                  ? 'rgba(255,255,255,0.9)'
                  : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: onStepClick ? 'pointer' : 'default',
              }}
              onClick={() => onStepClick && onStepClick(index)}
            />
          ))}
        </Box>

        {/* Forward/Submit Arrow - Bottom-right */}
        {onNext && (
          <IconButton
            onClick={onNext}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'white',
              color: color,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(0,0,0,0.2)',
              },
            }}
          >
            {isLastStep ? <CheckCircle /> : <ArrowForward />}
          </IconButton>
        )}
      </Box>
    </Box>
  );
};

export default ModalStepPage;
