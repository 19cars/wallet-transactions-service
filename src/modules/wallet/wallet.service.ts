import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(dto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create({
      currency: dto.currency,
      status: dto.status,
      availableBalance: '0.0000',
    });

    return this.walletRepository.save(wallet);
  }

  async findAll(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async findById(walletId: string): Promise<Wallet | null> {
    return this.walletRepository.findOne({ where: { walletId } });
  }

  async updateBalance(walletId: string, newBalance: string): Promise<Wallet> {
    const wallet = await this.findById(walletId);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const balance = parseFloat(newBalance);
    if (balance < 0) {
      throw new BadRequestException('Wallet balance cannot be negative');
    }

    wallet.availableBalance = balance.toFixed(4);
    return this.walletRepository.save(wallet);
  }

  async validateCurrency(walletId: string, currency: string): Promise<void> {
    const wallet = await this.findById(walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.currency !== currency) {
      throw new BadRequestException('Currency mismatch with wallet');
    }
  }

  async validateActive(walletId: string): Promise<void> {
    const wallet = await this.findById(walletId);
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet is not active');
    }
  }
}
