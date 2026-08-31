import type { D1Database } from '@cloudflare/workers-types';
import { autoReplyHtml, autoReplyText } from '$lib/email-templates';
import type { InboundRoute } from './domains';
import { insertEmail } from './mail-store';
import type { ResendClient } from './resend';
import { buildHtmlEmail, formatMessageId, formatReferences } from './send-mail';
import { formatEmailAddress } from './email-address';

export const AUTO_REPLY_ADDRESS = 'hello@mapped.agency';
export const AUTO_REPLY_SUBJECT = 'We received your request — MAPPED.AGENCY';

type AutoReplyCandidate = {
	from: string;
	routeAddress: string;
	headers?: Record<string, string>;
	inReplyTo?: string | null;
	references?: string | null;
	threadMessageCount: number;
};

const AUTOMATED_LOCAL_PART = /^(?:no-?reply|do-?not-?reply|mailer-daemon|postmaster|bounce|notifications?)$/i;

function headerValue(headers: Record<string, string> | undefined, name: string): string {
	if (!headers) return '';
	const target = name.toLowerCase();
	for (const [key, value] of Object.entries(headers)) {
		if (key.toLowerCase() === target) return value.trim();
	}
	return '';
}

/** Conservative loop prevention: only a genuinely new human-looking inquiry qualifies. */
export function shouldSendAutoReply(candidate: AutoReplyCandidate): boolean {
	if (candidate.routeAddress.toLowerCase() !== AUTO_REPLY_ADDRESS) return false;
	if (candidate.threadMessageCount !== 1) return false;
	if (candidate.inReplyTo?.trim() || candidate.references?.trim()) return false;

	const sender = candidate.from.trim().toLowerCase();
	const [localPart, domain] = sender.split('@');
	if (!localPart || !domain || domain === 'mapped.agency') return false;
	if (AUTOMATED_LOCAL_PART.test(localPart)) return false;

	const autoSubmitted = headerValue(candidate.headers, 'auto-submitted').toLowerCase();
	if (autoSubmitted && autoSubmitted !== 'no') return false;
	if (headerValue(candidate.headers, 'list-id')) return false;
	if (/^(?:bulk|list|junk)$/i.test(headerValue(candidate.headers, 'precedence'))) return false;
	if (headerValue(candidate.headers, 'x-auto-response-suppress')) return false;

	return true;
}

export async function countThreadMessages(
	db: D1Database,
	userId: string,
	emailId: string
): Promise<number> {
	const row = await db
		.prepare(
			`SELECT COUNT(*) AS count
			 FROM emails
			 WHERE user_id = ?
			   AND COALESCE(thread_id, id) = (
			     SELECT COALESCE(thread_id, id) FROM emails WHERE id = ? AND user_id = ?
			   )`
		)
		.bind(userId, emailId, userId)
		.first<{ count: number }>();
	return row?.count ?? 0;
}

export async function sendAutoReply(input: {
	db: D1Database;
	client: ResendClient;
	route: InboundRoute;
	inboundEmailId: string;
	recipient: string;
	messageId?: string | null;
	references?: string | null;
}): Promise<void> {
	const inReplyTo = formatMessageId(input.messageId);
	const references = formatReferences(input.references) ?? inReplyTo;
	const headers: Record<string, string> = {
		'Auto-Submitted': 'auto-replied',
		'X-Auto-Response-Suppress': 'All'
	};
	if (inReplyTo) headers['In-Reply-To'] = inReplyTo;
	if (references) headers.References = references;

	const result = await input.client.send(
		{
			from: formatEmailAddress('MAPPED.AGENCY', input.route.address),
			to: input.recipient,
			reply_to: input.route.address,
			subject: AUTO_REPLY_SUBJECT,
			text: autoReplyText(),
			html: buildHtmlEmail(autoReplyHtml()),
			headers
		},
		`mapped-auto-reply-${input.inboundEmailId}`
	);

	await insertEmail(input.db, {
		userId: input.route.userId,
		direction: 'outbound',
		from: input.route.address,
		fromName: 'MAPPED.AGENCY',
		to: input.recipient,
		subject: AUTO_REPLY_SUBJECT,
		bodyText: autoReplyText(),
		bodyHtml: autoReplyHtml(),
		inReplyTo: input.messageId ?? null,
		references: input.references ?? input.messageId ?? null,
		replyToEmailId: input.inboundEmailId,
		domainId: input.route.domainId,
		addressId: input.route.addressId,
		providerId: result.id,
		status: 'queued',
		isRead: true
	});
}
