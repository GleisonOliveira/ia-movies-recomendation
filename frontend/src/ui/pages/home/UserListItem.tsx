import { Box, Button, Typography } from '@mui/material';
import type { User } from '@/services/user/UserService';

type Props = {
  user: User;
  onClick: (user: User) => void;
};

export function UserListItem({ user, onClick }: Props) {
  return (
    <Button
      variant="outlined"
      onClick={() => onClick(user)}
      sx={{ justifyContent: 'space-between' }}
    >
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="subtitle1">{user.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {user.age} anos
        </Typography>
      </Box>
    </Button>
  );
}
