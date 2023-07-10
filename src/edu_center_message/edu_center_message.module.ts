import { Module, forwardRef } from '@nestjs/common';
import { EduCenterMessageService } from './edu_center_message.service';
import { EduCenterMessageController } from './edu_center_message.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { EduCenterMessage } from './models/edu_center_message.model';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    SequelizeModule.forFeature([EduCenterMessage]),
    forwardRef(() => MessageModule),
  ],
  controllers: [EduCenterMessageController],
  providers: [EduCenterMessageService],
  exports: [EduCenterMessageService],
})
export class EduCenterMessageModule {}
