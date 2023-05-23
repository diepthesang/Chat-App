import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationEntity } from '../entity/conversation.entity';
import { Repository } from 'typeorm';
import { BaseService } from '../../../utils/base/base.service';

@Injectable()
export class ConversationService extends BaseService<ConversationEntity> {
  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepository: Repository<ConversationEntity>,
  ) {
    super(conversationRepository);
  }

  async createConversation() {
    const conversation = await this.createOne({});
    if (!conversation) throw new ForbiddenException();
    return conversation;
  }

  async getAllConversationByUserId(userId: string) {
    const queryStr = `select 
                        u.avt_img_path,
                        u.first_name,
                        u.last_name,
                        message.text, 
                        message.created_at,
                        message.conversation_id,
                        message.sender_id 
                        from 
                        (select m.conversation_id,
                        max(m.created_at) as last_message_created 
                        from chat_app_db.messages m 
                        where m.conversation_id = any (
                        select m.conversation_id 
                        from
                        chat_app_db.messages m 
                        where
                        m.sender_id = '${userId}')
                        group by m.conversation_id) as l 
                        inner join chat_app_db.messages message
                        on l.last_message_created = message.created_at
                        inner join chat_app_db.users u 
                        on message.sender_id = u.id
                        order by message.created_at desc
                        ;`;
    const allConversation = await this.conversationRepository.query(queryStr);
    if (!allConversation) throw new NotFoundException();
    return allConversation;
  }
}
