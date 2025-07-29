# Project Design Plan: Vikram Reviews Application

## Overview
This plan outlines the migration of the existing Vite + React frontend and Express backend to a single Next.js full-stack application. We will delete the separate `server` folder and integrate all backend logic into Next.js API routes. The app will handle feedback submission, admin login, data viewing with statistics, question editing, and a CMS for day-by-day reviews.

## Assumptions
- 'Nexus backend' refers to Next.js for full-stack development with API routes.
- Existing database (Prisma) will be retained and integrated into Next.js.
- Focus on quality, production-ready code without hallucinations.

## Architecture
- **Framework**: Next.js (React-based, with server-side rendering, API routes).
- **Frontend**: Pages and components in `/pages` and `/components`.
- **Backend**: API routes in `/pages/api` for endpoints.
- **Database**: Prisma for ORM, with schema for feedback, admins, questions, daily reviews.
- **Authentication**: JWT for admin login.
- **UI**: Modern, responsive design with Tailwind CSS (assuming from existing).
- **Editor**: Use React-based editors like Monaco Editor for question editing (JavaScript editor).

## Features
1. **Feedback Submission Form**:
   - Endpoint: POST /api/feedback
   - Store data in database.

2. **Admin Login**:
   - Endpoint: POST /api/auth/login
   - Use bcrypt for password, JWT for token.

3. **Admin Dashboard**:
   - Protected route to view submitted feedback.
   - Statistics and reports (e.g., charts with Chart.js).
   - Question Editor: Allow changing questions, types (multiple choice, text, etc.). Use a JavaScript editor component.
   - CMS for Day-by-Day Reviews: Admin can create, edit, delete daily review entries.

## Development Steps
1. **Setup Next.js**:
   - Initialize Next.js project.
   - Install dependencies: next, react, prisma, @prisma/client, jwt, bcrypt, etc.

2. **Migrate Frontend**:
   - Move existing React components to Next.js structure.

3. **Implement API Routes**:
   - Feedback submission.
   - Auth routes.
   - Protected admin routes.

4. **Database Integration**:
   - Update Prisma schema for new features (questions, daily reviews).
   - Generate client.

5. **Implement Features**:
   - Question Editor with Monaco Editor.
   - Statistics dashboard.
   - CMS for reviews.

6. **Testing**:
   - Unit tests for API routes.
   - Integration tests for form submission and admin features.
   - Manual testing for UI/UX.

7. **Deployment**:
   - Prepare for Vercel or similar.

## Potential Doubts
If 'Nexus' means something else, please clarify. Otherwise, proceeding with development.