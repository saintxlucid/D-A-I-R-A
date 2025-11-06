# DAIRA Global Scale Implementation Roadmap

## Executive Summary

This document outlines the complete implementation roadmap to transform DAIRA from a production-ready foundation into a globally competitive social media platform capable of serving 100M+ users across multiple regions.

## Current State ✅

**Foundation Complete** (14 commits):
- Meta/senior database schema (40+ tables, RLS, partitioning)
- JWT auth system with device sessions
- GraphQL API (30+ types, DataLoader)
- 6 Kafka worker services
- Upload service with media processing
- Multi-tier caching strategy
- Full observability stack
- 26 innovative features documented

## Phase 1: Critical Infrastructure (Weeks 1-4)

### 1.1 Search & Discovery Infrastructure
**OpenSearch Integration** - Full-text search with Arabic/Arabizi support

**Components**:
```yaml
opensearch:
  cluster_size: 3 nodes (multi-AZ)
  shards: 5 primary, 2 replicas per index
  indices:
    - users_index (20M docs)
    - posts_index (500M docs)
    - hashtags_index (10M docs)
    - sounds_index (5M docs)
```

**Analyzers**:
- Arabic analyzer with stemming + stop words
- Arabizi custom analyzer with character mappings (3→ع, 7→ح, 2→أ)
- Trigram analyzer for fuzzy matching
- Dialect-aware tokenizers (Egyptian, Levantine, Gulf)

**Implementation**:
```python
# apps/api/app/search/opensearch_client.py
from opensearchpy import OpenSearch, helpers

class SearchService:
    def __init__(self):
        self.client = OpenSearch(
            hosts=[{'host': 'opensearch', 'port': 9200}],
            http_auth=('admin', os.getenv('OPENSEARCH_PASSWORD')),
            use_ssl=True,
            verify_certs=True
        )
    
    async def index_user(self, user_id: int, data: dict):
        """Index user for search with Arabic/Arabizi support"""
        await self.client.index(
            index='users',
            id=user_id,
            body={
                'username': data['username'],
                'display_name': data['display_name'],
                'bio': data['bio'],
                'location': data.get('location'),
                'verified': data.get('is_verified', False),
                'follower_count': data.get('follower_count', 0),
                'indexed_at': datetime.utcnow().isoformat()
            }
        )
    
    async def search_users(
        self, 
        query: str, 
        filters: dict = None,
        size: int = 20,
        from_: int = 0
    ) -> dict:
        """Search users with Arabic/Arabizi fuzzy matching"""
        body = {
            'query': {
                'bool': {
                    'should': [
                        # Exact match boost
                        {'match': {'username': {'query': query, 'boost': 3}}},
                        {'match': {'display_name': {'query': query, 'boost': 2}}},
                        # Fuzzy match for typos
                        {'fuzzy': {'username': {'value': query, 'fuzziness': 'AUTO'}}},
                        # Bio search
                        {'match': {'bio': {'query': query}}}
                    ],
                    'filter': []
                }
            },
            'size': size,
            'from': from_,
            'sort': [
                {'_score': 'desc'},
                {'follower_count': 'desc'}
            ]
        }
        
        if filters:
            if filters.get('verified'):
                body['query']['bool']['filter'].append({'term': {'verified': True}})
            if filters.get('location'):
                body['query']['bool']['filter'].append({'term': {'location': filters['location']}})
        
        return await self.client.search(index='users', body=body)
```

**Indexing Pipeline** (Kafka Consumer):
```python
# apps/worker/search_indexer.py
async def consume_user_events():
    """Index user changes to OpenSearch"""
    async for message in kafka_consumer:
        event = json.loads(message.value)
        
        if event['type'] == 'user.created':
            await search_service.index_user(event['user_id'], event['data'])
        elif event['type'] == 'user.updated':
            await search_service.update_user(event['user_id'], event['changes'])
        elif event['type'] == 'user.deleted':
            await search_service.delete_user(event['user_id'])
```

**GraphQL Integration**:
```python
# apps/api/app/graphql/queries/search.py
@strawberry.field
async def search(
    self,
    info: Info,
    query: str,
    type: SearchType = SearchType.ALL,
    limit: int = 20,
    offset: int = 0
) -> SearchResults:
    """Unified search across users, posts, hashtags, sounds"""
    search_service = info.context.search_service
    
    if type == SearchType.USERS:
        results = await search_service.search_users(query, limit, offset)
    elif type == SearchType.POSTS:
        results = await search_service.search_posts(query, limit, offset)
    elif type == SearchType.HASHTAGS:
        results = await search_service.search_hashtags(query, limit, offset)
    else:
        # All - search across indices
        results = await search_service.search_all(query, limit, offset)
    
    return SearchResults(
        users=results.get('users', []),
        posts=results.get('posts', []),
        hashtags=results.get('hashtags', []),
        sounds=results.get('sounds', []),
        total=results.get('total', 0)
    )
```

### 1.2 Real-Time WebSocket Infrastructure
**WebSocket Gateway** - Live updates, presence, typing indicators

**Architecture**:
```
Client <-WebSocket-> FastAPI WS Handler <-Redis Pub/Sub-> All Instances
                            ↓
                    Update GraphQL Subscriptions
                            ↓
                    Emit to Connected Clients
```

**Implementation**:
```python
# apps/api/app/realtime/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, Set
import asyncio

class ConnectionManager:
    def __init__(self):
        # user_id -> set of WebSocket connections
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        self.redis_pubsub = None
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        
        # Publish presence
        await self.redis.publish(
            'presence',
            json.dumps({'user_id': user_id, 'status': 'online'})
        )
    
    async def disconnect(self, websocket: WebSocket, user_id: int):
        self.active_connections[user_id].discard(websocket)
        if not self.active_connections[user_id]:
            del self.active_connections[user_id]
            # Publish offline
            await self.redis.publish(
                'presence',
                json.dumps({'user_id': user_id, 'status': 'offline'})
            )
    
    async def send_to_user(self, user_id: int, message: dict):
        """Send message to all user's connections"""
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    await self.disconnect(connection, user_id)
    
    async def broadcast_to_room(self, room_id: str, message: dict):
        """Broadcast to all users in a room"""
        room_users = await get_room_users(room_id)
        for user_id in room_users:
            await self.send_to_user(user_id, message)

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_json()
            await handle_websocket_message(user_id, data)
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)
```

**GraphQL Subscriptions** (Strawberry):
```python
# apps/api/app/graphql/subscriptions.py
@strawberry.type
class Subscription:
    @strawberry.subscription
    async def notifications(
        self, 
        info: Info
    ) -> AsyncGenerator[Notification, None]:
        """Real-time notifications stream"""
        user_id = info.context.user_id
        channel = f"notifications:{user_id}"
        
        pubsub = redis.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    notification = json.loads(message['data'])
                    yield Notification(**notification)
        finally:
            await pubsub.unsubscribe(channel)
    
    @strawberry.subscription
    async def message_thread(
        self,
        info: Info,
        thread_id: int
    ) -> AsyncGenerator[Message, None]:
        """Real-time messages in thread"""
        user_id = info.context.user_id
        # Check permission to access thread
        if not await has_thread_access(user_id, thread_id):
            raise PermissionError("No access to thread")
        
        channel = f"thread:{thread_id}"
        pubsub = redis.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    msg = json.loads(message['data'])
                    yield Message(**msg)
        finally:
            await pubsub.unsubscribe(channel)
    
    @strawberry.subscription
    async def typing_indicator(
        self,
        info: Info,
        thread_id: int
    ) -> AsyncGenerator[TypingStatus, None]:
        """Typing indicators"""
        channel = f"typing:{thread_id}"
        pubsub = redis.pubsub()
        await pubsub.subscribe(channel)
        
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    status = json.loads(message['data'])
                    yield TypingStatus(**status)
        finally:
            await pubsub.unsubscribe(channel)
```

### 1.3 Video Processing Pipeline
**Complete Transcoding** - Multi-resolution adaptive streaming

**Architecture**:
```
Upload → MinIO → Kafka Event → Video Worker → FFmpeg Transcoding
                                        ↓
                            [360p, 480p, 720p, 1080p, 4K]
                                        ↓
                            HLS Packaging + Thumbnails
                                        ↓
                            MinIO + CDN Distribution
```

**Implementation**:
```python
# apps/worker/video_processor.py
import subprocess
import os
from pathlib import Path

class VideoProcessor:
    RESOLUTIONS = [
        {'height': 360, 'bitrate': '800k', 'audio_bitrate': '96k'},
        {'height': 480, 'bitrate': '1200k', 'audio_bitrate': '128k'},
        {'height': 720, 'bitrate': '2500k', 'audio_bitrate': '128k'},
        {'height': 1080, 'bitrate': '5000k', 'audio_bitrate': '192k'},
        {'height': 2160, 'bitrate': '15000k', 'audio_bitrate': '256k'},  # 4K
    ]
    
    async def process_video(self, video_id: str, input_path: str):
        """Process video into multiple resolutions with HLS"""
        temp_dir = Path(f"/tmp/video_{video_id}")
        temp_dir.mkdir(exist_ok=True)
        
        try:
            # Extract metadata
            metadata = await self.extract_metadata(input_path)
            
            # Generate thumbnails
            thumbnails = await self.generate_thumbnails(input_path, temp_dir)
            
            # Transcode to multiple resolutions
            variants = []
            for res in self.RESOLUTIONS:
                if res['height'] <= metadata['height']:
                    variant_path = await self.transcode_variant(
                        input_path, 
                        res, 
                        temp_dir
                    )
                    variants.append(variant_path)
            
            # Package as HLS
            hls_path = await self.package_hls(variants, temp_dir)
            
            # Upload to MinIO
            await self.upload_to_storage(video_id, hls_path, thumbnails)
            
            # Update database
            await self.update_video_status(video_id, 'ready', metadata)
            
        finally:
            # Cleanup
            shutil.rmtree(temp_dir)
    
    async def transcode_variant(
        self, 
        input_path: str, 
        resolution: dict, 
        output_dir: Path
    ) -> str:
        """Transcode single resolution variant"""
        height = resolution['height']
        output_path = output_dir / f"variant_{height}p.mp4"
        
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', f"scale=-2:{height}",
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-b:v', resolution['bitrate'],
            '-maxrate', resolution['bitrate'],
            '-bufsize', str(int(resolution['bitrate'].rstrip('k')) * 2) + 'k',
            '-c:a', 'aac',
            '-b:a', resolution['audio_bitrate'],
            '-movflags', '+faststart',
            '-y',
            str(output_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"FFmpeg error: {stderr.decode()}")
        
        return str(output_path)
    
    async def package_hls(self, variants: list, output_dir: Path) -> str:
        """Package variants into HLS adaptive streaming"""
        hls_dir = output_dir / "hls"
        hls_dir.mkdir(exist_ok=True)
        
        # Create master playlist
        master_playlist = hls_dir / "master.m3u8"
        variant_playlists = []
        
        for variant_path in variants:
            height = int(Path(variant_path).stem.split('_')[1].rstrip('p'))
            playlist_path = hls_dir / f"variant_{height}p.m3u8"
            
            # Generate HLS segments
            cmd = [
                'ffmpeg',
                '-i', variant_path,
                '-codec', 'copy',
                '-start_number', '0',
                '-hls_time', '6',
                '-hls_list_size', '0',
                '-f', 'hls',
                str(playlist_path)
            ]
            
            await asyncio.create_subprocess_exec(*cmd)
            variant_playlists.append((height, playlist_path))
        
        # Write master playlist
        with open(master_playlist, 'w') as f:
            f.write('#EXTM3U\n')
            f.write('#EXT-X-VERSION:3\n')
            for height, playlist in sorted(variant_playlists, key=lambda x: x[0]):
                resolution = next(r for r in self.RESOLUTIONS if r['height'] == height)
                bandwidth = int(resolution['bitrate'].rstrip('k')) * 1000
                f.write(f'#EXT-X-STREAM-INF:BANDWIDTH={bandwidth},RESOLUTION=1920x{height}\n')
                f.write(f'{playlist.name}\n')
        
        return str(hls_dir)
    
    async def generate_thumbnails(
        self, 
        input_path: str, 
        output_dir: Path,
        count: int = 10
    ) -> list:
        """Generate thumbnail images"""
        thumbnails = []
        duration = await self.get_duration(input_path)
        interval = duration / (count + 1)
        
        for i in range(count):
            timestamp = interval * (i + 1)
            thumbnail_path = output_dir / f"thumb_{i}.jpg"
            
            cmd = [
                'ffmpeg',
                '-ss', str(timestamp),
                '-i', input_path,
                '-vframes', '1',
                '-vf', 'scale=320:-1',
                '-y',
                str(thumbnail_path)
            ]
            
            await asyncio.create_subprocess_exec(*cmd)
            thumbnails.append(str(thumbnail_path))
        
        return thumbnails
```

### 1.4 Mobile Push Notifications
**FCM/APNS Integration** - Cross-platform push notifications

**Implementation**:
```python
# apps/api/app/notifications/push_service.py
from firebase_admin import messaging, credentials, initialize_app
import httpx

class PushNotificationService:
    def __init__(self):
        # Initialize Firebase
        cred = credentials.Certificate('firebase-adminsdk.json')
        initialize_app(cred)
        
        # APNS credentials
        self.apns_key_id = os.getenv('APNS_KEY_ID')
        self.apns_team_id = os.getenv('APNS_TEAM_ID')
        self.apns_key = os.getenv('APNS_KEY_PATH')
    
    async def send_notification(
        self,
        user_id: int,
        title: str,
        body: str,
        data: dict = None,
        priority: str = 'high'
    ):
        """Send push notification to all user devices"""
        devices = await self.get_user_devices(user_id)
        
        tasks = []
        for device in devices:
            if device['platform'] == 'android':
                task = self.send_fcm(device['token'], title, body, data, priority)
            elif device['platform'] == 'ios':
                task = self.send_apns(device['token'], title, body, data, priority)
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Handle failed tokens
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                await self.mark_token_invalid(devices[i]['token'])
    
    async def send_fcm(
        self,
        token: str,
        title: str,
        body: str,
        data: dict,
        priority: str
    ):
        """Send via Firebase Cloud Messaging"""
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            token=token,
            android=messaging.AndroidConfig(
                priority=priority,
                notification=messaging.AndroidNotification(
                    sound='default',
                    channel_id='daira_notifications'
                )
            )
        )
        
        try:
            response = messaging.send(message)
            return response
        except messaging.UnregisteredError:
            raise Exception("Invalid token")
    
    async def send_apns(
        self,
        token: str,
        title: str,
        body: str,
        data: dict,
        priority: str
    ):
        """Send via Apple Push Notification Service"""
        message = messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body
            ),
            data=data or {},
            token=token,
            apns=messaging.APNSConfig(
                headers={'apns-priority': '10' if priority == 'high' else '5'},
                payload=messaging.APNSPayload(
                    aps=messaging.Aps(
                        alert=messaging.ApsAlert(
                            title=title,
                            body=body
                        ),
                        sound='default',
                        badge=1
                    )
                )
            )
        )
        
        try:
            response = messaging.send(message)
            return response
        except messaging.UnregisteredError:
            raise Exception("Invalid token")
```

**Notification Worker**:
```python
# apps/worker/notifications.py
async def process_notification_events():
    """Process notification triggers and send push"""
    async for message in kafka_consumer:
        event = json.loads(message.value)
        
        notification_type = event['type']
        user_id = event['target_user_id']
        
        # Get notification preferences
        prefs = await get_user_notification_prefs(user_id)
        
        if not prefs.get(notification_type, {}).get('push_enabled', True):
            continue
        
        # Format notification
        title, body, data = format_notification(event)
        
        # Send push
        await push_service.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            data=data
        )
        
        # Store in database for in-app
        await store_notification(user_id, event)
```

## Phase 2: Scale & Performance (Weeks 5-8)

### 2.1 ClickHouse Analytics
**Real-time Analytics** - Fast queries on billions of events

### 2.2 Read Replicas & Sharding
**Database Scaling** - Multi-region read replicas, sharding strategy

### 2.3 CDN Integration
**Edge Delivery** - Cloudflare/CloudFront for media and API

### 2.4 Kubernetes Orchestration
**Container Orchestration** - Auto-scaling, health checks, rolling updates

## Phase 3: ML & Intelligence (Weeks 9-12)

### 3.1 Feed Ranking Model
**ML Pipeline** - User embeddings, content scoring, A/B testing

### 3.2 Content Moderation
**Safety Systems** - NSFW detection, toxicity filtering, spam prevention

### 3.3 Recommendation Engine
**Discovery** - Collaborative filtering for users, content, hashtags

## Phase 4: Monetization & Commerce (Weeks 13-16)

### 4.1 Payment Gateway
**Stripe/PayPal** - EGP support, InstaPay integration

### 4.2 Ad Auction System
**Real-time Bidding** - Targeting, pacing, ROI tracking

### 4.3 Creator Payouts
**Automated Payments** - Bulk payouts, tax reporting

## Phase 5: Mobile Native (Weeks 17-20)

### 5.1 React Native/Flutter App
**Cross-platform** - Offline-first, native performance

### 5.2 Native Camera SDK
**Media Capture** - Filters, effects, editing

## Implementation Priority Matrix

| Feature | Impact | Complexity | Priority |
|---------|--------|------------|----------|
| Search (OpenSearch) | High | Medium | P0 |
| Real-time (WebSocket) | High | Medium | P0 |
| Video Pipeline | High | High | P0 |
| Push Notifications | High | Low | P0 |
| ClickHouse Analytics | Medium | Medium | P1 |
| ML Feed Ranking | High | High | P1 |
| Content Moderation | High | High | P1 |
| CDN Integration | Medium | Low | P1 |
| Kubernetes | Medium | Medium | P2 |
| Payment Gateway | High | Medium | P2 |
| Mobile Native | High | High | P2 |

## Success Metrics

**Performance**:
- P95 API latency <100ms globally
- Search latency <200ms
- Video start time <2s
- 99.9% uptime

**Scale**:
- 100M+ registered users
- 1B+ posts
- 10B+ events/day in analytics
- 100K+ concurrent WebSocket connections

**Business**:
- 50%+ DAU/MAU ratio
- 20%+ creator monetization
- 80%+ user satisfaction
- 10%+ MoM growth

## Conclusion

This roadmap transforms DAIRA's production-ready foundation into a globally competitive platform. Phased implementation prioritizes critical infrastructure (search, real-time, video, push) while building toward advanced ML, monetization, and native mobile experiences.

**Next Action**: Begin Phase 1 implementation starting with OpenSearch integration.
