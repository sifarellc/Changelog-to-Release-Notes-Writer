import { Ratelimit } from '@upstash/ratelimit'
import { redis } from './redis'

// 10 requests per minute per user
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  analytics: true,
  prefix: 'rl:rewrite',
})
