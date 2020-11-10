import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);
const transactionsRouter = Router();

transactionsRouter.get('/', async (req, res) => {
  const repo = getCustomRepository(TransactionsRepository);

  const transactions = await repo.find();
  const balance = await repo.getBalance();

  return res.status(200).json({ transactions, balance });
});

transactionsRouter.post('/', async (req, res) => {
  const { type, value, title, category } = req.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    type,
    value,
    title,
    category
  });

  return res.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  await new DeleteTransactionService().execute(req.params.id);

  return res.status(200).json();
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const transactions = await new ImportTransactionsService().execute(req.file.path);

  return res.status(200).json(transactions);
});

export default transactionsRouter;
