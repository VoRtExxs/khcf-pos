import { supabaseFetch } from './supabaseClient';

export async function syncLocalTransactions() {
  const localStr = typeof window !== 'undefined' ? localStorage.getItem("khcf_transactions") : null;
  if (!localStr) return { success: true, count: 0 };
  
  let txs: any[] = [];
  try {
    txs = JSON.parse(localStr);
  } catch (e) {
    console.error("Invalid JSON in khcf_transactions", e);
    return { success: false, count: 0 };
  }

  const unsynced = txs.filter((t: any) => !t.synced);
  if (unsynced.length === 0) return { success: true, count: 0 };

  let successCount = 0;

  for (const tx of unsynced) {
    try {
      // 1. Try secure idempotent RPC
      const { data: rpcData, error: rpcError } = await supabaseFetch('rpc/process_secure_sync_transaction', {
        method: 'POST',
        body: JSON.stringify({
          p_tx: {
            id: tx.id,
            volunteer_name: tx.volunteerName || tx.volunteerId,
            site_name: tx.siteName || 'المبنى الرئيسي',
            payment_method: tx.paymentMethod,
            visa_last4: tx.visaLast4,
            total: tx.total,
            extra_donation: tx.extraDonation || 0,
            date: tx.date,
            items: tx.items || []
          }
        })
      });

      if (!rpcError && rpcData?.success) {
        tx.synced = true;
        successCount++;
        continue;
      }

      // 2. Fallback to standard insert if RPC hasn't been migrated yet
      const { data: txData, error: txError } = await supabaseFetch('transactions', {
        method: 'POST',
        body: JSON.stringify({
          volunteer_name: tx.volunteerName || tx.volunteerId,
          site_name: tx.siteName || 'المبنى الرئيسي',
          payment_method: tx.paymentMethod,
          visa_last4: tx.visaLast4,
          total_amount: tx.total
        })
      });

      if (txError || !txData || txData.length === 0) {
        console.warn("Standard insert fallback notice for tx:", tx.id, txError);
        continue;
      }

      const insertedTxId = txData[0].id;

      // Resolve Item UUIDs
      const { data: dbItems } = await supabaseFetch('items?select=id,name');
      const nameToIdMap = new Map();
      if (dbItems) {
        dbItems.forEach((dbItem: any) => nameToIdMap.set(dbItem.name, dbItem.id));
      }

      const itemsPayload = (tx.items || []).map((item: any) => {
        let resolvedItemId = item.id;
        if (!String(resolvedItemId).includes('-') && nameToIdMap.has(item.name)) {
          resolvedItemId = nameToIdMap.get(item.name);
        }
        
        return {
          transaction_id: insertedTxId,
          item_id: resolvedItemId,
          quantity: item.qty || 1,
          price_at_time: item.price || 0
        };
      });

      const { error: itemsError } = await supabaseFetch('transaction_items', {
        method: 'POST',
        body: JSON.stringify(itemsPayload)
      });

      if (!itemsError) {
        tx.synced = true;
        successCount++;
      }
    } catch (err) {
      console.error("Error during transaction sync:", err);
    }
  }

  // 3. Storage Resilience & Buffer Pruning (Prevents QuotaExceededError)
  // If local transactions exceed 200, retain all unsynced + recent 100 synced transactions
  let optimizedTxs = txs;
  if (txs.length > 200) {
    const unsyncedList = txs.filter((t) => !t.synced);
    const syncedList = txs.filter((t) => t.synced).slice(0, 100);
    optimizedTxs = [...unsyncedList, ...syncedList];
  }

  try {
    localStorage.setItem("khcf_transactions", JSON.stringify(optimizedTxs));
  } catch (quotaErr) {
    console.warn("Storage quota warning. Purging older synced transactions to recover space...", quotaErr);
    try {
      const urgentClean = txs.filter((t) => !t.synced).slice(0, 50);
      localStorage.setItem("khcf_transactions", JSON.stringify(urgentClean));
    } catch (_) {}
  }

  return { success: true, count: successCount };
}
