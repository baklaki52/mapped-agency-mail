const TELEGRAM_API_BASE = 'https://api.telegram.org';
const NOTIFICATION_TIMEOUT_MS = 8_000;

export type TelegramNotificationEnv = {
	TELEGRAM_BOT_TOKEN?: string;
	TELEGRAM_CHAT_ID?: string;
	waitUntil?: (promise: Promise<void>) => void;
};

export type TelegramMailNotification = {
	emailId: string;
	from: string;
	subject: string;
};

function escapeTelegramHtml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

export function telegramMailMessage(input: TelegramMailNotification): string {
	const from = escapeTelegramHtml(input.from.slice(0, 300));
	const subject = escapeTelegramHtml(input.subject.slice(0, 500));
	return `<b>Новое письмо</b>\n\n<b>От:</b> ${from}\n<b>Тема:</b> ${subject}`;
}

export function telegramMailUrl(emailId: string): string {
	return `https://mail.mapped.agency/mail/${encodeURIComponent(emailId)}`;
}

async function sendTelegramNotification(
	token: string,
	chatId: string,
	input: TelegramMailNotification
): Promise<void> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), NOTIFICATION_TIMEOUT_MS);
	try {
		const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: chatId,
				text: telegramMailMessage(input),
				parse_mode: 'HTML',
				disable_web_page_preview: true,
				reply_markup: {
					inline_keyboard: [[{ text: 'Открыть письмо', url: telegramMailUrl(input.emailId) }]]
				}
			}),
			signal: controller.signal
		});
		if (!response.ok) {
			throw new Error(`Telegram notification failed (${response.status})`);
		}
	} finally {
		clearTimeout(timeout);
	}
}

/** Fire-and-forget notification; mail ingestion never depends on Telegram. */
export function scheduleTelegramMailNotification(
	env: TelegramNotificationEnv,
	input: TelegramMailNotification
): void {
	const token = env.TELEGRAM_BOT_TOKEN?.trim();
	const chatId = env.TELEGRAM_CHAT_ID?.trim();
	if (!token || !chatId) return;

	const delivery = sendTelegramNotification(token, chatId, input).catch((error) => {
		console.error(
			'Telegram new-mail notification failed',
			error instanceof Error ? error.message : 'unknown error'
		);
	});
	if (env.waitUntil) env.waitUntil(delivery);
}
