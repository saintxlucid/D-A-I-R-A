import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { RealtimeService } from './realtime.service'

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'realtime',
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  constructor(private realtimeService: RealtimeService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, data: { roomId: string }) {
    this.realtimeService.joinRoom(data.roomId, client.id)
    client.join(data.roomId)
    client.to(data.roomId).emit('user-joined', { userId: client.id })
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, data: { roomId: string }) {
    this.realtimeService.leaveRoom(data.roomId, client.id)
    client.leave(data.roomId)
    client.to(data.roomId).emit('user-left', { userId: client.id })
  }

  @SubscribeMessage('send-message')
  handleSendMessage(client: Socket, data: { roomId: string; userId: string; content: string }) {
    this.server.to(data.roomId).emit('new-message', data)
  }

  @SubscribeMessage('typing')
  handleTyping(client: Socket, data: { roomId: string; userId: string; isTyping: boolean }) {
    client.to(data.roomId).emit('user-typing', { userId: data.userId, isTyping: data.isTyping })
  }

  @SubscribeMessage('presence')
  handlePresence(client: Socket, data: { roomId: string; status: string }) {
    client.to(data.roomId).emit('user-presence', { userId: client.id, status: data.status })
  }
}
