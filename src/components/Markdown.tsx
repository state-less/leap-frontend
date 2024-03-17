import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  TableBody,
  Table,
  TableCell,
  TableHead,
  TableRow,
  Link,
  Box,
} from '@mui/material';

import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  useContext,
  useEffect,
  useMemo,
  createElement,
  ReactNode,
} from 'react';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { IconButton, List, ListItem, ListItemText } from '@mui/material';
import { ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import copy from 'copy-to-clipboard';
import rehypeRaw from 'rehype-raw';
import mermaid from 'mermaid';
import clsx from 'clsx';
import { atom, useAtom, PrimitiveAtom } from 'jotai';
import { v4 } from 'uuid';

import { Actions, stateContext } from '../provider/StateProvider.js';

const getChildText = (props) => {
  const texts =
    props.children?.map?.((c) => {
      if (typeof c === 'string') return c;
      if (c.type === 'code') return c.props.children;
    }) || [];

  return texts.join('');
};
type MarkdownProps = {
  children: string;
  src?: string;
  disablePadding?: boolean;
  optimisticHeight?: string;
  small?: boolean;
  preview?: boolean;
  center?: boolean;
  landing?: boolean;
  cacheKey?: string;
  fetchFn?: (() => Promise<string>) | null;
  errorMD?: string;
};

export const FetchSOAnswerById = (id, url) => async () => {
  const res = await fetch(
    `https://api.stackexchange.com/2.3/answers/${id}?order=desc&sort=activity&site=stackoverflow&filter=!nNPvSNdWme&key=${encodeURIComponent(
      'IQOO7kdoZ)ST9J0b)HCfww(('
    )}&client_id=28299`
  );

  const json = await res.json();
  const answer = json?.items?.[0];

  return `${quote(answer?.body)}\n<sub>- [${answer?.owner?.['display_name']}](${
    answer?.owner?.link
  }): ${url}</sub>`;
};

export const FetchTextContent = (url) => async () => {
  const res = await fetch(url);
  const text = await res.text();
  return text;
};

export type FetchState = {
  loading: number;
  result: string | null;
  error: Error | null;
};
const useFetchAtoms: Record<string, PrimitiveAtom<FetchState>> = {};
export const useFetch = (
  initialValue: string,
  fetchFn: null | (() => Promise<string>),
  cacheKey?: string
) => {
  const key = useMemo(() => {
    return cacheKey || v4();
  }, [cacheKey]);

  const atm =
    useFetchAtoms[key] ||
    (useFetchAtoms[key] = atom<FetchState>({
      loading: fetchFn === null ? 2 : 0,
      error: null,
      result: fetchFn === null ? initialValue : null,
    }));
  const [state, setState] = useAtom(atm);

  useEffect(() => {
    if (fetchFn) return;
    setState((state) => ({ ...state, result: initialValue }));
  }, [initialValue, setState, fetchFn]);

  useEffect(() => {
    if (!fetchFn) return;
    if (state?.loading > 0) return;
    setState((state) => ({ ...state, loading: 1 }));
    fetchFn()
      .then(async (text) => {
        setState((state) => ({ ...state, loading: 2, result: text }));
      })
      .catch((e) => {
        setState((state) => ({ ...state, loading: 3, result: null, error: e }));
      });
  }, [fetchFn, setState, state?.loading]);

  return state;
};

const quote = (str) => {
  return str
    .split('\n')
    .map((line) => '> ' + line)
    .join('\n');
};

mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Fira Code',
});

const Mermaid = (props) => {
  useEffect(() => {
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{props.children}</div>;
};

export const Markdown = ({
  children,
  src,
  disablePadding,
  optimisticHeight = '0px',
  small = false,
  preview = false,
  center = true,
  landing = false,
  errorMD,
  fetchFn: userFetchFn,
  cacheKey = src,
}: MarkdownProps) => {
  const { dispatch } = useContext(stateContext);
  const { hash } = useLocation();
  let fetchFn = userFetchFn;
  const fetchSrc = useMemo(() => FetchTextContent(src), [src]);
  if (src && !fetchFn) {
    fetchFn = fetchSrc;
  } else if (!src && !fetchFn) {
    fetchFn = null;
  }

  const { loading, result, error } = useFetch(
    children,
    fetchFn || null,
    cacheKey
  );

  useEffect(() => {
    if (loading > 1 && hash) {
      setTimeout(() => {
        document
          .querySelector(hash)
          ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 50);
    }
  }, [loading, hash]);

  const headingRenderer = useMemo(
    () => (props) => {
      const { children } = props;
      const text =
        typeof children === 'string' ? children : getChildText(props);

      if (typeof text === 'string') {
        const anchor = (text || '')
          .toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove special characters
          .replace(/\s+/g, '-'); // Replace spaces with hyphens

        return createElement(
          props?.node?.tagName,
          { id: anchor || undefined },
          children
        );
      }

      return createElement(props?.node?.tagName, {}, children);
    },
    [preview]
  );

  const components = useMemo(() => {
    return {
      h1: headingRenderer,
      h2: headingRenderer,
      h3: headingRenderer,
      h4: headingRenderer,
      h5: headingRenderer,
      h6: headingRenderer,
      ul: (props) => {
        return (
          <List dense disablePadding>
            {props.children.map((child) => {
              if (child === '\n') return null;
              return (
                <ListItem
                  dense
                  sx={{
                    py: 0,
                    my: 1,
                    borderLeft: '1.5px solid',
                    borderLeftColor: 'info.main',
                  }}
                >
                  <ListItemText
                    sx={{ m: 0 }}
                    primary={child?.props?.children || child}
                  ></ListItemText>
                </ListItem>
              );
            })}
          </List>
        );
      },
      pre: (props) => {
        const language = (props?.children?.props?.className || '-bash').split(
          '-'
        )[1];

        if (language === 'github') {
          const url = props?.children?.props?.children;

          return (
            <Markdown src={url} key={url} center={false} preview={preview}>
              {`Loading Markdown from Github: ${url}`}
            </Markdown>
          );
        }
        if (language === 'stackoverflow') {
          const url = props?.children?.props?.children;
          const id = url.split('/').at(-2);

          return (
            <Markdown
              key={id}
              center={false}
              disablePadding
              fetchFn={FetchSOAnswerById(id, url)}
              cacheKey={id}
              preview={preview}
            >
              {`*See this Stackoverflow answer: [${url}](${url})`}
            </Markdown>
          );
        }

        if (language === 'mermaid') {
          return <Mermaid>{props?.children?.[0].props.children}</Mermaid>;
        }

        const child = Array.isArray(props.children)
          ? props.children[0]
          : props.children;

        return (
          <>
            <Box sx={{ width: '100%', display: 'flex' }}>
              <IconButton
                sx={{ ml: 'auto', mb: -7, color: 'white' }}
                onClick={() => {
                  copy(props?.children?.[0].props.children);
                  dispatch({
                    type: Actions.SHOW_MESSAGE,
                    value: 'Copied to clipboard',
                  });
                }}
              >
                <ContentCopyIcon />
              </IconButton>
            </Box>
            <SyntaxHighlighter language={language} style={a11yDark}>
              {child.props.children}
            </SyntaxHighlighter>
          </>
        );
      },
      a: (props) => {
        return (
          <Link
            to={props.href}
            component={(props) => {
              return (
                <RouterLink
                  {...props}
                  onClick={() => {
                    document
                      .querySelector(hash)
                      ?.scrollIntoView({ block: 'center', behavior: 'smooth' });
                  }}
                />
              );
            }}
            sx={{ color: 'info.main' }}
          >
            {props.children}
          </Link>
        );
      },
      blockquote: (args) => {
        return (
          <Box
            sx={{
              borderLeft: '4px solid',
              borderColor: 'primary.main',
            }}
          >
            <blockquote {...args} />
          </Box>
        );
      },
      table: (props) => {
        return (
          <Table>
            <TableHead>
              <TableRow>
                {props.children[0].props.children[0].props.children?.map(
                  (e) => {
                    return <TableCell>{e}</TableCell>;
                  }
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.children[1].props.children.map((row) => {
                return (
                  <TableRow>
                    {row.props.children.map((e) => {
                      return <TableCell>{e}</TableCell>;
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        );
      },
      stackoverflow: (props) => {
        const { url, children } = props;
        if (typeof children === 'string') {
          const trimmed = children.trim();
          const id = url.split('/').at(-2);
          return (
            <Markdown
              key={id}
              center={false}
              disablePadding
              errorMD={trimmed}
              fetchFn={FetchSOAnswerById(id, url)}
              cacheKey={id}
              preview={preview}
            >
              {`*See this Stackoverflow answer: [${url}](${url})`}
            </Markdown>
          );
        }
      },
      github: (props) => {
        const { url, children } = props;
        const trimmed =
          typeof children === 'string' ? children.trim() : children;

        return (
          <Markdown
            src={url}
            key={url}
            center={false}
            errorMD={trimmed}
            preview={preview}
          >
            {`Loading Markdown from Github: ${url}`}
          </Markdown>
        );
      },
    };
  }, [dispatch, headingRenderer]);

  return (
    <div
      className={clsx('markdown', {
        center,
        disablePadding,
        preview,
        landing,
      })}
      style={{
        minHeight: optimisticHeight,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        alignContent: 'center',
      }}
    >
      <ReactMarkdown
        className={clsx({ 'markdown-small': small })}
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {error ? errorMD : loading < 2 ? children : result}
      </ReactMarkdown>
    </div>
  );
};
