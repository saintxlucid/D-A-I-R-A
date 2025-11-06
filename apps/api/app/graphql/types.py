import strawberry
from datetime import datetime
from typing import Optional
from enum import Enum


@strawberry.enum
class UserType(Enum):
    REGULAR = "regular"
    CREATOR = "creator"
    VERIFIED_CREATOR = "verified_creator"
    BRAND = "brand"


@strawberry.enum
class PostType(Enum):
    REGULAR = "regular"
    SPONSORED = "sponsored"
    PROMOTED = "promoted"


@strawberry.type
class User:
    id: strawberry.ID
    username: str
    email: str
    display_name: str
    bio: Optional[str]
    
    # Content Creator Features
    user_type: UserType = UserType.REGULAR
    is_verified: bool = False
    follower_count: int = 0
    creator_score: float = 0.0
    
    created_at: datetime


@strawberry.type
class Post:
    id: strawberry.ID
    content: str
    created_at: datetime
    author: User
    
    # Content & Advertisement Features
    post_type: PostType = PostType.REGULAR
    is_sponsored: bool = False
    
    # Engagement metrics for creators
    views_count: int = 0
    likes_count: int = 0
    shares_count: int = 0
    comments_count: int = 0


@strawberry.type
class Comment:
    id: strawberry.ID
    content: str
    created_at: datetime
    author: User
    post_id: strawberry.ID
    likes_count: int = 0

