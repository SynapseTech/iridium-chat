import { createContext, ReactNode, useContext } from "react";

const context = createContext<{ ws: WebSocket | undefined, connecting: boolean } | undefined>(undefined);

export const WSProvider = ({ ws, connecting, children }: { ws: WebSocket | undefined, connecting: boolean, children: ReactNode }) => {
  return <context.Provider value={{ ws, connecting }}> {children}</ context.Provider>;
}

export const useWS = () => useContext(context);