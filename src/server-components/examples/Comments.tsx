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
  Tooltip,
  CardHeader,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemIcon,
  Paper,
} from '@mui/material';
import { authContext, useComponent } from '@state-less/react-client';
import { useContext, useMemo, useState } from 'react';
import {
  Google as GoogleIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import { UpButton, UpDownButtons, VotingApp } from './VotingApp.js';
import { Markdown } from '../../components/Markdown.js';

export const CommunityComments = ({
  id = 'comments',
  title,
}: {
  id?: string;
  title?: string;
}) => {
  const [component, { error, loading }] = useComponent(id, {});
  const [features, { loading: featuresLoading }] = useComponent('features');
  const [comment, setComment] = useState('');
  const comments = component?.props?.comments || [];

  const canComment = component?.props?.permissions.comment;
  const canDelete = component?.props?.permissions.delete;
  const { children } = component || {};

  const [showComment, setShowComment] = useState(false);
  const wilson = useMemo(() => features?.props?.wilson, [loading]);
  // return <>{JSON.stringify(component)}</>;
  return (
    <>
      {title && <CardHeader title={title} />}
      {loading ||
        (featuresLoading && <Alert severity="info">Loading...</Alert>)}
      {error && <Alert severity="error">{error.message}</Alert>}
      {!canComment && (
        <Alert severity="info">You need to be logged in to comment.</Alert>
      )}

      <List dense>
        {(component?.children || []).map((child, index) => {
          return (
            <ListItem dense>
              <CommunityComment
                comment={child}
                canDelete={canDelete}
                wilson={wilson}
              />
            </ListItem>
          );
        })}
      </List>
      {!showComment && (
        <CardActions>
          <Button onClick={() => setShowComment(true)}>Add comment</Button>
        </CardActions>
      )}

      {showComment && (
        <>
          <CardContent sx={{ display: 'flex' }}>
            <TextField
              multiline
              rows={3}
              onChange={(e) => setComment(e.target.value)}
              fullWidth
              value={comment}
            />
          </CardContent>
          <CardActions>
            <Tooltip
              title={canComment ? '' : 'You need to be logged in to comment.'}
            >
              <span>
                <Button
                  onClick={() => {
                    component?.props?.comment(comment);
                    setComment('');
                  }}
                  disabled={!canComment}
                >
                  Add comment
                </Button>
              </span>
            </Tooltip>
          </CardActions>
        </>
      )}
    </>
  );
};

export const Comments = ({
  id = 'comments',
  title,
}: {
  id?: string;
  title?: string;
}) => {
  const [component, { error, loading }] = useComponent(id, {});
  const [features, { loading: featuresLoading }] = useComponent('features');
  const [comment, setComment] = useState('');
  const comments = component?.props?.comments || [];

  const canComment = component?.props?.permissions.comment;
  const canDelete = component?.props?.permissions.delete;
  const { children } = component || {};
  const [visible, setVisible] = useState(false);
  // return <>{JSON.stringify(component)}</>;
  return (
    <Paper square>
      {loading ||
        (featuresLoading && <Alert severity="info">Loading...</Alert>)}
      {error && <Alert severity="error">{error.message}</Alert>}
      {!canComment && (
        <Alert severity="info">You need to be logged in to comment.</Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {(component?.children || []).map((child, index) => {
          return (
            <Comment
              comment={child}
              canDelete={canDelete}
              wilson={features?.props?.wilson}
            />
          );
        })}
      </Box>

      {visible && (
        <CardContent>
          <TextField
            multiline
            rows={3}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            value={comment}
          />
        </CardContent>
      )}
      <CardActions>
        <Tooltip
          title={canComment ? '' : 'You need to be logged in to comment.'}
        >
          <span>
            <Button
              onClick={() => {
                if (!visible) {
                  setVisible(true);
                } else {
                  component?.props?.comment(comment);
                  setComment('');
                  setVisible(false);
                }
              }}
              disabled={!canComment}
            >
              {visible ? 'Post' : 'Add Comment'}
            </Button>
          </span>
        </Tooltip>
      </CardActions>
    </Paper>
  );
};

const StrategyIcons = {
  google: GoogleIcon,
};
const Comment = ({ comment, canDelete, wilson }) => {
  const { session } = useContext(authContext);
  const [component, { error, loading }] = useComponent(comment.key, {
    data: comment,
  });
  const props = component?.props;
  const isOwnComment =
    props.identity.email === session?.strategies?.[session?.strategy || '']?.email ||
    (props.identity.strategy === 'anonymous' &&
      props.identity.id === JSON.parse(localStorage.id));
  const Icon = StrategyIcons[props?.identity?.strategy];

  return (
    <Card>
      <Box sx={{ display: 'flex', ml: 1, mt: 1 }}>
        <UpDownButtons
          id={component?.children[0].key}
          data={component?.children[0]}
          wilson={wilson}
        />
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            pb: '0px !important',
            pt: 0,
          }}
        >
          <Markdown>{props?.message}</Markdown>
        </CardContent>
      </Box>
      <CardActions>
        {(canDelete || isOwnComment) && (
          <IconButton onClick={() => component?.props?.del()}>
            <DeleteIcon />
          </IconButton>
        )}
        <Chip
          avatar={
            props?.identity.picture && (
              <Avatar src={props?.identity.picture}>{<Icon />}</Avatar>
            )
          }
          label={props?.identity.name}
          sx={{ ml: 'auto' }}
        ></Chip>
      </CardActions>
    </Card>
  );
};

const CommunityComment = ({ comment, canDelete, wilson }) => {
  const { session } = useContext(authContext);
  const [component, { error, loading }] = useComponent(comment.key, {
    data: comment,
  });
  const props = component?.props;
  const isOwnComment =
    props.identity.email === session?.strategies?.[session?.strategy || '']?.email ||
    (props.identity.strategy === 'anonymous' &&
      props.identity.id === JSON.parse(localStorage.id));
  const Icon = StrategyIcons[props?.identity?.strategy];

  return (
    <>
      <ListItemIcon>
        <UpButton id={component?.children[0].key} wilson={wilson} />
      </ListItemIcon>
      <Markdown small>
        {props?.message + ` *- ${props?.identity.name}*`}
      </Markdown>

      {(canDelete || isOwnComment) && (
        <ListItemSecondaryAction>
          <IconButton size="small" onClick={() => component?.props?.del()}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </>
  );
};
