import { TextChannel } from "@prisma/client";
import { Hashtag } from "iconsax-react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { trpc } from "../../utils/trpc";

const ChannelsPage = () => {
  const [channels, setChannels] = useState<TextChannel[]>([]);
  const loadChannelsQuery = trpc.channel.getAccessible.useQuery();

  useEffect(() => {
    if (loadChannelsQuery.data) setChannels(loadChannelsQuery.data);
  }, [loadChannelsQuery.data]) // run when data fetch

  return (
    <div>
      <Head>
        <title>Iridium Chat</title>
      </Head>

      <main className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex">
        <aside className='hs-sidebar w-64 bg-white border-r border-gray-200 pt-8 pb-10 overflow-y-auto scrollbar-y flex-col'>
          <div className='px-6'>
            <Link href='/'>
              <a className="flex-none flex w-auto content-center text-xl font-semibold dark:text-white" aria-label="Iridium">
                <img className="h-8 w-8 inline" alt="iridium logo" src="/iridium_logo.svg" />
                Iridium
              </a>
            </Link>
          </div>
          <nav className='p-6 w-full flex flex-col flex-wrap'>
            <ul className="space-y-1.5">
              {channels.map(({ name, id }) => <li key={`channel_${id}`}>
                <Link href={`/channels/${id}`}>
                  <a
                    className={
                      'flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-slate-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-900 dark:text-slate-400 dark:hover:text-slate-300'
                    }
                  >
                    <Hashtag color='currentColor' className='w-3.5 h-3.5' />
                    {name}
                  </a>
                </Link>
              </li>)}
            </ul>
          </nav>
        </aside>
      </main>
    </div>
  )
}

export default ChannelsPage;