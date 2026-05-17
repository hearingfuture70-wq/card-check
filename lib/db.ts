import { createClient } from "@libsql/client";

export const db = createClient({
  url: "libsql://your-actual-database-url.turso.io", 
  authToken: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzkwMjgwODUsImlkIjoiMDE5ZGI1N2ItNTgwMS03MjU5LTgzNjEtZmMzNzU0YTZkMjNjIiwicmlkIjoiYTQwZTExYWItNjdlZi00MmVjLThhNjQtYjRhZGViOWM3OWQ2In0.7qwwv9T709ylH2OAxMrEtS2-n0uh0gV-3HWvtaTR7j7byyHilNavZ0Ik5SOxCc0FyxQP1uAmqjQo8eedFtgqDQ", // Your incredibly long real token here
});
