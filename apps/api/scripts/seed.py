#!/usr/bin/env python3
"""Seed script to populate demo data"""
import os
import sys
import uuid
from datetime import UTC, datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Digest, Post, PostType, Room, RoomState, User


def seed():
    db = SessionLocal()

    try:
        # Check if already seeded
        existing = db.query(User).filter(User.handle == "demo").first()
        if existing:
            print("Database already seeded. Skipping...")
            return

        print("Seeding database...")

        # Create demo user
        demo_user = User(
            id=str(uuid.uuid4()),
            handle="demo",
            name="Demo User",
            bio="This is a demo account for DAIRA",
            avatar=None,
        )
        db.add(demo_user)

        # Create 5 demo posts
        posts = []
        for i in range(5):
            post_type = [
                PostType.VIDEO,
                PostType.IMAGE,
                PostType.TEXT,
                PostType.VOICE,
                PostType.IMAGE,
            ][i]
            post = Post(
                id=str(uuid.uuid4()),
                author_id=demo_user.id,
                type=post_type,
                caption=f"This is demo post #{i+1}. Exploring the world one post at a time!",
                media_refs=["/placeholder-video.mp4"] if post_type == PostType.VIDEO else [],
                visibility="public",
            )
            posts.append(post)
            db.add(post)

        # Create a room
        room = Room(
            id=str(uuid.uuid4()),
            host_id=demo_user.id,
            topic="Welcome to DAIRA: Discussing the Future of Social Media",
            starts_at=datetime.now(UTC) - timedelta(hours=2),
            ends_at=datetime.now(UTC) - timedelta(hours=1),
            state=RoomState.CLOSED,
        )
        db.add(room)

        # Create a digest for the room
        digest = Digest(
            id=str(uuid.uuid4()),
            room_id=room.id,
            summary="""# Room Digest: Welcome to DAIRA

## Key Discussion Points:
- Introduction to DAIRA's vision of connecting communities
- The importance of time-boxed discussions for focused conversations
- How Reels, Threads, and Rooms complement each other
- Moderation strategies for healthy communities
- Future features and community feedback

## Highlights:
Participants discussed the unique approach DAIRA takes in combining short-form video content with meaningful discussions. The concept of "Rooms" was particularly well-received as a way to have focused, time-bound conversations.

## Next Steps:
- Community guidelines refinement
- Beta testing program expansion
- Feature requests prioritization

Total Participants: 25
Duration: 1 hour
""",
        )
        db.add(digest)

        db.commit()
        print("✓ Created demo user")
        print("✓ Created 5 demo posts")
        print("✓ Created demo room")
        print("✓ Created digest")
        print("\nSeeding complete!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
