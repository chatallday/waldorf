
import 'dotenv/config';

const TEABLE_API_URL = "https://app.teable.io/api";
const TEABLE_API_KEY = process.env.TEABLE_API_KEY;
const MENTORS_TABLE_ID = "tbl3Mh9jie3SBHObgwO";

async function fetchIds() {
  const response = await fetch(`${TEABLE_API_URL}/table/${MENTORS_TABLE_ID}/record`, {
    headers: {
      'Authorization': `Bearer ${TEABLE_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error(`Error: ${error}`);
    return;
  }
  
  const data: any = await response.json();
  console.log("MENTOR RECORDS:");
  data.records.forEach((r: any) => {
    console.log(`${r.fields.Name}: ${r.id}`);
  });
}

fetchIds();
