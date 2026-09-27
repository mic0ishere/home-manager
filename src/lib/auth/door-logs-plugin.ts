import type { BetterAuthPlugin } from "better-auth";

export interface DoorOpeningLog {
  id: string;
  doorId: string;
  userEmail: string;
  userName?: string | null;
  createdAt: Date;
}

export const doorLogsPlugin = () => {
  return {
    id: "door-logs",
    schema: {
      doorOpeningLog: {
        fields: {
          doorId: {
            type: "string",
            required: true,
          },
          userEmail: {
            type: "string",
            required: true,
          },
          userName: {
            type: "string",
            required: false,
          },
          createdAt: {
            type: "date",
            required: true,
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};
