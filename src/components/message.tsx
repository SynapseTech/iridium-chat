import classNames from 'classnames';
import { FC, useEffect, useState } from 'react';
import { MessageType } from '../hooks/useMessages';
import { MessageEdit, Trash } from 'iconsax-react';
import { trpc } from '../utils/trpc';
import { useSession } from 'next-auth/react';
import MessageBox from './messageBox';
import { ContextMenu } from './contextMenu';
import * as CM from '@radix-ui/react-context-menu';
import { Markdown } from './markdown';
import { isSameDay, format, subDays } from 'date-fns';
import Embed from './embed';

type MessageProps = {
  _key: any;
  message: MessageType;
  pending?: boolean;
};

const Message: FC<MessageProps> = ({ message, pending = false, _key }) => {
  const [hovered, setHovered] = useState(false);
  const deleteMessageMutation = trpc.channel.deleteMessage.useMutation();
  const editMessageMutation = trpc.channel.editMessage.useMutation();
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);

  function editMsg(msg: string) {
    editMessageMutation.mutate({ messageId: message.id, content: msg });
    return {
      sent: true,
    };
  }

  return (
    <div
      className={classNames(
        'px-6 py-2 hover:bg-gray-100 dark:hover:bg-slate-800',
        { 'opacity-50': pending },
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      id={`message_${message.id}`}
      key={_key}
    >
      <CM.Root>
        <CM.Trigger>
          <div className='flex gap-x-3'>
            <img
              key={_key}
              className='inline-block h-12 w-12 rounded-full ring-2 ring-white dark:ring-gray-800'
              src={message.author.image ?? '/placeholder_avatar.svg'}
              alt={`${message.author.name}'s Avatar`}
            />
            <div className='flex flex-col'>
              <div className='flex items-center justify-start gap-x-2'>
                <span className='font-bold text-black dark:text-white'>
                  {message.author.name}
                </span>
                <span className='text-sm text-slate-700 dark:text-slate-400'>
                  {timestampGenerator(new Date(message.createdTimestamp))}{' '}
                  {/*{message.editedTimestamp ? `(Edited) ${new Date(message.createdTimestamp).toLocaleString()}` : ''} */}
                </span>
                {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
                {message.author.id === session!.user!.id && !pending ? (
                  <div
                    className={classNames(
                      'flex h-4 flex-row items-center justify-center gap-x-1 rounded bg-gray-300',
                      { hidden: !hovered },
                    )}
                  >
                    <MessageEdit
                      color='currentColor'
                      className='h-3.5 w-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
                      onClick={() => setEditing(true)}
                    />
                    <Trash
                      color='currentColor'
                      className='h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600'
                      onClick={() => {
                        deleteMessageMutation
                          .mutateAsync({ messageId: message.id })
                          .then(async ({ success }) => {
                            if (success) {
                              return;
                            }
                          });
                      }}
                    />
                  </div>
                ) : null}
              </div>
              {/* eslint-disable-next-line react/no-children-prop */}
              <div className='text-black dark:text-[#DADADA]'>
                {editing ? (
                  <MessageBox
                    channelName=''
                    connecting={false}
                    onSend={editMsg}
                    editing={{ v: true, setEditing, content: message.content }}
                  ></MessageBox>
                ) : (
                  <Markdown>{message.content}</Markdown>
                )}
              </div>
              <div className='flex flex-col gap-y-2'>
                {message.embeds
                  ? message.embeds.map(({ title, description, url }, index) => (
                      <Embed
                        index={index}
                        title={title}
                        description={description}
                        url={url}
                      />
                    ))
                  : null}
              </div>
            </div>
          </div>
        </CM.Trigger>
        <ContextMenu
          type='message'
          author={message.author}
          onClick={(_, type) => {
            if (type === 'edit') {
              setEditing(true);
            }
            if (type === 'delete') {
              deleteMessageMutation
                .mutateAsync({ messageId: message.id })
                .then(async ({ success }) => {
                  if (success) {
                    return;
                  }
                });
            }
            if (type === 'copy') {
              navigator.clipboard.writeText(
                `${document.location.origin}/channels/${message.channelId}/${message.id}`,
              );
            }
          }}
        />
      </CM.Root>
    </div>
  );
};

export default Message;

function timestampGenerator(compare: Date) {
  const today = new Date();
  const yesterday = subDays(today, 1);

  let result = '';
  if (isSameDay(compare, today)) {
    result = `Today at ${format(compare, 'h:mm a')}`;
  } else if (isSameDay(compare, yesterday)) {
    result = `Yesterday at ${format(compare, 'h:mm a')}`;
  } else {
    result = `${compare.toLocaleDateString()} ${compare.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }

  return result;
}
