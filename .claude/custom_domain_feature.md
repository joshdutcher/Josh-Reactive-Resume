# Implementing Custom Domains for Resumes

This document outlines three potential approaches to allow users to map custom domains to their resumes.

### Approach 1: Integrated Reverse Proxy with Domain Verification

This is the most robust and user-friendly approach. It involves integrating the custom domain functionality directly into the application and providing a seamless experience for the user.

**1. Database:**
-   Add a new, unique `domain` field to the `Resume` model in `tools/prisma/schema.prisma`.

**2. Backend:**
-   A new controller would be created to handle requests for custom domains. It would look up the resume based on the `Host` header of the incoming request.
-   A new protected endpoint (e.g., `PATCH /resume/:id/domain`) would allow users to set or update their custom domain.
-   This endpoint would trigger a DNS lookup to verify that the user has correctly configured their domain's `CNAME` record to point to the application.

**3. Frontend:**
-   A new "Custom Domain" section would be added to the "Sharing" page in the resume builder.
-   This section would provide an input for the user to enter their domain and would display the required `CNAME` record.

**4. Reverse Proxy:**
-   The existing Traefik reverse proxy would be configured to handle wildcard domains, routing all custom domain traffic to the backend server.

**Pros:**
-   Seamless user experience.
-   High level of security through domain verification.
-   Scalable and robust.

**Cons:**
-   Highest implementation complexity, touching all parts of the stack.

### Approach 2: User-Managed Reverse Proxy (BYO)

This approach simplifies the backend implementation by offloading the responsibility of domain routing to the user.

**1. Database:**
-   Same as Approach 1: add a `domain` field to the `Resume` model.

**2. Backend:**
-   An endpoint to update the `domain` field would be created, but the server would *not* handle incoming requests for those domains.

**3. Frontend:**
-   The UI would allow a user to associate a domain with their resume.
-   Instead of DNS records, the UI would provide instructions on how to configure a personal reverse proxy (like Nginx or Caddy) to point their domain to the resume's public URL (`/u/{username}/{slug}`).

**Pros:**
-   Reduced backend complexity.
-   No need for wildcard domain configuration on the application's reverse proxy.

**Cons:**
-   Significantly poorer user experience, requiring advanced technical knowledge.
-   No domain ownership verification, which could be a security risk.

### Approach 3: Subdomain-based "Pretty" URLs

This approach offers a simpler way to provide users with a more professional-looking URL, but does not allow for fully custom domains.

**1. Database:**
-   The `slug` field on the `Resume` model would need to be made globally unique, rather than unique per user.

**2. Backend:**
-   The server would be configured to handle wildcard subdomains (e.g., `*.your-app.com`).
-   A middleware would extract the subdomain from the `Host` header and use it to look up the resume by its `slug`.

**3. Frontend:**
-   The UI would simply display the user's "pretty" URL (e.g., `acme-inc.your-app.com`).

**Pros:**
-   Simpler to implement than a full custom domain solution.
-   No DNS configuration required for the user.

**Cons:**
-   Does not meet the requirement of using a completely custom domain.
-   Requires a significant change to the database schema to enforce globally unique slugs.

### Recommendation

**Approach 1** is the recommended path. While it is the most complex, it is the only one that fully meets the user's request in a secure and user-friendly manner, aligning with the kind of experience provided by platforms like Railway.
