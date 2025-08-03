# School Management System

## Overview
This project is a comprehensive, multi-tenant school management system designed for educational institutions, particularly in Bangladesh. It provides a full suite of tools for managing students, teachers, classes, and school operations, including document generation. The system aims to streamline administrative tasks and enhance educational management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The system is built with a clear separation of concerns, employing modern web technologies for both frontend and backend.

**Frontend:**
*   **Framework:** React 18 with TypeScript
*   **UI/UX:** Tailwind CSS for utility-first styling and shadcn/ui for accessible components, with Lucide React for icons.
*   **State Management:** React Query for server-side state and standard React hooks for local state.
*   **Routing:** React Router for client-side navigation.
*   **Build Tool:** Vite for development and optimized production builds.

**Backend:**
*   **Runtime:** Node.js 20+ with Express.js and TypeScript.
*   **Authentication:** Session-based with `express-session` and role-based access control (admin, user, teacher, student).
*   **API Design:** RESTful APIs with consistent error handling and modular organization.
*   **File Structure:** Modular, with distinct concerns for routes and business logic.

**Database:**
*   **Primary Database:** PostgreSQL via Supabase.
*   **ORM:** Drizzle ORM for type-safe operations.
*   **Schema Management:** TypeScript-first definitions with programmatic migrations using Drizzle Kit.

**Core Features & Design Patterns:**
*   **Authentication System:** Secure session-based authentication, role-based access control, multi-tenant user management with school isolation, and secure password hashing.
*   **Document Generation Engine:** Supports 57+ document templates specific to Bangladeshi educational contexts, with a credit-based usage system, multi-language support (Bengali and English), and server-side PDF generation.
*   **Multi-Tenant Architecture:** Data isolation per school, centralized user management, per-school feature toggles, and credit tracking.
*   **Core Modules:** Encompasses Student, Teacher, Class, Financial, Library, Transport, Notification, and Calendar Management.
*   **Data Flow:** Client requests are processed through authentication and authorization middleware, business logic, and Drizzle ORM interaction with Supabase PostgreSQL. Document generation involves template processing, server-side PDF creation, and storage in Supabase Storage.
*   **Real-time Features:** Includes live notifications, attendance updates, document generation status, and system health monitoring.

## External Dependencies
*   **Core Infrastructure:** Supabase (PostgreSQL database, authentication, file storage), Drizzle ORM, Express.js, React Query.
*   **Document Generation:** Dedicated server-side PDF creation and template engine.
*   **UI/UX Libraries:** Tailwind CSS, shadcn/ui, Lucide React, React Hook Form.
*   **Development Tools:** TypeScript, Vite, ESLint, Drizzle Kit.