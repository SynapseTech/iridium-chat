import Providers from './Providers';
import '../styles/globals.css';
import ModalContainer from './Modal';

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang='en'>
        <head>
          <link rel='icon' href='/favicon.ico' sizes='any' />
        </head>
        <body>
          {children}
          <div className='pointer-events-none absolute bottom-0 left-0 right-0 top-0 z-[1002] !bg-none'>
            <ModalContainer />
          </div>
        </body>
      </html>
    </Providers>
  );
}
