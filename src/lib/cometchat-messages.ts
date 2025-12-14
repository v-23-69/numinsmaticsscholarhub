import { CometChat } from "@cometchat/chat-sdk-javascript";

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  sentAt: number;
  deliveredAt?: number;
  readAt?: number;
  type: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

// Convert CometChat message to our format
export const convertCometChatMessage = (message: any): ChatMessage => {
  // Handle both SDK objects (with methods) and plain objects
  const getId = () => {
    if (typeof message.getId === 'function') return message.getId();
    return message.id;
  };

  const getText = () => {
    if (typeof message.getText === 'function') return message.getText();
    return message.text || '';
  };

  const getSenderId = () => {
    if (message.sender) {
      if (typeof message.sender.getUid === 'function') return message.sender.getUid();
      return message.sender.uid;
    }
    if (typeof message.getSender === 'function') {
      const sender = message.getSender();
      if (sender) {
        if (typeof sender.getUid === 'function') return sender.getUid();
        return sender.uid;
      }
    }
    return '';
  };

  const getReceiverId = () => {
    if (typeof message.getReceiverId === 'function') return message.getReceiverId();
    return message.receiverId || '';
  };

  const getSentAt = () => {
    if (typeof message.getSentAt === 'function') return message.getSentAt() * 1000; // Convert to milliseconds
    return message.sentAt || Date.now();
  };

  return {
    id: getId(),
    text: getText(),
    senderId: getSenderId(),
    receiverId: getReceiverId(),
    sentAt: getSentAt(),
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
    type: 'text',
    attachmentUrl: undefined,
  };
};

// Send a text message
export const sendTextMessage = async (receiverId: string, text: string): Promise<ChatMessage> => {
  try {
    const textMessage = new CometChat.TextMessage(
      receiverId,
      text,
      CometChat.RECEIVER_TYPE.USER
    );

    const sentMessage = await CometChat.sendMessage(textMessage);
    return convertCometChatMessage(sentMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Fetch previous messages
export const fetchMessages = async (userId: string, limit: number = 50): Promise<ChatMessage[]> => {
  try {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(userId)
      .setLimit(limit)
      .build();

    const messages = await messagesRequest.fetchPrevious();
    return messages.map(convertCometChatMessage);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
};

// Create message listener
export const createMessageListener = (
  listenerId: string,
  onMessageReceived: (message: ChatMessage) => void,
  onMessageEdited?: (message: ChatMessage) => void,
  onMessageDeleted?: (message: ChatMessage) => void
) => {
  const listener = new CometChat.MessageListener({
    onTextMessageReceived: (message: any) => {
      onMessageReceived(convertCometChatMessage(message));
    },
    onMediaMessageReceived: (message: any) => {
      onMessageReceived(convertCometChatMessage(message));
    },
    onCustomMessageReceived: (message: any) => {
      onMessageReceived(convertCometChatMessage(message));
    },
    onMessageEdited: (message: any) => {
      if (onMessageEdited) {
        onMessageEdited(convertCometChatMessage(message));
      }
    },
    onMessageDeleted: (message: any) => {
      if (onMessageDeleted) {
        onMessageDeleted(convertCometChatMessage(message));
      }
    },
  });

  CometChat.addMessageListener(listenerId, listener);

  return () => {
    CometChat.removeMessageListener(listenerId);
  };
};
