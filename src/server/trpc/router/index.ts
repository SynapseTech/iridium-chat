// src/server/trpc/router/index.ts
import { t } from "../trpc";
import { channelRouter } from "./channel";
import { authRouter } from "./auth";

export const appRouter = t.router({
  channel: channelRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
