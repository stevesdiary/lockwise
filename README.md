# Lockwise
Lockwise Access Management System

Lockwise is a property access management platform for residential estates. It centralizes visitor access, security operations, resident services, payments, and community engagement in one system.

**DB ER Diagram**
- https://www.mermaidchart.com/raw/11773fd7-7e7a-4771-b43b-5964d891496f?theme=light&version=v0.1&format=svg

**Features**
- **Access Control & Visitor Management**: Create access records, approve/deny access, generate access codes, validate NFC, record entry/exit, and monitor active access.
- **Estate, Address & Unit Management**: Register and manage estates, update address locations, and support multi-estate operations.
- **User Roles & Permissions**: Role-based access (admin, manager, security, resident, support), permission management, and session controls.
- **Authentication & Identity**: JWT login/logout, password reset, Google OAuth linking, and audit logging.
- **Admin Operations**: Admin registration, agent creation, API key management, and configuration endpoints.
- **Payments & Subscriptions**: Payment initiation and verification, plan management, webhooks, referral tracking, and bonus payouts.
- **Notifications & Emergency Alerts**: Email/SMS notifications, bulk notifications, and emergency alert workflows.
- **Real-time Updates**: WebSocket notifications, access code updates, and real-time support chat.
- **Community Features**: Community posts, comments, announcements, meetings, and FAQ management.
- **Amenities & Reservations**: Amenity catalog, availability checks, reservations, and cancellations.
- **Parking & EV Charging**: Parking slots, guest parking releases, and EV charging sessions.
- **Support & Helpdesk**: Ticket creation, messaging, assignment, status updates, and admin support analytics.
- **Mobile Readiness**: Device registration, data sync, deep links, and push notification testing.
- **File & Bulk Data Management**: File uploads, cloud storage adapters (AWS S3/Backblaze B2), and CSV/Excel bulk uploads for estates, residents, and addresses.
- **Analytics & Monitoring**: Admin/manager dashboards, access logs, payment analytics, custom event tracking, health checks, and metrics.
- **Legal Endpoints**: Terms and privacy policy endpoints.

**User Story / Flow**
1. An admin sets up the estate(s), roles, permissions, subscription plans, and system configuration.
2. Managers onboard residents and addresses (manually or via bulk upload) and residents register devices for mobile access.
3. A resident creates a visitor access request with a time window and access type; the system issues an access code or NFC pass and notifies relevant parties.
4. Security validates the visitor at the gate, records entry and exit, and the system updates access status and logs in real time.
5. Residents use amenities, parking, EV charging, and community features; payments and subscriptions are managed through the platform.
6. Support handles tickets and chat requests while admins monitor dashboards, analytics, referrals, and emergency alerts.

~/Documents/Github/lockwise/src/modules/mobile/models/user-device.model.ts