import {
  Alert,
  Box,
  Button,
  Card,
  CardHeader,
  Checkbox,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { useComponent } from '@state-less/react-client';
import { useEffect, useState } from 'react';

export const TodoApp = (props) => {
  const [component, { loading, error }] = useComponent('todos', {});
  const [title, setTitle] = useState('');
  const [edit, setEdit] = useState(false);

  if (loading) {
    return null;
  }

  return (
    <Card>
      {error && <Alert severity="error">{error.message}</Alert>}
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              value={title}
              label="Title"
              onChange={(e) => setTitle(e.target.value)}
            />
            <Button
              onClick={() => {
                setTitle('');
                component.props.add({ title, completed: false });
              }}
            >
              Add
            </Button>
          </Box>
        }
        action={
          <IconButton onClick={() => setEdit(!edit)}>
            <EditIcon />
          </IconButton>
        }
      ></CardHeader>
      <List>
        {component?.children.map((todo, i) => (
          <TodoItem
            key={i}
            todo={todo}
            edit={edit}
            remove={component?.props?.remove}
          />
        ))}
      </List>
    </Card>
  );
};

const TodoItem = (props) => {
  const { todo, edit, remove } = props;

  // Hydarate the call with the data from the parent component
  const [component, { loading }] = useComponent(todo.key, { data: todo });

  return (
    <ListItem>
      {edit && (
        <ListItemIcon>
          <IconButton onClick={() => remove(component.props.id)}>
            <RemoveCircleIcon />
          </IconButton>
        </ListItemIcon>
      )}
      <ListItemText
        primary={component.props.title}
        sx={{ textDecoration: component.props.completed ? 'line-through' : '' }}
      />
      <ListItemSecondaryAction>
        <Checkbox
          checked={component?.props.completed}
          onClick={() => {
            component?.props.toggle();
          }}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
};
