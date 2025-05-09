# Tech Stack

## Frontend Framework
- **Next.js:** React framework for server-side rendering, static site generation, and routing (App Router).
- **React:** JavaScript library for building user interfaces.
- **TypeScript:** Superset of JavaScript adding static typing.

## UI Components & Styling
- **Tailwind CSS:** Utility-first CSS framework.
- **Shadcn/ui:** Re-usable components built using Radix UI and Tailwind CSS. (Inferred from `components.json` and `registry/` folder)
- **Radix UI:** Unstyled, accessible UI primitives.
- **Lucide Icons:** Icon library.
- **Recharts:** Composable charting library.

## State Management
- **React Context API:** Used for `AuthContext`.
- **Zustand:** Small, fast state-management solution (dependency found in `package.json`).
- **SWR:** React Hooks for data fetching (used in page components like enrollments, study plans).

## Forms & Validation
- **React Hook Form:** Library for managing form state and validation.
- **Zod:** TypeScript-first schema declaration and validation library.

## API Communication
- **Axios:** Promise-based HTTP client for making API requests.

## Authentication
- **JWT (JSON Web Tokens):** Used for securing API requests (inferred from `AuthContext` and `api-client`).
- **Cookies & LocalStorage:** Used for storing authentication tokens and user data.

## Development Tools
- **ESLint:** Code linting.
- **tsx:** TypeScript execution for scripts.
