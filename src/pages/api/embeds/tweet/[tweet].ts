import { NextApiRequest, NextApiResponse } from 'next';
import { getTweet } from 'react-tweet/api';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const tweetId = req.query.tweet;

  if (req.method !== 'GET' || typeof tweetId !== 'string') {
    res.status(400).json({ error: 'Bad Request.' });
    return;
  }

  try {
    const tweet = await getTweet(tweetId);
    res.status(tweet ? 200 : 404).json({ data: tweet ?? null });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: (error as any).message ?? 'Bad request.' });
  }
};

export default handler;
