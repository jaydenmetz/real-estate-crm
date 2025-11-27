import React, { useState, useCallback } from 'react';
import { Box, IconButton, Card, CardContent } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import AIManagerTeaser from './pages/HomePage/AIManagerTeaser';
import AIManagerModal from './AIManagerModal';

/**
 * AIAssistantCarousel - Replaces the static 300x300 AI Assistant slot with carousel
 *
 * This component is designed to fit EXACTLY where the current AI Assistant card is
 * in DashboardHero (lines 589-718). It maintains the exact same dimensions and
 * responsive behavior.
 *
 * Pages:
 * - Page 1: AI Manager Teaser (clickable for modal)
 * - Page 2: (Future) Additional upsell content
 *
 * Features:
 * - Swipe support (mobile/touch)
 * - Arrow navigation overlays (desktop)
 * - Carousel dots at bottom
 * - Matches existing 300x300 dimensions
 * - Fullscreen modal on click
 */
const AIAssistantCarousel = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = 2; // For now: Teaser page + future page

  // Navigation handlers
  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = useCallback((index) => {
    setCurrentPage(index);
  }, []);

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false, // Disable mouse swipe on desktop
  });

  // Handle teaser click
  const handleTeaserClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Box
        {...swipeHandlers}
        sx={{
          position: 'relative',
          width: '300px',
          height: '300px',
          minWidth: '300px',
          minHeight: '300px',
          maxWidth: '300px',
          maxHeight: '300px',
        }}
      >
        {/* Navigation Arrows (hover overlay, desktop only) */}
        {totalPages > 1 && (
          <>
            {/* Left Arrow */}
            <IconButton
              onClick={goToPrevious}
              disabled={currentPage === 0}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                width: 36,
                height: 36,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                opacity: 0,
                transition: 'opacity 0.3s',
                display: { xs: 'none', md: 'flex' }, // Desktop only
                '.MuiBox-root:hover &': {
                  opacity: currentPage === 0 ? 0.3 : 1,
                },
                '&:hover': {
                  background: 'rgba(0,0,0,0.6)',
                },
                '&.Mui-disabled': {
                  cursor: 'not-allowed',
                },
              }}
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>

            {/* Right Arrow */}
            <IconButton
              onClick={goToNext}
              disabled={currentPage === totalPages - 1}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 3,
                width: 36,
                height: 36,
                background: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                opacity: 0,
                transition: 'opacity 0.3s',
                display: { xs: 'none', md: 'flex' }, // Desktop only
                '.MuiBox-root:hover &': {
                  opacity: currentPage === totalPages - 1 ? 0.3 : 1,
                },
                '&:hover': {
                  background: 'rgba(0,0,0,0.6)',
                },
                '&.Mui-disabled': {
                  cursor: 'not-allowed',
                },
              }}
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </>
        )}

        {/* Carousel Content */}
        <AnimatePresence mode="wait">
          {currentPage === 0 && (
            <motion.div
              key="page-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              <AIManagerTeaser onClick={handleTeaserClick} />
            </motion.div>
          )}

          {currentPage === 1 && (
            <motion.div
              key="page-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Page 2: Future content (for now, duplicate teaser) */}
              <Card
                onClick={handleTeaserClick}
                sx={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontSize: '3rem', mb: 2 }}>📊</Box>
                  <Box sx={{ color: '#fff', fontWeight: 600 }}>
                    Coming Soon
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Dots */}
        {totalPages > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
              zIndex: 3,
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => goToPage(index)}
                sx={{
                  width: currentPage === index ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: currentPage === index
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: currentPage === index
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.6)',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* AI Manager Modal */}
      <AIManagerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
};

export default AIAssistantCarousel;
