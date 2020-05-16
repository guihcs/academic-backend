const assert = require('chai').assert;

function assertChanged(expected, actual, diff) {

    if (diff.change) {
        for (const key of Object.keys(diff.change)) {
            actual[key] = diff.change[key];
        }
    }

    if (diff.remove) {
        for (const key of diff.remove) {
            delete actual[key];
        }
    }
    assert.deepEqual(expected, actual);
}


module.exports = {assertChanged};
