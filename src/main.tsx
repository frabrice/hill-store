import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

// Self-hosted so there is no external font CDN to depend on or leak to.
import '@fontsource-variable/fraunces';
import '@fontsource-variable/plus-jakarta-sans';
import './index.css';

import { Providers } from '@/app/Providers';
import { router } from '@/app/router';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
