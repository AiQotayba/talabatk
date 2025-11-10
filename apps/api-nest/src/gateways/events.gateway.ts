import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join_order_room')
  handleJoinOrderRoom(@MessageBody() data: { orderId: string }) {
    // Join order-specific room
    return { event: 'joined_room', data: { orderId: data.orderId } };
  }

  @SubscribeMessage('leave_order_room')
  handleLeaveOrderRoom(@MessageBody() data: { orderId: string }) {
    // Leave order-specific room
    return { event: 'left_room', data: { orderId: data.orderId } };
  }
}
