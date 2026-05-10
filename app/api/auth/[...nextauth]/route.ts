/**
 * NextAuth v5 catch-all route — delegates GET and POST to the auth handlers.
 */

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
