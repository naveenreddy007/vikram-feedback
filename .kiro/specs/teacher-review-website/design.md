# Design Document

## Overview

The Teacher Review Website is a modern, interactive web application designed to collect student feedback for Vikram, an energetic engineering teacher. The application emphasizes visual appeal and user engagement through cutting-edge web technologies including Three.js WebGL rendering, Framer Motion animations, glassmorphism design, and haptic feedback. The goal is to create a "magical" experience that motivates students to provide thoughtful, honest feedback.

## Architecture

### Technology Stack
- **Frontend Framework**: React.js with TypeScript for type safety and component-based architecture
- **3D Graphics**: Three.js for WebGL rendering and 3D visual effects
- **Animations**: Framer Motion for smooth, physics-based animations and transitions
- **Styling**: Tailwind CSS with custom glassmorphism utilities and dark theme configuration
- **Haptic Feedback**: Web Vibration API for supported devices
- **Backend**: Node.js with Express.js for API endpoints
- **Database**: Neon DB (PostgreSQL) with Prisma ORM for type-safe database operations
- **Deployment**: Vercel for frontend, Railway/Heroku for backend

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React +      │◄──►│   (Express.js + │◄──►│   (Neon DB      │
│   Three.js)     │    │    Prisma)      │    │   PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Landing Page Component
- **Purpose**: Create first impression with 3D hero section
- **Features**:
  - Animated 3D geometric shapes using Three.js
  - Floating mathematical equations and subject-related particles
  - Glassmorphism welcome card with call-to-action
  - Smooth scroll-triggered animations

#### 2. Student Information Form Component
- **Purpose**: Collect required student details
- **Features**:
  - Animated input fields with glassmorphism styling
  - Real-time validation with smooth error animations
  - Progressive form revelation (fields appear as previous ones are completed)
  - Haptic feedback on mobile devices for interactions

#### 3. Rating Interface Component
- **Purpose**: Interactive rating system for teaching skills
- **Features**:
  - Custom animated star/number rating system
  - 3D hover effects and particle animations on selection
  - Visual feedback with color transitions and micro-animations
  - Motivational messages that appear based on rating selection

#### 4. Feedback Sections Component
- **Purpose**: Collect specific feedback categories
- **Features**:
  - Card-based layout with glassmorphism effects
  - Animated question reveals with typewriter effects
  - Interactive toggle switches and sliders for responses
  - Dynamic background particle effects that respond to user input

#### 5. Admin Dashboard Component
- **Purpose**: Display feedback analytics for Vikram
- **Features**:
  - Data visualization with animated charts (Chart.js/D3.js)
  - Filtering and search capabilities
  - Export functionality for feedback data
  - Real-time updates when new feedback is submitted

### Backend API Endpoints

#### Authentication & Security
```typescript
POST /api/auth/login          // Admin login for Vikram
POST /api/auth/logout         // Admin logout
GET  /api/auth/verify         // Verify admin session
```

#### Feedback Management
```typescript
POST /api/feedback/submit     // Submit student feedback
GET  /api/feedback/all        // Get all feedback (admin only)
GET  /api/feedback/analytics  // Get aggregated analytics
DELETE /api/feedback/:id      // Delete specific feedback (admin only)
```

#### System Health
```typescript
GET  /api/health             // System health check
GET  /api/stats              // Basic system statistics
```

## Data Models

### Prisma Schema Models
```prisma
model StudentFeedback {
  id                    String   @id @default(cuid())
  name                  String
  email                 String?
  phoneNumber           String
  teachingSkills        Int      // 1-10 scale
  realWorldExplanation  Int      // 1-10 scale
  overallSatisfaction   Int      // 1-10 scale
  realWorldTopics       Boolean
  futureTopics          String[] // Array of topic suggestions
  teachingPace          TeachingPace
  additionalComments    String?
  deviceType            DeviceType
  browserInfo           String
  sessionDuration       Int      // Time spent on site in seconds
  submittedAt           DateTime @default(now())
  
  @@map("student_feedback")
}

model AdminUser {
  id           String    @id @default(cuid())
  username     String    @unique
  passwordHash String
  role         String    @default("admin")
  lastLogin    DateTime?
  createdAt    DateTime  @default(now())
  
  @@map("admin_users")
}

enum TeachingPace {
  TOO_FAST
  PERFECT
  TOO_SLOW
}

enum DeviceType {
  MOBILE
  DESKTOP
  TABLET
}
```

### TypeScript Interfaces
```typescript
interface StudentFeedback {
  id: string;
  name: string;
  email?: string;
  phoneNumber: string;
  teachingSkills: number;        // 1-10 scale
  realWorldExplanation: number;  // 1-10 scale
  overallSatisfaction: number;   // 1-10 scale
  realWorldTopics: boolean;
  futureTopics: string[];
  teachingPace: 'TOO_FAST' | 'PERFECT' | 'TOO_SLOW';
  additionalComments?: string;
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET';
  browserInfo: string;
  sessionDuration: number;       // Time spent on site in seconds
  submittedAt: Date;
}

interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  role: string;
  lastLogin?: Date;
  createdAt: Date;
}
```

## Error Handling

### Frontend Error Handling
- **Network Errors**: Graceful fallbacks with retry mechanisms and offline indicators
- **Validation Errors**: Real-time field validation with animated error messages
- **Browser Compatibility**: Feature detection with progressive enhancement
- **Performance**: Lazy loading of 3D assets and animation optimization

### Backend Error Handling
- **Input Validation**: Joi schema validation for all API endpoints
- **Database Errors**: Connection retry logic and graceful degradation
- **Rate Limiting**: Prevent spam submissions with exponential backoff
- **Logging**: Comprehensive error logging with Winston

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

## Testing Strategy

### Frontend Testing
- **Unit Tests**: Jest + React Testing Library for component testing
- **Integration Tests**: Cypress for end-to-end user flow testing
- **Visual Regression**: Percy or Chromatic for UI consistency
- **Performance Tests**: Lighthouse CI for performance monitoring
- **Accessibility Tests**: axe-core for WCAG compliance

### Backend Testing
- **Unit Tests**: Jest for individual function testing
- **Integration Tests**: Supertest for API endpoint testing
- **Database Tests**: MongoDB Memory Server for isolated testing
- **Load Tests**: Artillery.js for performance under load

### Test Coverage Goals
- Minimum 80% code coverage for critical paths
- 100% coverage for data validation and security functions
- Cross-browser testing on Chrome, Firefox, Safari, Edge
- Mobile device testing on iOS and Android

## UI/UX Design Specifications

### Visual Design System

#### Color Palette
- **Primary Dark**: #0a0a0a (Deep black background)
- **Secondary Dark**: #1a1a1a (Card backgrounds)
- **Accent Colors**: 
  - Electric Blue: #00d4ff (Primary actions)
  - Neon Green: #39ff14 (Success states)
  - Warm Orange: #ff6b35 (Highlights)
- **Glass Effects**: rgba(255, 255, 255, 0.1) with backdrop-blur

#### Typography
- **Primary Font**: Inter or Poppins for clean, modern readability
- **Accent Font**: Orbitron or Space Mono for "lewish letters" effect
- **Font Sizes**: Responsive scale from 14px (mobile) to 24px (desktop)

#### Animation Principles
- **Easing**: Custom cubic-bezier curves for natural motion
- **Duration**: 200-800ms for micro-interactions, 1-2s for page transitions
- **Stagger**: Sequential animations with 100-200ms delays
- **Physics**: Spring animations for organic feel

### 3D Visual Elements
- **Particle Systems**: Floating mathematical equations and geometric shapes
- **Interactive Objects**: 3D buttons and form elements that respond to mouse/touch
- **Background Effects**: Subtle rotating geometric patterns
- **Performance**: Adaptive quality based on device capabilities

### Responsive Design Breakpoints
- **Mobile**: 320px - 768px (Touch-optimized interactions)
- **Tablet**: 768px - 1024px (Hybrid touch/mouse support)
- **Desktop**: 1024px+ (Full 3D effects and animations)

## Security Considerations

### Data Protection
- Input sanitization and validation on all user inputs
- HTTPS enforcement for all communications
- Rate limiting to prevent spam and abuse
- No sensitive data storage (minimal personal information)

### Admin Security
- Secure password hashing with bcrypt
- JWT tokens for session management
- Role-based access control
- Admin activity logging

### Privacy Compliance
- Clear privacy policy regarding data collection
- Option for students to request data deletion
- Minimal data collection principle
- Secure data transmission and storage