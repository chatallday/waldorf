
export interface TeableRecord {
  id: string;
  fields: Record<string, any>;
}

const TEABLE_API_URL = "/api/teable";

function getHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

export async function fetchTeableRecord(tableId: string, recordId: string): Promise<TeableRecord> {
  const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record/${recordId}`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error(`Failed to fetch record from Teable: ${response.statusText}`);
  return response.json();
}

export async function fetchTeableRecords(tableId: string): Promise<TeableRecord[]> {
  const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error(`Failed to fetch records from Teable: ${response.statusText}`);
  const data = await response.json();
  return data.records;
}

export async function fetchAllTeableRecords(tableId: string, pageSize: number = 1000): Promise<TeableRecord[]> {
  const all: TeableRecord[] = [];
  let skip = 0;
  for (;;) {
    const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record?take=${pageSize}&skip=${skip}`, {
      headers: getHeaders()
    });
    if (!response.ok) throw new Error(`Failed to fetch records from Teable: ${response.statusText}`);
    const data = await response.json();
    all.push(...data.records);
    if (data.records.length < pageSize) break;
    skip += data.records.length;
  }
  return all;
}

export async function updateTeableRecord(tableId: string, recordId: string, fields: Record<string, any>): Promise<TeableRecord> {
  const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record/${recordId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ record: { fields } })
  });
  if (!response.ok) {
    let errDetail = response.statusText;
    try {
      const errJson = await response.json();
      if (errJson && errJson.message) {
        errDetail = errJson.message;
      } else if (errJson && errJson.error) {
        errDetail = errJson.error;
      }
    } catch (_) {
      try {
        const errText = await response.text();
        if (errText) errDetail = errText;
      } catch (__) {}
    }
    throw new Error(`Failed to update record in Teable (${response.status}): ${errDetail}`);
  }
  return response.json();
}

export async function createTeableRecord(tableId: string, fields: Record<string, any>): Promise<TeableRecord> {
  const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      records: [{ fields }],
      typecast: true
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create record in Teable (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.records[0];
}

export async function fetchRhythms(tableId: string, season: string): Promise<any[]> {
  const response = await fetch(`${TEABLE_API_URL}/table/${tableId}/record`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error(`Failed to fetch rhythms: ${response.statusText}`);
  const data = await response.json();
  return data.records.filter((r: any) => r.fields && r.fields.Season === season);
}
