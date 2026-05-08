import type { AxiosRequestConfig } from 'axios';
import { jest } from '@jest/globals';

type AxiosMocks = {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockDelete = jest.fn();

(globalThis as unknown as { __axiosMocks?: AxiosMocks }).__axiosMocks = {
  get: mockGet,
  post: mockPost,
  delete: mockDelete,
};

const axiosMock = {
  create: jest.fn(() => ({
    get: mockGet,
    post: mockPost,
    delete: mockDelete,
  })),
} as unknown as {
  create: (config?: AxiosRequestConfig) => {
    get: typeof mockGet;
    post: typeof mockPost;
    delete: typeof mockDelete;
  };
};

export default axiosMock;
