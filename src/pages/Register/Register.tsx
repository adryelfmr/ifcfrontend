import { useState } from 'react';
import { User } from '../../api/api';
import { RegisterResponse, UserInterface } from '../../models/user.interface';
import validator from 'validator';
import { FaCheck, FaTimes } from 'react-icons/fa';
import styles from './Register.module.css';
import { useAuthContext } from '../../context/authContext';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import {FaUser, FaLock, FaEnvelope} from 'react-icons/fa'

const Register: React.FunctionComponent = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [nameIsValid, setNameIsValid] = useState<boolean>(false);
  const [nameMsg, setNameMsg] = useState<string>('');
  const [emailIsValid, setEmailIsValid] = useState<boolean>(false);
  const [passwordIsValid, setPasswordIsValid] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [minLength, setMinLength] = useState<boolean>(false);
  const [minLowercase, setMinLowercase] = useState<boolean>(false);
  const [minUppercase, setMinUppercase] = useState<boolean>(false);
  const [minSymbols, setMinSymbols] = useState<boolean>(false);
  const [isNameFocused, setIsNameFocused] = useState<boolean>(false);
  const [isEmailFocused, setIsEmailFocused] = useState<boolean>(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState<boolean>(false);

  const { setUser, setIsAuthenticated, setToken, token } = useAuthContext();

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError(null);

      if (!emailIsValid) return;
      if (!passwordIsValid) return;
      if (!nameIsValid) return;

      const response = await User.register({ name, email, password });
      // setUser(name);

      if (response.user.token) {
        setToken(response.user.token);
      } else {
        throw new Error('Token is undefined');
      }

      localStorage.setItem('name', name);
      localStorage.setItem('token', token as string);
      setIsAuthenticated(true);
      navigate('/viewer');
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data.message);
      } else {
        console.log(error);
      }
    }
  };

  const nameValidate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setName(name);
    const nameRegex = /^[A-Za-z\s]+$/;
    if (name.trim().length < 3) {
      setNameIsValid(false);
      setNameMsg('O nome deve ter pelo menos 3 caracteres');
    } else if (!nameRegex.test(name)) {
      setNameIsValid(false);
      setNameMsg('O nome não pode conter números ou caracteres especiais');
    } else {
      setNameIsValid(true);
      setNameMsg('O nome é válido');
    }
  };

  const emailValidate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (!validator.isEmail(email)) {
      return setEmailIsValid(false);
    }
    setEmailIsValid(true);
    setEmail(email);
  };

  const passwordValidate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const password = e.target.value;
    setPassword(password);

    const minLengthValid = password.length >= 8;
    const minLowercaseValid = /[a-z]/.test(password);
    const minUppercaseValid = /[A-Z]/.test(password);
    const minSymbolsValid = /[!@#$%^_&*(),.?":{}|<>]/.test(password);

    setMinLength(minLengthValid);
    setMinLowercase(minLowercaseValid);
    setMinUppercase(minUppercaseValid);
    setMinSymbols(minSymbolsValid);

    const isValid = minLengthValid && minLowercaseValid && minUppercaseValid && minSymbolsValid;

    setPasswordIsValid(isValid);
  };

  return (
    <div className={styles.container}>
      <div className={styles.containerLogin}>
        <img className={styles.img} id='logo' src="/aloquesemfundo.png" alt="Logo"/>
        <h1 className={styles.formTitle}>Registrar</h1>
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <div className={styles.div_input}>
            <FaUser className={styles.faIcons}></FaUser>
            <input className={styles.formInput} type="name" id="name" placeholder='Nome completo' onChange={(e) => nameValidate(e)}></input>
          </div>
        <div className={styles.checkmsgContainer}>
          {nameIsValid ? <FaCheck className={styles.faCheck} /> : <FaTimes className={styles.faunCheck} />}
          <span className={styles.checkMsg}>Nome deve ser válido</span>
        </div>
        <div className={styles.div_input}>
            <FaEnvelope className={styles.faIcons}></FaEnvelope>
        <input className={styles.formInput} type="email" id="email" onChange={(e) => emailValidate(e)}></input>
        </div>
        <div className={styles.checkmsgContainer}>
          {emailIsValid ? <FaCheck className={styles.faCheck} /> : <FaTimes className={styles.faunCheck} />}
          <span className={styles.checkMsg}>Email deve ser válido</span>
        </div>
        <div className={styles.div_input}>
            <FaLock className={styles.faIcons}></FaLock>
        <input className={styles.formInput} type="password" id="password" onChange={(e) => passwordValidate(e)} />
        </div>
        <div className={styles.checkmsgContainer2}>
          <div className={styles.checkMsg}>
            {minLength ? <FaCheck className={styles.faCheck} /> : <FaTimes className={styles.faunCheck} />}
            <span className={styles.checkMsg}>8 caracteres</span>
          </div>
          <div className={styles.checkMsg}>
            {minUppercase ? <FaCheck className={styles.faCheck} /> : <FaTimes className={styles.faunCheck} />}
            <span className={styles.checkMsg}>Letra maiúscula</span>
          </div>
          <div className={styles.checkMsg}>
            {minSymbols ? <FaCheck className={styles.faCheck} /> : <FaTimes className={styles.faunCheck}/>}
            <span className={styles.checkMsg}>Um caractere especial</span>
          </div>
        </div>
        <div className={styles.submitbtnContainer}>
          <button type="submit" className={styles.submitBtn}>
            Registrar
          </button>
        </div>
      </form>
      {error && <div className={styles.errorMsg}>{error}</div>}
      </div>
      <img className={styles.imgPredio} id='predio' src="/predio3.png" alt="Prédio" />
    </div>
  );
};

export default Register;
