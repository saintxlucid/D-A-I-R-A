#!/usr/bin/env python3
"""Seed demo data for DAIRA"""

import sys
import os
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.db.models import User, Post, Follow, Comment, PostType, PostVisibility


def seed_data():
    db = SessionLocal()
    try:
        # Check if data already exists
        if db.query(User).count() > 0:
            print("Data already seeded. Skipping...")
            return

        print("Seeding demo data...")

        # Create demo users
        users = [
            User(
                handle="@demo_user",
                name="Demo User",
                bio="Welcome to DAIRA! This is a demo account.",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            ),
            User(
                handle="@sarahchen",
                name="Sarah Chen",
                bio="Full-stack developer | Coffee enthusiast ☕",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
            ),
            User(
                handle="@alexr",
                name="Alex Rivera",
                bio="Photographer | Traveler 📸",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
            ),
            User(
                handle="@mayap",
                name="Maya Patel",
                bio="Designer | Creative mind 🎨",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
            ),
        ]

        db.add_all(users)
        db.commit()

        for user in users:
            db.refresh(user)

        print(f"Created {len(users)} users")

        # Create demo posts
        posts = [
            Post(
                author_id=users[1].id,
                type=PostType.text,
                caption="Just launched my new project! Check it out and let me know what you think 🚀 #webdev #typescript",
                visibility=PostVisibility.public,
                created_at=datetime.utcnow() - timedelta(minutes=30),
            ),
            Post(
                author_id=users[2].id,
                type=PostType.image,
                caption="Beautiful sunset from my office window 🌅",
                media_refs="https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
                visibility=PostVisibility.public,
                created_at=datetime.utcnow() - timedelta(hours=2),
            ),
            Post(
                author_id=users[3].id,
                type=PostType.text,
                caption="Coffee + Code = ❤️\n\nWhat's your favorite coding beverage?",
                visibility=PostVisibility.public,
                created_at=datetime.utcnow() - timedelta(hours=5),
            ),
            Post(
                author_id=users[0].id,
                type=PostType.text,
                caption="Welcome to DAIRA! Excited to share my journey here.",
                visibility=PostVisibility.public,
                created_at=datetime.utcnow() - timedelta(hours=12),
            ),
        ]

        db.add_all(posts)
        db.commit()

        print(f"Created {len(posts)} posts")

        # Create demo follows
        follows = [
            Follow(follower_id=users[0].id, following_id=users[1].id),
            Follow(follower_id=users[0].id, following_id=users[2].id),
            Follow(follower_id=users[1].id, following_id=users[0].id),
            Follow(follower_id=users[2].id, following_id=users[3].id),
        ]

        db.add_all(follows)
        db.commit()

        print(f"Created {len(follows)} follows")

        # Create demo comments
        comments = [
            Comment(
                post_id=posts[0].id,
                author_id=users[0].id,
                content="This looks amazing! Great work!",
            ),
            Comment(
                post_id=posts[1].id,
                author_id=users[1].id,
                content="Stunning photo! 📸",
            ),
        ]

        db.add_all(comments)
        db.commit()

        print(f"Created {len(comments)} comments")

        print("✅ Demo data seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
