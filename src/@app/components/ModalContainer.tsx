'use client';
import { Modal, ModalData } from "../../components/modal";
import { useGlobalModal } from "../../contexts/ModalProvider";

export const ModalContainer = () => {
  const { state, setState } = useGlobalModal();
  if (Object.keys(state).length === 0) return null;
  if (state.state === undefined) return null;
  if (state.state === false) return null;
  return (
    <div className='flex justify-center items-center' style={{ margin: '0 auto' }}>
      <div className='fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-[0.85] flex items-center justify-center' style={{ pointerEvents: 'all', transform: 'translateZ(0)' }} />
      <Modal onClose={() => {
        if (state.type === 'terms') {
          document.cookie = 'terms=1;max-age=31536000';
        }
        setState({ ...state, state: false })
      }} data={state as ModalData} />
    </div>
  )
}
