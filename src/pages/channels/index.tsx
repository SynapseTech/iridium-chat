import Head from 'next/head';
import ApplicationSidebar from '../../components/appSidebar';
import { ModalData } from '../../components/modal';

export const getServerSideProps = () => {
  return {
    props: {
      mData: {
        title: 'Notice',
        type: 'terms',
        content: `Iridium Chat is still in development.\n\nThis is not a finished product.\n\nDesigns and flows are still subject to change.\n\n**Thank you for using Iridium Chat!**\n\n*- The Iridium Chat Team*`
      } as ModalData
    }
  }
};


const ChannelsPage = () => {
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
