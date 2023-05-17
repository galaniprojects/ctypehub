import type { CTypeData } from '../../models/ctype';

import styles from './CTypeOverview.module.css';

interface Props {
  cTypeData: CTypeData;
}

export function CTypeOverview({ cTypeData }: Props) {
  const { title, id } = cTypeData;
  return (
    <li className={styles.container}>
      <h2 className={styles.title}>
        <a className={styles.link} href={`/${id}`}>
          {title}
        </a>
      </h2>
    </li>
  );
}
