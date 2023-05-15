import { authedProcedure, t } from '../trpc';
import { z } from 'zod';
import { JSDOM } from 'jsdom';


export type RawEmbed = { title: string; description: string; image: string; url: string; };

const URLRegex = /((http|https):\/\/+)([\w\d-]+\.)*[\w-]+[\.\:]\w+([\/\?\=\&\#.]?[\w-]+)*\/?/gm;

function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[]
): Omit<User, Key> {
  for (let key of keys) {
    delete user[key]
  }
  return user
}

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

      const messages = Promise.all(channel.messages.reverse().map(async (message) => {
        const URLs: string[] = [];
        let m;
        while ((m = URLRegex.exec(message.content)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === URLRegex.lastIndex) {
            URLRegex.lastIndex++;
          }

          // The result can be accessed through the `m`-variable.
          m.forEach((match, groupIndex) => {
            if (groupIndex === 0) URLs.push(match);
          });
        }

        const URLEmbeds: Promise<RawEmbed[]> = Promise.all(URLs.map(async (url) => {
          try {
            const _data = await fetch(url);
            const html = await _data.text();
            const doc = (new JSDOM(html)).window.document;
            const title = (doc.head.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content ?? doc.title;
            const description = (doc.head.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content ?? (doc.head.querySelector('meta[name="description"]') as HTMLMetaElement)?.content;
            const image = (doc.head.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content ?? (doc.head.querySelector('meta[name="twitter:image"]') as HTMLMetaElement)?.content;
            return { title, description, image, url };
          } catch (e) {
            return { title: '', description: '', image: '', url: '' };
          }
        }));

        const embeds = await (await URLEmbeds).filter((embed) => embed.url.length !== 0);

        return {
          ...message,
          author: exclude(message.author, ['email', 'emailVerified']),
          embeds,
        }
      }));

      return await messages;
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

      const URLs: string[] = [];
      let m;
      while ((m = URLRegex.exec(message.content)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === URLRegex.lastIndex) {
          URLRegex.lastIndex++;
        }

        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
          if (groupIndex === 0) URLs.push(match);
        });
      }

      const URLEmbeds: Promise<RawEmbed[]> = Promise.all(URLs.map(async (url) => {
        try {
          const _data = await fetch(url);
          const html = await _data.text();
          const doc = (new JSDOM(html)).window.document;
          const title = (doc.head.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content ?? doc.title;
          const description = (doc.head.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content ?? (doc.head.querySelector('meta[name="description"]') as HTMLMetaElement)?.content;
          const image = (doc.head.querySelector('meta[property="og:image"]') as HTMLMetaElement)?.content ?? (doc.head.querySelector('meta[name="twitter:image"]') as HTMLMetaElement)?.content;
          return { title, description, image, url };
        } catch (e) {
          return { title: '', description: '', image: '', url: '' };
        }
      }));

      const embeds = await (await URLEmbeds).filter((embed) => embed.url.length !== 0);

      const finalMsg = { ...message, embeds: embeds };

      await fetch(`http://localhost:8080/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': process.env.WS_AUTH_TOKEN!,
        },
        body: JSON.stringify({
          type: 'createMessage',
          data: finalMsg,
          nonce: input.nonce,
        }),
      });
      return {
        ...message,
        author: exclude(message.author, ['email', 'emailVerified']),
      };
    }),
  deleteMessage: authedProcedure
    .input(
      z.object({
        messageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.textMessage.findUnique({
        where: {
          id: input.messageId,
        },
      });

      if (!message) return { success: false };

      if (message.authorId === ctx.session.user.id) {
        await ctx.prisma.textMessage.delete({
          where: {
            id: message.id,
          },
        });

        await fetch(`http://localhost:8080/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.WS_AUTH_TOKEN!,
          },
          body: JSON.stringify({
            type: 'deleteMessage',
            data: { id: message.id },
          }),
        });
        return { success: true }
      } else return { success: false };
    }),
  editMessage: authedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.textMessage.findUnique({
        where: {
          id: input.messageId,
        },
        include: {
          author: true,
        },
      });

      if (!message) return { success: false };

      if (message.authorId === ctx.session.user.id) {
        await ctx.prisma.textMessage.update({
          where: {
            id: message.id,
          },
          data: {
            content: input.content,
            //Edited Timestamps need to be added to the database/
            //editedTimestamp: new Date(),
          },
        });

        await fetch(`http://localhost:8080/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'authorization': process.env.WS_AUTH_TOKEN!,
          },
          body: JSON.stringify({
            type: 'editMessage',
            data: message,
          }),
        });
        return { success: true }
      } else return { success: false };
    }),
});
