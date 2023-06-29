import { authedProcedure, t } from '../trpc';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const serverRouter = t.router({
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const server = await ctx.prisma.server.create({
          data: {
            name: input.name,
            ownerId: ctx.session.user.id,
            inviteLink: randomBytes(6).toString('hex'),
          },
        });
        return server;
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2002') {
            const server = await ctx.prisma.server.create({
              data: {
                name: input.name,
                ownerId: ctx.session.user.id,
                inviteLink: randomBytes(6).toString('hex'),
              },
            });
            return server;
          }
        }
        throw e;
      }
    }),
  getAccessible: authedProcedure.query(async ({ ctx }) => {
    // todo: access perms

    // for now, just give access to all channels
    return await ctx.prisma.server.findMany({
      where: {
        OR: [
          {
            serverMembers: {
              some: {
                userId: ctx.session.user.id,
              },
            },
          },
          { ownerId: ctx.session.user.id },
        ],
      },
    });
  }),
  joinServer: authedProcedure
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

      console.log('[joinServer]', 'Checking for Server', server);
      if (!server) return { success: false };

      const check = await ctx.prisma.serverMember.findFirst({
        where: {
          serverId: server.id,
          userId: ctx.session.user.id,
        },
      });

      console.log('[joinServer]', 'Checking for User in Server', check);
      if (check) return { success: false };

      await ctx.prisma.serverMember.create({
        data: {
          serverId: server.id,
          userId: ctx.session.user.id,
        },
      });
      console.log('[joinServer]', 'User Created');

      return { success: false };
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
