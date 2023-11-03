import { FC, ReactNode, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { trpc } from '../utils/trpc';
import { Server } from '@prisma/client';

type SignInButtonProps = {
  inNavbar?: boolean;
  icon?: ReactNode;
  type?: string;
  serverId?: string;
};

const SignInButton: FC<SignInButtonProps> = ({
  inNavbar = false,
  icon,
  type,
  serverId,
}) => {
  const session = useSession();
  const isLoggedIn = !!session.data;
  const router = useRouter();
  const [servers, setServers] = useState<Server[]>();
  const memberMutation = trpc.server.joinServer.useMutation();
  if (type === 'invite' && !serverId)
    throw new Error('serverId is required for invite button');
  if (type === 'invite') {
    const getServer = trpc.server.getAccessible.useQuery();

    useEffect(() => {
      if (getServer.data) {
        setServers(getServer.data);
      }
    }, [getServer.data]);
  }
  const classes = inNavbar
    ? 'py-2 px-3 inline-flex justify-center items-center gap-2 rounded-full border border-transparent font-semibold bg-white hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800'
    : 'w-full sm:w-auto inline-flex justify-center items-center gap-x-3.5 text-center bg-white shadow-sm text-sm font-medium rounded-md hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition py-3 px-4';

  let text = 'Sign In';
  if (isLoggedIn) {
    if (type === 'invite') text = 'Join Server';
    else text = 'Open App';
  }
  return (
    <button
      onClick={async (e) => {
        e.preventDefault();
        if (!isLoggedIn) {
          signIn();
          return;
        }
        if (type === 'invite') {
          if (
            servers?.filter((member) => member.id === serverId)[0]?.ownerId ===
            session.data?.user?.id
          )
            await router.push(`/server/${serverId}`);
          await memberMutation.mutateAsync({ serverId: serverId! });
          await router.push(`/server/${serverId}`);
        } else await router.replace('/server');
      }}
      type='button'
      className={classes}
    >
      {icon}
      {text}
    </button>
  );
};

export default SignInButton;
