import { Box, CircularProgress } from '@mui/material';
import type React from 'react';

export type LoadingProps = {
  /**
   * Min-height do skeleton (ex: '40vh', '18vh')
   */
  minHeight?: string | number;
  /**
   * Test id para facilitar assert nos testes.
   */
  testId?: string;
};

export function Loading({ minHeight = '40vh', testId = 'loading' }: LoadingProps) {
  return (
    <Box
      data-testid={testId}
      sx={{
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
