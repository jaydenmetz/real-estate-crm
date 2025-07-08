import React from 'react';
import { NavLink } from 'react-router-dom';
import { AppBar, Toolbar, Button } from '@mui/material';

export default function Navigation() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Button component={NavLink} to="/" color="inherit">
          Dashboard
        </Button>
        <Button component={NavLink} to="/escrows" color="inherit">
          Escrows
        </Button>
        <Button component={NavLink} to="/listings" color="inherit">
          Listings
        </Button>
        <Button component={NavLink} to="/clients" color="inherit">
          Clients
        </Button>
        <Button component={NavLink} to="/appointments" color="inherit">
          Appointments
        </Button>
        <Button component={NavLink} to="/leads" color="inherit">
          Leads
        </Button>
        <Button component={NavLink} to="/ai-team" color="inherit">
          AI Team
        </Button>
      </Toolbar>
    </AppBar>
  );
}