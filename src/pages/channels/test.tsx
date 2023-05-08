/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Head from 'next/head';
import Message from '../../components/message';
import { useSession } from 'next-auth/react';
import { ModalData } from '../../components/modal';
import { useGlobalModal } from '../../contexts/ModalProvider';

const ChannelsPage = () => {
  const { data: session } = useSession();
  const { state, setState } = useGlobalModal();

  const createModal = (data: Partial<ModalData>) => {
    setState((p) => ({ ...p, ...data }))
  }


  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>
      {session ? (
        <main className='h-screen w-screen bg-gray-50 dark:bg-slate-900 flex'>
          <Message message={{
            createdTimestamp: new Date(),
            content: 'Test Message',
            id: 'testId123',
            channelId: 'testChannelId123',
            authorId: session!.user!.id,
            author: {
              id: session!.user!.id,
              name: session!.user!.name!,
              email: '',
              emailVerified: new Date(),
              image: session!.user!.image!,
            },
            embeds: [],
          }} ></Message>

          <button onClick={() => {
            console.log('Button Clicked');
            createModal({
              title: 'Test Modal',
              type: 'notice',
              content: 'This is a test modal',
              state: true,
            })
            console.log('[State]', state);
          }}>Open Test Modal</button>
        </main>
      ) : null}
    </div>
  );
};

export default ChannelsPage;
