Your New Document

Below is your clean, structured, implementation-focused document (starting from dashboard only).

📘 READPRO_ADAPTIVE_AI_SYSTEM.md

Version: 1.0
Scope: Post-Dashboard Learning System
Status: In Development

1. 📌 Overview

This document defines the implementation of the Adaptive AI Learning System starting from the dashboard.

This system replaces the traditional module/level-based approach with a continuous, personalized learning loop powered by AI-generated content and performance analysis.

2. 🧠 Core Learning Loop
Dashboard
   ↓
Fetch Recommended Session
   ↓
Generate AI Content
   ↓
User Completes Session
   ↓
Evaluate Performance
   ↓
Update Skill Scores
   ↓
Generate Next Recommendation
3. 🎯 Key Features
3.1 AI-Based Session Generation
Purpose

Dynamically generate reading content and quizzes instead of using fixed modules.

Includes:

Reading Passage

5 MCQ Questions

Answer Key

Input Factors:

Weakest skill

Difficulty level

User preferences

Recent performance

3.2 Continuous Skill Tracking
Skills:

Speed

Comprehension

Vocabulary

Inference

Behavior:

Skills are continuously updated after each session

No fixed levels

System adapts in real-time

3.3 Recommendation Engine
Purpose

Determine the next best session for the user.

Logic:

Identify weakest skill

Analyze last 3 sessions

Adjust difficulty dynamically

3.4 Session-Based Learning Model

Instead of modules, the system uses:

Learning Sessions

Each session contains:

AI-generated passage

Quiz

Performance evaluation

4. 📱 Frontend UI Requirements
4.1 Dashboard Screen
Purpose

Main control center and entry point to learning.

Sections:
🔹 1. Recommended Session Card

Displays:

Skill Focus (e.g., Comprehension)

Difficulty (Easy/Medium/Hard)

Estimated Time

Reason (e.g., “Low accuracy in recent sessions”)

Action:

Start Session button

🔹 2. Skill Overview

Display 4 progress bars:

Speed

Comprehension

Vocabulary

Inference

Each shows percentage.

🔹 3. Insights Panel

Displays:

Weakest skill

Suggestion for improvement

🔹 4. Activity Summary

Displays:

Sessions completed

Streak count

Weekly progress

4.2 Session Screen (Reading)
Purpose

Display AI-generated reading content.

UI Elements:

Header (Back + Timer)

Scrollable passage

“I’m Done” button

4.3 Quiz Screen
Purpose

Evaluate comprehension.

UI Elements:

Question text

4 options

Progress indicator (e.g., 2/5)

Next / Submit button

4.4 Result Screen
Purpose

Provide feedback and guide next step.

UI Elements:

WPM Score

Accuracy Score

Feedback Section:

Positive insight (e.g., speed improved)

Negative insight (e.g., missed inference)

Skill Changes:

Show improvement or decline

Action:

“Next Recommended Session” button

5. 🧠 Backend Logic Requirements
5.1 AI Content Generation
Endpoint Responsibility:

Generate passage + questions

Steps:

Receive request with:

skill focus

difficulty

Construct prompt

Call AI API

Validate response

Return structured content

5.2 Skill Update Engine
Formula:
newScore = (oldScore * 0.7) + (currentPerformance * 0.3)
5.3 User State Detection

States:

Improving

Struggling

Stable

Logic:

Based on last 3 session performance

5.4 Recommendation Engine
Steps:

Identify weakest skill

Check recent performance trend

Decide difficulty

Generate session request

6. 🗄 Data Requirements
Session Data

skillFocus

difficulty

passage

questions

answers

wpm

accuracy

timestamp

Skill Data

speed

comprehension

vocabulary

inference

7. 🎯 UX Flow
Dashboard
   ↓
Start Session
   ↓
Reading Screen
   ↓
Quiz Screen
   ↓
Result Screen
   ↓
Next Session
   ↓
Back to Dashboard
8. 🚀 Implementation Plan
Phase 1

Dashboard UI integration with “Recommended Session”

Phase 2

Session UI (Reading + Quiz + Result)

Phase 3

AI integration

Phase 4

Skill update logic

Phase 5

Recommendation engine

9. 🧠 Key Design Decisions

No level-based progression

Continuous learning loop

AI-driven content

Skill-based adaptation

10. 📌 Summary

This system transforms ReadPro into:

Adaptive learning platform

AI-powered content generator

Continuous improvement system