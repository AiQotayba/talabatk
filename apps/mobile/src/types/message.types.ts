export type MessageType = 'text' | 'audio' | 'image' | 'system';

export interface Message {
  id: string;
  order_id: string;
  from_user: string;
  to_user?: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  attachments?: string[];
  created_at: string;
  from_user_data?: {
    id: string;
    name: string;
    profile_photo_url?: string;
  };
}

export interface SendMessageRequest {
  order_id: string;
  content: string;
  message_type?: MessageType;
  attachments?: string[];
}


