export function htmlToPlainText(html: string): string {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return (doc.body.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
}

/** Decode tags and whitespace entities when DOMParser is unavailable (SSR). */
function stripMarkup(html: string): string {
	return html.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, ' ').replace(
		/&#(x)?([0-9a-f]+);/gi,
		(_match, hex: string | undefined, value: string) => {
			const code = Number.parseInt(value, hex ? 16 : 10);
			return Number.isNaN(code) ? '' : String.fromCharCode(code);
		}
	);
}

export function isHtmlEmpty(html: string): boolean {
	if (!html.trim()) return true;
	if (html.includes('<img')) return false;
	// Derived emptiness is evaluated during SSR, where DOMParser is unavailable.
	if (typeof DOMParser === 'undefined') {
		return !stripMarkup(html).trim();
	}
	return !htmlToPlainText(html);
}

/** Turn bare HTTP(S) URLs in text nodes into links without touching existing anchors or attributes. */
export function linkifyPlainUrls(html: string): string {
	let insideAnchor = 0;

	return html
		.split(/(<[^>]+>)/g)
		.map((part) => {
			if (part.startsWith('<')) {
				if (/^<a\b/i.test(part)) insideAnchor += 1;
				if (/^<\/a\b/i.test(part)) insideAnchor = Math.max(0, insideAnchor - 1);
				return part;
			}
			if (insideAnchor) return part;

			return part.replace(/\bhttps?:\/\/[^\s<>"']+/gi, (match) => {
				const trailing = match.match(/[),.!?;:]+$/)?.[0] ?? '';
				const url = trailing ? match.slice(0, -trailing.length) : match;
				return `<a href="${url}">${url}</a>${trailing}`;
			});
		})
		.join('');
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
