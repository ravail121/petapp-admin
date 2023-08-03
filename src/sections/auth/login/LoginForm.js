import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';
import { set } from 'lodash';


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ----------------------------------------------------------------------


export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailCheck, setEmailCheck] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);


  const handleClick = (e) => {
    if (email && password) {
      setShowSpinner(true);
      fetch('https://apis.rubypets.co.uk/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.statusCode == 200) {
            setShowSpinner(false);
            localStorage.setItem('loginToken', data.data.token);
            navigate('/dashboard', { replace: true });
          }
          else {
            setShowSpinner(false);
            // alert('Not a valid user!')
            toast.error(
              "Invalid Login Crdentials",
              { position: toast.POSITION.TOP_CENTER, autoClose: 3000 },
            )

          }
        })
        .catch(error => {
          console.error(error);
        });
    }
    else {
      if (!email) { setEmailCheck(true) }
      if (!password) { setPasswordCheck(true) }
    }
  };

  return (
    <>
      <ToastContainer />
      <Stack spacing={3}>
        <TextField
          name="email"
          label="Email address"
          value={email}
          error={emailCheck}
          onChange={(e) => {
            setEmail(e.target.value)
            setEmailCheck(false);
          }}
        />

        <TextField
          name="password"
          label="Password"
          value={password}
          error={passwordCheck}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordCheck(false);
          }}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {/* <Checkbox name="remember" label="Remember me" />
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton loading={showSpinner} fullWidth size="large" type="submit" variant="contained" disabled={showSpinner} onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
