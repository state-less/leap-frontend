import {
  Avatar,
  Button,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import { authContext } from '@state-less/react-client';
import { useContext, useState } from 'react';
import GoogleLogin, { GoogleLoginResponse } from 'react-google-login';
import { Google as GoogleIcon } from '@mui/icons-material';
import { stateContext } from '../provider/StateProvider.js';

import { Menu, MenuItem } from '@mui/material';

const logError = () => {};

const isGoogleLoginResponse = (val: any): val is GoogleLoginResponse => {
  return val?.tokenId !== undefined && val.accessToken !== undefined;
};

export const LoggedInGoogleButton = () => {
  const { session, logout } = useContext(authContext);
  const { state } = useContext(stateContext);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  if (session.strategy !== 'google') {
    return null;
  }

  const decoded = session.strategies?.google?.decoded;

  const theme = useTheme();

  const lessThanSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const MDButton: any = lessThanSmall ? IconButton : Button;
  return (
    <>
      <MDButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        color={state.animatedBackground ? 'info' : 'info'}
      >
        <Avatar
          src={decoded?.picture}
          sx={{ width: 24, height: 24, mr: 1 }}
        ></Avatar>
        {!lessThanSmall && decoded?.name}
      </MDButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={logout}>Logout</MenuItem>
      </Menu>
    </>
  );
};

export type GoogleLoginButtonProps = {
  clientId: string;
};

export const GoogleLoginButton = ({ clientId }: GoogleLoginButtonProps) => {
  const { session, authenticate } = useContext(authContext);
  const { state } = useContext(stateContext);

  return session?.strategy === 'google' ? (
    <LoggedInGoogleButton />
  ) : (
    <GoogleLogin
      clientId={clientId}
      buttonText="Login"
      onSuccess={(response) => {
        if (!isGoogleLoginResponse(response)) {
          return;
        }
        const { tokenId, accessToken } = response;
        authenticate({
          strategy: 'google',
          data: { accessToken, idToken: tokenId },
        });
      }}
      render={(props) => {
        return (
          <Button
            color={state.animatedBackground ? 'info' : 'info'}
            style={{
              backgroundColor: '#001f3f',
              backgroundImage: 'linear-gradient(to bottom, #001f3f, #0F9D58)',
              color: '#fff',
              fontSize: '14px',
            }}
            {...props}
          >
            <GoogleIcon sx={{ mr: 1 }} />
            Login
          </Button>
        );
      }}
      onFailure={logError}
      cookiePolicy={'single_host_origin'}
    />
  );
};
