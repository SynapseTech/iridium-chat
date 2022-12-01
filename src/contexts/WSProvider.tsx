import { createContext, ReactNode, useContext } from "react";

export type WSContext = { ws: WebSocket | undefined, connecting: boolean };

const context = createContext<WSContext | undefined>(undefined);

export const WSProvider = ({ ws, connecting, children }: WSContext & { children: ReactNode }) => {
  return <context.Provider value={{ ws, connecting }}> {children}</ context.Provider>;
}

export const useWS = () => useContext<WSContext | undefined>(context);