import { useComponent } from '@state-less/react-client';
import { Alert, Button } from '@mui/material';

export const HelloWorldExample1 = () => {
  const [component, { loading, error }] = useComponent('hello-world-1', {});

  return (
    <>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Button onClick={() => component?.props?.increase()}>Increase</Button>
    </>
  );
};

export const HelloWorldExample2 = () => {
  const [component, { loading, error }] = useComponent('hello-world-2', {});

  return (
    <>
      {error && <Alert severity="error">{error.message}</Alert>}
      <Button onClick={() => component?.props?.increase()}>
        Count is {component?.props?.count}
      </Button>
    </>
  );
};
