import {
  Container,
  Button,
  Typography,
  Box,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Link,
  Pagination,
  CardActions,
  Grid,
  LinearProgress,
  MenuItem,
  Select,
  BoxProps,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useComponent, useLocalStorage } from '@state-less/react-client';
import { Link as RouterLink } from 'react-router-dom';
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Markdown } from '../components/Markdown.js';
import { FlexBox } from '../components/FlexBox.js';
import { calc } from '../server-components/examples/VotingApp.js';
import { DEF_PAGE_SIZE } from '../lib/const.js';
import { ViewCounter } from '../server-components/examples/ViewCounter.js';
import { GoogleLoginButton } from '../components/LoggedInGoogleButton.js';

export type ForumPageProps = {
  pageSize?: number;
  startPage?: number;
  forumKey: string;
  basePath?: string;
  clientId?: string;
  ghSrc: {
    rules: string;
    qa: string;
  };
};

export type OverViewPostProps = {
  children: any[];
  component?: string;
  props: PostServerProps;
  basePath: string;
};

export type PostServerProps = {
  title?: string;
  deleted?: boolean;
  body?: string;
  sticky?: boolean;
  tags?: string[];
};

export const ForumPage = ({
  pageSize: configuredPageSize = DEF_PAGE_SIZE,
  startPage = 1,
  forumKey,
  basePath = '',
  clientId,
  ghSrc = {} as any,
}: ForumPageProps) => {
  const [page, setPage] = useState(startPage);
  const [pageSize, setPageSize] = useLocalStorage(
    'forum-page-size',
    configuredPageSize
  );
  const [component, { loading }] = useComponent(forumKey, {
    suspend: true,
    ssr: import.meta.env.SSR,
    props: {
      page,
      pageSize,
      compound: false,
    },
  });
  useEffect(() => {
    document
      .getElementById('root-container')
      ?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <Container maxWidth="lg" disableGutters>
      <Card
        sx={{
          boxShadow: '0 2px 2px -2px gray;',
          px: {
            xs: 0,
            sm: 2,
            md: 4,
          },
          mb: '1px',
        }}
      >
        {/* <Markdown src={getRawPath(PAGE_SRC)}>*Loading*</Markdown> */}
        <Header />
        <CardContent>
          {/* {document.getElementById('progress') &&
            createPortal(
              loading ? (
                <LinearProgress color="secondary" variant={'indeterminate'} />
              ) : (
                <LinearProgress
                  color="secondary"
                  value={100}
                  variant="determinate"
                />
              ),
              document.getElementById('progress')!
            )} */}
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              md={9}
              order={{
                xs: 1,
                md: 0,
              }}
            >
              <Posts component={component} basePath={basePath} />
            </Grid>
            <Grid
              item
              xs={12}
              md={3}
              order={{
                xs: 0,
                md: 1,
              }}
            >
              <ForumRules
                ghSrc={ghSrc}
                basePath={basePath}
                clientId={clientId}
              />
            </Grid>
          </Grid>
        </CardContent>

        <CardActions
          sx={{
            boxShadow: '0px 0px 2px 0px black',
            display: 'flex',
            mt: 4,
          }}
        >
          <Pagination
            count={Math.ceil(component?.props?.totalCount / pageSize) || 0}
            page={page}
            onChange={(_, p) => setPage(p)}
          />

          <PageSize pageSize={pageSize} setPageSize={setPageSize} />
        </CardActions>
      </Card>
    </Container>
  );
};

export type ForumRulesProps = {
  basePath?: string;
  clientId?: string;
  ghSrc: {
    rules: string;
    qa: string;
  };
};
export const ForumRules = ({ ghSrc, basePath, clientId }: ForumRulesProps) => {
  const [expanded, setExpanded] = useState(0);
  return (
    <StickyCard top={64}>
      <Accordion
        defaultExpanded={true}
        expanded={expanded === 0}
        onChange={() => setExpanded(expanded === 0 ? -1 : 0)}
      >
        <AccordionSummary
          sx={{
            minHeight: '48px !important',
          }}
        >
          Forum Rules
        </AccordionSummary>
        <AccordionDetails>
          <Markdown center={false} src={ghSrc.rules}>
            Error Loading Rules
          </Markdown>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === 1}
        onChange={() => setExpanded(expanded === 1 ? -1 : 1)}
      >
        <AccordionSummary
          sx={{
            minHeight: '48px !important',
          }}
        >
          Q & A
        </AccordionSummary>
        <AccordionDetails>
          <Markdown center={false} src={ghSrc.qa}>
            Loading from GitHub
          </Markdown>
        </AccordionDetails>
      </Accordion>

      <CardActions>
        <NewPostButton basePath={basePath} />
        {clientId && <GoogleLoginButton clientId={clientId} />}
      </CardActions>
    </StickyCard>
  );
};
export const StickyCard = (props) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref?.current) return;
    const onScroll = (e: any) => {
      const scrollTop = e?.target?.scrollTop || 0;

      const max =
        (ref?.current?.parentElement?.getBoundingClientRect?.()?.height || 0) -
        (ref?.current?.getBoundingClientRect()?.height || 0) -
        16;
      const top = Math.min(max, Math.max(0, scrollTop - props.top)) + 'px';
      if (ref.current) {
        ref.current.style.transform = `translateY(${top})`;
      }
    };
    document.getElementById('scroll')?.addEventListener('scroll', onScroll);
    return () => {
      document
        .getElementById('scroll')
        ?.removeEventListener('scroll', onScroll);
    };
  }, [ref?.current]);
  return <Card ref={ref}>{props.children}</Card>;
};

const Post = (post: OverViewPostProps) => {
  const { basePath } = post;
  const [votes] = useComponent(post.children?.[0]?.component, {
    data: post.children?.[0],
    suspend: true,
    ssr: import.meta.env.SSR,
  });
  const { score, upvotes, downvotes } = votes?.props || {};
  const wilson = true,
    random = true;

  const randomUp = useMemo(() => Math.random(), []);
  const randomDown = useMemo(() => Math.random(), []);
  const sum = useMemo(
    () =>
      calc(upvotes, {
        lb: score?.upvote[0],
        ub: score?.upvote[1],
        wilson,
        random,
        r: randomUp,
      }) -
      calc(downvotes, {
        lb: score?.downvote[0],
        ub: score?.downvote[1],
        wilson,
        random,
        r: randomDown,
      }),
    [upvotes, downvotes, score, wilson, random]
  );

  const nAnswers =
    post.children?.filter?.((c) => c?.props?.body && !c?.props?.deleted)
      ?.length || 0;

  return (
    <Card
      square
      sx={{
        opacity: post.props.deleted ? 0.9 : 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            md: 'row',
          },
        }}
      >
        {post?.props?.sticky && (
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: {
                xs: '100%',
                md: '2px',
              },
              height: {
                xs: '2px',
                md: 'unset',
              },
              // borderTop: '4px dashed',
              backgroundColor: 'info.main',
            }}
          ></Box>
        )}

        <Grid container>
          <Grid item order={{ xs: 2, md: 0 }} xs={12} md={3}>
            <FlexBox sx={{ flexDirection: 'column', gap: 1, minWidth: 200 }}>
              <PostOverviewMeta
                plainText={false}
                nAnswers={nAnswers}
                nVotes={sum}
                post={post}
              />
            </FlexBox>
          </Grid>
          <Grid item xs={12} md={9}>
            <Box>
              <CardHeader
                title={
                  <Link
                    sx={{ color: 'secondary.main' }}
                    to={`${basePath}/${post.component}`}
                    component={RouterLink}
                  >
                    {post.props.title}
                  </Link>
                }
                sx={{ pb: 0 }}
              />
              <CardContent
                sx={{
                  pt: 0,
                  pb: '0rem !important',
                  maxHeight: '5rem',
                  mb: 2,

                  overflow: 'hidden',
                }}
              >
                <Markdown preview disablePadding center={false}>
                  {post.props.body || ''}
                </Markdown>
              </CardContent>
              {(post.props.tags?.length || 0) > 0 && (
                <CardContent sx={{ display: 'flex', gap: 1 }}>
                  {post.props.tags?.map((tag) => (
                    <Chip size="small" label={tag} />
                  ))}
                </CardContent>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};

const PostOverviewMeta = ({ nVotes, nAnswers, post, plainText }) => {
  const votesStr = `${nVotes} votes`;
  const answersStr = `${nAnswers} answers`;
  return (
    <CardContent
      sx={{
        ml: 'auto',
        mr: {
          xs: 'auto',
          md: 'unset',
        },
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: {
          xs: 'row',
          md: 'column',
        },
        gap: 1,
        textAlign: 'right',
      }}
    >
      {plainText ? <span>{votesStr}</span> : <Chip label={votesStr} />}
      {plainText ? <span>{answersStr}</span> : <Chip label={answersStr}></Chip>}
      {post?.props?.canDelete && (
        <Chip
          variant="outlined"
          color={
            post.props.deleted
              ? 'error'
              : post.props.locked
              ? 'warning'
              : post.props.approved
              ? 'success'
              : undefined
          }
          label={['deleted', 'locked', 'approved']
            .filter((k) => !!post.props[k])
            .join('. ')}
        ></Chip>
      )}
      <ViewCounter
        clientOnly
        variant={plainText ? 'plaintext' : 'listitem'}
        componentKey={post?.props?.viewCounter?.component}
        data={post?.props?.viewCounter}
      />
    </CardContent>
  );
};

const Posts = ({ component, basePath }) => {
  const sticky = component?.children?.filter((post) => post.props.sticky) || [];
  const nonSticky =
    component?.children?.filter((post) => !post.props.sticky) || [];

  return (
    <FlexBox sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {sticky?.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {sticky.map((post) => {
            return <Post {...post} basePath={basePath} />;
          })}
        </Box>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {nonSticky.map((post) => {
          return <Post {...post} basePath={basePath} />;
        })}
      </Box>
    </FlexBox>
  );
};
const Header = () => {
  return (
    <CardHeader
      title={
        <FlexBox sx={{ alignItems: 'center' }}>
          <Typography variant="h5">All Questions</Typography>
        </FlexBox>
      }
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap-reverse',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    ></CardHeader>
  );
};

export const PageSize = ({ pageSize, setPageSize }) => {
  return (
    <Select
      size="small"
      value={pageSize}
      onChange={(e) => setPageSize(e.target.value)}
      sx={{ ml: 'auto', mr: 2 }}
    >
      <MenuItem value={5}>5</MenuItem>
      <MenuItem value={15}>15</MenuItem>
      <MenuItem value={25}>25</MenuItem>
      <MenuItem value={50}>50</MenuItem>
    </Select>
  );
};
export const NewPostButton = ({
  basePath = '',
  sx,
}: {
  basePath?: string;
  sx?: BoxProps['sx'];
}) => {
  return (
    <Link to={`${basePath}/new`} component={RouterLink} color={'#EEEEEE'}>
      <Button variant="contained" color="secondary" sx={sx}>
        Ask Question
      </Button>
    </Link>
  );
};

export default ForumPage;
