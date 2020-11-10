import Transaction from '../models/Transaction';
import csvParser from 'csv-parse';
import fs from 'fs';
import AppError from '../errors/AppError';
import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface TransactionDTO {
  type: 'income' | 'outcome',
  title: string,
  value: number,
  category: string
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const readStream = fs.createReadStream(filePath);

    const parsers = csvParser({
      from_line: 2
    });

    const transactions : TransactionDTO[] = [];
    const categories : string[] = [];

    const parseCsv = readStream.pipe(parsers);

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) => cell.trim());

      if(!title || !type || !value || !category) {
        throw new AppError('Invalid CSV file')
      }

      categories.push(category);
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parseCsv.on('end', resolve));

    const existentCategories = await categoryRepository.find({
      where: {
        title: In(categories)
      }
    });

    const existentCategoriesTitles = existentCategories.map(category => category.title);

    const nonExistentCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = await categoryRepository.save(
      nonExistentCategoriesTitles.map(category => { return { title: category } })
    );

    const finalCategories = [...newCategories, ...existentCategories];

    const newTransactions = await transactionsRepository.save(
      transactions.map(transaction => {
        return {
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
          category: finalCategories.find(category => category.title === transaction.category)
        }
      })
    );

    await fs.promises.unlink(filePath);

    return newTransactions;
  }
}

export default ImportTransactionsService;
