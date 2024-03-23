import { Visibility, Group } from '@mui/icons-material';

import { useComponent } from '@state-less/react-client';
import {
  Box,
  Tooltip,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CardProps,
} from '@mui/material';

export type ViewCounterProps = {
  componentKey: string;
  data?: any;
  skip?: boolean;
  variant?: 'chips' | 'plaintext' | 'listitem';
  clientOnly?: boolean;
  sx?: CardProps['sx'];
  textColor?: string;
  ssr?: boolean;
};

export const ViewCounterSpan = ({ component, clientOnly }) => {
  const clientStr = `${component?.props?.clients} ${
    clientOnly ? 'views' : 'users'
  }`;
  const viewsStr = `${component?.props?.views} views`;

  return (
    <div>
      {!clientOnly && <span>{viewsStr}</span>}
      <span>{clientStr}</span>
    </div>
  );
};

export const ViewCounterChip = ({ clientOnly, loading, component }) => {
  const clientStr = `${component?.props?.clients} ${
    clientOnly ? 'views' : 'users'
  }`;
  const viewsStr = `${component?.props?.views} views`;
  return (
    <>
      {!clientOnly && (
        <Chip icon={<Visibility />} label={loading ? '-' : viewsStr} />
      )}
      {<Chip icon={<Visibility />} label={loading ? '-' : clientStr} />}
    </>
  );
};

export const ViewCounterItem = ({
  component,
  clientOnly,
  loading,
  sx,
  textColor,
}) => {
  return (
    <Tooltip title="Views" placement="left">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'start',
          width: 'min-content',
          ...sx,
        }}
      >
        {!clientOnly && (
          <ListItem dense sx={{ color: textColor }}>
            <ListItemIcon>
              <Visibility />
            </ListItemIcon>
            <ListItemText
              sx={{ color: textColor }}
              primary={loading ? '-' : component?.props?.views}
            ></ListItemText>
          </ListItem>
        )}
        <ListItem dense>
          <ListItemIcon>{clientOnly ? <Visibility /> : <Group />}</ListItemIcon>
          <ListItemText
            sx={{ color: textColor }}
            primary={
              loading
                ? '-'
                : clientOnly
                ? component?.props?.views
                : component?.props?.clients
            }
          />
        </ListItem>
      </Box>
    </Tooltip>
  );
};

export const ViewCounter = ({
  componentKey,
  data,
  skip,
  variant,
  clientOnly,
  sx,
  textColor,
  ssr,
}: ViewCounterProps) => {
  const [component, { loading }] = useComponent(componentKey, {
    skip,
    data,
    suspend: true,
    ssr: ssr,
  });

  const props = { clientOnly, component, loading, sx, textColor };

  if (variant === 'plaintext') return <ViewCounterSpan {...props} />;
  if (variant === 'chips') return <ViewCounterChip {...props} />;
  return <ViewCounterItem {...props} />;
};
