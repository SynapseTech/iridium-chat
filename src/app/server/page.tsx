import { Metadata, NextPage } from 'next';
import ServersPage_Client from './client-side';

export const metadata: Metadata = {
  title: 'Servers | Iridium Chat',
};

const ServersPage: NextPage = () => {
  return <ServersPage_Client />;
};

export default ServersPage;
