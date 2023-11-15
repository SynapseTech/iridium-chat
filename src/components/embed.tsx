import Image from 'next/image';
import { FC } from 'react';
import { Tweet, TwitterComponents } from 'react-tweet';

type EmbedProps = {
  index: number;
  title: string;
  description: string;
  url: string;
};

const TweetComponents: TwitterComponents = {
  AvatarImg: (props) => <Image {...props} />,
  MediaImg: (props) => <Image {...props} fill unoptimized />,
};

const isTwitterOrXUrl = (url: string) => {
  const hostname = new URL(url).hostname;
  return hostname.includes('twitter.com') || hostname.includes('x.com');
};

const Embed: FC<EmbedProps> = ({ index, title, description, url }) => {
  // Image Check
  if (/(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))/i.test(url))
    return (
      <img className='w-[500px] rounded-xl' src={url} alt='Linked image' />
    );

  // Youtube/Social Checks
  if (
    /https?:\/\/(www\.)?(twitter\.com|x\.com|youtube\.com|youtu\.be|twitch\.tv|instagram\.com|reddit\.com)(\/.*)?/i.test(
      url,
    )
  ) {
    // Youtube
    if (
      /https?:\/\/(www\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)(\/.*)?/i.test(
        url,
      )
    ) {
      const embedId = url
        .replace(/(>|<)/gi, '')
        ?.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)[2]
        ?.split(/[^0-9a-z_\-]/i)[0];

      return (
        <div className='relative h-[280px] w-[500px] overflow-hidden rounded-2xl'>
          <iframe
            className='absolute left-0 top-0 h-full w-full rounded-2xl'
            src={`https://www.youtube.com/embed/${embedId}`}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
            title='Embedded youtube'
          />
        </div>
      );
    }

    // Twitch
    if (/(http)?s?:?(\/\/[^"']*\.(?:twitch))/i.test(url)) {
      const embedId = url
        .replace(/(>|<)/gi, '')
        ?.split(/(vi\/|v=|\/v\/|twitch\.tv\/|\/embed\/)/)[2]
        ?.split(/[^0-9a-z_\-]/i)[0];
      return (
        <div className='relative h-[280px] w-[500px] overflow-hidden'>
          <iframe
            className='absolute left-0 top-0 h-full w-full'
            src={`https://player.twitch.tv/?channel=${embedId}&parent=${window.location.hostname}`}
            allowFullScreen
            title='Embedded twitch'
          />
        </div>
      );
    }

    // Twitter or X
    if (isTwitterOrXUrl(url)) {
      const tweetId = url.split('/').pop();
      const cleanTweetId = tweetId?.split('?')[0]?.split('#')[0];
      return (
        <div className='relative overflow-hidden'>
          <Tweet
            apiUrl={cleanTweetId && `/api/embeds/tweet/${cleanTweetId}`}
            components={TweetComponents}
          />
        </div>
      );
    }

    // Instagram
    if (/(http)?s?:?(\/\/[^"']*\.(?:instagram))/i.test(url)) {
      return (
        <div className='relative h-[835px] w-[500px] overflow-hidden rounded-2xl'>
          <iframe
            className='absolute left-0 top-0 h-full w-full'
            src={`${url}embed`}
            title='Embedded instagram'
          />
        </div>
      );
    }
  }

  return (
    <div
      className='w-[500px] rounded-xl bg-gray-300 py-1 dark:bg-slate-700 dark:text-white'
      key={index}
    >
      <div className='flex flex-col p-4'>
        <p className='text-xl font-bold text-blue-500 hover:underline'>
          <a href={url} target='_blank' rel='noreferrer'>
            {title}
          </a>
        </p>
        <br />
        <span className='text-sm'>{description}</span>
      </div>
    </div>
  );
};

export default Embed;
