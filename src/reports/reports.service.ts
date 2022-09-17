import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
    constructor(@InjectRepository(Report) private repo: Repository<Report>) { }

    findOne(id: number) {
        if (!id) {
            return null;
        }
        return this.repo.findOne({ where: { id } });
    }

    create(reportDto: CreateReportDto, user: User) {
        const report = this.repo.create(reportDto);
        report.user = user;
        return this.repo.save(report);
    }

    async changeApproval(id: number, approved: boolean) {
        const report = await this.findOne(id);
        if (!report) {
            throw new NotFoundException('Report not found.')
        }

        report.approved = approved;

        return this.repo.save(report);
    }

    createEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
        console.log(make,model,lng,lat,year,mileage);
        return this.repo.createQueryBuilder()
            .select('AVG(price)', 'price')
            .where('make = :make', { make })
            .andWhere('model = :model', { model })
            .andWhere('lng - :lng between -50 and 50', { lng })
            .andWhere('lat - :lat between -50 and 50', { lat })
            .andWhere('year - :year between -3 and 3', { year })
            .andWhere('approved is true')
            .orderBy('ABS(mileage - :mileage)', 'DESC')
            .setParameters({ mileage })
            .groupBy('mileage')
            .limit(3)
            .getRawOne();
    }
}
