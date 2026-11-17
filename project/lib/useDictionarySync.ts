import { useCallback, useState } from 'react';
import { supabase } from './supabase';
import type { DictionaryEntry } from './supabase';
import { bulkInsert, countEntries, getMeta, setMeta } from './offline-db';

const SYNC_KEY = 'dictionary_synced';

export type SyncState = 'idle' | 'downloading' | 'done' | 'error';

export function useDictionarySync() {
  const [state, setState] = useState<SyncState>('idle');
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkSynced = useCallback(async () => {
    try {
      const flagged = await getMeta<boolean>(SYNC_KEY);
      if (flagged) {
        const count = await countEntries();
        if (count > 0) return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const download = useCallback(async () => {
    setState('downloading');
    setError(null);
    setProgress(0);
    setLoaded(0);

    try {
      const { count: totalCount, error: countErr } = await supabase
        .from('dictionary')
        .select('*', { count: 'exact', head: true });

      if (countErr) throw countErr;
      const totalRows = totalCount ?? 0;
      setTotal(totalRows);

      const pageSize = 100;
      let offset = 0;
      let all: DictionaryEntry[] = [];

      while (offset < totalRows) {
        const { data, error: fetchErr } = await supabase
          .from('dictionary')
          .select('*')
          .range(offset, offset + pageSize - 1);

        if (fetchErr) throw fetchErr;
        if (!data || data.length === 0) break;

        all = all.concat(data as DictionaryEntry[]);
        offset += pageSize;
        setLoaded(all.length);
        setProgress(Math.round((all.length / totalRows) * 100));
      }

      await bulkInsert(all);
      await setMeta(SYNC_KEY, true);
      setState('done');
      setProgress(100);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Download failed';
      setError(message);
      setState('error');
    }
  }, []);

  return { state, progress, total, loaded, error, download, checkSynced };
}
