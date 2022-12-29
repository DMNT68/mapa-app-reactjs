import { SocketProvider } from './context/SocketContext';
import { MapaPage } from './pages/MapaPage';

export const App = () => {
  return (
    <SocketProvider>
      <MapaPage />
    </SocketProvider>
  );
};
