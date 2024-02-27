import { Alert } from '@mui/material';
import { useComponent } from '@state-less/react-client';

export const ServerSession = () => {
  const [component, { error, loading }] = useComponent('session', {});
  if (loading) return <Alert severity="info">Loading...</Alert>;
  if (error) return <Alert severity="error">{error.message}</Alert>;
  return (
    <Alert severity="success">{`Currently logged in on the server as ${sessionInfo(
      component.props.session
    )}`}</Alert>
  );
};

export const googleInfo = (session) => {
  return `${session.strategies.google.decoded.name} (${session.strategies.google.decoded.email})`;
};

const handler = {
  google: googleInfo,
};

export const sessionInfo = (session) => {
  return handler[session.strategy](session);
};
