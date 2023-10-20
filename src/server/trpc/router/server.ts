import { authedProcedure, t } from '../trpc';
import { z } from 'zod';
import { randomBytes } from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User as IUser } from '@prisma/client';

export type User = {
  user: IUser | null;
  role: 'owner' | 'member';
};

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
  getMembers: authedProcedure
    .input(z.object({ serverId: z.string() }))
    .query(async ({ ctx, input }) => {
      const server = await ctx.prisma.server.findUnique({
        where: {
          id: input.serverId,
        },
      });

      if (!server) return { success: false };

      const _members = await ctx.prisma.serverMember.findMany({
        where: {
          serverId: server.id,
        },
      });

      const detailedMembers: User[] = await Promise.all(
        _members.map(async (member) => {
          const user = await ctx.prisma.user.findUnique({
            where: {
              id: member.userId,
            },
          });

          return {
            user: user,
            role: 'member',
          };
        }),
      );

      detailedMembers.push({
        user: await ctx.prisma.user.findUnique({
          where: {
            id: server.ownerId,
          },
        }),
        role: 'owner',
      });

      return detailedMembers.sort((a, b) =>
        a!.user!.name!.localeCompare(b!.user!.name!),
      );
    }),
  kickMember: authedProcedure
    .input(
      z.object({
        serverId: z.string(),
        userId: z.string(),
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
        await ctx.prisma.serverMember.delete({
          where: {
            serverId: server.id,
            userId: input.userId,
          },
        });
        return { success: true };
      } else return { success: false };
    }),
  getAllWebSocketMembers: authedProcedure.query(async () => {
    const onlineMembers = await fetch('http://localhost:8080/getClients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: process.env.WS_AUTH_TOKEN!,
      },
    });

    const onlineMembersJson = await onlineMembers.json();

    return onlineMembersJson.map((member: { id: string; userId: string }) => {
      return member.userId;
    });
  }),
  getWebSockets: authedProcedure.query(async () => {
    const clients = await fetch('http://localhost:8080/getClients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authorization: process.env.WS_AUTH_TOKEN!,
      },
    });

    const clientsJson = await clients.json();

    return clientsJson;
  }),
});
