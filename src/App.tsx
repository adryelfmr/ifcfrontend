import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import AuthProvider from './context/authContext';
import Viewer from './pages/Viewer/Viewer';
import Projects from './pages/Projects/Projects';
import styles from './App.module.css';

function App() {
  return (
    <div className={styles.container}>
      <BrowserRouter>
        <AuthProvider>
          <Header></Header>
          <div className={styles.pages_container}>
            <Routes>
              <Route path="/login" element={<Login />}></Route>
              <Route path="/register" element={<Register />}></Route>
              <Route path="/viewer" element={<Viewer />}></Route>
              <Route path="/projects" element={<Projects />}></Route>
            </Routes>
          </div>

          {/* <Footer></Footer> */}
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
