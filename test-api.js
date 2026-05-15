import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:5132/api/Products/debug/my');
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body:", text.substring(0, 500));
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
