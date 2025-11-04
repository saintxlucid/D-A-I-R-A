import strawberry
from typing import List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.graphql.types import User, Post, Comment
from app.models import User as UserModel, Post as PostModel, Comment as CommentModel
from app.database import AsyncSessionLocal


@strawberry.type
class Query:
    @strawberry.field
    async def posts(self) -> List[Post]:
        """Get all posts"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(PostModel)
                .options(selectinload(PostModel.author))
                .options(selectinload(PostModel.comments))
                .order_by(PostModel.created_at.desc())
            )
            posts = result.scalars().all()
            
            return [
                Post(
                    id=strawberry.ID(str(post.id)),
                    content=post.content,
                    created_at=post.created_at,
                    author=User(
                        id=strawberry.ID(str(post.author.id)),
                        username=post.author.username,
                        email=post.author.email,
                        display_name=post.author.display_name,
                        bio=post.author.bio,
                        created_at=post.author.created_at,
                    ),
                    comments_count=len(post.comments),
                    likes_count=0,  # TODO: Implement likes
                )
                for post in posts
            ]

    @strawberry.field
    async def post(self, id: strawberry.ID) -> Post | None:
        """Get a single post by ID"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(
                select(PostModel)
                .where(PostModel.id == int(id))
                .options(selectinload(PostModel.author))
                .options(selectinload(PostModel.comments))
            )
            post = result.scalar_one_or_none()
            
            if not post:
                return None
            
            return Post(
                id=strawberry.ID(str(post.id)),
                content=post.content,
                created_at=post.created_at,
                author=User(
                    id=strawberry.ID(str(post.author.id)),
                    username=post.author.username,
                    email=post.author.email,
                    display_name=post.author.display_name,
                    bio=post.author.bio,
                    created_at=post.author.created_at,
                ),
                comments_count=len(post.comments),
                likes_count=0,
            )

    @strawberry.field
    async def users(self) -> List[User]:
        """Get all users"""
        async with AsyncSessionLocal() as session:
            result = await session.execute(select(UserModel))
            users = result.scalars().all()
            
            return [
                User(
                    id=strawberry.ID(str(user.id)),
                    username=user.username,
                    email=user.email,
                    display_name=user.display_name,
                    bio=user.bio,
                    created_at=user.created_at,
                )
                for user in users
            ]
