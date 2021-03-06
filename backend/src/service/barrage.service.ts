import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '../entity/admin';
import { AdminDto } from '../dto/admin.dto';
import { Room } from '../entity/room';
import { RoomTag } from '../entity/roomTag';
import { Barrage } from '../entity/barrage';
import { BarrageDto } from '../dto/barrage.dto';

@Injectable()
export class BarrageService {

  constructor(
    @InjectRepository(Barrage)
    private repository: Repository<Barrage>
  ) {
  }

  createBarrage(barrageDto:BarrageDto){
    if (barrageDto.content.length > 200){
      barrageDto.content = barrageDto.content.substr(0,200);
    }
    const barrage = new Barrage();
    const room = new Room();
    room.id = barrageDto.roomId
    barrage.room = room
    barrage.creator = barrageDto.creator.id?barrageDto.creator:null
    barrage.content = barrageDto.content
    this.repository.save(barrage)
  }

  async findBarrageByRoom(roomId): Promise<Barrage[]> {
    const list =  await this.repository.createQueryBuilder('barrage')
      .select([
        'barrage.id',
        'barrage.content',
        'creator.nickname',
        'barrage.createTime'
      ])
      .leftJoin('barrage.creator', 'creator')
      .leftJoin('barrage.room', 'room')
      .where('room.id = :id', { id: roomId })
      .take(10)
      .orderBy("barrage.id","DESC")
      .getMany();
    list.forEach((barrage)=>{
      barrage.sender = barrage.creator?barrage.creator.nickname:'匿名游客'
      console.log(barrage.createTime)
    })
    return list
  }

}
