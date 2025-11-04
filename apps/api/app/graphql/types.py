import strawberry
from datetime import datetime
from typing import Optional


@strawberry.type
class User:
    id: strawberry.ID
    username: str
    email: str
    display_name: str
    bio: Optional[str]
    created_at: datetime


@strawberry.type
class Post:
    id: strawberry.ID
    content: str
    created_at: datetime
    author: User
    comments_count: int = 0
    likes_count: int = 0


@strawberry.type
class Comment:
    id: strawberry.ID
    content: str
    created_at: datetime
    author: User
    post_id: strawberry.ID
