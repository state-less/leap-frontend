import {
  Container,
  TextField,
  Button,
  Box,
  Card,
  CardHeader,
  CardContent,
  Chip,
  CardActions,
  Alert,
  LinearProgress,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import {
  authContext,
  useComponent,
  useLocalStorage,
} from '@state-less/react-client';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useEffect, useState, useRef, useContext } from 'react';

import { CommunityComments } from '../server-components/examples/Comments.js';
import { useSyncedState } from '../lib/hooks.js';
import { ViewCounter } from '../server-components/examples/ViewCounter.js';
import { UpDownButtons } from '../server-components/examples/VotingApp.js';
import { FlexBox } from '../components/FlexBox.js';

import {
  AnswerActions,
  ContentEditor,
  OwnerChip,
  PostActions,
} from '../server-components/ContentEditor.js';

import { NewPost } from './newPost.js';

import { NewPostButton } from './index.js';
import { GoogleLoginButton } from '../components/LoggedInGoogleButton.js';
import { Home, Visibility } from '@mui/icons-material';

import { Helmet } from 'react-helmet';

export type PostsPageProps = {
  clientId?: string;
  forumKey: string;
  basePath?: string;
  onTitleLeave?: (left: boolean) => void;
  settings?: {
    showPostBC?: boolean;
    forumTitle?: string;
    renderMetaTags?: boolean;
  };
  ssr?: boolean;
};
export const PostsPage = ({
  basePath = '',
  forumKey,
  clientId,
  onTitleLeave,
  settings: { showPostBC, forumTitle, renderMetaTags } = {},
  ssr,
}: PostsPageProps) => {
  const params = useParams();

  if (params.post === 'new') {
    return <NewPost forumKey={forumKey} ssr={ssr} />;
  }

  return (
    <Container maxWidth="lg" disableGutters sx={{ py: 4 }}>
      {params.post && (
        <Post
          id={params.post}
          basePath={basePath}
          onTitleLeave={onTitleLeave}
          showBC={showPostBC}
          settings={{ forumTitle, renderMetaTags }}
          ssr={ssr}
        />
      )}
      <ComposeAnswer id={params.post} clientId={clientId} ssr={ssr} />
    </Container>
  );
};

const DRAFT = true;
export type PostProps = {
  id: string;
  basePath?: string;
  onTitleLeave?: (left: boolean) => void;
  showBC?: boolean;
  settings?: { forumTitle?: string; renderMetaTags?: boolean };
  ssr?: boolean;
};
const Post = ({
  id,
  basePath,
  onTitleLeave,
  showBC = false,
  settings: { forumTitle, renderMetaTags } = {},
  ssr,
}: PostProps) => {
  // const { dispatch } = useContext(stateContext);
  const [_, setSkip] = useState(false);
  const [component, { error, loading }] = useComponent(id, {
    suspend: true,
    ssr,
  });

  useEffect(() => {
    /* Skip recreated ViewCounter component as long as the post is in the cache*/
    if (component?.props) setSkip?.(true);
  }, [component?.props, setSkip]);

  const [edit, setEdit] = useState(0);
  const [showDeleted, setShowDeleted] = useLocalStorage(
    'mod-show-deleted',
    false
  );
  const [bodyServer, setBodyServer, { loading: bodyLoading }] = useSyncedState(
    component?.props?.body,
    component?.props?.setBody,
    {
      draft: DRAFT,
    }
  );

  const ref = useRef(null);

  useEffect(() => {
    if (!ref?.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onTitleLeave?.(true);
          // dispatch({ type: Actions.SET_LAST_BC, value: true });
        } else if (entries[0]?.boundingClientRect?.y > 0) {
          onTitleLeave?.(false);
          // dispatch({ type: Actions.SET_LAST_BC, value: false });
        }
      },
      {
        root: document.body,
        rootMargin: '0px 0px -100%',
        threshold: 0.0,
      }
    );
    obs.observe(ref?.current);
  }, [ref?.current]);

  const [body, setBody] = useState(bodyServer);
  useEffect(() => {
    setBody(bodyServer);
  }, [bodyServer]);
  if (error) return null;
  if (loading)
    return (
      <>
        <Alert severity="info">Loading...</Alert>
        <LinearProgress variant="indeterminate" />
      </>
    );
  const title = component?.props?.title || 'Post';
  return (
    <div ref={ref}>
      <FlexBox
        sx={{
          alignItems: 'center',
          height: 'min-content',
          flexWrap: 'wrap-reverse',
        }}
      >
        {renderMetaTags && (
          <Helmet>
            <title>{`${title} | ${forumTitle}`}</title>
            <meta property="og:title" content={`${title} | ${forumTitle}`} />
            <meta name="twitter:title" content={`${title} | ${forumTitle}`} />
          </Helmet>
        )}
        <CardHeader
          title={
            showBC ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Link
                  component={RouterLink}
                  sx={{ color: 'black', display: 'flex' }}
                  to={'/'}
                >
                  <Home sx={{ width: '1.4em', height: '1.4em' }} />
                </Link>
                /
                <Typography variant="h4" sx={{ color: 'black' }}>
                  {title}
                </Typography>
              </Box>
            ) : (
              title
            )
          }
        ></CardHeader>

        <FlexBox
          sx={{
            ml: 'auto',
            mr: { xs: 'auto', sm: 'unset' },
            px: 2,
            flexDirection: { xs: 'column-reverse', sm: 'row' },
          }}
        >
          <IconButton
            color={showDeleted ? 'info' : undefined}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Visibility />
          </IconButton>
          <NewPostButton basePath={basePath} />
        </FlexBox>
      </FlexBox>
      <Card sx={{ mb: 1 }} color="info">
        {component?.props?.deleted && (
          <Alert severity="error">This post has been deleted.</Alert>
        )}
        {!component?.props?.canDelete && !component?.props?.approved && (
          <Alert severity="info">This post needs approval from an admin.</Alert>
        )}
        <FlexBox
          sx={{
            maxWidth: '100%',
            flexDirection: {
              xs: 'column',
              sm: 'row',
            },
          }}
        >
          {component?.children[0] && (
            <UpDownButtons
              data={component?.children[0]}
              id={component?.children[0]?.component}
              wilson={false}
            />
          )}
          <ContentEditor
            draft={DRAFT}
            body={DRAFT ? body : bodyServer}
            component={component}
            edit={edit > 0}
            loading={bodyLoading}
            setBody={DRAFT ? setBody : setBodyServer}
            setEdit={async (e) => {
              if (!e) {
                await setBodyServer(body);
                setEdit(0);
              } else {
                setEdit(2);
              }
            }}
          />
        </FlexBox>
        <PostActions
          draft={DRAFT}
          component={component}
          edit={edit}
          setEdit={async (e) => {
            if (!e) {
              await setBodyServer(body);
              setEdit(0);
            } else {
              setEdit(2);
            }
          }}
        />
        {component?.props.tags?.length > 0 && (
          <CardContent sx={{ display: 'flex', gap: 1 }}>
            {component?.props.tags?.map((tag) => (
              <Chip color="info" label={tag} />
            ))}
          </CardContent>
        )}
      </Card>
      {component?.props.viewCounter && (
        <ViewCounter componentKey={component?.props.viewCounter?.component} ssr={ssr} />
      )}
      {component?.children
        .filter(
          (c) => c?.props?.body && (showDeleted ? true : !c?.props?.deleted)
        )
        ?.map((answer) => {
          return <Answer answer={answer} ssr={ssr} />;
        })}
    </div>
  );
};

const Answer = ({ answer, ssr }) => {
  const [component] = useComponent(answer?.component, {
    suspend: true,
    ssr,
    data: answer,
  });
  const [edit, setEdit] = useState(0);
  const [bodyServer, setBodyServer, { loading: bodyLoading }] = useSyncedState(
    component?.props?.body,
    component?.props?.setBody
  );

  const [body, setBody] = useState(bodyServer);

  return (
    <Card sx={{ mb: 1 }} color="info">
      <FlexBox>
        <UpDownButtons
          id={answer?.children[0]?.component}
          data={answer?.children[0]}
          wilson={false}
        />
        <Box sx={{ width: '100%' }}>
          {component?.props?.deleted && (
            <Alert severity="error">This post has been deleted.</Alert>
          )}
          <ContentEditor
            draft={DRAFT}
            body={DRAFT ? body : bodyServer}
            component={component}
            edit={edit > 0}
            loading={bodyLoading}
            setBody={DRAFT ? setBody : setBodyServer}
            setEdit={async (e) => {
              if (!e) {
                await setBodyServer(body);
                setEdit(0);
              } else {
                setEdit(2);
              }
            }}
          />
        </Box>
      </FlexBox>

      <AnswerActions
        component={component}
        edit={edit}
        setEdit={async (e) => {
          if (!e) {
            await setBodyServer(body);
            setEdit(0);
          } else {
            setEdit(2);
          }
        }}
        draft={DRAFT}
        ssr={ssr}
      />
      <CommunityComments id={answer?.children[1]?.component} ssr={ssr} />
    </Card>
  );
};

const ComposeAnswer = ({ id, clientId, ssr }) => {
  const { session } = useContext(authContext);
  const [component] = useComponent(id, {
    suspend: true,
    ssr,
  });
  const [body, setBody] = useState('');
  return (
    <Card sx={{ p: 2 }}>
      <TextField
        multiline
        fullWidth
        label="Answer"
        rows={7}
        onChange={(e) => setBody(e.target.value)}
        value={body}
      />
      <CardActions>
        <Button
          disabled={body.length === 0}
          onClick={async () => {
            setBody('');
            await component?.props?.createAnswer({
              body,
            });
          }}
        >
          Post Answer
        </Button>
        {session?.id && (
          <OwnerChip
            sx={{ marginLeft: 1 }}
            owner={session?.strategies?.[session?.strategy || '']?.decoded}
          />
        )}
        {!session?.id && <GoogleLoginButton clientId={clientId} />}
      </CardActions>
    </Card>
  );
};
export default PostsPage;
