import { Markdown } from "./markdown";

export type ModalData = {
  title: string;
  type: 'update' | 'warning' | 'notice' | 'terms';
  content: string;
}

export type ModalProps = {
  onClose: () => void;
  data: ModalData;
}

export const Modal: React.FC<ModalProps> = ({ onClose, data: { title, type, content } }) => {
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