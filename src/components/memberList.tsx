'use client';
import { useEffect, useState } from 'react';
import { trpc } from '../utils/_trpc';
import { User } from '../server/trpc/router/server';
import * as CM from '@radix-ui/react-context-menu';
import { ContextMenu } from './contextMenu';
import { useSession } from 'next-auth/react';

type MemberListProps = {
  serverId: string;
};

export const MemberList: React.FC<MemberListProps> = ({ serverId }) => {
  const [members, setMembers] = useState<User[]>([]);
  const loadServerMembersQuery = trpc.server.getMembers.useQuery({ serverId });
  const getOnlineMembers = trpc.server.getAllWebSocketMembers.useQuery();
  const [onlineMembers, setOnlineMembers] = useState<string[]>([]);
  const kickUserMutation = trpc.server.kickMember.useMutation();
  const { data: session } = useSession();

  useEffect(() => {
    if (
      (loadServerMembersQuery.data as { success: boolean })?.success ===
      undefined
    )
      setMembers(loadServerMembersQuery.data as User[]);
  }, [loadServerMembersQuery.data]);

  useEffect(() => {
    if (getOnlineMembers.data === undefined) return;
    setOnlineMembers(getOnlineMembers.data);
    setInterval(() => {
      getOnlineMembers.refetch();
    }, 1000);
  }, [getOnlineMembers.data]);

  return (
    <aside className='hs-sidebar scrollbar-y w-64 flex-col overflow-y-auto border-l border-gray-200 bg-white pb-10 pt-8 dark:bg-slate-800'>
      <div className='px-6'>
        <div className='flex w-auto flex-none content-center text-xl font-semibold dark:text-white'>
          Members - {members === undefined ? 0 : members.length}
        </div>
        <hr className='rounded-[3px] border-t-[3px] border-solid border-t-slate-500' />
        {onlineMembers.length > 0 && members !== undefined ? (
          members.map(({ user: member, role }) => {
            if (member === null) return null;
            return (
              <CM.Root>
                <CM.Trigger>
                  <div
                    key={member.id}
                    className='mt-2 flex flex-row items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-slate-700'
                    id={`member_${member.id}`}
                  >
                    <div className='flex-none'>
                      <img
                        className='h-8 w-8 rounded-full'
                        src={member.image ?? '/default-avatar.png'}
                        alt={member.name ?? 'Unknown User'}
                      />
                    </div>
                    <div className='flex-auto'>
                      <p
                        className={`text-sm font-semibold ${
                          role === 'owner'
                            ? 'text-orange-500 dark:text-orange-400'
                            : 'dark:text-white'
                        }`}
                      >
                        {member.name ?? 'Unknown User'}
                      </p>
                      <div className='text-xs text-gray-500 dark:text-gray-400'>
                        {onlineMembers.includes(member.id)
                          ? 'Online'
                          : 'Offline'}
                      </div>
                    </div>
                  </div>
                </CM.Trigger>
                <ContextMenu
                  type='member'
                  member={member}
                  currentUser={members.find(
                    ({ user }) => session?.user?.id === user?.id,
                  )}
                  onClick={(_, type) => {
                    if (type === 'kick') {
                      kickUserMutation.mutate({
                        serverId,
                        userId: member.id,
                      });
                      setMembers(
                        members.filter(({ user }) => user?.id !== member.id),
                      );
                    }
                    if (type === 'copy') {
                      navigator.clipboard.writeText(`${member.id}`);
                    }
                  }}
                />
              </CM.Root>
            );
          })
        ) : (
          <>
            <LoadingUser />
            <LoadingUser />
            <LoadingUser />
          </>
        )}
      </div>
    </aside>
  );
};

const LoadingUser = () => {
  // Have this look like a user is loading and have it look similar to the user html
  return (
    <div className='mt-2 flex flex-row items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-slate-700'>
      <div className='flex-none'>
        <div className='h-8 w-8 animate-pulse rounded-full bg-gray-300'></div>
      </div>
      <div className='grid flex-auto grid-cols-1 gap-y-1'>
        <div className='w-30 h-3 animate-pulse rounded-full bg-gray-300'></div>
        <div className='h-3 w-10 animate-pulse rounded-full bg-gray-300'></div>
      </div>
    </div>
  );
};
