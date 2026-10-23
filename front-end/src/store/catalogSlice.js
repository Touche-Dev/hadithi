import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";

export const fetchCatalog = createAsyncThunk(
  "catalog/fetchCatalog",
  async (_, { rejectWithValue }) => {
    try {
      const [collections, books, authors, events] = await Promise.all([
        api.get("/api/collections"),
        api.get("/api/books"),
        api.get("/api/authors"),
        api.get("/api/events"),
      ]);
      return {
        collections: collections.data,
        books: books.data,
        authors: authors.data,
        events: events.data,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || err.message || "Erreur réseau"
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { status } = getState().catalog;
      return status !== "loading" && status !== "succeeded";
    },
  }
);

const catalogSlice = createSlice({
  name: "catalog",
  initialState: {
    collections: [],
    books: [],
    authors: [],
    events: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCatalog.fulfilled, (state, { payload }) => {
        state.status = "succeeded";
        state.collections = payload.collections;
        state.books = payload.books;
        state.authors = payload.authors;
        state.events = payload.events;
      })
      .addCase(fetchCatalog.rejected, (state, { payload, error }) => {
        state.status = "failed";
        state.error = payload || error.message;
      });
  },
});

export default catalogSlice.reducer;