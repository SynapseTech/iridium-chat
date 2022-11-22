import { authedProcedure, t } from "../trpc";
import { z } from "zod";

export const channelRouter = t.router({
  fetchMessages: t.procedure
    .input(z.object({ 
      channelId: z.string(),
      start: z.number().default(0),
      count: z.number().default(50),
    })).query(async ({ input, ctx }) => {
      const channel = await ctx.prisma.textChannel.findUniqueOrThrow({
        where: {
          id: input.channelId,
        },
        include: {
          messages: {
            orderBy: {
              createdTimestamp: 'asc',
            },
            skip: input.start,
            take: input.count,
            include: {
              author: true,
            }
          },
        },
      });

      return channel.messages;
    }),
  create: authedProcedure.input(z.object({
    name: z.string()
  })).mutation(async ({ ctx, input }) => {

  }),
});
