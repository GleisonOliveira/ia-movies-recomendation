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
    <img
      src="/assets/images/noimage.png"
      alt="Sem poster"
      style={{ width: '75%', height: '75%', objectFit: 'contain' }}
    />
  );
}

export function AddMovieIcon() {
  return (
    <SvgIcon fontSize="small">
      <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
    </SvgIcon>
  );
}
