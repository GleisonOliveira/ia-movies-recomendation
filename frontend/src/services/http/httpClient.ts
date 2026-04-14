import axios from 'axios';

export function createHttpClient(baseURL: string) {
  return axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });
}
