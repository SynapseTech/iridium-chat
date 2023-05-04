import { User } from '@prisma/client';
import * as CM from '@radix-ui/react-context-menu';
import { Link, MessageEdit, Trash } from 'iconsax-react';
import { useSession } from 'next-auth/react';
import { FC } from 'react';

type ContextMenuProps = {
  type: 'message' | 'channel';
  author: User;
  onClick: (e: MouseEvent, type: string) => void;
};
export const ContextMenu: FC<ContextMenuProps> = ({ type, author, onClick }) => {
  const { data: session } = useSession();

  if (type === 'message') {
    return (
      <CM.Portal>
        <CM.Content className='z-40 w-56 min-w-max py-1 rounded-md shadow-sm outline-none bg-gray-200 border border-gray-400 gap-x-1'>
          {session?.user?.id === author.id ?
            <CM.Item className='flex flex-col items-start w-full px-3 flex-shrink-0 text-md text-left cursor-base focus:outline-none focus:bg-neutral-100 h-8'
              onClick={(e) => onClick((e as unknown as MouseEvent), 'edit')}>
              <span className='flex flex-row flex-1 mr-2 justify-start items-center gap-x-1'>Edit<MessageEdit
                color='currentColor'
                className='w-3.5 h-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
              /></span>
            </CM.Item> : null}
          <CM.Item className='flex flex-col items-start w-full px-3 flex-shrink-0 text-md text-left cursor-base focus:outline-none focus:bg-neutral-100 h-8'
            onClick={(e) => onClick((e as unknown as MouseEvent), 'copy')}>
            <span className='flex flex-row flex-1 mr-2 justify-start items-center gap-x-1'>Copy Message Link<Link
              color='currentColor'
              className='w-3.5 h-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
            /></span>
          </CM.Item>
          {session?.user?.id === author.id ?
            <CM.Item className='flex flex-col items-start w-full px-3 flex-shrink-0 text-md text-left cursor-base focus:outline-none focus:bg-neutral-100 h-8'
              onClick={(e) => onClick((e as unknown as MouseEvent), 'delete')}>
              <span className='flex flex-row flex-1 mr-2 justify-start items-center gap-x-1 text-red-500 hover:text-red-600'>Delete Message<Trash
                color='currentColor'
                className='w-3.5 h-3.5 cursor-pointer text-red-500 hover:text-red-600'
              /></span>
            </CM.Item> : null}
        </CM.Content>
      </CM.Portal >
    )
  } else {
    return null;
  }
};
