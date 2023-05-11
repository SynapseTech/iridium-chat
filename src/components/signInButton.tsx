import { FC, ReactNode } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

type SignInButtonProps = {
  inNavbar?: boolean;
  icon?: ReactNode;
};

const SignInButton: FC<SignInButtonProps> = ({ inNavbar = false, icon }) => {
  const session = useSession();
  const isLoggedIn = !!session.data;
  const router = useRouter();

  const classes = inNavbar
    ? 'py-2 px-3 inline-flex justify-center items-center gap-2 rounded-full border border-transparent font-semibold bg-white hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 transition-all text-sm dark:focus:ring-offset-gray-800'
    : 'w-full sm:w-auto inline-flex justify-center items-center gap-x-3.5 text-center bg-white shadow-sm text-sm font-medium rounded-md hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-slate-900 transition py-3 px-4';

  return (
    <button
      onClick={async () => {
        if (!isLoggedIn) signIn();
        else await router.push('/channels');
      }}
      type='button'
      className={classes}
    >
      {icon}
      {isLoggedIn ? 'Open App' : 'Sign In'}
    </button>
  );
};

export default SignInButton;
