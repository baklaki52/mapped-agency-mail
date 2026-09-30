import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRecipients } from './send-mail';

test('deduplicates recipients case-insensitively, including display-name variants', () => {
	assert.deepEqual(
		parseRecipients([
			'Yueyun Zhang <yueyun.zhang@epfl.ch>',
			'yueyun.zhang@epfl.ch',
			'YUEYUN.ZHANG@EPFL.CH'
		]),
		['Yueyun Zhang <yueyun.zhang@epfl.ch>']
	);
});
