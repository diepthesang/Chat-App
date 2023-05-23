export interface MessageInterface {
  text: string;
  senderId: string;
  receiverId: string;
  isGroup?: string;
}

export type Message = {
  senderId: string;
  receiverId: string;
  firstName: string;
  lastName: string;
  avtImg?: string;
  text: string;
  createdAt: string;
};
