import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../auth/decorators/current-user.decorator';
import { CalendarService } from './calendar.service';
import { AvailabilityQueryDto, CalendarRangeDto } from './dto/availability.dto';

@ApiTags('calendar')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calendar')
export class CalendarController {
  constructor(private calendar: CalendarService) {}

  @Get('availability')
  @ApiOperation({ summary: 'Disponibilidade de materiais entre duas datas (com conflitos)' })
  availability(@CurrentUser() u: AuthUser, @Query() dto: AvailabilityQueryDto) {
    return this.calendar.availabilityInRange({
      companyId: u.companyId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      excludeEventId: dto.excludeEventId,
    });
  }

  @Get('events')
  @ApiOperation({ summary: 'Eventos no intervalo (mensal/semanal)' })
  events(@CurrentUser() u: AuthUser, @Query() dto: CalendarRangeDto) {
    return this.calendar.eventsInRange(u.companyId, new Date(dto.start), new Date(dto.end));
  }
}
