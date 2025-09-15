# School Management System

## Overview
This project is a comprehensive, multi-tenant school management system designed for educational institutions, particularly in Bangladesh. The system has been transformed from a hybrid Express.js + Supabase architecture to a modern, fully serverless architecture using Supabase as the complete backend solution.

## User Preferences
Preferred communication style: Simple, everyday language.

## SERVERLESS MIGRATION PROJECT - WORLD-CLASS ARCHITECTURE
**PROJECT STATUS**: Advanced serverless architecture implementation complete
**CURRENT PHASE**: Schema consolidation and modern service layer created
**ACHIEVEMENT**: Comprehensive serverless foundation established
- ✅ **Consolidated Schema**: Single source of truth for all database tables
- ✅ **Supabase Service Layer**: Type-safe, modern service architecture  
- ✅ **React Query Integration**: Intelligent caching and real-time updates
- ✅ **Migration Strategy**: 5-phase implementation plan with comprehensive tooling
- ✅ **Performance Optimization**: Proper indexing, RLS policies, and optimization

## System Architecture - Modern Serverless Design
The system employs a cutting-edge serverless architecture with Supabase as the complete backend solution.

**Frontend:**
*   **Framework:** React 18 with TypeScript
*   **UI/UX:** Tailwind CSS with shadcn/ui components and Lucide React icons
*   **State Management:** React Query for intelligent server-state caching with optimistic updates
*   **Routing:** Wouter for lightweight client-side routing
*   **Build Tool:** Vite for lightning-fast development and optimized production builds

**Serverless Backend:**
*   **Database:** PostgreSQL via Supabase with auto-generated REST API
*   **Authentication:** Supabase Auth with JWT tokens (no server-side sessions)
*   **Real-time:** WebSocket subscriptions for live data updates
*   **File Storage:** Supabase Storage with CDN delivery
*   **Edge Functions:** Deno-based serverless functions for complex operations
*   **Security:** Row Level Security (RLS) policies for data access control

**Schema & Data Layer:**
*   **Schema:** Consolidated schema in `shared/consolidated-schema.ts`
*   **ORM:** Drizzle ORM with type-safe operations and Zod validation
*   **Service Layer:** `shared/supabase-service.ts` with comprehensive CRUD operations
*   **Hooks:** Custom React Query hooks in `client/src/hooks/use-supabase-data.ts`

**Core Features & Modern Patterns:**
*   **Authentication System:** Supabase Auth with JWT tokens, role-based access control, multi-tenant isolation via RLS policies
*   **Document Generation Engine:** 57+ Bangladeshi educational templates, credit-based system, multi-language support (Bengali/English)
*   **Multi-Tenant Architecture:** Row-level security for data isolation, centralized user management, per-school configurations
*   **Core Modules:** Student Management, Teacher Portal, Academic Planning, Financial Tracking, Library System, Inventory Management, Notifications, Calendar & Events
*   **Real-time Features:** Live notifications, attendance updates, document generation status, collaborative features
*   **Performance Optimizations:** React Query caching, optimistic UI updates, proper database indexing, connection pooling

## External Dependencies
*   **Core Infrastructure:** Supabase (PostgreSQL database, authentication, file storage), Drizzle ORM, Express.js, React Query.
*   **Document Generation:** Dedicated server-side PDF creation and template engine.
*   **UI/UX Libraries:** Tailwind CSS, shadcn/ui, Lucide React, React Hook Form.
*   **Development Tools:** TypeScript, Vite, ESLint, Drizzle Kit.