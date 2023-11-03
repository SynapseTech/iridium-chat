import Providers from "./Providers";
import '../styles/globals.css';
import { ModalContainer } from "../@app/components/ModalContainer";

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <html lang="en">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
        </head>
        <body>
          {children}
          <div className='absolute top-0 left-0 right-0 bottom-0 !bg-none pointer-events-none z-[1002]'>
            <ModalContainer></ModalContainer>
          </div>
        </body>
      </html>
    </Providers>
  );
}