#!/usr/bin/env python3
"""
Seed script for populating the database with initial data
"""
import asyncio
from app.database import AsyncSessionLocal
from app.models import User, Post, Comment


async def seed_data():
    """Seed the database with initial data"""
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        from sqlalchemy import select
        result = await session.execute(select(User))
        existing_users = result.scalars().all()
        
        if existing_users:
            print("Database already seeded. Skipping...")
            return
        
        # Create sample users
        users = [
            User(
                username="alice",
                email="alice@example.com",
                display_name="Alice Johnson",
                bio="Tech enthusiast and coffee lover ☕",
            ),
            User(
                username="bob",
                email="bob@example.com",
                display_name="Bob Smith",
                bio="Designer by day, gamer by night 🎮",
            ),
            User(
                username="charlie",
                email="charlie@example.com",
                display_name="Charlie Brown",
                bio="Just here for the memes 😄",
            ),
        ]
        
        for user in users:
            session.add(user)
        
        await session.commit()
        
        # Refresh users to get their IDs
        for user in users:
            await session.refresh(user)
        
        # Create sample posts
        posts = [
            Post(
                content="Hello DAIRA! This is my first post. Excited to be here! 🎉",
                author_id=users[0].id,
            ),
            Post(
                content="Just finished a great design project. Check it out!",
                author_id=users[1].id,
            ),
            Post(
                content="Why do programmers prefer dark mode? Because light attracts bugs! 😂",
                author_id=users[2].id,
            ),
            Post(
                content="Working on some exciting new features for DAIRA. Stay tuned!",
                author_id=users[0].id,
            ),
            Post(
                content="Anyone else find TypeScript amazing? The type safety is a game changer!",
                author_id=users[1].id,
            ),
        ]
        
        for post in posts:
            session.add(post)
        
        await session.commit()
        
        # Refresh posts to get their IDs
        for post in posts:
            await session.refresh(post)
        
        # Create sample comments
        comments = [
            Comment(
                content="Welcome! Great to have you here!",
                author_id=users[1].id,
                post_id=posts[0].id,
            ),
            Comment(
                content="Thanks! Looking forward to connecting!",
                author_id=users[0].id,
                post_id=posts[0].id,
            ),
            Comment(
                content="Haha, that's a good one! 😄",
                author_id=users[0].id,
                post_id=posts[2].id,
            ),
        ]
        
        for comment in comments:
            session.add(comment)
        
        await session.commit()
        
        print("Database seeded successfully!")
        print(f"Created {len(users)} users")
        print(f"Created {len(posts)} posts")
        print(f"Created {len(comments)} comments")


if __name__ == "__main__":
    asyncio.run(seed_data())
