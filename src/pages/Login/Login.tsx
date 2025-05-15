// import * as React from 'react';
import { useState } from 'react';
import { User } from '../../api/api';
import { useAuthContext } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import styles from './Login.module.css';
import {FaUser, FaLock} from 'react-icons/fa'

const Login: React.FunctionComponent = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { token, user, setIsAuthenticated, setUser, setToken } = useAuthContext();

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await User.login({ email, password });
      console.log(response.user.password);
      if (response.user.token) {
        setToken(response.user.token);
      } else {
        return setError('Token is undefined');
      }
      console.log(response.user.token);
      if (response.user.id !== undefined) {
        setUser(response.user.id);
      } else {
        setError('User ID is undefined');
      }
      localStorage.setItem('id', response.user.id?.toString() || '');
      localStorage.setItem('token', response.user.token);
      if (localStorage.getItem('token')) setIsAuthenticated(true);

      navigate('/viewer');
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        console.log(error);
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.containerLogin}>
        <img className={styles.img} id='logo' src="/aloquesemfundo.png" alt="Logo"/>
        <h1 className={styles.formTitle}>Login</h1>
        <form className={styles.formContainer} onSubmit={handleSubmit}>
        <div className={styles.div_input}>
          <FaUser className={styles.faIcons}></FaUser>
          <input className={styles.formInput} placeholder='Email' type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
        </div>
        <div className={styles.div_input}>
          <FaLock className={styles.faIcons}></FaLock>
        <input className={styles.formInput} type="password" id="password" placeholder='Senha' value={password} autoComplete="on" onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className={styles.submitbtnContainer}>
          <button className={styles.submitBtn} type="submit">
            Login
          </button>
        </div>
      </form>
      {error && <div className={styles.errorMsg}>{error}</div>}
      </div>
      <img className={styles.imgPredio} id='predio' src="/predio3.png" alt="Prédio" />
      
    </div>
  );
};

export default Login;
