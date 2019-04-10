const test = require('ava');

const { router, route, prefix, withOptions } = require('.');

test('`router` returns first non undefined result of given function', t => {
  const fn = router([_ => {}, _ => 'response', _ => {}]);

  const result = fn();

  t.is(result, 'response');
});

test('`route` sets params and calls given function on match', t => {
  const options = { prefix: '' };
  const fn = route('/:foo/:bar', 'GET', ({ params }) => params)(options);

  const result = fn({
    method: 'GET',
    url: '/test/route'
  });

  t.deepEqual(result, {
    foo: 'test',
    bar: 'route'
  });
});

test('`route` aggregates prefixes', t => {
  const options = { prefix: '/test' };
  const fn = route('/route', 'GET', _ => 'response')(options);

  const result = fn({
    method: 'GET',
    url: '/test/route'
  });

  t.is(result, 'response');
});

test('`route` returns undefined if method does not match', t => {
  const options = { prefix: '' };
  const fn = route('/test/route', 'GET', _ => t.fail())(options);

  const result = fn({
    method: 'POST',
    url: '/test/route'
  });

  t.is(result, undefined);
});

test('`route` returns undefined if url does not match', t => {
  const options = { prefix: '' };
  const fn = route('/test/route', 'GET', _ => t.fail())(options);

  const result = fn({
    method: 'GET',
    url: '/'
  });

  t.is(result, undefined);
});

test('`route` accepts routes ending with "/"', t => {
  const options = { prefix: '' };
  const fn = route('/test/route/', 'GET', t.pass)(options);

  fn({
    method: 'GET',
    url: '/'
  });
});

test('`prefix` aggregates prefixes', t => {
  const fn = prefix('/route', [
    withOptions(options => t.is(options.prefix, '/test/route'))
  ]);

  fn({ prefix: '/test' });
});
