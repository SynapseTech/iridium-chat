'use client';
import React, { useEffect } from 'react';
import { createModal, useGlobalModal } from '../../../contexts/ModalProvider';

export default function ServerHome_Client({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <main
      className='flex h-screen w-screen bg-white dark:bg-slate-900'
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      {children}
    </main>
  );
}
