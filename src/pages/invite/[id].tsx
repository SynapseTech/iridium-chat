import Head from 'next/head';
import { ModalData } from '../../components/modal';
import { createModal, useGlobalModal } from '../../contexts/ModalProvider';
import Link from 'next/link';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { GetServerSidePropsContext } from 'next';
import { prisma } from '../../server/db/client';
import { Server } from '@prisma/client';
import SignInButton from '../../components/signInButton';

type InvitePageServerSideProps = {
  server: Server;
  mData: ModalData | null;
  username: string;
};

type InvitePageProps = InvitePageServerSideProps;

export const getServerSideProps = async ({
  req,
  res,
  params,
}: GetServerSidePropsContext) => {
  let mData: ModalData | null = null;
  if (req.cookies['terms' as keyof unknown] !== '1') {
    mData = {
      title: 'Notice',
      type: 'terms',
      content: `Iridium Chat is still in development.\n\nThis is not a finished product.\n\nDesigns and flows are still subject to change.\n\n**Thank you for using Iridium Chat!**\n\n*- The Iridium Chat Team*`,
      state: true,
    } as ModalData;
  }
  const session = await getServerAuthSession({ req, res });

  if (!session || !params)
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };

  const inviteId = params['id'] as string;
  const server = await prisma.server.findUnique({
    where: {
      inviteLink: inviteId,
    },
  });

  if (!server)
    return {
      notFound: true,
    };

  return {
    props: {
      server: JSON.parse(JSON.stringify(server)), // dumbshit
      mData,
      username: await prisma.user
        .findUnique({ where: { id: server.ownerId } })
        .then((user) => user?.name),
    },
  };
};

const InvitesPage = ({ mData, server, username }: InvitePageProps) => {
  const { setState } = useGlobalModal();

  if (mData !== null) {
    createModal(setState, mData);
  }

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className='flex h-screen w-screen bg-gray-50 dark:bg-slate-900'>
        <div className='p-6'>
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
        <div className='fixed bottom-0 left-0 right-0 top-[1px] flex items-center justify-center'>
          <div
            className='pointer-events-auto relative z-50 grid h-auto w-auto grid-cols-1 items-center justify-center gap-y-3 rounded-3xl bg-gray-300 p-5'
            style={{ transform: 'translateY(50%)' }}
          >
            <p className='text-center text-2xl'>
              You have been invited to join
            </p>
            <strong className='text-center text-3xl'>{server.name}</strong>
            <div className='flex items-center justify-center gap-x-[5px] text-center text-xl'>
              Owner: <p className='text-gray-500'>{username}</p>
            </div>
            <br></br>
            <SignInButton type='invite' serverId={server.id} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvitesPage;
