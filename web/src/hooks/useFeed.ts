import { useInfiniteQuery } from '@tanstack/react-query'
import { gql } from '@/lib/api'
import { useAuthStore } from '@/state/auth'

export const FEED_QUERY = `
  query Feed($limit: Int, $cursor: String) {
    feed(limit: $limit, cursor: $cursor) {
      edges {
        id
        author_id
        type
        caption
        media_refs
        created_at
        author {
          id
          handle
          name
          avatar
        }
        stats {
          likes
          comments
          saves
          views
        }
      }
      pageInfo {
        nextCursor
        hasNextPage
      }
    }
  }
`

export function useFeed() {
  const token = useAuthStore((s) => s.token)
  
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam }) =>
      gql(FEED_QUERY, { limit: 12, cursor: pageParam ?? null }, token || undefined),
    getNextPageParam: (last) =>
      last?.feed?.pageInfo?.hasNextPage ? last.feed.pageInfo.nextCursor : undefined,
    enabled: !!token,
  })
}