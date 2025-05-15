import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../context/authContext';
import styles from './Header.module.css';

const Header: React.FunctionComponent = () => {
  const { logOut, isAuthenticated } = useAuthContext();

  return (
    <div className={styles.container}>
      <div className={styles.home}>
      <img className={styles.logo} src="/aloquelogo.svg" alt="" />
        <Link to="/" className={styles.link}>
          Home
        </Link>
      </div>

      <div className={styles.auth_options}>
        {localStorage.getItem('token') ? (
          <div>
            <Link to='/viewer' className={styles.link}>Viewer</Link>
            <Link to="/projects" className={styles.link}>
              Projetos
            </Link>
            <button onClick={logOut} className={styles.button}>
              Sair
            </button>
          </div>
        ) : (
          <div>
            <Link to="/login" className={styles.link}>
              Login
            </Link>
            <Link to="/register" className={styles.link}>
              Registrar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
