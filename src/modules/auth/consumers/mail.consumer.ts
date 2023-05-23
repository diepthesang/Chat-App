import { MailerService } from "@nestjs-modules/mailer";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { EXP_OTP } from "src/utils/common/constant/auth.constants";
import { setTimeout } from "timers/promises";
import { UserService } from "src/modules/user/service/user.service";
import { statusEnum } from "../../user/entity/user.entity";

@Processor("send_email")
export class MailConsumer {
  constructor(
    private mailerService: MailerService,
    private readonly userService: UserService
  ) {
  }

  @Process("register_email")
  async registerMail(job: Job<any>) {
    return await this.mailerService.sendMail(job.data);
  }

  @Process("validate_otp")
  async validateOTP(job: Job<any>): Promise<any> {
    const result = await setTimeout(EXP_OTP, async () => {
      const user = await this.userService.findOneBy({ email: job.data.email });
      // const user = await this.userService.findUserByEmail(job.data.email);
      if (!user) return false;
      if (user.status === statusEnum.PENDING) {
        const deletedResult = await this.userService.hardDeleteOneBy({
          id: user.id
        });
        return deletedResult.affected;
      }
      return true;
    });
    await result();
  }
}
