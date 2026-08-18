import { useEffect, useState } from 'react';
import { useLang } from '../i18n/LanguageContext';

/** Copies `text` to the clipboard; announces the result to screen readers. */
export default function CopyButton({ text, label }: { text: string; label?: string }) {
  const { t } = useLang();
  const [done, setDone] = useState<'idle' | 'ok' | 'fail'>('idle');
  useEffect(() => { if (done === 'idle') return; const id = setTimeout(() => setDone('idle'), 2000); return () => clearTimeout(id); }, [done]);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone('ok'); }
    catch { setDone('fail'); }
  };
  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={copy} aria-live="polite">
      {done === 'ok' ? t.press.copied : done === 'fail' ? t.press.copyFailed : (label ?? t.press.copy)}
    </button>
  );
}
