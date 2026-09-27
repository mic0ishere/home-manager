import { createAuthClient } from "better-auth/react";
import { passkeyClient } from "@better-auth/passkey/client";
import { adminClient, magicLinkClient } from "better-auth/client/plugins";

import { ac, roles } from "./auth/permissions";

export const authClient = createAuthClient({
  plugins: [
    passkeyClient(),
    magicLinkClient(),
    adminClient({ ac, roles }),
  ],
});
