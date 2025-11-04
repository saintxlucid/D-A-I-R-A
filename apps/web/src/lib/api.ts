const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchFeed() {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Feed($limit: Int, $cursor: String) {
          feed(limit: $limit, cursor: $cursor) {
            id
            caption
            type
            mediaRefs
            createdAt
            author {
              id
              name
              handle
              avatar
            }
            likesCount
            commentsCount
          }
        }
      `,
      variables: { limit: 20 },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch feed");
  const json = await res.json();
  return json.data?.feed || [];
}

export async function fetchUser(handle: string) {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query User($handle: String!) {
          user(handle: $handle) {
            id
            name
            handle
            bio
            avatar
            createdAt
          }
        }
      `,
      variables: { handle },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch user");
  const json = await res.json();
  return json.data?.user;
}

export async function fetchUserPosts(userId: string) {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query PostsByUser($userId: ID!, $limit: Int) {
          postsByUser(userId: $userId, limit: $limit) {
            id
            caption
            type
            mediaRefs
            createdAt
          }
        }
      `,
      variables: { userId, limit: 50 },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch posts");
  const json = await res.json();
  return json.data?.postsByUser || [];
}

export async function fetchRooms() {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Rooms($limit: Int) {
          rooms(limit: $limit) {
            id
            topic
            startsAt
            endsAt
            state
            host {
              id
              name
              handle
            }
          }
        }
      `,
      variables: { limit: 20 },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch rooms");
  const json = await res.json();
  return json.data?.rooms || [];
}

export async function fetchRoom(id: string) {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Room($id: ID!) {
          room(id: $id) {
            id
            topic
            startsAt
            endsAt
            state
            host {
              id
              name
              handle
            }
          }
        }
      `,
      variables: { id },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch room");
  const json = await res.json();
  return json.data?.room;
}

export async function fetchDigest(roomId: string) {
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query Digest($roomId: ID!) {
          digest(roomId: $roomId) {
            id
            summary
            createdAt
            room {
              id
              topic
            }
          }
        }
      `,
      variables: { roomId },
    }),
  });

  if (!res.ok) throw new Error("Failed to fetch digest");
  const json = await res.json();
  return json.data?.digest;
}

export async function createPost({
  content,
  media,
}: {
  content: string;
  media?: File[];
}): Promise<any> {
  // For simplicity, not handling media upload here
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreatePost($authorId: ID!, $type: String!, $caption: String, $mediaRefs: [String!]) {
          createPost(authorId: $authorId, type: $type, caption: $caption, mediaRefs: $mediaRefs) {
            id
            caption
            type
            createdAt
          }
        }
      `,
      variables: {
        authorId: "demo-user",
        type: media && media.length > 0 ? "image" : "text",
        caption: content,
        mediaRefs: [],
      },
    }),
  });

  if (!res.ok) throw new Error("Failed to create post");
  const json = await res.json();
  return json.data?.createPost;
}
