import { useComponent } from '@state-less/react-client';
import { Alert } from '@mui/material';
import { useState, useEffect } from 'react';

export const Server = () => {
  const [props, { loading, error }] = useComponent('server', {});
  const [count, setCount] = useState(0);
  useEffect(() => {
    setTimeout(setCount, 1000, (count + 1) % 2);
  });
  const dur = Date.now() - props?.uptime;
  const dt = new Date(dur).toUTCString().split(' ').at(-2);
  const days = Math.floor(dur / (1000 * 60 * 60 * 24));

  console.log('Error connecting to server', props, error);
  return (
    <div>
      {loading && <Alert severity="info">Loading...</Alert>}
      {error && <Alert severity="error">Server is down...</Alert>}
      {!error && !loading && (
        <Alert severity="success">
          Server running react-server v{props?.version} for {days}:{dt} on{' '}
          {props?.platform}
        </Alert>
      )}
    </div>
  );
};
