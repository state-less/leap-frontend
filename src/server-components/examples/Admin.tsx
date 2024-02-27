import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Typography,
  Checkbox,
} from '@mui/material';
import { authContext, useComponent } from '@state-less/react-client';
import { useContext } from 'react';

export const Admin = () => {
  const [features, { error, loading: featuresLoading }] =
    useComponent('features');
  const { session } = useContext(authContext);
  if (!session?.id) return <Alert severity="error">Not logged in.</Alert>;
  return (
    <Card>
      {error && <Alert severity="error">{error.message}</Alert>}

      <CardContent>
        <Typography variant="h5">Admin</Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="Wilson"
              secondary="Use Wilson score to sort comments"
            />
            <Checkbox
              checked={!!features?.props?.wilson}
              onClick={() => features?.props?.toggleWilson()}
              //   onChange={() => features?.props?.toggleWilson()}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Animation"
              secondary="Display animation on page"
            />
            <Checkbox
              checked={!!features?.props?.animated}
              onClick={() => features?.props?.toggleAnimated()}
              //   onChange={() => features?.props?.toggleWilson()}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};
