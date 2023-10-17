import Head from 'next/head';
import ApplicationSidebar from '../../components/appSidebar';
import { createModal, useGlobalModal } from '../../contexts/ModalProvider';
import { useEffect } from 'react';

const ChannelsPage = () => {
  const { setState } = useGlobalModal();

  useEffect(() => {
    if (!document.cookie.includes('terms=1')) {
      createModal(setState, {
        title: 'Terms of Service',
        type: 'terms',
        content: `Iridium Chat is still in development.\n\nThis is not a finished product.\n\nDesigns and flows are still subject to change.\n\n**Thank you for using Iridium Chat!**\n\n*- The Iridium Chat Team*`,
        state: true,
      });
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className='flex h-screen w-screen bg-gray-50 dark:bg-slate-900'>
        <ApplicationSidebar />
      </main>
    </div>
  );
};

export default ChannelsPage;
