# AutoBot Manager - Discord & WhatsApp Automation Platform

## Overview

AutoBot Manager is a full-stack web application designed to manage and automate Discord and WhatsApp bots. The platform provides a comprehensive dashboard for creating, configuring, and monitoring automation bots with features like scheduled messaging, auto-responses, and real-time activity tracking.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter (lightweight React router)
- **Build Tool**: Vite with custom configuration
- **Real-time Updates**: WebSocket client integration

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **File Handling**: Multer for configuration file uploads
- **Bot Integration**: Discord.js and WhatsApp-web.js libraries

## Key Components

### Database Schema
The application uses PostgreSQL with the following main entities:
- **Discord Bots**: Store bot credentials, server information, and channels
- **WhatsApp Bots**: Manage phone numbers, session data, and QR codes
- **Schedules**: Configure automated message posting with cron expressions
- **Auto Responders**: Define trigger keywords and automated responses
- **Activity Logs**: Track all bot activities and system events
- **Config Files**: Store uploaded configuration files for batch operations

### Service Layer
- **Discord Service**: Manages Discord bot connections, message handling, and server interactions
- **WhatsApp Service**: Handles WhatsApp bot authentication, QR code generation, and message processing
- **Scheduler Service**: Implements cron-based job scheduling for automated tasks
- **Configuration Service**: Manages file-based configuration import/export

### Frontend Pages
- **Dashboard**: Overview of all bots with real-time statistics
- **Discord Bots**: Management interface for Discord bot creation and configuration
- **WhatsApp Bots**: WhatsApp bot management with QR code authentication
- **Auto Poster**: Schedule configuration for automated message posting
- **Auto Responder**: Setup automated responses to trigger keywords
- **Activity Logs**: Real-time monitoring of all bot activities

## Data Flow

1. **Bot Creation**: Users create bots through the web interface, storing credentials in the database
2. **Bot Connection**: Services establish connections to Discord/WhatsApp using stored credentials
3. **Real-time Updates**: WebSocket connections broadcast status changes to the frontend
4. **Automation Execution**: Scheduler service runs automated tasks based on configured schedules
5. **Activity Logging**: All actions are logged to the database and displayed in real-time
6. **Configuration Management**: Users can upload/download JSON configuration files for bulk operations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection (Neon-compatible)
- **discord.js**: Discord API integration for bot functionality
- **whatsapp-web.js**: WhatsApp automation through web interface
- **drizzle-orm**: Type-safe database queries and schema management
- **node-cron**: Cron job scheduling for automated tasks

### UI/UX Dependencies
- **@radix-ui/***: Accessible UI primitives for consistent design
- **@tanstack/react-query**: Efficient server state management
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library

### Development Tools
- **tsx**: TypeScript execution for development
- **vite**: Fast build tool with HMR support
- **esbuild**: Production bundling for server code

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Development Mode
- Frontend served by Vite development server with HMR
- Backend runs with tsx for TypeScript execution
- WebSocket server integrated with HTTP server
- Database migrations handled by Drizzle Kit

### Production Build
- Frontend built to static files in `dist/public`
- Backend bundled with esbuild to `dist/index.js`
- Single Node.js process serves both static files and API
- Environment variables required: `DATABASE_URL`

### Database Management
- Schema defined in `shared/schema.ts`
- Migrations generated in `./migrations` directory
- Push schema changes with `npm run db:push`
- PostgreSQL dialect with Neon Database compatibility

## Changelog

- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.