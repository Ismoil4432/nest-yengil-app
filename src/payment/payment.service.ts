import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Payment } from './models/payment.model';
import { Student } from '../student/models/student.model';
import { EduCenterService } from '../edu_center/edu_center.service';
import { StudentService } from '../student/student.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private readonly paymentRepository: typeof Payment,
    private readonly studentService: StudentService,
    private readonly eduCenterService: EduCenterService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    try {
      const { student_id, edu_center_id } = createPaymentDto;
      await this.studentService.getOne(student_id);
      await this.eduCenterService.getOne(edu_center_id);
      const newPayment = await this.paymentRepository.create({
        id: await this.generateUniqueId(),
        ...createPaymentDto,
        status: 'not-payed',
      });
      return this.getOne(newPayment.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(edu_center_id: string) {
    try {
      if (!edu_center_id) {
        throw new HttpException('Edu Center not found', HttpStatus.NOT_FOUND);
      }
      await this.eduCenterService.getOne(edu_center_id);
      return this.paymentRepository.findAll({
        where: { edu_center_id },
        attributes: [
          'id',
          'price',
          'note',
          'status',
          'for_month',
          'date_payed',
        ],
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name'],
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      return this.getOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      await this.getOne(id);
      await this.paymentRepository.update(updatePaymentDto, { where: { id } });
      return this.getOne(id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      const payment = await this.getOne(id);
      await this.paymentRepository.destroy({ where: { id } });
      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getOne(id: string) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id },
        attributes: [
          'id',
          'price',
          'note',
          'status',
          'for_month',
          'date_payed',
        ],
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name'],
          },
        ],
      });
      if (!payment) {
        throw new HttpException('Payment not found', HttpStatus.NOT_FOUND);
      }
      return payment;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async generateId() {
    try {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const prefix =
        letters.charAt(Math.floor(Math.random() * letters.length)) +
        letters.charAt(Math.floor(Math.random() * letters.length)) +
        letters.charAt(Math.floor(Math.random() * letters.length));
      const suffix = Math.floor(Math.random() * 90000) + 10000;
      return prefix + suffix;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async generateUniqueId() {
    try {
      const allUniqueId = await this.paymentRepository.findAll({
        attributes: ['id'],
      });
      let id: any;
      while (true) {
        id = await this.generateId();
        if (!allUniqueId.includes(id)) {
          break;
        }
      }
      return id;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
