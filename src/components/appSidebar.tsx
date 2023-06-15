import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { Add, Hashtag, Moon, Sun1, Trash } from 'iconsax-react';
import { Server, TextChannel } from '@prisma/client';
import { trpc } from '../utils/trpc';
import CreateServerModal from './createServerModal';
import CreateChannelModal from './createChannelModal';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

type ApplicationSidebarProps = {
  currentServerId?: string;
  onServerSelect?: (serverId: string) => void;
  isServerSelected?: boolean;
  currentChannelId?: string;
  onChannelSelect?: (channelId: string) => void;
};

const ApplicationSidebar: FC<ApplicationSidebarProps> = ({
  currentChannelId,
  onChannelSelect,
  currentServerId,
  isServerSelected,
}) => {
  const { data: session } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<TextChannel[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const loadServersQuery = trpc.server.getAccessible.useQuery();
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();
  const [createServerModalOpen, setCreateServerModalOpen] =
    useState<boolean>(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] =
    useState<boolean>(false);
  const deleteServerMutation = trpc.server.delete.useMutation();
  const deleteChannelMutation = trpc.channel.delete.useMutation();
  const router = useRouter();

  useEffect(() => {
    setTheme((localStorage.getItem('theme') as 'light' | 'dark') || 'light');
  }, []);
  /**
   * Load accessible servers using tRPC on page load.
   */
  useEffect(() => {
    if (loadServersQuery.data) setServers(loadServersQuery.data);
  }, [loadServersQuery.data]); // run when data fetch
  /**
   * Load accessible channels using tRPC on page load.
   */
  useEffect(() => {
    if (loadChannelsQuery.data) setServers(loadChannelsQuery.data);
  }, [loadChannelsQuery.data]); // run when data fetch

  return (
    <>
      <CreateServerModal
        open={createServerModalOpen}
        onClose={async (id?: string) => {
          setCreateServerModalOpen(false);
          await loadServersQuery.refetch();
          if (id) await router.replace(`/server/${id}`);
        }}
      />
      <CreateChannelModal
        open={createChannelModalOpen}
        onClose={async (id?: string) => {
          setCreateChannelModalOpen(false);
          await loadChannelsQuery.refetch();
          if (id)
            await router.replace(`/server/${currentServerId}/channel/${id}`);
        }}
      />
      <aside className='hs-sidebar scrollbar-y w-64 flex-col overflow-y-auto border-r border-gray-200 bg-white pb-10 pt-8 dark:bg-slate-800'>
        <div className='px-6'>
          <Link
            href='/'
            className='flex w-auto flex-none content-center text-xl font-semibold dark:text-white'
            aria-label='Iridium'
          >
            <img
              className='inline h-8 w-8'
              alt='iridium logo'
              src='/iridium_logo.svg'
            />
            Iridium
          </Link>
        </div>
        <nav className='flex w-full flex-col flex-wrap p-6'>
          <ul className='space-y-1.5'>
            {servers.map(({ name, ownerId, id }) => (
              <li key={`server_${id}`}>
                <a
                  className={
                    currentServerId && currentServerId === id
                      ? 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md bg-gray-100 px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-white'
                      : 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-gray-900 dark:hover:text-slate-300'
                  }
                  onMouseEnter={() => {
                    router.prefetch(`/server/${id}`);
                  }}
                  onClick={() => {
                    router.replace(`/server/${id}`);
                  }}
                >
                  <Hashtag color='currentColor' className='h-3.5 w-3.5' />
                  <div className='flex-grow'>{name}</div>
                  {ownerId === session?.user?.id && (
                    <Trash
                      color='currentColor'
                      className='h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600'
                      onClick={() => {
                        deleteServerMutation
                          .mutateAsync({ serverId: id })
                          .then(async ({ success }) => {
                            if (success) {
                              await loadServersQuery.refetch();
                              await router.replace('/server');
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
                className='flex w-full items-center gap-x-3.5 rounded-md bg-brand-600 px-2.5 py-2 text-sm text-white hover:bg-brand-700'
              >
                <Add color='currentColor' className='h-3.5 w-3.5' />
                Create Server
              </button>
            </li>
            <li>
              <button
                className='bottom-0 rounded-xl bg-gray-300 p-3'
                onClick={() => {
                  if (localStorage.getItem('theme') === 'dark') {
                    localStorage.setItem('theme', 'light');
                    setTheme('light');
                    document.body.classList.remove('dark');
                  } else {
                    localStorage.setItem('theme', 'dark');
                    setTheme('dark');
                    document.body.classList.add('dark');
                  }
                }}
              >
                {theme === 'dark' ? <Sun1 /> : <Moon />}
              </button>
            </li>
          </ul>
        </nav>
        {isServerSelected ? (
          <nav className='flex w-full flex-col flex-wrap p-6'>
            <ul className='space-y-1.5'>
              {channels.map(({ name, ownerId, id }) => (
                <li key={`channel_${id}`}>
                  <a
                    className={
                      currentChannelId && currentChannelId === id
                        ? 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md bg-gray-100 px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:bg-gray-900 dark:text-white'
                        : 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-gray-900 dark:hover:text-slate-300'
                    }
                    onMouseEnter={() => {
                      router.prefetch(
                        `/server/${currentServerId}/channel/${id}`,
                      );
                    }}
                    onClick={() => {
                      router.replace(
                        `/server/${currentServerId}/channel/${id}`,
                      );
                    }}
                  >
                    <Hashtag color='currentColor' className='h-3.5 w-3.5' />
                    <div className='flex-grow'>{name}</div>
                    {ownerId === session?.user?.id && (
                      <Trash
                        color='currentColor'
                        className='h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600'
                        onClick={() => {
                          deleteChannelMutation
                            .mutateAsync({ channelId: id })
                            .then(async ({ success }) => {
                              if (success) {
                                await loadChannelsQuery.refetch();
                                await router.replace(
                                  `/server/${currentServerId}/channel`,
                                );
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
                  className='flex w-full items-center gap-x-3.5 rounded-md bg-brand-600 px-2.5 py-2 text-sm text-white hover:bg-brand-700'
                >
                  <Add color='currentColor' className='h-3.5 w-3.5' />
                  Create <Chanel></Chanel>
                </button>
              </li>
            </ul>
          </nav>
        ) : null}
      </aside>
    </>
  );
};

export default ApplicationSidebar;
