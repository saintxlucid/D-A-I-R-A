from typing import List, Optional
from datetime import datetime
from enum import Enum
import strawberry
from strawberry.types import Info


class PostTypeEnum(str, Enum):
    VIDEO = "video"
    IMAGE = "image"
    TEXT = "text"
    VOICE = "voice"


class PostVisibilityEnum(str, Enum):
    PUBLIC = "public"
    FOLLOWERS = "followers"
    PRIVATE = "private"


@strawberry.enum
class PostType(Enum):
    VIDEO = "video"
    IMAGE = "image"
    TEXT = "text"
    VOICE = "voice"


@strawberry.enum
class PostVisibility(Enum):
    PUBLIC = "public"
    FOLLOWERS = "followers"
    PRIVATE = "private"


@strawberry.type
class User:
    id: int
    handle: str
    name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    created_at: datetime

    @strawberry.field
    def followers_count(self, info: Info) -> int:
        # Stub implementation
        return 0

    @strawberry.field
    def following_count(self, info: Info) -> int:
        # Stub implementation
        return 0


@strawberry.type
class Post:
    id: int
    author_id: int
    type: PostType
    caption: Optional[str] = None
    media_refs: Optional[List[str]] = None
    visibility: PostVisibility
    created_at: datetime

    @strawberry.field
    def author(self, info: Info) -> Optional[User]:
        # This would be resolved from database
        return None


@strawberry.type
class Follow:
    id: int
    follower_id: int
    following_id: int
    created_at: datetime


@strawberry.type
class Comment:
    id: int
    post_id: int
    author_id: int
    content: str
    created_at: datetime

    @strawberry.field
    def author(self, info: Info) -> Optional[User]:
        # This would be resolved from database
        return None
