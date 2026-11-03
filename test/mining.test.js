const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');

for (const isChain of [false, true]) {
  for (const succeeds of [false, true]) {
    test(`refreshes ${isChain ? 'chain' : 'block'} after ${succeeds ? 'success' : 'exhaustion'}`, () => {
      const values = new Map();
      let attempts = 0;
      const classes = new Map();
      const context = {
        $: selector => ({
          val(value) {
            if (arguments.length) values.set(selector, value);
            return values.get(selector);
          },
          removeClass() { return this; },
          addClass(value) { classes.set(selector, value); return this; },
        }),
      };
      vm.createContext(context);
      vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/javascripts/blockchain.js'), 'utf8'), context);
      context.maximumNonce = 2;
      context.sha256 = () => { attempts++; return succeeds ? '00000' : 'fffff'; };
      classes.set('#block1chain1well', 'well-success');
      values.set('#block2chain1previous', 'old hash');
      context.mine(1, 1, isChain);
      assert.equal(attempts, (succeeds ? 1 : 3) + (isChain ? 5 : 0));
      assert.equal(classes.get('#block1chain1well'), succeeds ? 'well-success' : 'well-error');
      if (isChain) {
        assert.equal(values.get('#block2chain1previous'), values.get('#block1chain1hash'));
        assert.equal(classes.get('#block2chain1well'), succeeds ? 'well-success' : 'well-error');
      }
    });
  }
}
