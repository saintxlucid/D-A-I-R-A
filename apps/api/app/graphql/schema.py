import strawberry
from typing import List, Optional
from datetime import datetime
import uuid

from app.graphql.types import User, Post, Room, Digest, Comment
from app.database import SessionLocal
from app import models


def get_db():
    return SessionLocal()


@strawberry.type
class Query:
    @strawberry.field
    def me(self) -> Optional[User]:
        # Stub: return demo user
        db = get_db()
        user = db.query(models.User).filter(models.User.handle == "demo").first()
        if not user:
            return None
        return User(
            id=user.id,
            handle=user.handle,
            name=user.name,
            bio=user.bio,
            avatar=user.avatar,
            created_at=user.created_at,
        )

    @strawberry.field
    def user(self, handle: str) -> Optional[User]:
        db = get_db()
        user = db.query(models.User).filter(models.User.handle == handle).first()
        if not user:
            return None
        return User(
            id=user.id,
            handle=user.handle,
            name=user.name,
            bio=user.bio,
            avatar=user.avatar,
            created_at=user.created_at,
        )

    @strawberry.field
    def feed(self, limit: int = 20, cursor: Optional[str] = None) -> List[Post]:
        db = get_db()
        query = db.query(models.Post).order_by(models.Post.created_at.desc())

        if cursor:
            query = query.filter(models.Post.id < cursor)

        posts = query.limit(limit).all()
        result = []
        for post in posts:
            author_user = None
            if post.author:
                author_user = User(
                    id=post.author.id,
                    handle=post.author.handle,
                    name=post.author.name,
                    bio=post.author.bio,
                    avatar=post.author.avatar,
                    created_at=post.author.created_at,
                )

            result.append(
                Post(
                    id=post.id,
                    author_id=post.author_id,
                    type=post.type.value,
                    caption=post.caption,
                    media_refs=post.media_refs,
                    visibility=post.visibility,
                    created_at=post.created_at,
                    author=author_user,
                    likes_count=len(
                        [r for r in post.reactions if r.type == "like"]
                    ),
                    comments_count=len(post.comments),
                )
            )
        return result

    @strawberry.field
    def posts_by_user(self, user_id: str, limit: int = 20) -> List[Post]:
        db = get_db()
        posts = (
            db.query(models.Post)
            .filter(models.Post.author_id == user_id)
            .order_by(models.Post.created_at.desc())
            .limit(limit)
            .all()
        )
        return [
            Post(
                id=post.id,
                author_id=post.author_id,
                type=post.type.value,
                caption=post.caption,
                media_refs=post.media_refs,
                visibility=post.visibility,
                created_at=post.created_at,
            )
            for post in posts
        ]

    @strawberry.field
    def rooms(self, limit: int = 20) -> List[Room]:
        db = get_db()
        rooms = db.query(models.Room).order_by(models.Room.created_at.desc()).limit(limit).all()
        result = []
        for room in rooms:
            host_user = None
            if room.host:
                host_user = User(
                    id=room.host.id,
                    handle=room.host.handle,
                    name=room.host.name,
                    bio=room.host.bio,
                    avatar=room.host.avatar,
                    created_at=room.host.created_at,
                )
            result.append(
                Room(
                    id=room.id,
                    host_id=room.host_id,
                    topic=room.topic,
                    starts_at=room.starts_at,
                    ends_at=room.ends_at,
                    state=room.state.value,
                    created_at=room.created_at,
                    host=host_user,
                )
            )
        return result

    @strawberry.field
    def room(self, id: str) -> Optional[Room]:
        db = get_db()
        room = db.query(models.Room).filter(models.Room.id == id).first()
        if not room:
            return None

        host_user = None
        if room.host:
            host_user = User(
                id=room.host.id,
                handle=room.host.handle,
                name=room.host.name,
                bio=room.host.bio,
                avatar=room.host.avatar,
                created_at=room.host.created_at,
            )

        return Room(
            id=room.id,
            host_id=room.host_id,
            topic=room.topic,
            starts_at=room.starts_at,
            ends_at=room.ends_at,
            state=room.state.value,
            created_at=room.created_at,
            host=host_user,
        )

    @strawberry.field
    def digest(self, room_id: str) -> Optional[Digest]:
        db = get_db()
        digest = db.query(models.Digest).filter(models.Digest.room_id == room_id).first()
        if not digest:
            return None

        room_obj = None
        if digest.room:
            room_obj = Room(
                id=digest.room.id,
                host_id=digest.room.host_id,
                topic=digest.room.topic,
                starts_at=digest.room.starts_at,
                ends_at=digest.room.ends_at,
                state=digest.room.state.value,
                created_at=digest.room.created_at,
            )

        return Digest(
            id=digest.id,
            room_id=digest.room_id,
            summary=digest.summary,
            created_at=digest.created_at,
            room=room_obj,
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_user(self, handle: str, name: str) -> User:
        db = get_db()
        user = models.User(id=str(uuid.uuid4()), handle=handle, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
        return User(
            id=user.id,
            handle=user.handle,
            name=user.name,
            bio=user.bio,
            avatar=user.avatar,
            created_at=user.created_at,
        )

    @strawberry.mutation
    def create_post(
        self,
        author_id: str,
        type: str,
        caption: Optional[str] = None,
        media_refs: Optional[List[str]] = None,
    ) -> Post:
        db = get_db()
        post = models.Post(
            id=str(uuid.uuid4()),
            author_id=author_id,
            type=models.PostType(type),
            caption=caption,
            media_refs=media_refs or [],
        )
        db.add(post)
        db.commit()
        db.refresh(post)
        return Post(
            id=post.id,
            author_id=post.author_id,
            type=post.type.value,
            caption=post.caption,
            media_refs=post.media_refs,
            visibility=post.visibility,
            created_at=post.created_at,
        )

    @strawberry.mutation
    def create_room(self, host_id: str, topic: str, starts_at: datetime) -> Room:
        db = get_db()
        room = models.Room(
            id=str(uuid.uuid4()), host_id=host_id, topic=topic, starts_at=starts_at
        )
        db.add(room)
        db.commit()
        db.refresh(room)
        return Room(
            id=room.id,
            host_id=room.host_id,
            topic=room.topic,
            starts_at=room.starts_at,
            ends_at=room.ends_at,
            state=room.state.value,
            created_at=room.created_at,
        )

    @strawberry.mutation
    def close_room(self, id: str) -> Room:
        db = get_db()
        room = db.query(models.Room).filter(models.Room.id == id).first()
        if room:
            room.state = models.RoomState.CLOSED
            room.ends_at = datetime.utcnow()
            db.commit()
            db.refresh(room)
        return Room(
            id=room.id,
            host_id=room.host_id,
            topic=room.topic,
            starts_at=room.starts_at,
            ends_at=room.ends_at,
            state=room.state.value,
            created_at=room.created_at,
        )

    @strawberry.mutation
    def create_digest(self, room_id: str) -> Digest:
        db = get_db()
        # Stub: create simple summary
        digest = models.Digest(
            id=str(uuid.uuid4()),
            room_id=room_id,
            summary="This is an AI-generated digest summarizing the room discussions.",
        )
        db.add(digest)
        db.commit()
        db.refresh(digest)
        return Digest(
            id=digest.id,
            room_id=digest.room_id,
            summary=digest.summary,
            created_at=digest.created_at,
        )


schema = strawberry.Schema(query=Query, mutation=Mutation)
