import { TextMessage, User } from '@prisma/client';
import classNames from 'classnames';
import { FC } from 'react';
import Markdown from 'react-markdown';
import MarkdownCSS from '../styles/markdown.module.css';

type MessageProps = {
  message: TextMessage & {
    author: User;
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
          <div className='flex items-end gap-x-3'>
            <span className='font-bold text-black dark:text-white'>
              {message.author.name}
            </span>
            <span className='text-slate-700 dark:text-slate-400 text-sm'>
              {new Date(message.createdTimestamp).toLocaleString()}
            </span>
          </div>
          {/* eslint-disable-next-line react/no-children-prop */}
          <div className='text-black dark:text-[#DADADA]'>
            <Markdown className={MarkdownCSS.markdown} skipHtml>
              {message.content}
            </Markdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
