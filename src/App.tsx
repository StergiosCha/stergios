import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './components/Theme';
import { LightboxProvider } from './components/Lightbox';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Books from './pages/Books';
import BookPage from './pages/BookPage';
import Texts from './pages/Texts';
import TextPage from './pages/TextPage';
import Reviews from './pages/Reviews';
import Events from './pages/Events';
import EventPage from './pages/EventPage';
import Press from './pages/Press';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

/** scroll to top on route change, or to the #hash target when there is one (events timeline anchors) */
function ScrollTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { el.scrollIntoView({ block: 'start' }); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <LightboxProvider>
            <ScrollTop />
            <Header />
            <main id="main" className="page" tabIndex={-1}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:slug" element={<BookPage />} />
                <Route path="/texts" element={<Texts />} />
                <Route path="/texts/:slug" element={<TextPage />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventPage />} />
                <Route path="/press" element={<Press />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                {/* old URLs from the previous static site (/texts/<slug>.html) match /texts/:slug; TextPage strips the .html */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </LightboxProvider>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}
