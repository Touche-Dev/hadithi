import { Routes, Route } from "react-router-dom";
import { RootLayout } from "@/layouts/RootLayout";
import { HomePage } from "@/pages/Home";
import { AboutPage } from "@/pages/About";
import { AuthorsPage } from "@/pages/Authors";
import { AuthorDetailPage } from "@/pages/AuthorDetail";
import { EventsPage } from "@/pages/Events";
import { EventDetailPage } from "@/pages/EventDetail";
import { BooksPage } from "@/pages/Books";
import { BookDetailPage } from "@/pages/BookDetail";
import { SubmitManuscriptPage } from "@/pages/SubmitManuscript";
import { NotFoundPage } from "@/components/site/NotFoundPage";
import { useDispatch } from "react-redux";
import { fetchCatalog } from "./store/catalogSlice";
import { useEffect } from "react";
import { store } from "./store/store";
import { useSelector } from "react-redux";


type AppDispatch = typeof store.dispatch;

function App() {

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCatalog());
  }, [dispatch]);

  //const catalog = useSelector((state: any) => state.catalog);
  //console.log(catalog);

  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/soumettre-un-manuscrit" element={<SubmitManuscriptPage />} />
        <Route path="/auteurs" element={<AuthorsPage />} />
        <Route path="/auteurs/:slug" element={<AuthorDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailPage />} />
        <Route path="/livres" element={<BooksPage />} />
        <Route path="/livres/:slug" element={<BookDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
