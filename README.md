# COMP367 – DevOps Implementation (Group Project)

This project demonstrates the implementation of a full-stack application integrated with modern DevOps practices, including CI/CD pipelines, code quality analysis, and collaborative development workflows.

The platform connects community members with events, allowing users to discover and register for events while enabling organizers to create and manage them.

---

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **CI/CD:** Azure DevOps Pipelines
- **Code Quality:** SonarCloud
- **API Testing:** Postman

---

## DevOps Features Implemented

- CI pipeline using **Azure Pipelines (YAML)**
- Automated build and test stages
- Multi-stage deployment pipeline:
  - Dev
  - QAT
  - Staging
  - Production (mock deployments)
- Code quality analysis using **SonarCloud**
- GitHub integration using **Personal Access Token (PAT)**
- Pull request workflow with code reviews
- Issue tracking and resolution

---

## Environment Configuration

Create a `.env` file in the `backend/` folder.  
 **Do not commit this file to GitHub.**

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key_for_auth
```
