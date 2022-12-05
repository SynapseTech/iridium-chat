import { FC } from 'react';

export const LoadingMessage: FC = () => {
  return (
    <div className='animate-pulse flex gap-x-4 py-4 px-6'>
      <div className='rounded-full bg-gray-300 h-10 w-10'></div>
      <div className='flex-1 space-y-4 py-1'>
        <div className='h-4 bg-gray-300 rounded w-[100px]'></div>
        <div className='space-y-2'>
          <div className='h-4 bg-gray-300 rounded w-[160px]'></div>
        </div>
      </div>
    </div>
  );
};
