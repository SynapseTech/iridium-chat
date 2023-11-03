'use client';
import { NextPage } from 'next';
import { createModal, useGlobalModal } from '../../contexts/ModalProvider';
import { useEffect } from 'react';
import ApplicationSidebar from '../../components/appSidebar';

const ServersPage_Client: NextPage = () => {
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
    <main className='flex h-screen w-screen bg-gray-50 dark:bg-slate-900'>
      <ApplicationSidebar />
    </main>
  );
};

export default ServersPage_Client;
