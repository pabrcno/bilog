# Appointment Booking Application

This project is a full-stack appointment booking system built with Next.js, tRPC, Drizzle ORM, and a modern React UI. It is designed to handle user registration, authentication, appointment scheduling, and management for both patients and admins. The architecture and codebase are structured for scalability, maintainability, and extensibility, following best practices for modern web development.

## Technical Docs
https://deepwiki.com/pabrcno/bilog 
---

## Index

- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)
- [Functionality & Implementation](#functionality--implementation)
- [Data Modeling](#data-modeling)
- [Scalability & Extensibility](#scalability--extensibility)
- [How to Run & Test](#how-to-run--test)
- [Design Decisions](#design-decisions)
- [Centralized Typing & Data Validation](#centralized-typing--data-validation)
- [UI Library](#ui-library)
- [Recommended Next Steps for Production](#recommended-next-steps-for-production)
- [Implemented Next Step: Deployment to Vercel](#implemented-next-step-deployment-to-vercel)
- [License](#license)


---

## Demo Credentials

Link: https://v0-simple-appointment-scheduler.vercel.app/

- **Admin**
  - Email: `admin@example.com`
  - Password: `123456`
- **Patient**
  - Email: `patient@example.com`
  - Password: `123456`

---

## Project Structure

- **app/**: Next.js app directory, including routing, layouts, and pages for both patient and admin flows.
  - **admin/**: Admin dashboard and login pages.
  - **patient/**: Patient dashboard, login, and registration pages.
  - **api/**: API endpoints (tRPC integration).
- **components/**: Reusable React components.
  - **ui/**: UI primitives (buttons, dialogs, forms, etc.).
  - **auth/**: Authentication forms.
  - **admin/**: Admin-specific components.
- **db/**: Database schema and initialization (Drizzle ORM).
- **migrations/**: SQL migration files for schema evolution.
- **server/**: tRPC server logic and routers.
- **lib/**: Shared utilities (theme, toast notifications, helpers).
- **providers/**: React context providers (e.g., tRPC provider).
- **utils/**: Utility functions (e.g., tRPC helpers).
- **test/**: Unit tests, setup, and test utilities.
- **public/**: Static assets.

---

## Functionality & Implementation

- **Appointments, Users, Time Slots**: The app models users (patients/admins), appointments, and time slots using a normalized relational schema (see `db/schema.ts`).
- **Edge Cases**: Handles double-booking, invalid time slots, and user input validation using Zod schemas and backend checks.
- **User Flows**: Separate flows for patients (booking, viewing, managing appointments) and admins (managing slots, viewing all appointments).
- **API Design**: All backend logic is exposed via tRPC routers, ensuring type safety and clear separation of concerns.
- **Frontend Logic**: State is managed using React hooks and context, with clear separation between UI, data fetching, and business logic.
- **Error Handling**: Graceful error messages for failed requests, invalid inputs, and inconsistent states, both in the UI and API responses.
- **UX & UI**: Built with Radix UI, Tailwind CSS, and custom components for a clean, accessible, and responsive interface.
- **Testing**: Unit tests for tRPC routers and utilities, using Jest and jest-mock-extended for mocking database and context.

---

## Data Modeling

- **Users**: Patients and admins, with authentication and role-based access.
- **Appointments**: Linked to users and time slots, with status tracking.
- **Time Slots**: Managed by admins, bookable by patients, with validation to prevent conflicts.

---

## Scalability & Extensibility

- Modular code structure for easy feature addition.
- tRPC and Drizzle ORM for type-safe, scalable backend logic.
- UI components are reusable and can be shared across projects.
- Designed to support future integration with real authentication, analytics, logging, and more.

---

## How to Run & Test

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Run the development server:**
   ```bash
   pnpm dev
   ```
3. **Run tests:**
   ```bash
   pnpm test
   ```
4. **Database migrations:**
   ```bash
   pnpm db:push
   ```

---

## Design Decisions

- **tRPC** for end-to-end type safety and rapid API development.
- **Drizzle ORM** for modern, type-safe database access and migrations.
- **Radix UI & Tailwind CSS** for accessible, composable UI components.
- **Separation of patient/admin flows** for clarity and maintainability.
- **Mock authentication** for demo purposes, with clear extension points for real auth.
- **Unit testing** focused on backend logic and utilities.

### Centralized Typing & Data Validation

- **Centralized Types**: All core types (users, appointments, time slots) are defined in a single place using Drizzle ORM and `drizzle-zod`. This ensures:
  - Type safety across the entire stack (database, backend, frontend)
  - Consistency and maintainability (no duplicated or out-of-sync types)
  - Zod schemas are generated directly from the Drizzle schema, so validation and types are always in sync.


### UI Library

- **shadcn/ui**: The UI is built using [shadcn/ui](https://ui.shadcn.com/), a modern, accessible, and customizable component library based on Radix UI and Tailwind CSS. This provides a strong foundation for usability, accessibility, and rapid development.

---

## Recommended Next Steps for Production

1. **Add real authentication** (e.g., Supabase Auth).
2. **Use Supabase for Auth, Database, Storage and Rate Limiting**: Supabase provides a unified platform for authentication, Postgres database, file storage, and real-time subscriptions. Adopting Supabase can simplify backend infrastructure, speed up development, and offer a scalable, managed solution for user auth, data, and file uploads.

3. **Adopt a monorepo architecture** (e.g., Turborepo) to share components and utilities across all Bilog apps.
4. **i18n**: Translations to adapt to the user's lanaguage.
5. **Create a design system library** for consistent UI/UX across projects.
6. **Add logging and error monitoring** (e.g., Sentry) for observability.
7. **Integrate alerting with Slack** for critical errors or operational events.
8. **Add analytics** (e.g., PostHog, Plausible, or Vercel Analytics) for usage insights.
9. **Add performance monitoring** (e.g., Vercel Speed Insights, Lighthouse CI).
10. **Infrastructure**: Deploy on Vercel, AWS, or GCP with CDN, and autoscaling.
11. **Monitoring**: Use tools like Grafana, Prometheus, or Datadog for metrics and uptime.
12. **CI/CD**: Set up automated testing and deployment pipelines.
13. **ESLint**: Integrate ESLint to automatically catch code issues, enforce consistent style, and prevent bugs early—helping teams write cleaner, more maintainable code and streamlining the development process.
14. **Owner Panel**: Add general management system to handle super user activities.
15. **UI Improvements**: Add landing, demo, tuturials, responsive UI, etc.

---

## Implemented Next Step: Deployment to Vercel

**Rationale:**
Deploying to Vercel provides a seamless, scalable, and developer-friendly platform for hosting Next.js applications. Vercel offers automatic deployments, serverless infrastructure, built-in CDN, and easy integration with GitHub for CI/CD. This ensures fast, reliable delivery and a great developer experience with minimal configuration.


---

## License

This project is licensed under the [Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/).


