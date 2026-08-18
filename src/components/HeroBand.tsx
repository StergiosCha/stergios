import { Link } from 'react-router-dom';
import Pic from './Pic';
import { eventOf, heroItems } from '../data';
import { useLang } from '../i18n/LanguageContext';
import { altFor, eventTitle } from '../lib/alt';
import { fmtDate } from '../lib/format';

/** One wide atmospheric photo as a header band, lightly darkened, title set small. */
export default function HeroBand({ title, kicker }: { title: string; kicker?: string }) {
  const { lang, t } = useLang();
  const m = heroItems()[0];
  if (!m) return null;
  const ev = eventOf(m);
  return (
    <section className="band" aria-label={t.home.bandLabel}>
      <Pic item={m} alt={altFor(m, lang)} fit="cover" ratio={false} priority sizes="100vw" className="band__pic" />
      <div className="band__veil" aria-hidden="true" />
      <div className="wrap band__text">
        {kicker && <p className="band__kicker">{kicker}</p>}
        <h1 className="display band__title">{title}</h1>
        {ev && (
          <p className="band__cap">
            <Link to={`/events#${ev.id}`}>{eventTitle(ev)}</Link>{' · '}{[ev.venue, ev.city].filter(Boolean).join(', ')}{' · '}{fmtDate(ev.date, lang, ev.date_precision)}
            {m.credit && <span className="band__credit"> · {m.credit}</span>}
          </p>
        )}
      </div>
    </section>
  );
}
