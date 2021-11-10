import { Channel } from './channel';

export interface Notification {
  title: string;
  body: string;
  channel: Channel | null;
  data: unknown;
  createdTime: string;
  readTime: string | null;
}
