import { authedProcedure, t } from "../trpc";
import { z } from "zod";
// import { broadcastTestMessage } from "../../socket";

export const messageRouter = t.router({
  getAllTests: authedProcedure.query(({ ctx }) => {
    return ctx.prisma.testMessage.findMany();
  }),
  createTestMessage: authedProcedure.input(z.object({
    content: z.string(),
  })).mutation(async ({ ctx, input }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const message = await ctx.prisma.testMessage.create({
      data: {
        content: input.content,
        authorId: ctx.session.user.id,
      }
    });
    // broadcastTestMessage(message);
  }),
});
