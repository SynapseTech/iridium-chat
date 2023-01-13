import { TextMessage, User } from '@prisma/client';
import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import MarkdownCSS from '../styles/markdown.module.css';
import Link from 'next/link';
import remarkGfm from 'remark-gfm';
import { RawEmbed } from '../server/trpc/router/channel';

type MessageProps = {
  message: TextMessage & {
    author: User;
    embeds: RawEmbed[]
  };
  pending?: boolean;
};

const Message: FC<MessageProps> = ({ message, pending = false }) => {
  return (
    <div
      className={classNames('py-2 px-6', { 'opacity-50': pending })}
      id={`message_${message.id}`}
    >
      <div className='flex gap-x-3'>
        <img
          className='inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800'
          src={message.author.image ?? '/placeholder_avatar.svg'}
          alt={`${message.author.name}'s Avatar`}
        />
        <div className='flex flex-col'>
          <div className='flex justify-start items-center gap-x-2'>
            <span className='font-bold text-black dark:text-white'>
              {message.author.name}
            </span>
            <span className='text-slate-700 dark:text-slate-400 text-sm'>
              {new Date(message.createdTimestamp).toLocaleString()}
            </span>
          </div>
          {/* eslint-disable-next-line react/no-children-prop */}
          <div className='text-black dark:text-[#DADADA]'>
            <Markdown className={MarkdownCSS.markdown} skipHtml remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
              {message.content}
            </Markdown>
          </div>
          <div className='flex flex-col gap-y-2'>
            {pending === false ? message.embeds.map(({ title, description, url }, index) => (
              <div className='dark:bg-slate-700 bg-gray-300 rounded-xl dark:text-white w-[500px] py-1' key={index}>
                <div className='p-4 flex-col flex'>
                  <p className='text-blue-500 font-bold text-xl hover:underline'><Link href={url}>{title}</Link></p>
                  <br></br>
                  <span className='text-sm'>{description}</span>
                </div>
              </div>
            )) : null}
          </div>
        </div>
      </div >
    </div >
  );
};

export default Message;
