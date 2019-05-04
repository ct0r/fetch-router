const pathToRegexp = require('path-to-regexp');

const flag = Symbol('fetch-router');

const withOptions = fn => {
  fn[flag] = true;
  return fn;
};

const combine = (fns, options) => {
  fns = [...fns.map(fn => (fn[flag] ? fn(options) : fn))];

  return request => {
    for (let i = 0; i < fns.length; i++) {
      const response = fns[i](request);
      if (response !== undefined) return response;
    }
  };
};

const router = (fns, { prefix = '' } = {}) => {
  // TODO: validation

  return combine(fns, { prefix });
};

const prefix = (path, fns) => {
  // TODO: validation

  return withOptions(options =>
    combine(fns, { ...options, prefix: options.prefix + path })
  );
};

const route = (path, method, fn) => {
  // TODO: validation

  path = path.endsWith('/') ? path.slice(0, -1) : path;

  return withOptions(options => {
    path = options && options.prefix ? options.prefix + path : path;

    const keys = [];
    const regexp = pathToRegexp(path, keys);

    return request => {
      if (request.method !== method) return;

      const url = new URL(request.url);
      const params = regexp.exec(url.pathname);
      if (!params) return;

      request.params = {};
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i].name;
        request.params[key] = params[i + 1];
      }

      return fn(request);
    };
  });
};

module.exports = {
  combine,
  prefix,
  router,
  route,
  withOptions
};
