import Head from "next/head";
import ApplicationSidebar from "../../components/channelList";

const ChannelsPage = () => {
  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex">
        <ApplicationSidebar />
      </main>
    </div>
  )
}

export default ChannelsPage;