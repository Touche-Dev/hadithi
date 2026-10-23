import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import { store, mutate as mutateThunk } from "./store";
import type * as Api from "@/api/admin";
import type {
  AcademyRequest,
  AdminUser,
  Author,
  Book,
  BookClubMember,
  Collection,
  Contact,
  CrmEvent,
  EventRegistration,
  Manuscript,
  Stats,
} from "@/types";

export interface RootState {
  auth: { token: string | null; user: AdminUser | null };
  data: {
    status: "idle" | "loading" | "ready" | "error";
    error: string | null;
    contacts: Contact[];
    manuscripts: Manuscript[];
    bookClub: BookClubMember[];
    academy: AcademyRequest[];
    registrations: EventRegistration[];
    events: CrmEvent[];
    collections: Collection[];
    authors: Author[];
    books: Book[];
    stats: Stats | null;
  };
}

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/** Lance une mutation API puis rafraîchit le store. */
export function useMutate() {
  const dispatch = useAppDispatch();
  return <T,>(fn: (api: typeof Api) => Promise<T>): Promise<T> =>
    dispatch(mutateThunk(fn as never)).unwrap() as Promise<T>;
}

export function useContactMap() {
  const contacts = useAppSelector((s) => s.data.contacts);
  return new Map(contacts.map((c) => [c.id, c]));
}
