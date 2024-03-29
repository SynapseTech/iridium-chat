import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Add,
  ArrowCircleDown,
  CloseCircle,
  Hashtag,
  Moon,
  People,
  Setting4 as Setting,
  Sun1,
  Trash,
} from 'iconsax-react';
import { Server, TextChannel } from '@prisma/client';
import { trpc } from '../utils/trpc';
import CreateServerModal from './createServerModal';
import CreateChannelModal from './createChannelModal';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';
import { createModal, useGlobalModal } from '../contexts/ModalProvider';
import { useWS } from '../contexts/WSProvider';

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
  const { state, setState } = useGlobalModal();
  const { ws } = useWS();
  const { data: session } = useSession();
  const [servers, setServers] = useState<Server[]>([]);
  const [channels, setChannels] = useState<TextChannel[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [openSettings, setSettingsState] = useState<boolean>(
    state.type === 'settings' ? state.state! : false,
  );
  const loadServersQuery = trpc.server.getAccessible.useQuery();
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();
  const [createServerModalOpen, setCreateServerModalOpen] =
    useState<boolean>(false);
  const [createChannelModalOpen, setCreateChannelModalOpen] =
    useState<boolean>(false);
  const [openServerMenu, setOpenServerMenu] = useState(false);
  const deleteServerMutation = trpc.server.delete.useMutation();
  const deleteChannelMutation = trpc.channel.delete.useMutation();
  const router = useRouter();

  useEffect(() => {
    createModal(setState, {
      title: 'Settings',
      type: 'settings',
      content: (
        <div className='grid grid-cols-1 gap-2'>
          <p>
            <strong>Version:</strong>{' '}
            {process.env.NEXT_PUBLIC_REACT_APP_VERSION} (
            {process.env.NEXT_PUBLIC_GIT_HASH})
          </p>
          <button
            className='inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-red-500 px-3 py-2 text-sm font-semibold transition-all hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 dark:focus:ring-offset-gray-800'
            onClick={() => signOut()}
          >
            Sign Out
          </button>
          {process.env.NEXT_PUBLIC_IS_DEV === 'true' && (
            <button
              onClick={() => {
                ws?.close();
              }}
            >
              Kill WS
            </button>
          )}
        </div>
      ),
      state: openSettings,
    });
  }, [openSettings]);

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
    if (loadChannelsQuery.data) setChannels(loadChannelsQuery.data);
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
        serverId={currentServerId!}
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
        {isServerSelected ? (
          <div className='grid grid-cols-[1fr_20px] items-center justify-center pl-[2.25rem] pr-[0.75rem] text-lg font-semibold dark:text-slate-400'>
            <p className='truncate'>
              {
                servers.filter((server) => server.id === currentServerId)[0]
                  ?.name
              }
            </p>
            {openServerMenu ? (
              <CloseCircle
                className='inline h-5 w-5 hover:dark:text-slate-500'
                onClick={() => setOpenServerMenu(false)}
              />
            ) : (
              <ArrowCircleDown
                className='inline h-5 w-5 hover:dark:text-slate-500'
                onClick={() => setOpenServerMenu(true)}
              />
            )}
          </div>
        ) : null}
        {isServerSelected && openServerMenu ? (
          <div className='hs-overlay fixed left-0 z-[60] w-[16%] overflow-y-auto overflow-x-hidden pl-[1.90rem] pt-[5px]'>
            <div className='h-[200px] overflow-y-auto rounded-md bg-gray-300 p-5 dark:bg-gray-900'>
              <div className='space-y-1.5'>
                {servers.map(({ name, ownerId, id }) => (
                  <a
                    key={`server_${id}`}
                    className={
                      currentServerId && currentServerId === id
                        ? 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md bg-gray-100 px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white'
                        : 'flex w-full cursor-pointer items-center gap-x-3.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-gray-800 dark:hover:text-slate-300'
                    }
                    onMouseEnter={() => {
                      router.prefetch(`/server/${id}`);
                    }}
                    onClick={() => {
                      router.replace(`/server/${id}`);
                      setOpenServerMenu(false);
                    }}
                  >
                    <Hashtag color='currentColor' className='h-3.5 w-3.5' />
                    <div className='flex-grow'>{name}</div>
                    {ownerId === session?.user?.id && (
                      <Trash
                        color='currentColor'
                        className='z-10 h-3.5 w-3.5 cursor-pointer text-red-500 hover:text-red-600'
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
                ))}
                {servers.filter((server) => server.id === currentServerId)[0]
                  ?.ownerId === session?.user?.id && (
                  <>
                    <hr className='rounded-[3px] border-t-[3px] border-solid border-t-slate-500'></hr>
                    <a
                      className='flex w-full cursor-pointer items-center gap-x-3.5 rounded-md px-2.5 py-2 text-sm text-slate-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-gray-900 dark:hover:text-slate-300'
                      onClick={() =>
                        navigator.clipboard.writeText(
                          `${document.location.origin}/invite/${
                            servers.filter(
                              (server) => server.id === currentServerId,
                            )[0]?.inviteLink
                          }`,
                        )
                      }
                    >
                      <People
                        color='currentColor'
                        className='h-3.5 w-3.5 text-brand-700'
                      />
                      <div className='flex-grow text-brand-700'>Invite</div>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
        <nav className='flex w-full flex-col flex-wrap p-6 pl-[1.90rem]'>
          <ul className='space-y-1.5'>
            {!currentServerId
              ? servers.map(({ name, ownerId, id }) => (
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
                ))
              : channels
                  .filter((c) => c.serverId === currentServerId)
                  .map(({ name, serverId, id }) => (
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
                        {serverId === currentServerId &&
                          servers.filter(
                            (server) => server.id === currentServerId,
                          )[0]?.ownerId === session?.user?.id && (
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
                                        `/server/${currentServerId}`,
                                      );
                                    }
                                  });
                              }}
                            />
                          )}
                      </a>
                    </li>
                  ))}
            {currentServerId &&
            servers.filter((server) => server.id === currentServerId)[0]
              ?.ownerId !== session?.user?.id ? null : (
              <li>
                <button
                  onClick={() =>
                    !currentServerId
                      ? setCreateServerModalOpen(true)
                      : setCreateChannelModalOpen(true)
                  }
                  className='flex w-full items-center gap-x-3.5 rounded-md bg-brand-600 px-2.5 py-2 text-sm text-white hover:bg-brand-700'
                >
                  <Add color='currentColor' className='h-3.5 w-3.5' />
                  {!currentServerId ? 'Create Server' : 'Create Channel'}
                </button>
              </li>
            )}
            <li>
              <div className='grid grid-cols-2 items-center justify-center gap-3'>
                <button
                  className='bottom-0 flex items-center justify-center rounded-xl bg-gray-300 p-3'
                  onClick={() => {
                    if (localStorage.getItem('theme') === 'dark') {
                      localStorage.setItem('theme', 'light');
                      setTheme('light');
                      document.body.dataset.theme = 'light';
                    } else {
                      localStorage.setItem('theme', 'dark');
                      setTheme('dark');
                      document.body.dataset.theme = 'dark';
                    }
                  }}
                >
                  {theme === 'dark' ? <Sun1 /> : <Moon />}
                </button>
                <button
                  className='bottom-0 flex items-center justify-center rounded-xl bg-gray-300 p-3'
                  onClick={() => {
                    setSettingsState(true);
                    state['state'] = true;
                    createModal(setState, state);
                  }}
                >
                  <Setting />
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default ApplicationSidebar;
