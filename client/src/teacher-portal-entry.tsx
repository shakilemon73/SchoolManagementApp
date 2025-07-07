import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TeacherApp from './pages/teacher-portal/teacher-app';
import './index.css';

// Completely separate teacher portal entry point
const container = document.getElementById('teacher-portal-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <TeacherApp />
    </StrictMode>
  );
}