import React, { useCallback, useMemo, useRef } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Box, useTheme } from '@mui/material';
import EscrowCard from './widgets/EscrowCard';

/**
 * Virtualized list for escrow cards
 * Only renders visible items for performance
 * Handles 1000+ escrows smoothly
 */
const VirtualizedEscrowList = ({
  escrows,
  viewMode = 'small',
  animationType,
  animationDuration,
  animationIntensity,
  onArchive,
  containerWidth,
  containerHeight = 800,
}) => {
  const theme = useTheme();
  const listRef = useRef();

  // Calculate item height based on viewMode
  const getItemHeight = useCallback(() => {
    switch (viewMode) {
      case 'small':
        return 160; // Compact card height
      case 'medium':
        return 240; // Medium card height
      case 'large':
        return 400; // Large card with all panels
      default:
        return 160;
    }
  }, [viewMode]);

  const itemHeight = getItemHeight();

  // Memoized row renderer
  const Row = useCallback(({ index, style }) => {
    const escrow = escrows[index];

    if (!escrow) return null;

    return (
      <div style={style}>
        <Box sx={{ px: 2, py: 1 }}>
          <EscrowCard
            escrow={escrow}
            viewMode={viewMode}
            animationType={animationType}
            animationDuration={animationDuration}
            animationIntensity={animationIntensity}
            index={index}
            onArchive={onArchive}
          />
        </Box>
      </div>
    );
  }, [escrows, viewMode, animationType, animationDuration, animationIntensity, onArchive]);

  // Reset scroll position when escrows change
  React.useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo(0);
    }
  }, [escrows.length]);

  return (
    <List
      ref={listRef}
      height={containerHeight}
      itemCount={escrows.length}
      itemSize={itemHeight}
      width="100%"
      overscanCount={3} // Render 3 extra items above/below viewport for smooth scrolling
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
      }}
    >
      {Row}
    </List>
  );
};

export default React.memo(VirtualizedEscrowList);
