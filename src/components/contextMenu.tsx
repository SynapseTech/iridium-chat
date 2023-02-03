import * as CM from '@radix-ui/react-context-menu';
import { MessageEdit, Trash } from 'iconsax-react';
import { FC } from 'react';

type ContextMenuProps = {
  type: 'message' | 'channel';
  onClick: (e: MouseEvent, type: string) => void;
};
export const ContextMenu: FC<ContextMenuProps> = ({ type, onClick }) => {
  if (type === 'message') {
    return (
      <CM.Portal>
        <CM.Content className='z-40 w-56 min-w-max py-1 rounded-md shadow-sm outline-none bg-gray-200 border border-gray-400 gap-x-1'>
          <CM.Item className='flex flex-col items-start w-full px-3 flex-shrink-0 text-md text-left cursor-base focus:outline-none focus:bg-neutral-100 h-8'
            onClick={(e) => onClick((e as unknown as MouseEvent), 'edit')}>
            <span className='flex flex-row flex-1 mr-2 justify-start items-center gap-x-1'>Edit<MessageEdit
              color='currentColor'
              className='w-3.5 h-3.5 cursor-pointer text-gray-500 hover:text-gray-600'
            /></span>
          </CM.Item>
          <CM.Item className='flex flex-col items-start w-full px-3 flex-shrink-0 text-md text-left cursor-base focus:outline-none focus:bg-neutral-100 h-8'
            onClick={(e) => onClick((e as unknown as MouseEvent), 'delete')}>
            <span className='flex flex-row flex-1 mr-2 justify-start items-center gap-x-1'>Delete<Trash
              color='currentColor'
              className='w-3.5 h-3.5 cursor-pointer text-red-500 hover:text-red-600'
            /></span>
          </CM.Item>
        </CM.Content>
      </CM.Portal>
    )
  } else {
    return null;
  }
};
