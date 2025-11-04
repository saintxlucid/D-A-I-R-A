"""initial schema

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE posttype AS ENUM ('video', 'image', 'text', 'voice')")
    op.execute("CREATE TYPE roomstate AS ENUM ('open', 'closed')")

    # Users table
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("handle", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("avatar", sa.String(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_handle"), "users", ["handle"], unique=True)

    # Follows table
    op.create_table(
        "follows",
        sa.Column("src_user_id", sa.String(), nullable=False),
        sa.Column("dst_user_id", sa.String(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["src_user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["dst_user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("src_user_id", "dst_user_id"),
    )
    op.create_index("idx_follows_dst", "follows", ["dst_user_id"], unique=False)

    # Posts table
    op.create_table(
        "posts",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("author_id", sa.String(), nullable=False),
        sa.Column(
            "type",
            postgresql.ENUM("video", "image", "text", "voice", name="posttype"),
            nullable=False,
        ),
        sa.Column("caption", sa.Text(), nullable=True),
        sa.Column("media_refs", sa.JSON(), nullable=True),
        sa.Column("visibility", sa.String(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_posts_id"), "posts", ["id"], unique=False)
    op.create_index(op.f("ix_posts_created_at"), "posts", ["created_at"], unique=False)
    op.create_index("idx_posts_author_created", "posts", ["author_id", "created_at"], unique=False)

    # Reactions table
    op.create_table(
        "reactions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("type", sa.String(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_reactions_post_user", "reactions", ["post_id", "user_id"], unique=False)

    # Comments table
    op.create_table(
        "comments",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("post_id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=False),
        sa.Column("parent_comment_id", sa.String(), nullable=True),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["parent_comment_id"], ["comments.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_comments_id"), "comments", ["id"], unique=False)
    op.create_index(op.f("ix_comments_created_at"), "comments", ["created_at"], unique=False)
    op.create_index(
        "idx_comments_post_created", "comments", ["post_id", "created_at"], unique=False
    )

    # Rooms table
    op.create_table(
        "rooms",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("host_id", sa.String(), nullable=False),
        sa.Column("topic", sa.String(), nullable=False),
        sa.Column("starts_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ends_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("state", postgresql.ENUM("open", "closed", name="roomstate"), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["host_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_rooms_id"), "rooms", ["id"], unique=False)

    # Digests table
    op.create_table(
        "digests",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("room_id", sa.String(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True
        ),
        sa.ForeignKeyConstraint(["room_id"], ["rooms.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_digests_id"), "digests", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_digests_id"), table_name="digests")
    op.drop_table("digests")
    op.drop_index(op.f("ix_rooms_id"), table_name="rooms")
    op.drop_table("rooms")
    op.drop_index("idx_comments_post_created", table_name="comments")
    op.drop_index(op.f("ix_comments_created_at"), table_name="comments")
    op.drop_index(op.f("ix_comments_id"), table_name="comments")
    op.drop_table("comments")
    op.drop_index("idx_reactions_post_user", table_name="reactions")
    op.drop_table("reactions")
    op.drop_index("idx_posts_author_created", table_name="posts")
    op.drop_index(op.f("ix_posts_created_at"), table_name="posts")
    op.drop_index(op.f("ix_posts_id"), table_name="posts")
    op.drop_table("posts")
    op.drop_index("idx_follows_dst", table_name="follows")
    op.drop_table("follows")
    op.drop_index(op.f("ix_users_handle"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
    op.execute("DROP TYPE roomstate")
    op.execute("DROP TYPE posttype")
