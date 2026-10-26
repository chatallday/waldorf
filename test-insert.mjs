const apiKey = "teable_accGh7t9Be8Od7lZfs3_1YdEP9dMHBuyK+vbexzVG6ucZ3pCkiqCLrFeKKsWaIg=";
const tableId = "tblyGpv8b7UekbcTNdP";

const testRecord = {
  fields: {
    Name: "TEST_CLI_HUB_TOOL_" + Date.now(),
    Type: "Repository",
    Category: "TEST",
    Description: "Test insert",
    Keywords: "test, cli-anything",
    URL: "https://github.com/HKUDS/CLI-Anything",
    DataPayload: "pip install cli-anything-test"
  }
};

async function run() {
  const res = await fetch(`https://app.teable.ai/api/table/${tableId}/record`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ records: [testRecord] })
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text);
}
run();