# comp313-002-Team-6-W25-

A full-stack web platform that connects community members with events, enabling users to discover and register, while giving organizers the ability to create, manage, and monitor events.

Frontend: React + Vite
Backend: Node.js + Express
Database: MongoDB Atlas
API Testing: Postman

### 1. Environment Configuration

Create a `.env` file in the `backend/` folder.  
⚠️ **Do not commit this file to GitHub.**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_for_auth
```

---

### 2. API Endpoints (Current Progress)

The following routes have been implemented and tested using **Postman**.

- **POST `/api/events`**  
  Creates a new community event.

- **GET `/api/events`**  
  Retrieves all available events.

- **POST `/api/registrations`**  
  Registers a user for an event while enforcing event capacity limits.

### 3. Key Features Implemented

- **Capacity Validation:** Prevents registration if the event is full (User Story 7).
- **Duplicate Prevention:** Users cannot register for the same event multiple times.
- **Relational Data:** Registrations are linked to **Event IDs** and **User IDs**.
