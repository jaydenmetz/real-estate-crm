// Lazy-loaded route components for code splitting
import { lazy } from 'react';

// Dashboard Components
export const AIAgentsDashboardSimple = lazy(() => import('./components/dashboards/AIAgentsDashboardSimple'));
export const EscrowsDashboard = lazy(() => import('./components/dashboards/EscrowsDashboard'));
export const ListingsDashboard = lazy(() => import('./components/dashboards/ListingsDashboard'));
export const ClientsDashboard = lazy(() => import('./components/dashboards/ClientsDashboard'));
export const AppointmentsDashboard = lazy(() => import('./components/dashboards/AppointmentsDashboard'));
export const LeadsDashboard = lazy(() => import('./components/dashboards/LeadsDashboard'));

// Detail Components
export const EscrowDetail = lazy(() => import('./components/details/EscrowDetail'));
export const ListingDetail = lazy(() => import('./components/details/ListingDetail'));
export const ClientDetail = lazy(() => import('./components/details/ClientDetail'));
export const AppointmentDetail = lazy(() => import('./components/details/AppointmentDetail'));
export const LeadDetail = lazy(() => import('./components/details/LeadDetail'));

// System Components
export const ActivityLog = lazy(() => import('./components/system/ActivityLog'));
export const AllNotes = lazy(() => import('./components/system/AllNotes'));