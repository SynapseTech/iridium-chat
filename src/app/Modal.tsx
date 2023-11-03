'use client';
import { Modal, ModalData } from '../components/modal';
import { useGlobalModal } from '../contexts/ModalProvider';

const ModalContainer = () => {
  const { state, setState } = useGlobalModal();
  //console.log('[State]', state)
  if (Object.keys(state).length === 0) return null;
  if (state.state === undefined) return null;
  if (state.state === false) return null;
  return (
    <>
      <div
        className='flex items-center justify-center'
        style={{ margin: '0 auto' }}
      >
        <div
          className='fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-black bg-opacity-[0.85]'
          style={{ pointerEvents: 'all', transform: 'translateZ(0)' }}
        />
        <Modal
          onClose={() => {
            if (state.type === 'terms') {
              document.cookie = 'terms=1;max-age=31536000;path=/';
            }
            setState({ ...state, state: false });
          }}
          data={state as ModalData}
        />
      </div>
    </>
  );
};

export default ModalContainer;
