interface CheckResult {
  originalUrl: string
  status: string
  blocked: boolean
  error: boolean
}

// Tambahkan interface untuk API response
interface DomainResult {
  blocked: boolean
  [key: string]: any
}

interface ApiResponse {
  [domain: string]: DomainResult
}

const API_ENDPOINT = 'https://etools.biz.id/nawala/api.php'

export async function checkBatch(domains: string[]): Promise<CheckResult[]> {
  try {
    const url = new URL(API_ENDPOINT)
    url.searchParams.append('domains', domains.join(','))
    url.searchParams.append('json', 'true')

    const response = await fetch(url.toString(), {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    // Type assertion untuk data dengan interface yang sudah didefinisikan
    const data = await response.json() as ApiResponse

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid API response format')
    }

    return domains.map(domain => {
      try {
        const result = data[domain] // Sekarang TypeScript tahu bahwa data bisa diindex dengan string

        if (!result || typeof result !== 'object') {
          return {
            originalUrl: domain,
            status: 'Error: Invalid response',
            blocked: false,
            error: true
          }
        }

        return {
          originalUrl: domain,
          status: result.blocked ? 'Blocked' : 'Not Blocked',
          blocked: result.blocked,
          error: false
        }
      } catch (err) {
        console.error(`Error processing domain ${domain}:`, err)
        return {
          originalUrl: domain,
          status: 'Error: Processing failed',
          blocked: false,
          error: true
        }
      }
    })
  } catch (error) {
    console.error('Error checking batch:', error)
    return domains.map(domain => ({
      originalUrl: domain,
      status: 'Error: API request failed',
      blocked: false,
      error: true
    }))
  }
}
