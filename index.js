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
  path = path.endsWith('/') ? path.substring(0, -1) : path;
  // TODO: validation

  return withOptions(options => {
    const keys = [];
    const regexp = pathToRegexp(options.prefix + path, keys);

    return request => {
      if (request.method !== method) return;

      const params = regexp.exec(request.url);
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
