import strawberry
from app.graphql.types import User, Post, Comment, UserType, PostType
from app.models import User as UserModel, Post as PostModel, Comment as CommentModel
from app.database import AsyncSessionLocal


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_user(
        self,
        username: str,
        email: str,
        display_name: str,
        bio: str | None = None,
        user_type: UserType = UserType.REGULAR,
    ) -> User:
        """Create a new user (supports regular users, creators, and brands)"""
        async with AsyncSessionLocal() as session:
            user = UserModel(
                username=username,
                email=email,
                display_name=display_name,
                bio=bio,
                user_type=user_type.value,
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
            return User(
                id=strawberry.ID(str(user.id)),
                username=user.username,
                email=user.email,
                display_name=user.display_name,
                bio=user.bio,
                user_type=user_type,
                is_verified=user.is_verified,
                follower_count=user.follower_count,
                creator_score=user.creator_score,
                created_at=user.created_at,
            )

    @strawberry.mutation
    async def create_post(
        self, 
        content: str, 
        author_id: int = 1,
        post_type: PostType = PostType.REGULAR,
        is_sponsored: bool = False,
    ) -> Post:
        """Create a new post (supports regular, sponsored, and promoted posts)"""
        async with AsyncSessionLocal() as session:
            post = PostModel(
                content=content,
                author_id=author_id,
                post_type=post_type.value,
                is_sponsored=is_sponsored,
            )
            session.add(post)
            await session.commit()
            await session.refresh(post, ["author"])
            
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
                    user_type=UserType[post.author.user_type.upper()],
                    is_verified=post.author.is_verified,
                    follower_count=post.author.follower_count,
                    creator_score=post.author.creator_score,
                    created_at=post.author.created_at,
                ),
                post_type=post_type,
                is_sponsored=is_sponsored,
                views_count=post.views_count,
                likes_count=post.likes_count,
                shares_count=post.shares_count,
                comments_count=0,
            )

    @strawberry.mutation
    async def create_comment(
        self,
        content: str,
        post_id: int,
        author_id: int = 1,
    ) -> Comment:
        """Create a new comment on a post"""
        async with AsyncSessionLocal() as session:
            comment = CommentModel(
                content=content,
                post_id=post_id,
                author_id=author_id,
            )
            session.add(comment)
            await session.commit()
            await session.refresh(comment, ["author"])
            
            return Comment(
                id=strawberry.ID(str(comment.id)),
                content=comment.content,
                created_at=comment.created_at,
                author=User(
                    id=strawberry.ID(str(comment.author.id)),
                    username=comment.author.username,
                    email=comment.author.email,
                    display_name=comment.author.display_name,
                    bio=comment.author.bio,
                    user_type=UserType[comment.author.user_type.upper()],
                    is_verified=comment.author.is_verified,
                    follower_count=comment.author.follower_count,
                    creator_score=comment.author.creator_score,
                    created_at=comment.author.created_at,
                ),
                post_id=strawberry.ID(str(comment.post_id)),
                likes_count=comment.likes_count,
            )

    @strawberry.mutation
    async def verify_creator(self, user_id: int) -> User:
        """Verify a creator (admin function)"""
        async with AsyncSessionLocal() as session:
            from sqlalchemy import select
            result = await session.execute(
                select(UserModel).where(UserModel.id == user_id)
            )
            user = result.scalar_one_or_none()
            
            if not user:
                raise Exception("User not found")
            
            user.is_verified = True
            user.user_type = "verified_creator"
            await session.commit()
            await session.refresh(user)
            
            return User(
                id=strawberry.ID(str(user.id)),
                username=user.username,
                email=user.email,
                display_name=user.display_name,
                bio=user.bio,
                user_type=UserType.VERIFIED_CREATOR,
                is_verified=user.is_verified,
                follower_count=user.follower_count,
                creator_score=user.creator_score,
                created_at=user.created_at,
            )

