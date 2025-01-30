import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";

export const SocketProvider: FC<PropsWithChildren> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      const ws = new WebSocket(`ws://localhost:8080/ws/${userId}`);
      ws.onopen = () => {
        console.log("WebSocket connection established.");
      };
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
      ws.onmessage = (message) => {
        const data: ISendSocketMessageProps = JSON.parse(message.data);

        if (data.type === "invite-incoming") {
          toast.info(`You have an invite from ${data.payload.invitedBy}`);
        }
      };
      setSocket(ws);
    }
  }, [userId]);

  const handleSendSocketMessage = useCallback(
    ({ type, payload }: ISendSocketMessageProps) => {
      if (socket) {
        socket.send(
          JSON.stringify({
            type,
            payload,
          })
        );
      }
    },
    [socket]
  );

  const value = useMemo(
    () => ({
      socket,
      handleSendSocketMessage,
    }),
    [socket, handleSendSocketMessage]
  );
  return (
    <SocketContext.Provider value={value}>
      {children}
      <Outlet />
    </SocketContext.Provider>
  );
};

const SocketContext = createContext<ISocketProviderProps | null>(null);

export const useSocketProvider = () => {
  const data = useContext(SocketContext);
  return data as ISocketProviderProps;
};

interface ISocketProviderProps {
  socket: WebSocket | null;
  handleSendSocketMessage: (props: ISendSocketMessageProps) => void;
}

interface ISendSocketMessageProps {
  type:
    | "message"
    | "invite-sent"
    | "invite-accepted"
    | "invite-declined"
    | "invite-incoming"
    | "quiz-started";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
}
