# Project Overview

Reactive Resume is a free and open-source resume builder that simplifies the process of creating, updating, and sharing your resume. It is a monorepo project that uses `pnpm` workspaces, `nx` for task running, and Docker for development and deployment.

The project consists of three main applications:
- `client`: The main frontend application built with React (Vite).
- `server`: The backend application built with NestJS.
- `artboard`: A design-related tool or a separate part of the application.

It also includes several shared libraries:
- `dto`: Data transfer objects.
- `hooks`: Shared React hooks.
- `parser`: A parser library.
- `schema`: Database schema definitions.
- `ui`: Shared UI components.
- `utils`: Utility functions.

# Building and Running

## Prerequisites

- Docker (with Docker Compose)
- Node.js 20 or higher (with pnpm)

## Development

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Copy `.env.example` to `.env`:**
    ```bash
    cp .env.example .env
    ```
    Review and update the environment variables in `.env` if necessary.

3.  **Start the development services:**
    ```bash
    docker compose -f tools/compose/development.yml --env-file .env -p reactive-resume up -d
    ```

4.  **Run the development server:**
    ```bash
    pnpm prisma:migrate:dev
    pnpm dev
    ```
    The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3000`.

## Building

To build the applications, run the following command:

```bash
pnpm build
```

## Testing

To run the tests, use the following command:

```bash
pnpm test
```

# Development Conventions

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Please follow this format for your commit messages.

## Linting and Formatting

- To lint the code, run `pnpm lint`.
- To fix linting errors, run `pnpm lint:fix`.
- To format the code, run `pnpm format`.
- To fix formatting errors, run `pnpm format:fix`.
