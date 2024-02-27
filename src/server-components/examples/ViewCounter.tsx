import VisibilityIcon from '@mui/icons-material/Visibility';
import GroupIcon from '@mui/icons-material/Group';

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
        <Chip icon={<VisibilityIcon />} label={loading ? '-' : viewsStr} />
      )}
      {<Chip icon={<VisibilityIcon />} label={loading ? '-' : clientStr} />}
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
              <VisibilityIcon />
            </ListItemIcon>
            <ListItemText
              sx={{ color: textColor }}
              primary={loading ? '-' : component?.props?.views}
            ></ListItemText>
          </ListItem>
        )}
        <ListItem dense>
          <ListItemIcon>
            {clientOnly ? <VisibilityIcon /> : <GroupIcon />}
          </ListItemIcon>
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
}: ViewCounterProps) => {
  const [component, { loading }] = useComponent(componentKey, {
    skip,
    data,
  });

  const props = { clientOnly, component, loading, sx, textColor };

  if (variant === 'plaintext') return <ViewCounterSpan {...props} />;
  if (variant === 'chips') return <ViewCounterChip {...props} />;
  return <ViewCounterItem {...props} />;
};
