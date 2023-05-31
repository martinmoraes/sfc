require('dotenv').config();
const {
  getDailyTransactedTransactions,
} = require('../../../src/api/transaction/get_daily_transacted_transactions.service');
const { HttpResponseMock } = require('../mock/http_reponse.mock');
const { TransactionRepositoryMock } = require('../mock/transaction.repository.mock');

describe('Get Daily Transacted Transactions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validate untilDate parameter', () => {
    it('without untilDate parameter ', async () => {
      const untilDate = undefined;
      const result = await getDailyTransactedTransactions(
        HttpResponseMock,
        new TransactionRepositoryMock(),
        untilDate,
      );

      expect(result.statusCode).toEqual(200);
      const actualParameters = HttpResponseMock.ok.mock.calls[0][0];
      expect(actualParameters).toEqual(
        expect.objectContaining({
          '2023-05-10': {
            credit: 200.2,
            debit: 100.2,
            total: 100,
          },
          '2023-05-20': {
            credit: 100.2,
            debit: 50.2,
            total: 50,
          },
        }),
      );
    });

    it('untilDate parameter in ISO-8601 fromat', async () => {
      const untilDate = '2023-05-20T22:55:11.444Z';
      const result = await getDailyTransactedTransactions(
        HttpResponseMock,
        new TransactionRepositoryMock(),
        untilDate,
      );

      expect(result.statusCode).toEqual(200);
      const actualParameters = HttpResponseMock.ok.mock.calls[0][0];
      expect(actualParameters).toEqual(
        expect.objectContaining({
          '2023-05-10': {
            credit: 200.2,
            debit: 100.2,
            total: 100,
          },
          '2023-05-20': {
            credit: 100.2,
            debit: 50.2,
            total: 50,
          },
        }),
      );
    });

    it('invalid untilDate parameter ', async () => {
      const day = '12-12-12';
      const result = await getDailyTransactedTransactions(
        HttpResponseMock,
        new TransactionRepositoryMock(),
        day,
      );

      expect(result.statusCode).toEqual(403);
      const actualParameters = HttpResponseMock.invalidFormat.mock.calls[0][0];
      expect(actualParameters).toEqual(
        expect.objectContaining({
          until: [
            {
              message: 'The until must be a valid ISO-8601 date.',
              rule: 'dateiso',
            },
          ],
        }),
      );
    });
  });

  describe('exception generated', () => {
    it('exception generated by findUntil', async () => {
      const transactionRepositoryMock = new TransactionRepositoryMock();
      const spyTransactionRepository = jest
        .spyOn(transactionRepositoryMock, 'findUntil')
        .mockImplementation(() => {
          throw new Error('Exceção gerada pelo mock');
        });

      const untilDate = '2023-05-20T22:55:11.444Z';
      const result = await getDailyTransactedTransactions(
        HttpResponseMock,
        transactionRepositoryMock,
        untilDate,
      );
      expect(result.statusCode).toEqual(500);
      const actualParameters = HttpResponseMock.internalError.mock.calls[0][0];
      expect(actualParameters).toEqual('Exceção gerada pelo mock');

      expect(spyTransactionRepository).toHaveBeenCalledWith(new Date(untilDate));
      expect(spyTransactionRepository).toThrow();
    });
  });
});
