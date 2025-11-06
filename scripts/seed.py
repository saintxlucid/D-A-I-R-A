#!/usr/bin/env python3
"""
Seed script for populating the database with initial data
Demonstrates the three-tier platform: Social Media, Content Creators, Advertisements
"""
import asyncio
from app.database import AsyncSessionLocal
from app.models import User, Post, Comment


async def seed_data():
    """Seed the database with initial data showcasing all platform tiers"""
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        from sqlalchemy import select
        result = await session.execute(select(User))
        existing_users = result.scalars().all()
        
        if existing_users:
            print("Database already seeded. Skipping...")
            return
        
        # Create sample users representing different platform tiers
        users = [
            # Tier 1: Regular Social Media Users
            User(
                username="alice",
                email="alice@example.com",
                display_name="Alice Johnson",
                bio="Tech enthusiast and coffee lover ☕",
                user_type="regular",
                follower_count=150,
            ),
            User(
                username="bob",
                email="bob@example.com",
                display_name="Bob Smith",
                bio="Designer by day, gamer by night 🎮",
                user_type="regular",
                follower_count=200,
            ),
            
            # Tier 2: Content Creators
            User(
                username="creator_emma",
                email="emma@creator.com",
                display_name="Emma Creative",
                bio="🎨 Digital Artist | Content Creator | Sharing my creative journey",
                user_type="creator",
                is_verified=True,
                follower_count=5000,
                creator_score=87.5,
            ),
            User(
                username="tech_guru",
                email="guru@tech.com",
                display_name="Tech Guru",
                bio="📱 Tech Reviews | Tutorials | 50k+ subscribers on other platforms",
                user_type="verified_creator",
                is_verified=True,
                follower_count=12000,
                creator_score=92.3,
            ),
            
            # Tier 3: Brand/Advertiser
            User(
                username="brand_xyz",
                email="marketing@brandxyz.com",
                display_name="Brand XYZ",
                bio="🏢 Leading tech brand | Follow for exclusive offers and updates",
                user_type="brand",
                is_verified=True,
                follower_count=25000,
            ),
        ]
        
        for user in users:
            session.add(user)
        
        await session.commit()
        
        # Refresh users to get their IDs
        for user in users:
            await session.refresh(user)
            await session.refresh(user)
        
        # Create sample posts representing all three tiers
        posts = [
            # Tier 1: Regular Social Media Posts
            Post(
                content="Hello DAIRA! This is my first post. Excited to be here! 🎉",
                author_id=users[0].id,
                post_type="regular",
                views_count=150,
                likes_count=23,
                shares_count=3,
            ),
            Post(
                content="Just finished a great design project. Check it out!",
                author_id=users[1].id,
                post_type="regular",
                views_count=200,
                likes_count=45,
                shares_count=8,
            ),
            
            # Tier 2: Content Creator Posts
            Post(
                content="🎨 New digital art series dropping tomorrow! As a creator, I love sharing my process with you all. What style should I explore next?",
                author_id=users[2].id,  # creator_emma
                post_type="regular",
                views_count=8500,
                likes_count=1200,
                shares_count=230,
            ),
            Post(
                content="📱 REVIEW: The latest smartphone - 10 reasons why it's a game changer! Full video in bio. #TechReview #GadgetLife",
                author_id=users[3].id,  # tech_guru
                post_type="regular",
                views_count=25000,
                likes_count=3400,
                shares_count=890,
            ),
            
            # Tier 3: Sponsored/Advertisement Posts
            Post(
                content="🚀 Introducing our newest product line! Exclusive launch offer: 30% OFF for DAIRA users. Use code: DAIRA30 at checkout. Limited time only! #Ad #Sponsored",
                author_id=users[4].id,  # brand_xyz
                post_type="sponsored",
                is_sponsored=True,
                sponsor_id=users[4].id,
                views_count=45000,
                likes_count=2100,
                shares_count=450,
            ),
            Post(
                content="Thanks to @brand_xyz for sponsoring this post! 🎉 I've been using their products and here's my honest review... [Content continues]",
                author_id=users[3].id,  # tech_guru promoting brand
                post_type="sponsored",
                is_sponsored=True,
                sponsor_id=users[4].id,
                views_count=32000,
                likes_count=4200,
                shares_count=670,
            ),
        ]
        
        for post in posts:
            session.add(post)
        
        await session.commit()
        
        # Refresh posts to get their IDs
        for post in posts:
            await session.refresh(post)
        
        # Create sample comments showcasing engagement across all tiers
        comments = [
            # Social engagement
            Comment(
                content="Welcome! Great to have you here!",
                author_id=users[1].id,
                post_id=posts[0].id,
                likes_count=5,
            ),
            Comment(
                content="Thanks! Looking forward to connecting!",
                author_id=users[0].id,
                post_id=posts[0].id,
                likes_count=3,
            ),
            
            # Creator engagement
            Comment(
                content="Your art is incredible! Can't wait to see the new series 🎨",
                author_id=users[0].id,
                post_id=posts[2].id,
                likes_count=45,
            ),
            Comment(
                content="Amazing review as always! Just ordered one 📱",
                author_id=users[1].id,
                post_id=posts[3].id,
                likes_count=67,
            ),
            
            # Brand/Ad engagement
            Comment(
                content="Great deal! Just used the code 🎉",
                author_id=users[0].id,
                post_id=posts[4].id,
                likes_count=12,
            ),
        ]
        
        for comment in comments:
            session.add(comment)
        
        await session.commit()
        
        print("✅ Database seeded successfully!")
        print(f"\n📊 Platform Tier Summary:")
        print(f"  Tier 1 - Social Media Users: {sum(1 for u in users if u.user_type == 'regular')} users")
        print(f"  Tier 2 - Content Creators: {sum(1 for u in users if u.user_type in ['creator', 'verified_creator'])} creators")
        print(f"  Tier 3 - Brands/Advertisers: {sum(1 for u in users if u.user_type == 'brand')} brands")
        print(f"\n📝 Content Summary:")
        print(f"  Regular Posts: {sum(1 for p in posts if p.post_type == 'regular')} posts")
        print(f"  Sponsored Posts: {sum(1 for p in posts if p.is_sponsored)} posts")
        print(f"  Total Comments: {len(comments)} comments")
        print(f"\n🎯 Total created: {len(users)} users, {len(posts)} posts, {len(comments)} comments")


if __name__ == "__main__":
    asyncio.run(seed_data())
