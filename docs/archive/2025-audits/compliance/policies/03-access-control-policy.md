# Access Control Policy

**Document ID:** POL-003
**Effective Date:** January 1, 2026
**Policy Owner:** [Your Name], CEO/CTO

---

## 1. Purpose
Define how access to systems, applications, and data is granted, modified, and revoked.

## 2. Access Principles
- **Least Privilege:** Users receive minimum access needed for job function
- **Separation of Duties:** No single person has end-to-end control of critical processes
- **Need-to-Know:** Access granted based on business need only

## 3. User Access Management

### 3.1 Onboarding
- Access provisioning within 24 hours of start date
- Role-based access templates for standard positions
- Manager approval required for all access requests
- MFA enabled for all accounts

### 3.2 Access Modification
- Role changes require manager approval
- Additional access requires business justification
- Documented in ticketing system

### 3.3 Offboarding
- Access revocation within 4 hours of termination notice
- All accounts disabled
- Company devices returned
- Data access audit performed

## 4. Authentication Requirements

### 4.1 Passwords
- Minimum 12 characters
- Complexity: uppercase, lowercase, number, special character
- No password reuse (last 24 passwords)
- Changed every 90 days for privileged accounts

### 4.2 Multi-Factor Authentication (MFA)
Required for:
- Production system access
- Email access
- VPN connections
- Admin/privileged accounts
- Any remote access

### 4.3 Single Sign-On (SSO)
- Preferred method for application access
- Centralized identity management
- MFA enforced at SSO level

## 5. Privileged Access

### 5.1 Administrator Accounts
- Separate accounts for admin tasks (e.g., user@company.com and admin-user@company.com)
- Just-in-time (JIT) access for production
- All admin actions logged
- Quarterly access reviews

### 5.2 Service Accounts
- Unique credentials for each application
- Documented ownership
- Credentials rotated every 90 days
- No shared service accounts

## 6. Access Reviews

### 6.1 Quarterly Reviews
- All user access reviewed by managers
- Excessive or inappropriate access removed
- Dormant accounts (90+ days inactive) disabled
- Results documented

### 6.2 Annual Certifications
- Complete access recertification
- All access re-approved or revoked
- Audit-ready documentation

## 7. Remote Access
- VPN required for all remote connections
- MFA required for VPN
- Remote desktop protocol (RDP) disabled by default
- IP whitelisting for critical systems

## 8. Third-Party Access
- Vendor access agreements required
- Time-limited access (max 90 days, renewable)
- Separate accounts (no shared credentials)
- Audit trail of all vendor activity
- Access revoked upon contract termination

---

**Approved by:** [Your Name], CEO/CTO
**Date:** January 1, 2026
