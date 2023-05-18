import type { NextPage, Metadata } from 'next';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SignInButton from '../@app/components/signInButton';
import Nav from '../@app/components/nav';
import SyntechLogo from '../components/syntechLogo';

export const metadata: Metadata = {
  title: 'Iridium Chat',
  description: 'A privacy-centric alternative to Discord for professional communications',
}

const Home: NextPage = () => {
  return (
    <div className='bg-slate-900 flex h-screen'>
      <div className='max-w-[50rem] flex flex-col mx-auto w-full h-full'>
        <Nav />

        <main id='content' role='main'>
          <div className='text-center py-10 px-4 sm:px-6 lg:px-8'>
            <h1 className='block text-2xl font-bold text-white sm:text-4xl'>
              Welcome to a secure, seamless chat
            </h1>
            <p className='mt-3 text-lg text-gray-300'>
              Iridium Chat helps teams and professionals connect and do what
              matters most: get sh*t done.
            </p>
            <div className='mt-5 flex flex-col justify-center items-center gap-2 sm:flex-row sm:gap-3'>
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
                className='w-full sm:w-auto inline-flex justify-center items-center gap-x-3.5 text-center border-2 border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition py-3 px-4'
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
        <footer className='mt-auto text-center py-5'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-x-2 flex items-center justify-center'>
            <SyntechLogo className='h-4 w-4 text-gray-400' />
            <p className='text-sm text-gray-400'>
              Crafted with love by{' '}
              <a
                className='text-white decoration-2 underline underline-offset-2 font-medium hover:text-gray-200 hover:decoration-gray-400'
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
