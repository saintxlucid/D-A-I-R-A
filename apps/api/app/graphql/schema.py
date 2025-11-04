from typing import List, Optional
import strawberry
from strawberry.types import Info
from sqlalchemy.orm import Session
from fastapi import Depends

from .types import User, Post, Comment, PostType, PostVisibility
from ..database import get_db
from ..db import models


@strawberry.type
class Query:
    @strawberry.field
    def posts(self, info: Info, limit: int = 50) -> List[Post]:
        """Get latest posts (limit: 50)"""
        # Note: In production, use FastAPI's dependency injection
        # This is a simplified version for the monorepo scaffold
        db: Session = next(get_db())
        try:
            db_posts = (
                db.query(models.Post)
                .order_by(models.Post.created_at.desc())
                .limit(limit)
                .all()
            )

            return [
                Post(
                    id=p.id,
                    author_id=p.author_id,
                    type=PostType(p.type.value),
                    caption=p.caption,
                    media_refs=p.media_refs.split(",") if p.media_refs else None,
                    visibility=PostVisibility(p.visibility.value),
                    created_at=p.created_at,
                )
                for p in db_posts
            ]
        finally:
            db.close()

    @strawberry.field
    def user(self, info: Info, id: Optional[int] = None, handle: Optional[str] = None) -> Optional[User]:
        """Get user by ID or handle"""
        # Note: In production, use FastAPI's dependency injection
        # This is a simplified version for the monorepo scaffold
        db: Session = next(get_db())
        try:
            query = db.query(models.User)
            if id:
                db_user = query.filter(models.User.id == id).first()
            elif handle:
                db_user = query.filter(models.User.handle == handle).first()
            else:
                return None

            if not db_user:
                return None

            return User(
                id=db_user.id,
                handle=db_user.handle,
                name=db_user.name,
                bio=db_user.bio,
                avatar=db_user.avatar,
                created_at=db_user.created_at,
            )
        finally:
            db.close()


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, info: Info, handle: str, name: str, bio: Optional[str] = None) -> User:
        """Create a new user"""
        # Note: In production, use FastAPI's dependency injection
        # This is a simplified version for the monorepo scaffold
        db: Session = next(get_db())
        try:
            db_user = models.User(handle=handle, name=name, bio=bio)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)

            return User(
                id=db_user.id,
                handle=db_user.handle,
                name=db_user.name,
                bio=db_user.bio,
                avatar=db_user.avatar,
                created_at=db_user.created_at,
            )
        finally:
            db.close()

    @strawberry.mutation
    def create_post(
        self,
        info: Info,
        author_id: int,
        type: PostType,
        caption: Optional[str] = None,
        media_refs: Optional[List[str]] = None,
        visibility: PostVisibility = PostVisibility.PUBLIC,
    ) -> Post:
        """Create a new post"""
        # Note: In production, use FastAPI's dependency injection
        # This is a simplified version for the monorepo scaffold
        db: Session = next(get_db())
        try:
            media_refs_str = ",".join(media_refs) if media_refs else None

            db_post = models.Post(
                author_id=author_id,
                type=models.PostType(type.value),
                caption=caption,
                media_refs=media_refs_str,
                visibility=models.PostVisibility(visibility.value),
            )
            db.add(db_post)
            db.commit()
            db.refresh(db_post)

            return Post(
                id=db_post.id,
                author_id=db_post.author_id,
                type=PostType(db_post.type.value),
                caption=db_post.caption,
                media_refs=media_refs,
                visibility=PostVisibility(db_post.visibility.value),
                created_at=db_post.created_at,
            )
        finally:
            db.close()


# Simple in-memory ranker stub
class SimpleRanker:
    """Simple in-memory ranking algorithm stub"""

    @staticmethod
    def rank_posts(posts: List[Post]) -> List[Post]:
        """Stub ranker - returns posts as-is, sorted by created_at"""
        return sorted(posts, key=lambda p: p.created_at, reverse=True)

    @staticmethod
    def rank_score(post: Post) -> float:
        """Calculate a simple ranking score (stub)"""
        # In a real implementation, this would use engagement metrics,
        # user preferences, recency, etc.
        return 1.0
