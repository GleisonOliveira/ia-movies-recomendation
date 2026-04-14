import { SvgIcon } from '@mui/material';

export function RemoveIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M19 13H5v-2h14v2z" />
    </SvgIcon>
  );
}

export function MissingPosterIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5C3.9 3 3 3.9 3 5v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM5 5h14v10l-3.5-3.5-4.5 5.51L8 13l-3 4V5z" />
    </SvgIcon>
  );
}

export function AddMovieIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
    </SvgIcon>
  );
}
