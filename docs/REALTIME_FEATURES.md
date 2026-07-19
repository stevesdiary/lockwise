# Real-time Features Implementation

## Overview
Real-time features have been implemented using Socket.IO for WebSocket connections, providing live notifications, access code updates, and chat support.

## Features Implemented

### 1. WebSocket Service (`src/services/websocket.service.ts`)
- JWT authentication for WebSocket connections
- User room management
- Staff broadcasting capabilities
- Event handling for notifications, access codes, and chat

### 2. Live Notifications (`src/services/realtime-notification.service.ts`)
- Real-time notification delivery to specific users
- Staff broadcasting for admin notifications
- Integration with payment events

### 3. Real-time Access Code Updates (`src/services/realtime-access-code.service.ts`)
- Live access code status updates
- Expiry notifications
- User-specific code delivery

### 4. Live Chat Support (`src/controllers/chat.controller.ts`, `src/routes/chat.route.ts`)
- Real-time messaging between users and support staff
- Chat room management
- Message broadcasting

## API Endpoints

### Chat Support
- `POST /api/v1/chat/create` - Create support chat
- `POST /api/v1/chat/send` - Send chat message
- `GET /api/v1/chat/history/{chatId}` - Get chat history

## WebSocket Events

### Client → Server
- `join_support_chat` - Join a support chat room
- `send_message` - Send a chat message

### Server → Client
- `notification` - Receive live notifications
- `access_code_update` - Receive access code updates
- `new_message` - Receive chat messages
- `new_support_chat` - New support chat created (staff only)

## Usage

### Server Setup
The WebSocket server is automatically initialized with the HTTP server. No additional configuration needed.

### Client Connection
```javascript
const socket = io('http://localhost:3000', {
    auth: { token: 'your-jwt-token' }
});

// Listen for notifications
socket.on('notification', (data) => {
    console.log('New notification:', data);
});

// Listen for access code updates
socket.on('access_code_update', (data) => {
    console.log('Access code update:', data);
});

// Join chat and listen for messages
socket.emit('join_support_chat', { chatId: 'chat_123' });
socket.on('new_message', (data) => {
    console.log('New message:', data);
});
```

### Testing
1. Start the server: `npm start`
2. Open `realtime-demo.html` in a browser
3. Replace the JWT token with a valid one
4. Test real-time features

## Integration Points
- Payment controller sends notifications on payment initiation
- Access code service can trigger real-time updates
- Support system uses WebSocket for live chat

## Security
- JWT authentication required for WebSocket connections
- User isolation through room-based messaging
- Role-based access for staff features