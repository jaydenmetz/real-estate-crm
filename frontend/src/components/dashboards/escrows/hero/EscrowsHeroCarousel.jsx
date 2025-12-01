import React, { useState, useCallback } from 'react';
import { Box, IconButton } from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useSwipeable } from 'react-swipeable';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardHero } from '../../../../templates/Dashboard/components/DashboardHero';
import AIManagerModal from './AIManagerModal';
import AIManagerPage from './pages/AIManagerPage';

/**
 * EscrowsHeroCarousel - Wraps the entire hero section in a carousel
 *
 * Pages:
 * - Page 1: Standard hero with 4 stats + AI Manager widget + buttons
 * - Page 2: AI Manager focused view (future implementation)
 *
 * Features:
 * - Swipe support (mobile/touch)
 * - Arrow navigation (desktop, outside hero card)
 * - Carousel dots at bottom
 * - Each page is a complete hero section
 */
const EscrowsHeroCarousel = ({
  // All props that would normally go to DashboardHero
  config,
  stats,
  statsConfig,
  selectedStatus,
  onNewItem,
  dateRangeFilter,
  setDateRangeFilter,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  dateRange,
  detectPresetRange,
  selectedYear,
  setSelectedYear,
  StatCardComponent,
  allData,
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward (right to left), -1 = backward (left to right)
  const [modalOpen, setModalOpen] = useState(false);

  const totalPages = 2; // For now: Standard hero + AI Manager page

  // Navigation handlers
  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  const goToPage = useCallback((index) => {
    setDirection(index > currentPage ? 1 : -1);
    setCurrentPage(index);
  }, [currentPage]);

  // Animation variants - use custom prop for dynamic direction
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
  });

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Create modified config for AI Manager widget to be clickable
  const configWithClickableWidget = {
    ...config,
    // Override the widget to make it clickable and open modal
    aiAssistantWidget: () => {
      const OriginalWidget = config.aiAssistantWidget;
      if (!OriginalWidget) return null;

      return (
        <Box onClick={() => setModalOpen(true)} sx={{ cursor: 'pointer' }}>
          <OriginalWidget />
        </Box>
      );
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      {/* Navigation Arrows (outside hero card) */}
      {totalPages > 1 && (
        <>
          {/* Left Arrow */}
          <IconButton
            onClick={goToPrevious}
            disabled={currentPage === 0}
            sx={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 48,
              height: 48,
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              display: { xs: 'none', lg: 'flex' }, // Desktop only
              '&:hover': {
                background: 'rgba(0,0,0,0.4)',
              },
              '&.Mui-disabled': {
                opacity: 0.3,
                background: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          {/* Right Arrow */}
          <IconButton
            onClick={goToNext}
            disabled={currentPage === totalPages - 1}
            sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: 48,
              height: 48,
              background: 'rgba(0,0,0,0.2)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              display: { xs: 'none', lg: 'flex' }, // Desktop only
              '&:hover': {
                background: 'rgba(0,0,0,0.4)',
              },
              '&.Mui-disabled': {
                opacity: 0.3,
                background: 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}

      {/* Hero Pages */}
      <Box
        {...swipeHandlers}
        sx={{ position: 'relative', overflow: 'hidden' }}
      >
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          {currentPage === 0 && (
            <motion.div
              key="page-1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <DashboardHero
                config={configWithClickableWidget}
                stats={stats}
                statsConfig={statsConfig}
                selectedStatus={selectedStatus}
                onNewItem={onNewItem}
                dateRangeFilter={dateRangeFilter}
                setDateRangeFilter={setDateRangeFilter}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                dateRange={dateRange}
                detectPresetRange={detectPresetRange}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                StatCardComponent={StatCardComponent}
                allData={allData}
              />
            </motion.div>
          )}

          {currentPage === 1 && (
            <motion.div
              key="page-2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {/* Page 2: AI Manager focused view */}
              <AIManagerPage
                isVisible={currentPage === 1}
                onConfigureAI={() => setModalOpen(true)}
                onViewActivity={() => {
                  // TODO: Navigate to activity view or open activity modal
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Dots - centered at bottom of hero card */}
        {totalPages > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1.5,
              zIndex: 10,
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => goToPage(index)}
                sx={{
                  width: currentPage === index ? 32 : 8,
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
    </Box>
  );
};

export default EscrowsHeroCarousel;
