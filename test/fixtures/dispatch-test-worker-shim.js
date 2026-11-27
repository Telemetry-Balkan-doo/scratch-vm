const {createRequire} = process.getBuiltinModule('module');
const path = process.getBuiltinModule('path');

const fixturesDir = path.resolve(process.cwd(), 'test/fixtures') + path.sep;
createRequire(fixturesDir)('./dispatch-test-worker');
