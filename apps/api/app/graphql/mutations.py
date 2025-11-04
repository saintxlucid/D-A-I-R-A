import strawberry
from app.graphql.types import User, Post, Comment
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
    ) -> User:
        """Create a new user"""
        async with AsyncSessionLocal() as session:
            user = UserModel(
                username=username,
                email=email,
                display_name=display_name,
                bio=bio,
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
                created_at=user.created_at,
            )

    @strawberry.mutation
    async def create_post(self, content: str, author_id: int = 1) -> Post:
        """Create a new post"""
        async with AsyncSessionLocal() as session:
            post = PostModel(
                content=content,
                author_id=author_id,
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
                    created_at=post.author.created_at,
                ),
                comments_count=0,
                likes_count=0,
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
                    created_at=comment.author.created_at,
                ),
                post_id=strawberry.ID(str(comment.post_id)),
            )
