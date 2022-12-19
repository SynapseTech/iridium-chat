import { authedProcedure, t } from '../trpc';
import { z } from 'zod';
import { broadcastMessage } from '../../socket';

export const channelRouter = t.router({
  fetchMessages: authedProcedure
    .input(
      z.object({
        channelId: z.string(),
        start: z.number().default(0),
        count: z.number().default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      const channel = await ctx.prisma.textChannel.findUniqueOrThrow({
        where: {
          id: input.channelId,
        },
        include: {
          messages: {
            orderBy: {
              createdTimestamp: 'desc',
            },
            skip: input.start,
            take: input.count,
            include: {
              author: true,
            },
          },
        },
      });

      return channel.messages.reverse();
    }),
  create: authedProcedure
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.textChannel.create({
        data: {
          name: input.name,
          ownerId: ctx.session.user.id,
        },
      });

      return channel;
    }),
  getAccessible: authedProcedure.query(async ({ ctx }) => {
    // todo: access perms

    // for now, just give access to all channels
    return await ctx.prisma.textChannel.findMany();
  }),
  delete: authedProcedure
    .input(
      z.object({
        channelId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const channel = await ctx.prisma.textChannel.findUnique({
        where: {
          id: input.channelId,
        },
      });

      if (!channel) return { success: false };

      if (channel.ownerId === ctx.session.user.id) {
        await ctx.prisma.textChannel.delete({
          where: {
            id: channel.id,
          },
        });

        return { success: true };
      } else return { success: false };
    }),
  createMessage: authedProcedure
    .input(
      z.object({
        channelId: z.string(),
        content: z.string(),
        nonce: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.textMessage.create({
        data: {
          authorId: ctx.session.user.id,
          content: input.content,
          channelId: input.channelId,
        },
        include: {
          author: true,
        },
      });

      broadcastMessage(message, input.nonce);
      return message;
    }),
});
