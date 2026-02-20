/**
 * Extracts readable text from pasted content.
 * Handles plain text, JSON, CSV, and anything else gracefully.
 */
export function extractText(raw: string): string {
  const trimmed = raw.trim()

  // Try JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed)
      return jsonToText(parsed)
    } catch {
      // Not valid JSON, continue
    }
  }

  // Try CSV (has commas and newlines, no JSON markers)
  if (trimmed.includes(',') && trimmed.includes('\n')) {
    try {
      const rows = parseCSV(trimmed)
      if (rows.length > 0) {
        return rows
          .map(row => row.join(' | '))
          .join('\n')
      }
    } catch {
      // Not CSV, continue
    }
  }

  // Plain text — return as-is
  return trimmed
}

function jsonToText(val: unknown, depth = 0): string {
  if (val === null || val === undefined) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)

  if (Array.isArray(val)) {
    return val.map(item => jsonToText(item, depth)).filter(Boolean).join('\n')
  }

  if (typeof val === 'object') {
    return Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => {
        const value = jsonToText(v, depth + 1)
        if (!value) return ''
        return `${k}: ${value}`
      })
      .filter(Boolean)
      .join('\n')
  }

  return String(val)
}

function parseCSV(text: string): string[][] {
  return text.split('\n').map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result
  })
}
