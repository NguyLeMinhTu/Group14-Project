import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../lib/api';
import { setAuthFromLocalStorage, clearAuth } from '../lib/api';

export const fetchProfile = createAsyncThunk('auth/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/profile');
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/auth/login', { email, password });
    const token = res.data?.token;
    if (!token) throw new Error('No token received');
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return token;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const signup = createAsyncThunk('auth/signup', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    const res = await axios.post('/auth/signup', { name, email, password });
    const token = res.data?.token;
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return { token, user: res.data?.user || null };
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await axios.post('/auth/logout');
  } catch (err) {
    // ignore server errors on logout
  }
  clearAuth();
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    setTokenFromStorage(state) {
      setAuthFromLocalStorage();
      state.token = localStorage.getItem('token') || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload || null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.error?.message;
        state.token = null;
        state.user = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.error = action.payload?.message || action.error?.message;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.token = action.payload.token || state.token;
        state.user = action.payload.user || state.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.status = 'idle';
      });
  },
});

export const { setTokenFromStorage } = authSlice.actions;
export default authSlice.reducer;
