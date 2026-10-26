export default async function handler(req, res) {
  try {
    const apiKey = process.env.TEABLE_API_KEY || '';

    if (!apiKey) {
      console.error('[teable-proxy] TEABLE_API_KEY environment variable is not set.');
      return res.status(500).json({ error: 'Server configuration error: TEABLE_API_KEY missing.' });
    }

    // req.url looks like "/api/teable-proxy?path=table/tblxxx/record&otherParam=val"
    const requestUrl = new URL(req.url, 'http://localhost');
    const path = requestUrl.searchParams.get('path') || '';

    if (!path) {
      return res.status(400).json({ error: 'Missing required "path" query parameter.' });
    }

    // Create target URL — correct Teable production domain is app.teable.io
    const targetUrl = new URL(`https://app.teable.io/api/${path}`);

    // Forward all other search params (like query filters, pagination)
    requestUrl.searchParams.forEach((value, key) => {
      if (key !== 'path') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    const fetchOptions = {
      method: req.method,
      headers: headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`[teable-proxy] ${req.method} → ${targetUrl.toString()}`);

    const response = await fetch(targetUrl.toString(), fetchOptions);

    const contentType = response.headers.get('content-type') || 'application/json';

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[teable-proxy] Teable error (${response.status}) for path "${path}": ${errText}`);
      res.setHeader('Content-Type', 'application/json');
      return res.status(response.status).send(errText);
    }

    const text = await response.text();
    res.setHeader('Content-Type', contentType);
    res.status(response.status).send(text);

  } catch (error) {
    console.error('[teable-proxy] Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
}
