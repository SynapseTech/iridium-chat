'use client';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { Add, Hashtag, Moon, Sun1, Trash } from 'iconsax-react';
import { TextChannel } from '@prisma/client';
import { trpc } from '../../utils/_trpc';
import CreateChannelModal from './createChannelModal';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type ApplicationSidebarProps = {
  currentChannelId?: string;
  onChannelSelect?: (channelId: string) => void;
};

const ApplicationSidebar: FC<ApplicationSidebarProps> = ({
  currentChannelId,
  onChannelSelect,
}) => {
  const { data: session } = useSession();
  const [channels, setChannels] = useState<TextChannel[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();
  const [createChannelModalOpen, setCreateChannelModalOpen] =
    useState<boolean>(false);
  const deleteChannelMutation = trpc.channel.delete.useMutation();
  const router = useRouter();

  useEffect(() => {
    setTheme(localStorage.getItem('theme') as 'light' | 'dark' || 'light')
  }, [])
  /**
   * Load accessible channels using tRPC on page load.
   */
  useEffect(() => {
    if (loadChannelsQuery.data) setChannels(loadChannelsQuery.data);
  }, [loadChannelsQuery.data]); // run when data fetch

  return <>
    <CreateChannelModal
      open={createChannelModalOpen}
      onClose={async (id?: string) => {
        setCreateChannelModalOpen(false);
        await loadChannelsQuery.refetch();
        if (id) await router.replace(`/channels/${id}`);
      }}
    />
    <aside className='hs-sidebar w-64 bg-white dark:bg-slate-800 border-r border-gray-200 pt-8 pb-10 overflow-y-auto scrollbar-y flex-col'>
      <div className='px-6'>
        <Link
          href='/'
          className='flex-none flex w-auto content-center text-xl font-semibold dark:text-white'
          aria-label='Iridium'>

          <img
            className='h-8 w-8 inline'
            alt='iridium logo'
            src='/iridium_logo.svg'
          />Iridium
        </Link>
      </div>
      <nav className='p-6 w-full flex flex-col flex-wrap'>
        <ul className='space-y-1.5'>
          {channels.map(({ name, ownerId, id }) => (
            <li key={`channel_${id}`}>
              <a
                className={
                  currentChannelId && currentChannelId === id
                    ? 'w-full cursor-pointer flex items-center gap-x-3.5 py-2 px-2.5 bg-gray-100 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:bg-gray-900 dark:text-white'
                    : 'w-full cursor-pointer flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300'
                }
                onMouseEnter={() => {
                  router.prefetch(`/channels/${id}`);
                }}
                onClick={() => {
                  router.replace(`/channels/${id}`);
                }}
              >
                <Hashtag color='currentColor' className='w-3.5 h-3.5' />
                <div className='flex-grow'>{name}</div>
                {ownerId === session?.user?.id && (
                  <Trash
                    color='currentColor'
                    className='w-3.5 h-3.5 cursor-pointer text-red-500 hover:text-red-600'
                    onClick={() => {
                      deleteChannelMutation
                        .mutateAsync({ channelId: id })
                        .then(async ({ success }) => {
                          if (success) {
                            await loadChannelsQuery.refetch();
                            await router.replace('/channels');
                          }
                        });
                    }}
                  />
                )}
              </a>
            </li>
          ))}
          <li>
            <button
              onClick={() => setCreateChannelModalOpen(true)}
              className='flex items-center gap-x-3.5 py-2 px-2.5 text-sm w-full bg-brand-600 hover:bg-brand-700 text-white rounded-md'
            >
              <Add color='currentColor' className='w-3.5 h-3.5' />
              Create Channel
            </button>
          </li>
          <li>
            <button className='rounded-xl bg-gray-300 bottom-0 p-3' onClick={() => {
              if (localStorage.getItem('theme') === 'dark') {
                localStorage.setItem('theme', 'light');
                setTheme('light');
                document.body.classList.remove('dark');
              } else {
                localStorage.setItem('theme', 'dark');
                setTheme('dark');
                document.body.classList.add('dark');
              }
            }}>
              {theme === 'dark' ? <Sun1 /> : <Moon />}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  </>;
};

export default ApplicationSidebar;
