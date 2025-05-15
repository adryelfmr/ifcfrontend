import * as React from 'react';
import styles from './Footer.module.css'

const Footer: React.FunctionComponent = () => {
  return (
    <div className={styles.container}>
      <p>Todos os direitos reservados @</p>
    </div>
  );
};

export default Footer;
