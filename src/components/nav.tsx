'use client';
import Link from 'next/link';
import { FC } from 'react';
import SignInButton from './signInButton';

const Nav: FC = () => {
  return (
    <header className='z-50 mb-auto flex w-full flex-wrap py-4 text-sm sm:flex-nowrap sm:justify-start'>
      <nav
        className='w-full px-4 sm:flex sm:items-center sm:justify-between sm:px-6 lg:px-8'
        aria-label='Global'
      >
        <div className='flex items-center justify-between'>
          <Link
            href='/'
            className='flex w-auto flex-none content-center text-xl font-semibold text-white'
            aria-label='Iridium'
          >
            <img
              className='inline h-8 w-8'
              alt='iridium logo'
              src='/iridium_logo.svg'
            />
            Iridium
          </Link>
          <div className='sm:hidden'>
            <button
              type='button'
              className='hs-collapse-toggle inline-flex items-center justify-center gap-2 rounded-md border border-gray-700 p-2 align-middle text-sm font-medium text-gray-300 shadow-sm transition-all hover:border-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-slate-900'
              data-hs-collapse='#navbar-collapse-with-animation'
              aria-controls='navbar-collapse-with-animation'
              aria-label='Toggle navigation'
            >
              <svg
                className='h-4 w-4 hs-collapse-open:hidden'
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
                className='hidden h-4 w-4 hs-collapse-open:block'
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
          className='hs-collapse hidden grow basis-full overflow-hidden transition-all duration-300 sm:block'
        >
          <div className='mt-5 flex flex-col gap-5 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:pl-5'>
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
