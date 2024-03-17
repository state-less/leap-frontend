import { useServerState } from '@state-less/react-client';
import { Box, Tooltip } from '@mui/material';
import { Sensors } from '@mui/icons-material';

export const ConnectionCounter = () => {
  const [connections, _, { loading }] = useServerState(0, {
    key: 'connections',
    scope: 'global',
  });

  return (
    <Tooltip title="Connections" placement="bottom">
      <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
        <Sensors />
        {loading ? '-' : connections}
      </Box>
    </Tooltip>
  );
};
