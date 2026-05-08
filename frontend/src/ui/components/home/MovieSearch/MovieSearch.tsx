import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { AddMovieIcon } from '../_shared/icons';
import type { MovieSearchProps } from '../_shared/types';

export function MovieSearch({ movieState, movieActions }: MovieSearchProps) {
  const { query: movieQuery, options: movieOptions, loading: movieOptionsLoading, selected: selectedMovieOption } = movieState;
  const { handleMovieQueryChange, setSelectedMovieOption, addMovieToUser } = movieActions;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'stretch' }}>
      <Autocomplete
        fullWidth
        sx={{
          flex: 1,
          '& .MuiInputBase-root': {
            height: (theme) => theme.spacing(7),
          },
        }}
        options={movieOptions}
        loading={movieOptionsLoading}
        inputValue={movieQuery}
        value={selectedMovieOption}
        onInputChange={(_, value) => handleMovieQueryChange(value)}
        onChange={(_, value) => setSelectedMovieOption(value)}
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderInput={(params) => <TextField {...params} label="Adicionar filme" placeholder="Digite para buscar" />}
      />
      <Button
        variant="contained"
        startIcon={<AddMovieIcon />}
        sx={{
          minWidth: 120,
          alignSelf: 'stretch',
          height: (theme) => theme.spacing(7),
          minHeight: (theme) => theme.spacing(7),
          py: 0,
        }}
        disabled={!selectedMovieOption}
        onClick={() => {
          void addMovieToUser(selectedMovieOption);
        }}
      >
        Adicionar
      </Button>
    </Box>
  );
}
