// seed.js — populates MongoDB with sample books, members, transactions, and admin user
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDB, mongoose } = require("./db");
const Book = require("./models/Book");
const Member = require("./models/Member");
const Transaction = require("./models/Transaction");
const User = require("./models/User");
const { LOAN_PERIOD_DAYS, FINE_PER_DAY } = require("./constants");

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function isoDaysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function seed() {
  await connectDB();
  console.log("Cleaning existing collections...");
  await Promise.all([
    Book.deleteMany({}),
    Member.deleteMany({}),
    Transaction.deleteMany({}),
    User.deleteMany({}),
  ]);

  // Seed default admin and user accounts
  const hashedPassword = await bcrypt.hash("password123", 10);
  await User.create([
    {
      name: "Sameer Sawan",
      email: "sawansameer31@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
    {
      name: "Admin User",
      email: "admin@library.com",
      password: hashedPassword,
      role: "admin",
    },
  ]);
  console.log("Seeded users (password: password123)");

  // Books
  const rawBooks = [
    ["CSE-001", "9780262033848", "Introduction to Algorithms", "Cormen, Leiserson, Rivest, Stein", "Computer Science", 2009, "MIT Press", 4],
    ["CSE-002", "9780132350884", "Clean Code", "Robert C. Martin", "Computer Science", 2008, "Prentice Hall", 3],
    ["CSE-003", "9780596007126", "Head First Design Patterns", "Freeman & Robson", "Computer Science", 2004, "O'Reilly", 2],
    ["CSE-004", "9780201633610", "Design Patterns", "Gamma, Helm, Johnson, Vlissides", "Computer Science", 1994, "Addison-Wesley", 2],
    ["MTH-001", "9780470458365", "Advanced Engineering Mathematics", "Erwin Kreyszig", "Mathematics", 2011, "Wiley", 5],
    ["MTH-002", "9780134763644", "Calculus: Early Transcendentals", "James Stewart", "Mathematics", 2015, "Cengage", 3],
    ["MTH-003", "9780821847685", "Linear Algebra Done Right", "Sheldon Axler", "Mathematics", 2015, "Springer", 2],
    ["PHY-001", "9780471758013", "Fundamentals of Physics", "Halliday, Resnick, Walker", "Physics", 2013, "Wiley", 4],
    ["PHY-002", "9780201021157", "Feynman Lectures on Physics Vol 1", "Richard Feynman", "Physics", 1964, "Addison-Wesley", 2],
    ["ECE-001", "9780073380575", "Microelectronic Circuits", "Sedra & Smith", "Electronics", 2014, "Oxford Univ. Press", 3],
    ["ECE-002", "9780132623465", "Digital Design", "M. Morris Mano", "Electronics", 2012, "Pearson", 3],
    ["MEC-001", "9780073398204", "Shigley's Mechanical Engineering Design", "Budynas & Nisbett", "Mechanical", 2014, "McGraw-Hill", 3],
    ["MEC-002", "9780471704092", "Fundamentals of Thermodynamics", "Borgnakke & Sonntag", "Mechanical", 2008, "Wiley", 2],
    ["CIV-001", "9780133486644", "Structural Analysis", "R.C. Hibbeler", "Civil", 2014, "Pearson", 3],
    ["CIV-002", "9780073401027", "Principles of Geotechnical Engineering", "Das & Sobhan", "Civil", 2013, "Cengage", 2],
    ["CHE-001", "9780078021510", "Chemical Reaction Engineering", "Octave Levenspiel", "Chemistry", 1998, "Wiley", 2],
    ["CHE-002", "9780321910417", "Organic Chemistry", "Paula Yurkanis Bruice", "Chemistry", 2013, "Pearson", 3],
    ["MGT-001", "9780134238184", "Principles of Management", "Robbins & Coulter", "Management", 2017, "Pearson", 4],
    ["MGT-002", "9781259097939", "Financial Management", "Prasanna Chandra", "Management", 2017, "McGraw-Hill", 3],
    ["LIT-001", "9780141439518", "Pride and Prejudice", "Jane Austen", "Literature", 1813, "Penguin Classics", 2],
    ["LIT-002", "9780743273565", "The Great Gatsby", "F. Scott Fitzgerald", "Literature", 1925, "Scribner", 2],
    ["LIT-003", "9780451524935", "1984", "George Orwell", "Literature", 1949, "Signet Classics", 3],
  ];

  const bookDocs = await Book.insertMany(
    rawBooks.map((b) => ({
      accession_no: b[0],
      isbn: b[1],
      title: b[2],
      author: b[3],
      genre: b[4],
      year: b[5],
      publisher: b[6],
      copies_total: b[7],
      copies_available: b[7],
    }))
  );

  // Members
  const rawMembers = [
    ["MANIT2201", "Student", "Aarav", "Sharma", "Computer Science", "aarav.sharma@stu.manit.ac.in", "9876500001"],
    ["MANIT2202", "Student", "Diya", "Patel", "Electronics", "diya.patel@stu.manit.ac.in", "9876500002"],
    ["MANIT2203", "Student", "Kabir", "Singh", "Mechanical", "kabir.singh@stu.manit.ac.in", "9876500003"],
    ["MANIT2204", "Student", "Ananya", "Verma", "Civil", "ananya.verma@stu.manit.ac.in", "9876500004"],
    ["MANIT2205", "Student", "Ishaan", "Gupta", "Computer Science", "ishaan.gupta@stu.manit.ac.in", "9876500005"],
    ["MANIT2206", "Student", "Myra", "Reddy", "Chemistry", "myra.reddy@stu.manit.ac.in", "9876500006"],
    ["MANITF01", "Faculty", "Rajesh", "Kulkarni", "Mathematics", "r.kulkarni@manit.ac.in", "9876511001"],
    ["MANITF02", "Faculty", "Sunita", "Rao", "Physics", "s.rao@manit.ac.in", "9876511002"],
    ["MANITF03", "Faculty", "Anil", "Mehta", "Management", "a.mehta@manit.ac.in", "9876511003"],
    ["MANITS01", "Staff", "Vikram", "Joshi", "Other", "v.joshi@manit.ac.in", "9876522001"],
  ];

  const memberDocs = await Member.insertMany(
    rawMembers.map((m) => ({
      member_code: m[0],
      type: m[1],
      first_name: m[2],
      last_name: m[3],
      department: m[4],
      email: m[5],
      phone: m[6],
    }))
  );

  // Transactions
  const scenarios = [
    [0, 0, 5, null],
    [1, 4, 3, null],
    [2, 9, 20, null],
    [3, 13, 18, null],
    [4, 1, 2, null],
    [5, 15, 4, null],
    [6, 6, 40, 26],
    [7, 2, 35, 21],
    [8, 17, 10, 5],
    [9, 20, 45, 30],
    [0, 8, 12, null],
    [2, 19, 60, 44],
  ];

  for (const [mIdx, bIdx, issuedAgo, returnedAgo] of scenarios) {
    const member = memberDocs[mIdx];
    const book = bookDocs[bIdx];
    const issueDate = isoDaysAgo(issuedAgo);
    const dueDate = isoDaysFromNow(LOAN_PERIOD_DAYS - issuedAgo);

    if (returnedAgo == null) {
      await Transaction.create({
        member_id: member._id,
        book_id: book._id,
        issue_date: issueDate,
        due_date: dueDate,
        return_date: null,
        status: "Issued",
        fine_amount: 0,
        fine_paid: false,
      });
      await Book.findByIdAndUpdate(book._id, { $inc: { copies_available: -1 } });
    } else {
      const returnDate = isoDaysAgo(returnedAgo);
      const overdueDays = Math.max(0, Math.round((new Date(dueDate) - new Date(returnDate)) / 86400000) * -1);
      const fine = overdueDays > 0 ? overdueDays * FINE_PER_DAY : 0;
      await Transaction.create({
        member_id: member._id,
        book_id: book._id,
        issue_date: issueDate,
        due_date: dueDate,
        return_date: returnDate,
        status: "Returned",
        fine_amount: fine,
        fine_paid: fine > 0 ? Math.random() > 0.5 : false,
      });
    }
  }

  console.log(`Seeded ${bookDocs.length} books, ${memberDocs.length} members, ${scenarios.length} transactions.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.connection.close();
  } catch (_) {}
  process.exit(1);
});
