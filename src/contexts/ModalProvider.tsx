'use client';
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { ModalData } from '../components/modal';

const GlobalModalContext = createContext({
  state: {} as Partial<ModalData>,
  setState: {} as Dispatch<SetStateAction<Partial<ModalData>>>,
});

export const GlobalModalProvider = ({
  children,
  value = {} as ModalData,
}: {
  children: React.ReactNode;
  value?: Partial<ModalData>;
}) => {
  const [state, setState] = useState(value);
  return (
    <GlobalModalContext.Provider value={{ state, setState }}>
      {children}
    </GlobalModalContext.Provider>
  );
};

export const useGlobalModal = () => {
  const context = useContext(GlobalModalContext);
  if (!context) {
    throw new Error('useGlobalModal must be used within a GlobalModalContext');
  }
  return context;
};

export const createModal = (
  setState: SetStateAction<any>,
  data: Partial<ModalData>,
) => {
  if (setState === undefined) throw new Error('setState is undefined!');
  if (typeof setState !== 'function')
    throw new Error('setState is not a function!');
  setState((p: any) => ({ ...p, ...data }));
};
