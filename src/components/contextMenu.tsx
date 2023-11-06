import { User } from '@prisma/client';
import { User as ServerUser } from '../server/trpc/router/server';
import * as CM from '@radix-ui/react-context-menu';
import { Link, MessageEdit, Trash, UserRemove } from 'iconsax-react';
import { useSession } from 'next-auth/react';
import { FC } from 'react';

type ContextMenuProps = {
  type: 'message' | 'channel' | 'member';
  author?: Omit<User, 'email' | 'emailVerified'>;
  member?: Omit<User, 'email' | 'emailVerified'>;
  currentUser?: ServerUser | null;
  onClick: (e: MouseEvent, type: string) => void;
};
export const ContextMenu: FC<ContextMenuProps> = ({
  type,
  author,
  member,
  currentUser,
  onClick,
}) => {
  const { data: session } = useSession();

  if (type === 'message') {
    return (
      <CM.Portal>
        <CM.Content className='z-40 w-56 min-w-max gap-x-1 rounded-md border border-gray-400 bg-gray-200 py-1 shadow-sm outline-none'>
          {session?.user?.id === author?.id ? (
            <CM.Item
              className='text-md cursor-base flex h-8 w-full flex-shrink-0 flex-col items-start px-3 text-left focus:bg-neutral-100 focus:outline-none'
              onClick={(e) => onClick(e as unknown as MouseEvent, 'edit')}
            >
              <span className='mr-2 flex flex-1 flex-row items-center justify-start gap-x-1'>
                Edit
                <MessageEdit
                  color='currentColor'
                  className='h-3.5 w-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
                />
              </span>
            </CM.Item>
          ) : null}
          <CM.Item
            className='text-md cursor-base flex h-8 w-full flex-shrink-0 flex-col items-start px-3 text-left focus:bg-neutral-100 focus:outline-none'
            onClick={(e) => onClick(e as unknown as MouseEvent, 'copy')}
          >
            <span className='mr-2 flex flex-1 flex-row items-center justify-start gap-x-1'>
              Copy Message Link
              <Link
                color='currentColor'
                className='h-3.5 w-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
              />
            </span>
          </CM.Item>
          {session?.user?.id === author?.id ? (
            <CM.Item
              className='text-md cursor-base flex h-8 w-full flex-shrink-0 flex-col items-start px-3 text-left focus:bg-neutral-100 focus:outline-none'
              onClick={(e) => onClick(e as unknown as MouseEvent, 'delete')}
            >
              <span className='mr-2 flex flex-1 flex-row items-center justify-start gap-x-1 text-red-500 hover:text-red-600'>
                Delete Message
                <Trash
                  color='currentColor'
                  className='h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600'
                />
              </span>
            </CM.Item>
          ) : null}
        </CM.Content>
      </CM.Portal>
    );
  } else if (type === 'member') {
    return (
      <CM.Portal>
        <CM.Content className='z-40 w-56 min-w-max gap-x-1 rounded-md border border-gray-400 bg-gray-200 py-1 shadow-sm outline-none'>
          {currentUser?.user?.id === session?.user?.id &&
          currentUser?.role === 'owner' &&
          member?.id !== currentUser.user?.id ? (
            <CM.Item
              className='text-md cursor-base flex h-8 w-full flex-shrink-0 flex-col items-start px-3 text-left focus:bg-neutral-100 focus:outline-none'
              onClick={(e) => onClick(e as unknown as MouseEvent, 'kick')}
            >
              <span className='mr-2 flex flex-1 flex-row items-center justify-start gap-x-1'>
                Remove User
                <UserRemove
                  color='currentColor'
                  className='h-5 w-5 cursor-pointer text-red-500 hover:text-red-600'
                />
              </span>
            </CM.Item>
          ) : null}
          <CM.Item
            className='text-md cursor-base flex h-8 w-full flex-shrink-0 flex-col items-start px-3 text-left focus:bg-neutral-100 focus:outline-none'
            onClick={(e) => onClick(e as unknown as MouseEvent, 'copy')}
          >
            <span className='mr-2 flex flex-1 flex-row items-center justify-start gap-x-1'>
              Copy User ID
              <Link
                color='currentColor'
                className='h-3.5 w-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
              />
            </span>
          </CM.Item>
        </CM.Content>
      </CM.Portal>
    );
  } else {
    return null;
  }
};
