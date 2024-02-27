import {
  Alert,
  Box,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Chip,
} from '@mui/material';
import { useComponent } from '@state-less/react-client';
import HeartIcon from '@mui/icons-material/Favorite';
import { ReactNode } from 'react';
import { FlexBox } from '../../components/FlexBox';

export const Poll = ({
  id = 'poll',
  message,
}: {
  id?: string;
  message?: (props: Record<string, any>) => ReactNode;
}) => {
  const [component, { error, loading }] = useComponent(id, {});
  const sum = component?.props?.votes.reduce((a, b) => a + b, 0);
  const max = component?.props?.votes?.reduce((a, b) => Math.max(a, b), 0);
  return (
    <Card>
      {loading && <Alert severity="info">Loading...</Alert>}
      {error && <Alert severity="error">{error.message}</Alert>}
      {message && message?.(component?.props || {})}
      <List>
        {component?.props?.values?.map((value, i) => {
          const percentage = (100 / sum) * component?.props?.votes[i];
          return (
            <ListItem dense>
              <Box
                sx={{
                  ml: -2,
                  zIndex: 0,
                  position: 'absolute',
                  width: `${percentage}%`,
                  height: `100%`,
                  backgroundColor: 'info.main',
                }}
              />
              <ListItemText
                sx={{ zIndex: 0 }}
                primary={
                  <FlexBox sx={{ gap: 1, alignItems: 'center' }}>
                    <Chip
                      color={
                        max === component?.props?.votes[i]
                          ? 'success'
                          : undefined
                      }
                      size="small"
                      label={<b>{component?.props?.votes[i]}</b>}
                    ></Chip>
                    <Box>{value}</Box>
                  </FlexBox>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => component?.props?.vote(i)}
                  disabled={
                    component?.props?.voted > -1 &&
                    component?.props?.voted !== i
                  }
                  color={component.props.voted === i ? 'error' : 'default'}
                >
                  <HeartIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>
    </Card>
  );
};
