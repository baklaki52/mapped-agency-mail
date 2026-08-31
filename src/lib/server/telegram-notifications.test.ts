import assert from 'node:assert/strict';
import { test } from 'node:test';
import { telegramMailMessage, telegramMailUrl } from './telegram-notifications';

test('Telegram notification escapes untrusted mail headers and omits message content', () => {
	const message = telegramMailMessage({
		emailId: 'mail-1',
		from: '<script>alert(1)</script>@example.com',
		subject: 'Question & <b>details</b>'
	});

	assert.match(message, /&lt;script&gt;/);
	assert.match(message, /Question &amp; &lt;b&gt;details&lt;\/b&gt;/);
	assert.doesNotMatch(message, /alert\(1\)<\/script>/);
	assert.equal(telegramMailUrl('id/with spaces'), 'https://mail.mapped.agency/mail/id%2Fwith%20spaces');
});
