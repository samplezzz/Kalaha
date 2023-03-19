import { InjectionToken } from '@angular/core';

import { Client } from 'stompjs';

export const WEB_SOCKET_CLIENT_FACTORY = new InjectionToken<any>('Web Socket client factory.');

export type WebSocketInitializer = () => Client;
