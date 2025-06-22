# Gut Balance Buddy Cheatsheet

## Key Project Directory Locations
- **Source Code**: `src/` - Contains the main application code, including components, hooks, integrations, and pages.
  - **Components**: `src/components/` - UI components for various features like Food Diary, Stool Tracker, and Gut Health Coach.
  - **Hooks**: `src/hooks/` - Custom React hooks for managing state and side effects (e.g., authentication, data fetching).
  - **Integrations**: `src/integrations/supabase/` - Supabase client and type definitions for backend connectivity.
  - **Pages**: `src/pages/` - Main application routes like authentication and index pages.
- **Public Assets**: `public/` - Static files like favicon, placeholder images, and uploaded content.
- **Supabase Configuration**: `supabase/` - Contains Supabase project configuration and serverless functions.
  - **Functions**: `supabase/functions/` - Serverless functions for tasks like food image analysis and gut health chat.
  - **Migrations**: `supabase/migrations/` - Database schema migrations for version control.
- **Project Root**: `./` - Configuration files for Vite, Tailwind CSS, ESLint, and project dependencies (package.json).

## Default Database Configuration Details
- **Backend**: Supabase is used for database management and backend services.
- **Configuration**: The Supabase client is initialized in `src/integrations/supabase/client.ts`. Ensure environment variables for Supabase URL and Anon Key are set for local development or deployment.
- **Database Schema**: Managed through migrations in `supabase/migrations/`. Refer to these files for the latest schema changes and structure.
- **Serverless Functions**: Deployed via Supabase for specific app functionalities like image analysis and personalized coaching. Located in `supabase/functions/`.

## Quick Commands
- **Install Dependencies**: `npm i` - Installs all required packages for the project.
- **Run Development Server**: `npm run dev` - Starts the Vite development server with hot reloading.
- **Testing**: `pytest` - Runs tests as configured in `pytest.ini` (ensure test dependencies are installed via `test_requirements.txt`).

## Notes
- Always refer to `README.md` for a high-level overview of the project and setup instructions.
- Detailed documentation for scripts and functionalities can be found in `detail_docs.md` (if available).
- Ensure any changes to directory structures or configurations are updated in this cheatsheet for future reference.
