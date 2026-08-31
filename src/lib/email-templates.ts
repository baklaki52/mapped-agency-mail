export const EMAIL_TEMPLATE_IDS = ['mapped-message', 'mapped-research'] as const;

export type EmailTemplateId = (typeof EMAIL_TEMPLATE_IDS)[number];

const SIGN_OFF = `
<div data-email-signature="true" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#6B5F57;">
  Best regards,<br>
  <strong style="color:#221A14;">Vlad Spitsyn</strong><br>
  MAPPED.AGENCY<br>
  <em>Exhaustive Research. Trustworthy Answers.</em><br>
  <a href="https://mapped.agency" style="color:#E2453C;text-decoration:none;">mapped.agency</a> · <a href="mailto:hello@mapped.agency" style="color:#E2453C;text-decoration:none;">hello@mapped.agency</a>
</div>`.trim();

function mappedShell(content: string, preheader: string, templateId?: EmailTemplateId): string {
	const templateMarker = templateId ? ` data-email-template="${templateId}"` : '';
	return `
<div${templateMarker} style="margin:0;padding:0;background-color:#F5EDE9;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F5EDE9;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">
        <tr><td style="background-color:#1F1509;padding:18px 28px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td style="font-family:Arial,Helvetica,sans-serif;font-size:20px;line-height:1;font-weight:bold;letter-spacing:1px;color:#FFFFFF;">MAPPED<span style="color:#E2453C;">.</span>AGENCY</td>
            <td align="right" style="font-family:'Courier New',monospace;font-size:11px;color:#DBC0B7;">[&nbsp;research&nbsp;desk&nbsp;]</td>
          </tr></table>
        </td></tr>
        <tr><td style="background-color:#E2453C;height:3px;line-height:3px;font-size:3px;">&nbsp;</td></tr>
        ${content}
        <tr><td style="padding:18px 28px 8px;border-top:1px solid #E8DCD5;">${SIGN_OFF}</td></tr>
      </table>
    </td></tr>
  </table>
</div>`.trim();
}

const MAPPED_RESEARCH_TEMPLATE = mappedShell(
	`<tr><td style="background-color:#FFFFFF;padding:32px 28px 8px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#E2453C;padding-bottom:14px;">Research built around your task</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:bold;color:#221A14;padding-bottom:16px;">We reviewed your question. Here is the plan.</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#221A14;padding-bottom:18px;">Thanks for sending the question. Below is what we believe can be proven, which sources are likely to matter, and the format we suggest for the result.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:22px;"><tr>
    <td style="width:3px;background-color:#E2453C;"></td>
    <td style="background-color:#F5EDE9;padding:14px 18px;">
      <div style="font-family:'Courier New',monospace;font-size:11px;color:#6D281D;padding-bottom:6px;">[ scope ]</div>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;font-weight:bold;color:#221A14;">Market map of ~150 funds · verified access routes · delivery as a working spreadsheet</div>
    </td>
  </tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
    <tr><td valign="top" style="width:52px;font-family:'Courier New',monospace;font-size:12px;color:#E2453C;padding:6px 0;">[ 01 ]</td><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#221A14;padding:6px 0;border-top:1px solid #E8DCD5;">We agree on the criteria and what should count as evidence.</td></tr>
    <tr><td valign="top" style="width:52px;font-family:'Courier New',monospace;font-size:12px;color:#E2453C;padding:6px 0;">[ 02 ]</td><td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#221A14;padding:6px 0;border-top:1px solid #E8DCD5;">First verified layer lands within the agreed window.</td></tr>
  </table>
</td></tr>
<tr><td style="background-color:#FFFFFF;padding:8px 28px 34px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#221A14;">If this scope works for you, reply to this email and we’ll confirm the timeline and next steps.</div>
</td></tr>`,
	'Your research scope and timing — one short review inside.',
	'mapped-research'
);

const MAPPED_MESSAGE_TEMPLATE = mappedShell(
	`<tr><td style="background-color:#FFFFFF;padding:32px 28px 34px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#221A14;">
    Hi [Name],<br><br>
    [Write your message here.]
  </div>
</td></tr>`,
	'A message from MAPPED.AGENCY.',
	'mapped-message'
);

export function emailTemplateHtml(id: EmailTemplateId): string {
	switch (id) {
		case 'mapped-message':
			return MAPPED_MESSAGE_TEMPLATE;
		case 'mapped-research':
			return MAPPED_RESEARCH_TEMPLATE;
	}
}

export function autoReplyHtml(): string {
	return mappedShell(
		`<tr><td style="background-color:#FFFFFF;padding:32px 28px 34px;">
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#E2453C;padding-bottom:14px;">Request received</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:1.25;font-weight:bold;color:#221A14;padding-bottom:16px;">Thank you for contacting MAPPED.AGENCY.</div>
  <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#221A14;">We’ve received your request and will review the details. A member of our team will get back to you as soon as possible.<br><br>If you would like to add any context, simply reply to this email.</div>
</td></tr>`,
	'We received your request and will review the details.'
	);
}

export function autoReplyText(): string {
	return `Thank you for contacting MAPPED.AGENCY.

We’ve received your request and will review the details. A member of our team will get back to you as soon as possible.

If you would like to add any context, simply reply to this email.

Best regards,
Vlad Spitsyn
MAPPED.AGENCY
Exhaustive Research. Trustworthy Answers.
mapped.agency · hello@mapped.agency`;
}

export function detectEmailTemplateId(html: string): EmailTemplateId | '' {
	for (const id of EMAIL_TEMPLATE_IDS) {
		if (html.includes(`data-email-template="${id}"`)) return id;
	}
	return '';
}

export function hasEmbeddedEmailSignature(html: string | null | undefined): boolean {
	return Boolean(html?.includes('data-email-signature="true"'));
}
