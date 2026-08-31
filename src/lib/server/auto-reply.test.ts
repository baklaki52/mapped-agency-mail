import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { AUTO_REPLY_ADDRESS, shouldSendAutoReply } from './auto-reply';

const candidate = {
	from: 'founder@example.com',
	routeAddress: AUTO_REPLY_ADDRESS,
	headers: {},
	inReplyTo: null,
	references: null,
	threadMessageCount: 1
};

describe('automatic inquiry replies', () => {
	test('accepts the first human message sent to the public mailbox', () => {
		assert.equal(shouldSendAutoReply(candidate), true);
	});

	test('does not reply again inside an existing conversation', () => {
		assert.equal(shouldSendAutoReply({ ...candidate, threadMessageCount: 2 }), false);
		assert.equal(shouldSendAutoReply({ ...candidate, inReplyTo: '<prior@example.com>' }), false);
	});

	test('rejects automated senders and mailing-list headers', () => {
		for (const from of ['no-reply@example.com', 'mailer-daemon@example.com', 'postmaster@example.com']) {
			assert.equal(shouldSendAutoReply({ ...candidate, from }), false);
		}
		assert.equal(
			shouldSendAutoReply({ ...candidate, headers: { 'Auto-Submitted': 'auto-replied' } }),
			false
		);
		assert.equal(shouldSendAutoReply({ ...candidate, headers: { 'List-Id': 'news.example' } }), false);
		assert.equal(shouldSendAutoReply({ ...candidate, headers: { Precedence: 'bulk' } }), false);
	});

	test('does not reply from another mailbox or back into the company domain', () => {
		assert.equal(shouldSendAutoReply({ ...candidate, routeAddress: 'research@mapped.agency' }), false);
		assert.equal(shouldSendAutoReply({ ...candidate, from: 'team@mapped.agency' }), false);
	});
});
