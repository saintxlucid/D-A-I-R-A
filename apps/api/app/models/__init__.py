from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Table, Boolean, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


# Association table for follows (Social Media Feature)
follows = Table(
    'follows',
    Base.metadata,
    Column('follower_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('followed_id', Integer, ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
)


# Enums for Content Creator Features
class UserType(str, enum.Enum):
    REGULAR = "regular"
    CREATOR = "creator"
    VERIFIED_CREATOR = "verified_creator"
    BRAND = "brand"


class PostType(str, enum.Enum):
    REGULAR = "regular"
    SPONSORED = "sponsored"
    PROMOTED = "promoted"


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    bio = Column(Text, nullable=True)
    
    # Content Creator Features
    user_type = Column(SQLEnum(UserType), default=UserType.REGULAR, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    follower_count = Column(Integer, default=0)
    creator_score = Column(Float, default=0.0)  # Reputation/engagement score
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="author", cascade="all, delete-orphan")
    
    # Following relationships (Social Media)
    following = relationship(
        "User",
        secondary=follows,
        primaryjoin=(follows.c.follower_id == id),
        secondaryjoin=(follows.c.followed_id == id),
        backref="followers",
    )


class Post(Base):
    __tablename__ = 'posts'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    
    # Content & Advertisement Features
    post_type = Column(SQLEnum(PostType), default=PostType.REGULAR, nullable=False)
    is_sponsored = Column(Boolean, default=False, nullable=False)
    sponsor_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)  # Brand/advertiser
    
    # Engagement metrics for creators
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="posts", foreign_keys=[author_id])
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")


class Comment(Base):
    __tablename__ = 'comments'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    author_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    post_id = Column(Integer, ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    
    # Engagement metrics
    likes_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    author = relationship("User", back_populates="comments")
    post = relationship("Post", back_populates="comments")

