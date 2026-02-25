// 💸 Expense Tracking Redux Slice
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction } from '../../core/data/models';
import { storageService } from '../../core/data/storage';
import { generateId } from '../../core/common/utils';
import { startOfDay, endOfDay } from 'date-fns';

interface ExpenseState {
  transactions: Transaction[];
  loading: boolean;
  filter: 'all' | 'expense' | 'income';
}

const initialState: ExpenseState = {
  transactions: [],
  loading: false,
  filter: 'all',
};

// Async thunks
export const loadTransactions = createAsyncThunk(
  'expense/loadTransactions',
  async () => {
    const transactions = await storageService.getTransactions();
    return transactions || [];
  }
);

export const addTransaction = createAsyncThunk(
  'expense/addTransaction',
  async (transaction: Omit<Transaction, 'id' | 'createdAt'>, { getState }) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    const state = getState() as { expense: ExpenseState };
    const updatedTransactions = [newTransaction, ...state.expense.transactions];
    
    await storageService.saveTransactions(updatedTransactions);
    
    return newTransaction;
  }
);

export const deleteTransaction = createAsyncThunk(
  'expense/deleteTransaction',
  async (id: string, { getState }) => {
    const state = getState() as { expense: ExpenseState };
    const updatedTransactions = state.expense.transactions.filter(t => t.id !== id);
    
    await storageService.saveTransactions(updatedTransactions);
    
    return id;
  }
);

const expenseSlice = createSlice({
  name: 'expense',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<ExpenseState['filter']>) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTransactions.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.loading = false;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions = [action.payload, ...state.transactions];
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
      });
  },
});

export const { setFilter } = expenseSlice.actions;

// Selectors
export const selectTodayTransactions = (state: { expense: ExpenseState }) => {
  const today = new Date();
  const todayStart = startOfDay(today).getTime();
  const todayEnd = endOfDay(today).getTime();
  
  return state.expense.transactions.filter(t => {
    const transactionDate = new Date(t.date).getTime();
    return transactionDate >= todayStart && transactionDate <= todayEnd;
  });
};

export const selectTodayBalance = (state: { expense: ExpenseState }) => {
  const todayTransactions = selectTodayTransactions(state);
  return todayTransactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);
};

export default expenseSlice.reducer;
