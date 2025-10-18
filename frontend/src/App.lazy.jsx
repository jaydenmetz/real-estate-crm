// Lazy-loaded route components for code splitting
import { lazy } from 'react';

// Dashboard Components
export const EscrowsDashboard = lazy(() => import('./components/dashboards/escrows'));
export const ListingsDashboard = lazy(() => import('./components/dashboards/listings'));
export const ClientsDashboard = lazy(() => import('./components/dashboards/clients'));
export const AppointmentsDashboard = lazy(() => import('./components/dashboards/appointments'));
export const LeadsDashboard = lazy(() => import('./components/dashboards/leads'));

// Detail Components
export const EscrowDetail = lazy(() => import('./components/details/EscrowDetail'));
export const ListingDetail = lazy(() => import('./components/details/ListingDetail'));
export const ClientDetail = lazy(() => import('./components/details/ClientDetail'));
export const AppointmentDetail = lazy(() => import('./components/details/AppointmentDetail'));
export const LeadDetail = lazy(() => import('./components/details/LeadDetail'));

// System Components
export const ActivityLog = lazy(() => import('./components/system/ActivityLog'));
export const AllNotes = lazy(() => import('./components/system/AllNotes'));