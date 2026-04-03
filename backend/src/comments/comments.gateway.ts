import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CommentsGateway {
  @WebSocketServer()
  server: Server;

  notifyNewComment(comment: unknown) {
    this.server.emit('newComment', comment);
  }
}
