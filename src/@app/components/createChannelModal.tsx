'use client';
import classNames from 'classnames';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '../../utils/_trpc';

type CreateChannelModalProps = {
  open: boolean;
  onClose?: (channelId?: string) => void;
};

const checkChannelNameErrors = (newChannelName: string): string => {
  let result = '';

  if (newChannelName.trim().length === 0)
    result = 'Channel Name must not be empty.';

  return result;
};

const CreateChannelModal: FC<CreateChannelModalProps> = ({
  open = false,
  onClose,
}) => {
  const [channelName, setChannelName] = useState<string>('');
  const [channelNameError, setChannelNameError] = useState<string>(
    checkChannelNameErrors(channelName),
  );
  const createChannelMutation = trpc.channel.create.useMutation();

  const close = (id?: string) => {
    setChannelName('');
    setChannelNameError('');
    onClose?.(id);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (channelNameError.length > 0) return;
    const channel = await createChannelMutation.mutateAsync({
      name: channelName.trim(),
    });
    close(channel.id);
  };

  const updateChannelName = (e: ChangeEvent) => {
    const newName = (e.target as HTMLInputElement).value;
    setChannelName(newName);
    setChannelNameError(checkChannelNameErrors(newName));
  };

  return (
    <div
      className={classNames(
        'hs-overlay w-full h-full fixed top-0 left-0 z-[60] overflow-x-hidden overflow-y-auto bg-black bg-opacity-25',
        { hidden: !open },
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={classNames(
          'duration-500 mt-0 ease-out transition-all sm:max-w-lg sm:w-full m-3 sm:mx-auto min-h-[calc(100%-3.5rem)] flex items-center',
          open ? 'opacity-100 mt-7' : 'opacity-0',
        )}
      >
        <form
          onSubmit={submit}
          className='flex flex-col w-full bg-white border shadow-sm rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:shadow-slate-700/[.7]'
        >
          <div className='flex justify-between items-center py-3 px-4 border-b dark:border-gray-700'>
            <h3 className='font-bold text-gray-800 dark:text-white'>
              Create a Channel
            </h3>
            <button
              type='button'
              className='hs-dropdown-toggle inline-flex flex-shrink-0 justify-center items-center h-8 w-8 rounded-md text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all text-sm dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800'
              onClick={() => close()}
            >
              <span className='sr-only'>Close</span>
              <FontAwesomeIcon icon={faX} className='w-3.5 h-2.5' />
            </button>
          </div>
          <div className='p-4 overflow-y-auto'>
            <div>
              <label htmlFor='channelNameInput'>Channel Name</label>
              <input
                type='text'
                id='channelNameInput'
                className={classNames(
                  'py-3 px-4 block w-full rounded-md text-sm  dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400',
                  channelNameError.length > 0
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-brand-600 focus:ring-brand-600',
                )}
                placeholder='Channel Name'
                value={channelName}
                onChange={updateChannelName}
              />
              {channelNameError.length > 0 && (
                <p className='text-sm text-red-600 mt-2'>{channelNameError}</p>
              )}
            </div>
          </div>
          <div className='flex justify-end items-center gap-x-2 py-3 px-4 border-t dark:border-gray-700'>
            <button
              type='button'
              className='hs-dropdown-toggle py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border font-medium bg-white text-gray-700 shadow-sm align-middle hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-blue-600 transition-all text-sm dark:bg-gray-800 dark:hover:bg-slate-800 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white dark:focus:ring-offset-gray-800'
              onClick={() => close()}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={channelNameError.length > 0}
              className={classNames(
                'py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-brand-600 text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800',
                channelNameError.length > 0 &&
                'cursor-not-allowed bg-brand-200 hover:bg-brand-200',
              )}
            >
              Create Channel{channelName !== '' && ` #${channelName}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChannelModal;
