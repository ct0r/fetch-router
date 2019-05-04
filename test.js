const test = require('ava');

const { router, route, prefix, withOptions } = require('.');

test('`router` returns first non undefined result of given function', t => {
  const fn = router([() => {}, () => 'response', () => {}]);

  const result = fn();

  t.is(result, 'response');
});

test('`route` sets params and calls given function on match', t => {
  const handler = request => {
    t.deepEqual(request.params, { user: 'ct0r' });
  };

  const fn = route('/:user', 'GET', handler)({ prefix: '' });

  fn({
    method: 'GET',
    url: 'https://github.com/ct0r'
  });
});

test('`route` aggregates prefixes', t => {
  const options = { prefix: '/:user' };
  const fn = route('/:repo', 'GET', () => t.pass())(options);

  fn({
    method: 'GET',
    url: 'https://github.com/ct0r/fetch-router'
  });
});

test('`route` returns undefined if method does not match', t => {
  const fn = route('/:user', 'GET', () => t.fail())();

  const result = fn({
    method: 'POST',
    url: 'https://github.com/ct0r'
  });

  t.is(result, undefined);
});

test('`route` returns undefined if url does not match', t => {
  const fn = route('/:user', 'GET', () => t.fail())();

  const result = fn({
    method: 'GET',
    url: 'https://github.com'
  });

  t.is(result, undefined);
});

test('`route` accepts routes ending with "/"', t => {
  const fn = route('/:user/', 'GET', t.pass)();

  fn({
    method: 'GET',
    url: 'https://github.com/ct0r'
  });
});

test('`prefix` aggregates prefixes', t => {
  const fn = prefix('/:repo', [
    withOptions(options => t.is(options.prefix, '/:user/:repo'))
  ]);

  fn({ prefix: '/:user' });
});
