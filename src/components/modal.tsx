import { Markdown } from './markdown';

export type ModalData = {
  title: string;
  type: 'update' | 'warning' | 'notice' | 'terms' | 'settings';
  content: string | any;
  state: boolean;
};

export type ModalProps = {
  onClose: () => void;
  data: ModalData;
};

export const Modal: React.FC<ModalProps> = ({ onClose, data }) => {
  if (data === undefined)
    return (
      <div
        className='pointer-events-auto relative z-50 h-auto w-auto items-center justify-center rounded-3xl bg-gray-300 p-5'
        style={{ transform: 'translateY(50%)' }}
      >
        <div className='flex items-center justify-between px-4 py-2'>
          <Loading />
        </div>
      </div>
    );
  const { title, type, content } = data;
  return (
    <div
      className='pointer-events-auto relative z-50 h-auto w-auto items-center justify-center rounded-3xl bg-gray-300 p-5'
      style={{ transform: 'translateY(50%)' }}
    >
      <div className='flex items-center justify-between px-4 py-2'>
        <h3 className='text-lg font-bold'>{title}</h3>
        {type === 'terms' ? null : (
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M6 18L18 6M6 6l12 12'
              ></path>
            </svg>
          </button>
        )}
      </div>
      <div className='px-4 py-2'>
        {typeof content === 'object' ? content : <Markdown>{content}</Markdown>}
      </div>
      {type === 'terms' ? (
        <div className='flex items-center justify-center p-[2px]'>
          <button
            onClick={onClose}
            className='w-[25%] rounded-3xl bg-green-500 px-4 py-2 font-bold text-gray-700 hover:bg-green-600'
          >
            Accept
          </button>
        </div>
      ) : null}
    </div>
  );
};

const Loading = () => {
  return (
    <svg
      className='h-[50px] w-[50px] animate-spin text-orange-500'
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      ></circle>
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      ></path>
    </svg>
  );
};
