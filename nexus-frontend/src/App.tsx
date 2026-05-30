import { Outlet } from 'react-router-dom';
import { AppProvider } from './shared/context/AppContext';
import Toast from './shared/components/Toast';

function App() {
  return (
    <AppProvider>
      <Outlet />
      <Toast />
    </AppProvider>
  );
}

export default App;
