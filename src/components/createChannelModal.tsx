import classNames from 'classnames';
import { ChangeEvent, FC, FormEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { trpc } from '../utils/trpc';

type CreateChannelModalProps = {
  open: boolean;
  serverId: string;
  onClose?: (channelId?: string) => void;
};

const checkChannelNameErrors = (newChannelName: string): string => {
  let result = '';

  if (newChannelName.trim().length === 0)
    result = 'Channel Name must not be empty.';

  return result;
};

const CreateChannelModal: FC<CreateChannelModalProps> = ({
  serverId,
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
      serverId,
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
        'hs-overlay fixed left-0 top-0 z-[60] h-full w-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-25',
        { hidden: !open },
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className={classNames(
          'm-3 mt-0 flex min-h-[calc(100%-3.5rem)] items-center transition-all duration-500 ease-out sm:mx-auto sm:w-full sm:max-w-lg',
          open ? 'mt-7 opacity-100' : 'opacity-0',
        )}
      >
        <form
          onSubmit={submit}
          className='flex w-full flex-col rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:shadow-slate-700/[.7]'
        >
          <div className='flex items-center justify-between border-b px-4 py-3 dark:border-gray-700'>
            <h3 className='font-bold text-gray-800 dark:text-white'>
              Create a Channel
            </h3>
            <button
              type='button'
              className='hs-dropdown-toggle inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-sm text-gray-500 transition-all hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-gray-700 dark:focus:ring-offset-gray-800'
              onClick={() => close()}
            >
              <span className='sr-only'>Close</span>
              <FontAwesomeIcon icon={faX} className='h-2.5 w-3.5' />
            </button>
          </div>
          <div className='overflow-y-auto p-4'>
            <div>
              <label htmlFor='channelNameInput' className='dark:text-white'>
                Channel Name
              </label>
              <input
                type='text'
                id='channelNameInput'
                className={classNames(
                  'block w-full rounded-md px-4 py-3 text-sm  dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400',
                  channelNameError.length > 0
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-200 focus:border-brand-600 focus:ring-brand-600',
                )}
                placeholder='Channel Name'
                value={channelName}
                onChange={updateChannelName}
              />
              {channelNameError.length > 0 && (
                <p className='mt-2 text-sm text-red-600'>{channelNameError}</p>
              )}
            </div>
          </div>
          <div className='flex items-center justify-end gap-x-2 border-t px-4 py-3 dark:border-gray-700'>
            <button
              type='button'
              className='hs-dropdown-toggle inline-flex items-center justify-center gap-2 rounded-md border bg-white px-4 py-3 align-middle text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:ring-offset-gray-800'
              onClick={() => close()}
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={channelNameError.length > 0}
              className={classNames(
                'inline-flex items-center justify-center gap-2 rounded-md border border-transparent bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-2 dark:focus:ring-offset-gray-800',
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
