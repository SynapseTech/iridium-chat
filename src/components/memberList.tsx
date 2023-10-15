import { use, useEffect, useState } from 'react';
import { trpc } from '../utils/trpc';
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
  const kickUserMutation = trpc.server.kickMember.useMutation();
  const { data: session } = useSession();

  useEffect(() => {
    if (
      (loadServerMembersQuery.data as { success: boolean })?.success ===
      undefined
    )
      setMembers(loadServerMembersQuery.data as User[]);
  }, [loadServerMembersQuery.data]);

  return (
    <aside className='hs-sidebar scrollbar-y w-64 flex-col overflow-y-auto border-l border-gray-200 bg-white pb-10 pt-8 dark:bg-slate-800'>
      <div className='px-6'>
        <div className='flex w-auto flex-none content-center text-xl font-semibold dark:text-white'>
          Members - {members === undefined ? 0 : members.length}
        </div>
        <hr className='rounded-[3px] border-t-[3px] border-solid border-t-slate-500' />
        {members !== undefined
          ? members.map(({ user: member, role }) => {
              if (member === null) return null;
              const ownerObj = members.find(({ role }) => role === 'owner');
              return (
                <CM.Root>
                  <CM.Trigger>
                    <div
                      key={member.id}
                      className='mt-2 flex flex-row items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-200 dark:hover:bg-slate-700'
                    >
                      <div className='flex-none'>
                        <img
                          className='h-8 w-8 rounded-full'
                          src={member.image ?? '/default-avatar.png'}
                          alt={member.name ?? 'Unknown User'}
                        />
                      </div>
                      <div className='flex-auto'>
                        <p className='text-sm font-semibold dark:text-white'>
                          {member.name ?? 'Unknown User'}{' '}
                          <strong>{role === 'owner' ? '(Owner)' : ''}</strong>
                        </p>
                        {/* <div className='text-xs text-gray-500 dark:text-gray-400'>
                  {detailedMember.data?.status ?? 'Unknown Status'}
                </div> */}
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
          : null}
      </div>
    </aside>
  );
};
