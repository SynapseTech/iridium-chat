import type { NextPage, Metadata } from 'next';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SignInButton from '../components/signInButton';
import Nav from '../components/nav';
import SyntechLogo from '../components/syntechLogo';

export const metadata: Metadata = {
  title: 'Iridium Chat',
  description:
    'A privacy-centric alternative to Discord for professional communications',
};

const Home: NextPage = () => {
  return (
    <div className='flex h-screen bg-slate-900'>
      <div className='mx-auto flex h-full w-full max-w-[50rem] flex-col'>
        <Nav />

        <main id='content' role='main'>
          <div className='px-4 py-10 text-center sm:px-6 lg:px-8'>
            <h1 className='block text-2xl font-bold text-white sm:text-4xl'>
              Welcome to a secure, seamless chat
            </h1>
            <p className='mt-3 text-lg text-gray-300'>
              Iridium Chat helps teams and professionals connect and do what
              matters most: get sh*t done.
            </p>
            <div className='mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3'>
              <SignInButton
                icon={
                  <FontAwesomeIcon
                    icon={faRocket}
                    className='h-[1rem]'
                    fixedWidth
                  />
                }
              />
              <a
                className='inline-flex w-full items-center justify-center gap-x-3.5 rounded-md border-2 border-gray-600 px-4 py-3 text-center text-sm font-medium text-gray-300 shadow-sm transition hover:border-gray-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 sm:w-auto'
                href='https://github.com/SynapseTech/iridium-chat'
                target='_blank'
                rel='noreferrer'
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className='h-[1rem]'
                  fixedWidth
                />
                Star on GitHub
              </a>
            </div>
          </div>
        </main>
        <footer className='mt-auto py-5 text-center'>
          <div className='mx-auto flex max-w-7xl items-center justify-center gap-x-2 px-4 sm:px-6 lg:px-8'>
            <SyntechLogo className='h-4 w-4 text-gray-400' />
            <p className='text-sm text-gray-400'>
              Crafted with love by{' '}
              <a
                className='font-medium text-white underline decoration-2 underline-offset-2 hover:text-gray-200 hover:decoration-gray-400'
                href='https://synapsetech.dev'
                target='_blank'
                rel='noreferrer'
              >
                Synapse Technologies
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Home;
