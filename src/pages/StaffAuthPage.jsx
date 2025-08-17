import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/loader/Loader';

export default function StaffAuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    name: '',
    username: '',
    password: '',
  });

  // Errors state separate for login and register to simplify logic
  const [loginErrors, setLoginErrors] = useState({});
  const [registerErrors, setRegisterErrors] = useState({});

  const [loading, setLoading] = useState(false);

  // Track touched fields for register only (to know if user typed or blurred the input)
  const [registerTouched, setRegisterTouched] = useState({
    name: false,
    username: false,
    password: false,
  });

  // Track if login form submitted to show errors after submit only
  const [loginSubmitted, setLoginSubmitted] = useState(false);

  const navigate = useNavigate();

  // ----- LOGIN VALIDATION: live required only -----
  // This runs on every change to loginData
  useEffect(() => {
    if (isLogin) {
      let errs = {};
      if (!loginData.username.trim()) {
        errs.username = 'Username is required';
      }
      if (!loginData.password) {
        errs.password = 'Password is required';
      }
      setLoginErrors(errs);
    }
  }, [loginData, isLogin]);


  useEffect(() => {
    if (!isLogin) {
      let errs = {};

      // NAME
      if (registerTouched.name) {
        if (!registerData.name.trim()) {
          errs.name = 'Name is required';
        }
      }

      // USERNAME
      if (registerTouched.username) {
        if (!registerData.username.trim()) {
          errs.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9]{3,15}$/.test(registerData.username)) {
          errs.username = 'Username must be 3-15 characters, letters and numbers only';
        }
      }

      // PASSWORD
      if (registerTouched.password) {
        if (!registerData.password) {
          errs.password = 'Password is required';
        } else if (registerData.password.length < 6) {
          errs.password = 'Password must be at least 6 characters';
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(registerData.password)) {
          errs.password = 'Password must include uppercase, lowercase and a number';
        }
      }

      setRegisterErrors(errs);
    }
  }, [registerData, registerTouched, isLogin]);

  // Determine if login button should be enabled
  // Enabled if no login errors and no empty fields
  const isLoginFieldsEmpty = !loginData.username.trim() || !loginData.password.trim();
  const isLoginValid = Object.keys(loginErrors).length === 0 && !isLoginFieldsEmpty;

  // Determine if register button should be enabled
  // Enabled if no register errors and no empty fields
  const isRegisterFieldsEmpty =
    !registerData.name.trim() || !registerData.username.trim() || !registerData.password.trim();
  const isRegisterValid = Object.keys(registerErrors).length === 0 && !isRegisterFieldsEmpty;

  // LOGIN FORM SUBMIT
  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginSubmitted(true);

    // Check final validation on submit
    let errs = {};
    if (!loginData.username.trim()) {
      errs.username = 'Username is required';
    }
    if (!loginData.password) {
      errs.password = 'Password is required';
    }
    setLoginErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const res = await fetch(
          'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff/login',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(loginData),
          }
        );
        if (res.ok) {
          navigate('/', { replace: true });
        } else {
          const data = await res.json();
          setLoginErrors({ form: data.error || 'Login failed' });
        }
      } catch (e) {
        console.log(e);
        setLoginErrors({ form: 'Network error' });
      } finally {
        setLoading(false);
      }
    }
  }

  // REGISTER FORM SUBMIT
  async function handleRegisterSubmit(e) {
    e.preventDefault();

    // Mark all fields as touched on submit to show errors if any
    setRegisterTouched({ name: true, username: true, password: true });

    // Validate all fields on submit
    let errs = {};

    if (!registerData.name.trim()) {
      errs.name = 'Name is required';
    }
    if (!registerData.username.trim()) {
      errs.username = 'Username is required';
    } else if (!/^[a-zA-Z0-9]{3,15}$/.test(registerData.username)) {
      errs.username = 'Username must be 3-15 characters, letters and numbers only';
    }
    if (!registerData.password) {
      errs.password = 'Password is required';
    } else if (registerData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(registerData.password)) {
      errs.password = 'Password must include uppercase, lowercase and a number';
    }

    setRegisterErrors(errs);

    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const res = await fetch(
          'http://localhost:8080/PahanaEdu_CL_BSCSD_31_96_war/api/staff/',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData),
          }
        );
        if (res.ok) {
          alert('Registration successful! Please login.');
          setIsLogin(true);
          setRegisterData({ name: '', username: '', password: '' });
          setRegisterErrors({});
          setRegisterTouched({ name: false, username: false, password: false });
        } else {
          const data = await res.json();
          setRegisterErrors({ form: data.error || 'Registration failed' });
        }
      } catch {
        setRegisterErrors({ form: 'Network error' });
      } finally {
        setLoading(false);
      }
    }
  }

  // Mark register field as touched on blur
  const handleRegisterBlur = (field) => {
    setRegisterTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-tr from-blue-100 to-blue-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {isLogin ? (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                Staff Panel Login
              </h2>
              <form onSubmit={handleLoginSubmit} noValidate>
                
                <div className="mb-4">
                  <label
                    htmlFor="loginUsername"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="loginUsername"
                    type="text"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        username: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      loginErrors.username
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  />
                  {loginErrors.username && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.username}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="loginPassword"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="loginPassword"
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({
                        ...loginData,
                        password: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      loginErrors.password
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  />
                  {loginErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{loginErrors.password}</p>
                  )}
                </div>
                {loginErrors.form && (
                  <p className="text-red-600 text-center mb-4">{loginErrors.form}</p>
                )}
                <button
                  type="submit"
                  className={`w-full py-2 rounded-md font-semibold transition text-white ${
                    !isLoginValid
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                  disabled={!isLoginValid}
                >
                  Login
                </button>
              </form>
              <p className="mt-6 text-center text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setLoginErrors({});
                    setIsLogin(false);
                    setLoginData({ username: '', password: '' });
                    setLoginSubmitted(false);
                  }}
                  className="text-blue-600 font-semibold hover:underline "
                >
                  Create new staff
                </button>
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                Register New Staff
              </h2>
              <form onSubmit={handleRegisterSubmit} noValidate>
                {registerErrors.form && (
                  <p className="text-red-600 text-center mb-4">{registerErrors.form}</p>
                )}
                <div className="mb-4">
                  <label
                    htmlFor="registerName"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Name
                  </label>
                  <input
                    id="registerName"
                    type="text"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      })
                    }
                    onBlur={() => handleRegisterBlur('name')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      registerErrors.name
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  />
                  {registerErrors.name && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.name}</p>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="registerUsername"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Username
                  </label>
                  <input
                    id="registerUsername"
                    type="text"
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        username: e.target.value,
                      })
                    }
                    onBlur={() => handleRegisterBlur('username')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      registerErrors.username
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  />
                  {registerErrors.username && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.username}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="registerPassword"
                    className="block mb-1 font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="registerPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        password: e.target.value,
                      })
                    }
                    onBlur={() => handleRegisterBlur('password')}
                    className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      registerErrors.password
                        ? 'border-red-500 focus:ring-red-400'
                        : 'border-gray-300 focus:ring-blue-400'
                    }`}
                  />
                  {registerErrors.password && (
                    <p className="text-red-600 text-sm mt-1">{registerErrors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 rounded-md font-semibold transition text-white ${
                    !isRegisterValid
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                  disabled={!isRegisterValid}
                >
                  Register
                </button>
              </form>

              <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setRegisterErrors({});
                    setIsLogin(true);
                    setRegisterData({ name: '', username: '', password: '' });
                    setRegisterTouched({ name: false, username: false, password: false });
                    setLoginSubmitted(false);
                  }}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Login here
                </button>
              </p>
            </>
          )}
        </div>
      </div>
      {loading && <Loader />}
    </>
  );
}
