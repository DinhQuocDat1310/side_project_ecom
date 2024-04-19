import { SocketService } from './socket.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/guard/wsJwt.guard';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(+process.env.PORT_SOCKET, {
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);
  constructor(private readonly socketService: SocketService) {}

  @WebSocketServer()
  server: Server;

  handleDisconnect(client: Socket) {
    client.rooms.forEach((room: string) => {
      this.logger.debug('Socket ID: ' + room + ' disconnected to server'); // Log each element of the Set
    });
  }

  handleConnection(client: Socket) {
    client.rooms.forEach((room: string) => {
      this.logger.debug('Socket ID: ' + room + ' connected to server'); // Log each element of the Set
    });
    console.log(
      'Authenticated user connected:',
      client.handshake.headers.authorization,
    );
  }

  @SubscribeMessage('client_send_message')
  handleMessageEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: string,
  ) {
    this.server.emit('sever_bind_message', body);
  }
}
