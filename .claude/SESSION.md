# Custom Domain Feature for Self-Hosting

## Objective

Implement a simplified custom domain feature tailored for a single-user, self-hosted instance (e.g., on Railway). This will allow the user to point one custom domain to one specific resume.

## Core Strategy

The implementation will offload the complex parts of domain management (network routing, SSL/TLS certificates) to the hosting platform (like Railway, Vercel, etc.). The application will only be responsible for recognizing the custom domain and serving the correct resume. This avoids the need for complex proxy configurations (like Traefik) and on-the-fly certificate generation.

## High-Level Workflow

1.  **Platform Configuration:** The user configures their custom domain in their hosting provider's dashboard, pointing it to the Reactive Resume application instance. The platform handles DNS and SSL.
2.  **Application Configuration:** The user logs into their Reactive Resume instance and, through a new UI in the settings, specifies their custom domain and selects which of their resumes it should point to.
3.  **Serving Content:**
    *   When a request is received at the custom domain (e.g., `www.joshsresume.com`), the application's backend will detect the hostname, look up the associated resume in the database, and serve it.
    *   When a request is received at the default application URL (e.g., `reactive-resume-production-8872.up.railway.app`), the application will serve the standard login page and user dashboard as usual.

## Key Implementation Points

*   **Database:** The `User` model in `prisma.schema` will be updated to store the custom domain and the ID of the target resume.
*   **Backend:** A new middleware will be introduced to inspect the `Host` header and serve the appropriate resume. A new API endpoint will be created to allow the user to update their custom domain settings from the frontend.
*   **Frontend:** New UI components will be added to the user settings page and the resume "Share" dialog to manage the feature.
