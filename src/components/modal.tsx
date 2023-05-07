import { Markdown } from "./markdown";

export type ModalData = {
  title: string;
  type: 'update' | 'warning' | 'notice' | 'terms' | 'default';
  content: string;
  state: boolean;
}

export type ModalProps = {
  onClose: () => void;
  data: ModalData;
}

export const Modal: React.FC<ModalProps> = ({ onClose, data }) => {
  if (data === undefined) return (
    <div className="rounded-3xl bg-gray-300 relative z-50 justify-center items-center w-auto h-auto pointer-events-auto p-5" style={{ transform: 'translateY(50%)' }}>
      <div className="flex justify-between items-center px-4 py-2">
        <Loading />
      </div>
    </div>
  );
  const { title, type, content } = data;
  return (
    <div className="rounded-3xl bg-gray-300 relative z-50 justify-center items-center w-auto h-auto pointer-events-auto p-5" style={{ transform: 'translateY(50%)' }}>
      <div className="flex justify-between items-center px-4 py-2">
        <h3 className="text-lg font-bold">{title}</h3>
        {type === 'terms' ? null :
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        }
      </div>
      <div className="px-4 py-2">
        <Markdown>{content}</Markdown>
      </div>
      {type === 'terms' ? <div className="flex justify-center items-center p-[2px]">
        <button onClick={onClose} className="w-[25%] bg-green-500 hover:bg-green-600 text-gray-700 font-bold py-2 px-4 rounded-3xl">
          Accept
        </button>
      </div> : null}
    </div>
  )
}


const Loading = () => {
  return (
    <svg className="animate-spin h-[50px] w-[50px] text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}