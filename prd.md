Perfect.
Now we’re upgrading this properly.

Below is your **complete updated PRD.md (Mobile Version – v3.0)**.

This keeps:

* ✅ Your improved product logic (adaptive + level-based)
* ✅ Your backend stack (Node + Express + PostgreSQL + Prisma)
* ✅ Professional structure
* ✅ Mobile-first frontend architecture (React Native)

You can directly replace your PRD file with this.

---

# 📘 Product Requirements Document (PRD) – ReadPro Mobile MVP

> **Version:** 3.0
> **Status:** In Development
> **Last Updated:** March 3, 2026
> **Author:** Akshay A A

---

# 1. 📌 Project Overview

## Product Name: **ReadPro (Mobile Edition)**

ReadPro is an adaptive reading skill mobile application designed to:

* Assess a user’s reading ability
* Assign structured skill levels
* Deliver personalized training modules
* Continuously recalibrate performance
* Visualize measurable improvement over time

The system follows a continuous learning loop:

```
Assess → Assign Level → Train → Reassess → Level Up
```

ReadPro is developed as a native mobile application using modern cross-platform technologies, enabling seamless learning experiences across Android and iOS devices.

---

# 2. 🎯 MVP Objectives

The MVP must successfully:

1. Implement secure user authentication.
2. Conduct a timed reading assessment.
3. Calculate Words Per Minute (WPM).
4. Calculate comprehension accuracy.
5. Assign an initial reading level.
6. Deliver level-based reading modules.
7. Perform adaptive recalibration after module completion.
8. Enable level progression through structured tests.
9. Display performance analytics via mobile dashboard.
10. Maintain clean, scalable, modular architecture.

---

# 3. 🧠 Product Model

## Hybrid Learning Model

ReadPro combines:

### 1️⃣ Level-Based Progression

Levels:

* Beginner
* Intermediate
* Advanced

Each level includes:

* 5 Training Modules
* 1 Level Test

Users must complete modules and pass the level test to unlock the next level.

---

### 2️⃣ Adaptive Recalibration

After every 3 module completions:

System evaluates:

* WPM trend
* Accuracy trend

If improvement detected → Continue progression
If accuracy drops → Suggest reinforcement modules

This ensures dynamic skill growth rather than static classification.

---

# 4. 👤 User Flow (Mobile Experience)

## Step 1 – Authentication

Screens:

* Register
* Login

Process:

* Password hashed using bcrypt
* JWT issued
* Token stored securely using mobile secure storage

---

## Step 2 – Onboarding Survey

User answers:

* Reading frequency
* Preferred reading type
* Self-perceived level

Data stored in backend.

Redirected to assessment.

---

## Step 3 – Initial Assessment

### Reading Screen

* Timed passage
* Auto-start timer
* Clean distraction-free UI

### Quiz Screen

* 5–7 MCQs

### Calculation Logic

```
WPM = (Total Words / Time Taken in Seconds) × 60
Accuracy = (Correct Answers / Total Questions) × 100
```

---

## Step 4 – Level Assignment

Example Logic:

| WPM     | Accuracy | Level        |
| ------- | -------- | ------------ |
| <150    | <60%     | Beginner     |
| 150–250 | 60–80%   | Intermediate |
| >250    | >80%     | Advanced     |

Assigned level stored in database.

---

## Step 5 – Dashboard (Home Screen)

Displays:

* Current Level
* Latest WPM
* Accuracy %
* Modules Available
* Level Progress Bar
* Performance Trend Graphs

Acts as main navigation hub.

---

## Step 6 – Module Completion Flow

Each module includes:

* Reading content (Markdown rendered)
* Timer tracking
* Mini quiz
* Performance storage

After 5 modules:
→ Level Test unlocked
→ Possible Level Upgrade

---

# 5. 🗄 Database Design (PostgreSQL)

## `User`

| Field        | Type      | Description              |
| ------------ | --------- | ------------------------ |
| id           | UUID (PK) | Unique identifier        |
| name         | String    | Full name                |
| email        | String    | Unique email             |
| password     | String    | Hashed password          |
| currentLevel | String    | Current reading level    |
| avgWpm       | Int       | Running average speed    |
| avgAccuracy  | Float     | Running average accuracy |
| createdAt    | DateTime  | Timestamp                |

---

## `SurveyResponse`

| Field            | Type      |
| ---------------- | --------- |
| id               | UUID      |
| userId           | UUID (FK) |
| readingFrequency | String    |
| preferredType    | String    |
| selfRating       | String    |

---

## `Assessment`

| Field         | Type      |
| ------------- | --------- |
| id            | UUID      |
| userId        | UUID (FK) |
| wpm           | Int       |
| accuracy      | Float     |
| levelAssigned | String    |
| createdAt     | DateTime  |

---

## `Module`

| Field         | Type              |
| ------------- | ----------------- |
| id            | UUID              |
| title         | String            |
| level         | String            |
| content       | String (Markdown) |
| estimatedTime | Int               |

---

## `ModuleCompletion`

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| userId      | UUID (FK) |
| moduleId    | UUID (FK) |
| wpm         | Int       |
| accuracy    | Float     |
| completedAt | DateTime  |

---

# 6. 🧱 Tech Stack

## 📱 Mobile Frontend

* Framework: React Native (Expo)
* Navigation: React Navigation
* State Management: Context API
* UI Library: React Native Paper
* Charts: react-native-chart-kit
* API Calls: Axios
* Date Handling: date-fns
* Markdown Rendering: react-native-markdown-display
* Secure Token Storage: expo-secure-store

---

## 🖥 Backend

* Runtime: Node.js
* Framework: Express.js
* Database: PostgreSQL
* ORM: Prisma
* Authentication: JWT
* Password Hashing: bcryptjs

---

# 7. 📁 Project Structure

## Mobile App (`/mobile`)

```
mobile/
├── src/
│   ├── core/
│   │   ├── config/
│   │   ├── navigation/
│   │   ├── theme/
│   ├── features/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── assessment/
│   │   ├── dashboard/
│   │   ├── modules/
│   │   ├── profile/
│   ├── services/
│   ├── context/
│   ├── hooks/
│   ├── components/
│   └── utils/
├── App.js
└── app.json
```

---

## Backend (`/backend`)

```
server/
├── config/
├── controllers/
├── routes/
├── middleware/
├── prisma/
├── utils/
└── server.js
```

Architecture Pattern:
Controller → Service Logic → Prisma ORM → PostgreSQL

---

# 8. 📱 Mobile Navigation Structure

## Bottom Tab Navigator

* Dashboard
* Modules
* Profile

## Stack Navigation (Nested)

* Assessment Flow
* Module Flow
* Level Test Flow

This ensures intuitive mobile UX.

---

# 9. 📊 Dashboard Requirements (Mobile)

Must include:

* WPM Trend Chart
* Accuracy Trend Chart
* Modules Completed Counter
* Current Level Indicator
* Level Progress Bar
* Performance Summary Card

---

# 10. 🔌 API Endpoints

## Auth

* POST `/api/auth/register`
* POST `/api/auth/login`

## User

* GET `/api/user/profile`
* POST `/api/user/onboarding`

## Assessment

* POST `/api/assessment/submit`
* GET `/api/assessment/history`

## Modules

* GET `/api/modules?level=`
* GET `/api/modules/:id`
* POST `/api/modules/:id/complete`

---

# 11. 🚫 Out of Scope (MVP)

* AI-based NLP scoring
* Subscription system
* Admin dashboard
* Social features
* Real-time notifications
* Offline sync (future feature)

---

# 12. 🚀 Post-MVP Roadmap

* AI comprehension scoring
* Vocabulary complexity analysis
* 24-hour retention testing
* ML-based adaptive recommendation
* Push notifications for daily practice
* Offline reading mode

---

# 13. Architecture Quality Goals

* Modular mobile feature structure
* Secure token storage
* RESTful API conventions
* Clean service separation
* Prisma migration management
* Scalable backend for future expansion

---

# Final Product Positioning

ReadPro (Mobile) is:

* Structured
* Adaptive
* Data-driven
* Scalable
* Mobile-first
* Internship-ready
* Resume-grade

---

Now this is a **proper mobile product PRD**, not a web one.

---

