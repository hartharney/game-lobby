import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  findAll() {
    return this.userModel.find().exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  remove(id: number) {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async recordWin(userId: string, points: number = 10) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('user data before win', user);

    // Update streak and longest streak
    user.streak += 1;
    if (user.streak > user.longestWinStreak) {
      user.longestWinStreak = user.streak;
    }

    // Add win history
    user.winHistory.push({
      date: new Date(),
      score: points,
    });

    // Update total games played
    user.totalGamesPlayed += 1;

    await user.save();

    console.log('user data after win', user);
  }

  async recordLoss(userId: string) {
    const user = await this.userModel.findById(userId);

    console.log('user data before loss', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Reset streak
    user.streak = 0;

    // Update total games played
    user.totalGamesPlayed += 1;

    await user.save();
    console.log('user data after loss', user);
  }

  async getUser(id: string) {
    return this.userModel.findById(id).lean();
  }
}
