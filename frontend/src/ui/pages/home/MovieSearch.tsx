import { Autocomplete, Box, Button, TextField } from '@mui/material';
import { AddMovieIcon } from './icons';
import type { MovieSearchProps } from './types';

export function MovieSearch({ movieState, movieActions }: MovieSearchProps) {
  const { query: movieQuery, options: movieOptions, loading: movieOptionsLoading, selected: selectedMovieOption } = movieState;
  const { handleMovieQueryChange, setSelectedMovieOption, addMovieToUser } = movieActions;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Autocomplete
        fullWidth
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
        sx={{ minWidth: 120, mt: 0.5, height: 56 }}
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
