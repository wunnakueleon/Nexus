import { Outlet } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import { SocketProvider } from './shared/context/SocketContext';
import Toast from './shared/components/Toast';

function App() {
  return (
    <AppProvider>
      {/* SocketProvider lives inside AppProvider so it can read the operator and
          open/close the shared connection as the session changes. */}
      <SocketProvider>
        <Outlet />
        <Toast />
      </SocketProvider>
    </AppProvider>
  );
}

export default App;
