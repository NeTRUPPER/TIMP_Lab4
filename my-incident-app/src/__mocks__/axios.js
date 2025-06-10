const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  defaults: { headers: { common: {} } },
};
mockAxios.create = () => mockAxios;
mockAxios.interceptors = {
  request: { use: jest.fn() },
  response: { use: jest.fn() }
};

module.exports = mockAxios;
module.exports.default = mockAxios; 