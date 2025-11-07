from datetime import datetime
from typing import List, Optional

import strawberry


@strawberry.type
class User:
    id: str
    handle: str
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime


@strawberry.type
class Post:
    id: str
    author_id: str
    type: str
    caption: Optional[str] = None
    media_refs: Optional[List[str]] = None
    visibility: str
    created_at: datetime
    author: Optional[User] = None
    likes_count: int = 0
    comments_count: int = 0


@strawberry.type
class Comment:
    id: str
    post_id: str
    user_id: str
    parent_comment_id: Optional[str] = None
    text: str
    created_at: datetime


@strawberry.type
class Room:
    id: str
    host_id: str
    topic: str
    starts_at: datetime
    ends_at: Optional[datetime] = None
    state: str
    created_at: datetime
    host: Optional[User] = None


@strawberry.type
class Digest:
    id: str
    room_id: str
    summary: str
    created_at: datetime
    room: Optional[Room] = None
