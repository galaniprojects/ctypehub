import { PropsWithChildren, useEffect, useRef } from 'react';

import styles from './Modal.module.css';

export function Modal({ children }: PropsWithChildren) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const { current } = ref;
    current?.showModal();
    return () => {
      current?.close();
    };
  }, [ref]);

  return (
    <dialog ref={ref} className={styles.modal}>
      {children}
    </dialog>
  );
}
