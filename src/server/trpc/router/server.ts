import { authedProcedure, t } from '../trpc';
import { z } from 'zod';

export const serverRouter = t.router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const server = await ctx.prisma.server.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
        },
      });

      return server;
    }),
  getAccessible: authedProcedure.query(async ({ ctx }) => {
    // todo: access perms

    // for now, just give access to all channels
    return await ctx.prisma.server.findMany();
  }),
  delete: authedProcedure
    .input(
      z.object({
        serverId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const server = await ctx.prisma.server.findUnique({
        where: {
          id: input.serverId,
        },
      });

      if (!server) return { success: false };

      if (server.ownerId === ctx.session.user.id) {
        await ctx.prisma.server.delete({
          where: {
            id: server.id,
          },
        });

        return { success: true };
      } else return { success: false };
    }),
});
