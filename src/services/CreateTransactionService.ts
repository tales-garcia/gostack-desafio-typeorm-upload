import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface TransactionDTO {
  type: 'income' | 'outcome',
  title: string,
  value: number,
  category: string
}

class CreateTransactionService {
  public async execute({ type, value, title, category }: TransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let transactionsCategory = await categoryRepository.findOne({
      where: {
        title: category
      }
    });

    if(!transactionsCategory) {
      transactionsCategory = await categoryRepository.save({
        title: category
      });
    }

    if(type === 'outcome' && value > (await transactionsRepository.getBalance()).total) {
      throw new AppError('Invalid balance', 400);
    }

    const transaction = await transactionsRepository.save({ type, value, title, category: transactionsCategory});

    return transaction;
  }
}

export default CreateTransactionService;
