// No require needed for fetch in Node 22

async function checkBookData() {
  const base = "http://127.0.0.1:8000";
  try {
    const listRes = await fetch(`${base}/books/`);
    if (!listRes.ok) throw new Error("Failed to fetch book list");
    const books = await listRes.json();
    if (books.length === 0) {
      console.log("No books found in the library.");
      return;
    }
    
    // Check the first book
    const bookId = books[0].book_id;
    console.log(`Checking book ID: ${bookId}`);
    const detailRes = await fetch(`${base}/books/${bookId}`);
    if (!detailRes.ok) throw new Error("Failed to fetch book details");
    const detail = await detailRes.json();
    
    console.log("SUMMARY STRUCTURE:");
    console.log(JSON.stringify(detail.summary, null, 2));
    
    console.log("\nQA BANK STRUCTURE:");
    console.log(JSON.stringify(detail.qa_bank, null, 2));
    
    console.log("\nQUIZ STRUCTURE:");
    console.log(JSON.stringify(detail.quiz, null, 2));
    
  } catch (e) {
    console.error("Error:", e.message);
  }
}

checkBookData();
