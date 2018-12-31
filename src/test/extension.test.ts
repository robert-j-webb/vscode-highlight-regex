import * as assert from 'assert';
import { before, describe, it } from 'mocha';
import * as vscode from 'vscode';
import * as myExtension from '../extension';

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the value is not present', function() {
            assert.equal([1, 2, 3].indexOf(4), -1);
        });
    });
});
