const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));   

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'library_db'
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // ที่อยู่ที่บันทึกไฟล์
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ชื่อไฟล์ที่ไม่ซ้ำกัน
    }
});

const upload = multer({ storage });

app.post('/api/books', upload.single('image'), (req, res) => {
    const { title, author } = req.body;
    const imageUrl = req.file.path; // ได้ที่อยู่ไฟล์ที่อัปโหลด

    const query = 'INSERT INTO books (title, author, imageUrl) VALUES (?, ?, ?)';
    db.query(query, [title, author, imageUrl], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ id: results.insertId, title, author, imageUrl });
    });
});

const fs = require('fs');

app.delete('/api/books/:id', (req, res) => {
    const bookId = req.params.id;

    // ดึงข้อมูลหนังสือก่อนเพื่อตรวจสอบที่อยู่ไฟล์
    const selectQuery = 'SELECT imageUrl FROM books WHERE id = ?';
    db.query(selectQuery, [bookId], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const imageUrl = results[0].imageUrl;

        // ลบข้อมูลจากฐานข้อมูล
        const deleteQuery = 'DELETE FROM books WHERE id = ?';
        db.query(deleteQuery, [bookId], (error, results) => {
            if (error) {
                return res.status(500).json({ error: 'Database error' });
            }
            if (results.affectedRows === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            // ลบไฟล์ในโฟลเดอร์ uploads
            fs.unlink(imageUrl, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
                res.status(204).send(); // No content to send back
            });
        });
    });
});

app.put('/api/books/:id', upload.single('image'), (req, res) => {
    const { title, author } = req.body;
    const { id } = req.params;

    // ค้นหารูปภาพเก่าจากฐานข้อมูล
    const query = 'SELECT imageUrl FROM books WHERE id = ?';
    db.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error retrieving book' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const oldImageUrl = results[0].imageUrl;

        // ตรวจสอบว่ามีไฟล์รูปภาพใหม่ที่อัปโหลดมาหรือไม่
        let imageUrl = oldImageUrl; // ใช้ URL รูปภาพเดิมถ้าไม่มีการอัปโหลดใหม่
        if (req.file) {
            imageUrl = req.file.path; // อัปเดต URL รูปภาพถ้ามีการอัปโหลดใหม่

            // ลบไฟล์รูปภาพเก่า
            fs.unlink(path.join(__dirname, oldImageUrl), (err) => {
                if (err) {
                    console.error('Error deleting old image:', err);
                }
            });
        }

        // สร้าง query สำหรับอัปเดตข้อมูลหนังสือ
        const updateQuery = 'UPDATE books SET title = ?, author = ?, imageUrl = ? WHERE id = ?';
        db.query(updateQuery, [title, author, imageUrl, id], (updateError, updateResults) => {
            if (updateError) {
                return res.status(500).json({ error: 'Error updating book' });
            }

            if (updateResults.affectedRows === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            const borrowUpdateQuery = 'UPDATE borrowings SET book_image = ?, book_title = ?, author = ? WHERE id_book = ?';
            db.query(borrowUpdateQuery, [imageUrl, title, author, id], (borrowUpdateError, borrowUpdateResults) => {
                if (borrowUpdateError) {
                    return res.status(500).json({ error: 'Error updating borrowings' });
                }


                res.status(200).json({ message: 'Book updated successfully', title, author, imageUrl });
            });
        });
    });
});



app.get('/api/books', (req, res) => {
    const query = 'SELECT * FROM books';
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(results);
    });
});

app.post('/api/borrow', (req, res) => {
    const { name, idCard, contact, borrowDate, returnDate, bookId } = req.body;
    const bookQuery = 'SELECT title, imageUrl, author FROM books WHERE id = ?'; // เพิ่ม author
    db.query(bookQuery, [bookId], (error, bookResults) => {
        if (error) {
            console.error('Error fetching book details:', error);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (bookResults.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const { title: bookTitle, imageUrl: bookImage, author: bookAuthor } = bookResults[0];

        // Insert into borrowings table
        const query = 'INSERT INTO borrowings (book_image, book_title, author, borrower, contact, id_card, borrow_date, return_date, id_book) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(query, [bookImage, bookTitle, bookAuthor, name, contact, idCard, borrowDate, returnDate , bookId], (error, results) => {
            if (error) {
                console.error('Error saving borrowing record:', error);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Borrowing record created', id: results.insertId });
        });
    });
});

app.put('/api/borrowing-history/:id', (req, res) => {
    const { id } = req.params; 
    const { book_image, book_title, borrower, contact, borrow_date, return_date, author, id_card, id_book } = req.body;

    // สร้าง array เพื่อเก็บฟิลด์ที่ต้องการอัปเดต
    const updates = [];
    const values = [];

    // เช็คและเพิ่มฟิลด์ที่มีการเปลี่ยนแปลง
    if (book_image !== undefined) {
        updates.push('book_image = ?');
        values.push(book_image);
    }
    if (book_title !== undefined) {
        updates.push('book_title = ?');
        values.push(book_title);
    }
    if (borrower !== undefined) {
        updates.push('borrower = ?');
        values.push(borrower);
    }
    if (contact !== undefined) {
        updates.push('contact = ?');
        values.push(contact);
    }
    if (borrow_date !== undefined) {
        updates.push('borrow_date = ?');
        values.push(borrow_date);
    }
    if (return_date !== undefined) {
        updates.push('return_date = ?');
        values.push(return_date);
    }
    if (author !== undefined) {
        updates.push('author = ?');
        values.push(author);
    }
    if (id_card !== undefined) {
        updates.push('id_card = ?');
        values.push(id_card);
    }

    if (id_book !== undefined) {
        updates.push('id_book = ?');
        values.push(id_book);
    }

    // ตรวจสอบว่ามีฟิลด์ที่ต้องการอัปเดตหรือไม่
    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    // เพิ่ม id ลงใน values
    values.push(id);

    // สร้าง query
    const query = `UPDATE borrowings SET ${updates.join(', ')} WHERE id = ?`;

    // ทำการอัปเดตในฐานข้อมูล
    db.query(query, values, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.status(200).json({ message: 'Record updated successfully' });
    });
});


app.delete('/api/borrowing-history/:id', (req, res) => {
    const id = req.params.id;

    const query = 'DELETE FROM borrowings WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting borrowings history:', err);
            return res.status(500).json({ message: 'Failed to delete borrowing history' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Borrowing history not found' });
        }

        res.status(200).json({ message: 'Borrowing history deleted successfully' });
    });
});

app.get('/api/borrowing-history', (req, res) => {
    const query = `
        SELECT 
            bo.id, 
            bo.book_image, 
            bo.book_title, 
            bo.borrower, 
            bo.contact, 
            bo.borrow_date, 
            bo.return_date, 
            bo.author,
            bo.id_card 
        FROM 
            borrowings bo`;
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).send(error);
        }
        res.json(results); // ส่งข้อมูลเป็น JSON
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
