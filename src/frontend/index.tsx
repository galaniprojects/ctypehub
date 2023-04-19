import { createRoot } from 'react-dom/client';

import './index.module.css';

const root = createRoot(document.querySelector('#app') as HTMLElement);
root.render(<h1>Hello World</h1>);
