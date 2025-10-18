/**
 * PHASE 8: Escrow Detail Page - Compact Redesign
 *
 * This is the main entry point for the escrow detail page.
 * It now uses the new compact redesign with:
 * - F-pattern layout (Left Sidebar | Hero + Widgets | Right Sidebar)
 * - 4 main widgets (Timeline, Financials, People, Documents)
 * - 4 detail modals (full editing functionality)
 * - Draggable activity feed (Apple Maps-style bottom sheet)
 * - WebSocket real-time updates
 *
 * Old layout archived - all functionality migrated to EscrowDetailCompact
 */

import EscrowDetailCompact from './EscrowDetailCompact';

export default EscrowDetailCompact;