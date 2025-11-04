import enum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class PostType(str, enum.Enum):
    VIDEO = "video"
    IMAGE = "image"
    TEXT = "text"
    VOICE = "voice"


class RoomState(str, enum.Enum):
    OPEN = "open"
    CLOSED = "closed"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    handle = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    bio = Column(Text)
    avatar = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    posts = relationship("Post", back_populates="author")
    hosted_rooms = relationship("Room", back_populates="host")


class Follow(Base):
    __tablename__ = "follows"

    src_user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    dst_user_id = Column(String, ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (Index("idx_follows_dst", "dst_user_id"),)


class Post(Base):
    __tablename__ = "posts"

    id = Column(String, primary_key=True, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(PostType), nullable=False)
    caption = Column(Text)
    media_refs = Column(JSON)  # List of URLs
    visibility = Column(String, default="public")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    author = relationship("User", back_populates="posts")
    reactions = relationship("Reaction", back_populates="post")
    comments = relationship("Comment", back_populates="post")

    __table_args__ = (Index("idx_posts_author_created", "author_id", "created_at"),)


class Reaction(Base):
    __tablename__ = "reactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # like, boost, save
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    post = relationship("Post", back_populates="reactions")

    __table_args__ = (Index("idx_reactions_post_user", "post_id", "user_id"),)


class Comment(Base):
    __tablename__ = "comments"

    id = Column(String, primary_key=True, index=True)
    post_id = Column(String, ForeignKey("posts.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    parent_comment_id = Column(String, ForeignKey("comments.id"))
    text = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    post = relationship("Post", back_populates="comments")

    __table_args__ = (Index("idx_comments_post_created", "post_id", "created_at"),)


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)
    host_id = Column(String, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    starts_at = Column(DateTime(timezone=True), nullable=False)
    ends_at = Column(DateTime(timezone=True))
    state = Column(Enum(RoomState), default=RoomState.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    host = relationship("User", back_populates="hosted_rooms")
    digests = relationship("Digest", back_populates="room")


class Digest(Base):
    __tablename__ = "digests"

    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=False)
    summary = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="digests")
