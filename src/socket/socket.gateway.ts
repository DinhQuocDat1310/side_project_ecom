import { SocketService } from './socket.service';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { verify } from 'jsonwebtoken';
import { ChatService } from 'src/chat/chat.service';
import { Conversation } from '@prisma/client';

@WebSocketGateway(+process.env.PORT_SOCKET, {
  cors: {
    origin: '*',
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SocketGateway.name);
  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  afterInit() {
    this.logger.log('Websocket Gateway initialized');
  }

  handleConnection = async (client: Socket) => {
    client.rooms.forEach((room: string) => {
      this.logger.debug('Socket ID: ' + room + ' connected to server'); // Log each element of the Set
    });
    this.logger.debug('Handling Authentication...');
    try {
      const jwtToken = client.handshake.headers.authorization;
      const decodeToken = verify(
        jwtToken,
        process.env.ACCESS_TOKEN_JWT_SECRET_KEY,
      );
      const user = await this.authService.getUserByEmailorPhonenumber(
        decodeToken['username'],
      );
      client['user'] = user;
      this.logger.debug(
        'Authenticated successfully for user: ' + user.username,
      );
      if (!user) {
        this.logger.error(
          new UnauthorizedException(
            'Socket ID: ' + client.id + ' unauthorized',
          ),
        );
        return this.disconnect(client);
      }
    } catch (error) {
      this.logger.error(
        new UnauthorizedException('Socket ID ' + client.id + ' unauthorized'),
      );
      return this.disconnect(client);
    }
    await this.handleConversation(client);
  };

  handleConversation = async (client: Socket) => {
    const conversation: Conversation =
      await this.chatService.getConversationByID(
        client.handshake.headers.conversationid.toString(),
      );
    if (conversation) return client.join(conversation.id);
  };

  handleDisconnect(client: Socket) {
    client.rooms.forEach((room: string) => {
      this.logger.error('Socket ID ' + room + ' disconnected to server'); // Log each element of the Set
    });
  }

  private disconnect(client: Socket): void {
    client.emit('Error', new UnauthorizedException());
    client.disconnect();
  }

  @SubscribeMessage('client_send_message')
  handleMessageEvent(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: any,
  ) {
    const user = client['user'];
    console.log(body);

    this.server
      .to(body.conversationID)
      .emit('sever_bind_message', body.message);
  }
}
