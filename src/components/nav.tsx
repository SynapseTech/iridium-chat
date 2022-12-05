import Link from 'next/link';
import { FC } from 'react';
import SignInButton from './signInButton';

const Nav: FC = () => {
  return (
    <header className='mb-auto flex flex-wrap sm:justify-start sm:flex-nowrap z-50 w-full text-sm py-4'>
      <nav
        className='w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8'
        aria-label='Global'
      >
        <div className='flex items-center justify-between'>
          <Link href='/'>
            <a
              className='flex flex-none w-auto content-center text-xl font-semibold text-white'
              aria-label='Iridium'
            >
              <img
                className='h-8 w-8 inline'
                alt='iridium logo'
                src='/iridium_logo.svg'
              />
              Iridium
            </a>
          </Link>
          <div className='sm:hidden'>
            <button
              type='button'
              className='hs-collapse-toggle p-2 inline-flex justify-center items-center gap-2 rounded-md border border-gray-700 hover:border-gray-600 font-medium text-gray-300 hover:text-white shadow-sm align-middle focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-600 transition-all text-sm'
              data-hs-collapse='#navbar-collapse-with-animation'
              aria-controls='navbar-collapse-with-animation'
              aria-label='Toggle navigation'
            >
              <svg
                className='hs-collapse-open:hidden w-4 h-4'
                width='16'
                height='16'
                fill='currentColor'
                viewBox='0 0 16 16'
              >
                <path
                  fillRule='evenodd'
                  d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z'
                />
              </svg>
              <svg
                className='hs-collapse-open:block hidden w-4 h-4'
                width='16'
                height='16'
                fill='currentColor'
                viewBox='0 0 16 16'
              >
                <path d='M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z' />
              </svg>
            </button>
          </div>
        </div>
        <div
          id='navbar-collapse-with-animation'
          className='hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow sm:block'
        >
          <div className='flex flex-col gap-5 mt-5 sm:flex-row sm:items-center sm:justify-end sm:mt-0 sm:pl-5'>
            {/* <a className="font-medium text-white" href="#" aria-current="page">Home</a>
                        <a class="font-medium text-gray-400 hover:text-gray-500" href="#">Account</a>
                        <a class="font-medium text-gray-400 hover:text-gray-500" href="#">Work</a>
                        <a class="font-medium text-gray-400 hover:text-gray-500" href="#">Blog</a> */}
            <SignInButton inNavbar />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
