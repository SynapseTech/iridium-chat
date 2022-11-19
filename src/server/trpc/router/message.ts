import { authedProcedure, t } from "../trpc";
import { z } from "zod";
import { broadcastTestMessage } from "../../socket";

export const messageRouter = t.router({
  getAllTests: authedProcedure.query(({ ctx }) => {
    return ctx.prisma.testMessage.findMany();
  }),
  createTestMessage: authedProcedure.input(z.object({
    content: z.string(),
  })).mutation(async ({ ctx, input }) => {
    const message = await ctx.prisma.testMessage.create({
      data: {
        content: input.content,
        authorId: ctx.session.user.id,
      }
    });
    broadcastTestMessage(message);
  }),
});
