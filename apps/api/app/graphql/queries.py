import strawberry
from typing import List
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.graphql.types import User, Post, Comment, UserType, PostType
from app.models import User as UserModel, Post as PostModel, Comment as CommentModel
from app.database import AsyncSessionLocal


@strawberry.type
class Query:
    @strawberry.field
    async def posts(self, sponsored_only: bool = False) -> List[Post]:
        """Get all posts, optionally filter for sponsored content"""
        async with AsyncSessionLocal() as session:
            query = select(PostModel).options(
                selectinload(PostModel.author)
            ).options(
                selectinload(PostModel.comments)
            ).order_by(PostModel.created_at.desc())
            
            if sponsored_only:
                query = query.where(PostModel.is_sponsored == True)
            
            result = await session.execute(query)
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
                        user_type=UserType[post.author.user_type.upper()] if hasattr(post.author, 'user_type') and post.author.user_type else UserType.REGULAR,
                        is_verified=getattr(post.author, 'is_verified', False),
                        follower_count=getattr(post.author, 'follower_count', 0),
                        creator_score=getattr(post.author, 'creator_score', 0.0),
                        created_at=post.author.created_at,
                    ),
                    post_type=PostType[post.post_type.upper()] if hasattr(post, 'post_type') and post.post_type else PostType.REGULAR,
                    is_sponsored=getattr(post, 'is_sponsored', False),
                    views_count=getattr(post, 'views_count', 0),
                    likes_count=getattr(post, 'likes_count', 0),
                    shares_count=getattr(post, 'shares_count', 0),
                    comments_count=len(post.comments),
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
                    user_type=UserType[post.author.user_type.upper()] if hasattr(post.author, 'user_type') and post.author.user_type else UserType.REGULAR,
                    is_verified=getattr(post.author, 'is_verified', False),
                    follower_count=getattr(post.author, 'follower_count', 0),
                    creator_score=getattr(post.author, 'creator_score', 0.0),
                    created_at=post.author.created_at,
                ),
                post_type=PostType[post.post_type.upper()] if hasattr(post, 'post_type') and post.post_type else PostType.REGULAR,
                is_sponsored=getattr(post, 'is_sponsored', False),
                views_count=getattr(post, 'views_count', 0),
                likes_count=getattr(post, 'likes_count', 0),
                shares_count=getattr(post, 'shares_count', 0),
                comments_count=len(post.comments),
            )

    @strawberry.field
    async def users(self, creators_only: bool = False) -> List[User]:
        """Get all users, optionally filter for creators"""
        async with AsyncSessionLocal() as session:
            query = select(UserModel)
            
            if creators_only:
                query = query.where(UserModel.user_type.in_(['creator', 'verified_creator']))
            
            result = await session.execute(query)
            users = result.scalars().all()
            
            return [
                User(
                    id=strawberry.ID(str(user.id)),
                    username=user.username,
                    email=user.email,
                    display_name=user.display_name,
                    bio=user.bio,
                    user_type=UserType[user.user_type.upper()] if hasattr(user, 'user_type') and user.user_type else UserType.REGULAR,
                    is_verified=getattr(user, 'is_verified', False),
                    follower_count=getattr(user, 'follower_count', 0),
                    creator_score=getattr(user, 'creator_score', 0.0),
                    created_at=user.created_at,
                )
                for user in users
            ]

