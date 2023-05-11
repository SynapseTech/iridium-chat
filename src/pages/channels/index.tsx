import Head from 'next/head';
import ApplicationSidebar from '../../components/appSidebar';
import { ModalData } from '../../components/modal';
import { NextRequest } from 'next/server';
import { createModal, useGlobalModal } from '../../contexts/ModalProvider';

export const getServerSideProps = ({ req }: { req: NextRequest }) => {
  if (req.cookies['terms' as keyof unknown] !== '1') {
    return {
      props: {
        mData: {
          title: 'Notice',
          type: 'terms',
          content: `Iridium Chat is still in development.\n\nThis is not a finished product.\n\nDesigns and flows are still subject to change.\n\n**Thank you for using Iridium Chat!**\n\n*- The Iridium Chat Team*`,
          state: true,
        } as ModalData
      }
    }
  }
  return {
    props: {},
  }
};


const ChannelsPage = ({ mData }: { mData?: ModalData }) => {
  const { setState } = useGlobalModal();

  if (mData) {
    createModal(setState, mData);
  }
  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className='h-screen w-screen bg-gray-50 dark:bg-slate-900 flex'>
        <ApplicationSidebar />
      </main>
    </div>
  );
};

export default ChannelsPage;
