import { useCallback, useState } from 'react';

import * as styles from './ReactTest.module.d.css';

export function ReactTest() {
  const [flag, setFlag] = useState(false);
  const handleClick = useCallback(() => setFlag((old) => !old), []);
  return (
    <button onClick={handleClick} className={styles.component}>
      {flag ? '✔️' : '❌️'} Click me!
    </button>
  );
}
