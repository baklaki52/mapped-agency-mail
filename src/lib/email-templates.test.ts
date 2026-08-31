import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
	autoReplyHtml,
	autoReplyText,
	detectEmailTemplateId,
	emailTemplateHtml,
	hasEmbeddedEmailSignature
} from './email-templates';

describe('MAPPED email templates', () => {
	test('renders the approved research proposal and personal sign-off', () => {
		const html = emailTemplateHtml('mapped-research');

		assert.equal(detectEmailTemplateId(html), 'mapped-research');
		assert.equal(hasEmbeddedEmailSignature(html), true);
		assert.match(html, /Best regards,/);
		assert.match(html, /Vlad Spitsyn/);
		assert.match(html, /Exhaustive Research\. Trustworthy Answers\./);
		assert.match(html, /href="https:\/\/mapped\.agency"/);
		assert.match(html, /href="mailto:hello@mapped\.agency"/);
		assert.doesNotMatch(html, /Confirm the scope/i);
		assert.match(html, /reply to this email and we’ll confirm the timeline and next steps/);
	});

	test('renders a lightweight branded message for ordinary correspondence', () => {
		const html = emailTemplateHtml('mapped-message');

		assert.equal(detectEmailTemplateId(html), 'mapped-message');
		assert.equal(hasEmbeddedEmailSignature(html), true);
		assert.match(html, /Hi \[Name\]/);
		assert.match(html, /\[Write your message here\.\]/);
		assert.doesNotMatch(html, /\[ scope \]/);
		assert.doesNotMatch(html, /Confirm the scope/i);
	});

	test('renders a lightweight auto-reply without proposal-only blocks', () => {
		const html = autoReplyHtml();

		assert.match(html, /Request received/);
		assert.match(html, /simply reply to this email/);
		assert.doesNotMatch(html, /\[ scope \]/);
		assert.equal(detectEmailTemplateId(html), '');
		assert.match(autoReplyText(), /Best regards,\nVlad Spitsyn/);
	});

	test('does not classify an ordinary message as a template', () => {
		assert.equal(detectEmailTemplateId('<p>Hello</p>'), '');
		assert.equal(hasEmbeddedEmailSignature('<p>Hello</p>'), false);
	});
});
