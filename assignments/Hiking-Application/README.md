# Architectural Description of Software System

### System Components

- Front End Web Server
- Backend Database Server
- Admin Web Client (HTML)
- Member Web Client (HTML)
- Guest Web Client (HTML)

### Front End Web Server

#### Guest Browsing
- Functionality and user stories

#### Authentication
- Member and admin authentication mechanisms'xh

#### Authorization
- Permission controls by role

### Backend Database Server

[Database isolation and firewall requirements]

### Admin Client

#### Trip Leader Permissions
- a. Event creation and management
- b. CRUD operations on own events
- c. Member status tracking
- d. Waitlist management
- e. Member removal
- f. Confidential member information access
- g. Member reporting
- h. Event capacity settings

#### System Admin Permissions
- a. User account management
- b. Trip leader account management
- c. Database integrity checks
- d. Payment portal setup
- e. Treasury portal access

### Member Client

- Event viewing and registration
- Profile management
- Limited member information access

### Guest Client

- Public event listings
- No authentication required
