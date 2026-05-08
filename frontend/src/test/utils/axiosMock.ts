type AxiosMocks = {
  get: jest.Mock;
  post: jest.Mock;
  delete: jest.Mock;
};

export function axiosMockFactory() {
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockDelete = jest.fn();

  (globalThis as unknown as { __axiosMocks?: AxiosMocks }).__axiosMocks = { get: mockGet, post: mockPost, delete: mockDelete };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => ({
        get: mockGet,
        post: mockPost,
        delete: mockDelete,
      })),
    },
  };
}

export function getAxiosMocks(): AxiosMocks {
  const mocks = (globalThis as unknown as { __axiosMocks?: AxiosMocks }).__axiosMocks;
  if (!mocks) {
    throw new Error('axios mocks not initialized. Ensure jest.mock("axios", () => axiosMockFactory()).');
  }
  return mocks;
}
