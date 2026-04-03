import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { ToolPage } from './pages/ToolPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="tools/:toolId" element={<ToolPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
