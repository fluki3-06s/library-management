import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const AddBookForm = () => {
  const [newBook, setNewBook] = useState({ title: '', author: '', image: null });
  const [books, setBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(''); // State สำหรับเก็บชื่อไฟล์

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถดึงข้อมูลหนังสือได้!',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewBook({ ...newBook, image: file });
    setFileName(file ? file.name : ''); // อัปเดตชื่อไฟล์ที่เลือก
  };

  const handleNewBookSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append('title', newBook.title);
    formData.append('author', newBook.author);
    formData.append('image', newBook.image);

    try {
      const response = await axios.post('http://localhost:5000/api/books', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewBook({ title: '', author: '', image: null });
      setFileName(''); // รีเซ็ตชื่อไฟล์
      fetchBooks();
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มหนังสือสำเร็จ',
        text: 'หนังสือใหม่ถูกเพิ่มแล้ว!',
      });
    } catch (error) {
      console.error('Error adding book:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเพิ่มหนังสือได้!',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBook = (id) => {
    setSelectedBooks((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((bookId) => bookId !== id)
        : [...prevSelected, id]
    );
  };

  const handleDeleteSelectedBooks = async () => {
    if (selectedBooks.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่ได้เลือกหนังสือ',
        text: 'กรุณาเลือกหนังสือที่ต้องการลบก่อน!',
      });
      return;
    }

    const confirmDelete = await Swal.fire({
      title: 'คุณแน่ใจไหม?',
      text: `คุณต้องการลบหนังสือจำนวน ${selectedBooks.length} เล่มหรือไม่!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบ!',
    });

    if (confirmDelete.isConfirmed) {
      try {
        await Promise.all(
          selectedBooks.map((id) => axios.delete(`http://localhost:5000/api/books/${id}`))
        );
        setSelectedBooks([]);
        fetchBooks();
        Swal.fire({
          icon: 'success',
          title: 'ลบหนังสือสำเร็จ',
          text: 'หนังสือถูกลบเรียบร้อย!',
        });
      } catch (error) {
        console.error('Error deleting books:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบหนังสือได้!',
        });
      }
    }
};


  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row md:justify-between">
      <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-4 md:mb-0">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4 text-center">เพิ่มหนังสือใหม่</h2>
            <form onSubmit={handleNewBookSubmit} className="flex flex-col">
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">ชื่อหนังสือ</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newBook.title}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="ตัวอย่าง: Harry Potter"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="label">
                  <span className="label-text">ผู้เขียน</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={newBook.author}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  placeholder="ตัวอย่าง: J.K. Rowling"
                  required
                />
              </div>
              <div className="mb-4 relative">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="input input-bordered w-full opacity-0 absolute"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="btn btn-outline w-full cursor-pointer">
                  เลือกรูปภาพ
                </label>
                {fileName && (
                  <p className="mt-2 text-sm text-gray-600">ไฟล์ที่เลือก: {fileName}</p> // แสดงชื่อไฟล์ที่เลือก
                )}
              </div>
              <div className="flex justify-between mt-4">
                <button type="submit" className="btn btn-outline btn-active" disabled={loading}>
                  เพิ่มหนังสือ
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setNewBook({ title: '', author: '', image: null })}>
                  รีเซ็ต
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Book List */}
      <div className="w-full md:w-1/2 pl-0 md:pl-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="text-2xl font-bold mb-4 text-center">รายชื่อหนังสือ</h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {books.length > 0 ? (
                books.map((book) => (
                  <div key={book.id} className="w-36 flex-shrink-0">
                    <div
                      className={`card w-full bg-base-100 shadow-xl cursor-pointer transition-all ${
                        selectedBooks.includes(book.id) ? 'ring ring-neutral-500' : ''
                      }`}
                      onClick={() => handleSelectBook(book.id)}
                    >
                      <figure className="px-4 pt-4">
                        {book.imageUrl ? (
                          <img
                            src={`http://localhost:5000/${book.imageUrl}`} // ใช้ book.imageUrl ในการแสดงรูปภาพ
                            alt={book.title}
                            className="w-full h-32 object-cover"
                          />
                        ) : (
                          <div className="bg-gray-300 w-full h-32 flex items-center justify-center text-gray-600 text-sm">
                            150 x 200
                          </div>
                        )}
                      </figure>
                      <div className="card-body p-4 items-center text-center">
                        <h2 className="card-title text-sm">{book.title}</h2>
                        <p className="text-xs text-gray-500">{book.author}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>ไม่มีข้อมูลหนังสือ</p>
              )}
            </div>

            <button
              className="btn btn-outline btn-error mt-4"
              onClick={handleDeleteSelectedBooks}
              disabled={selectedBooks.length === 0}
            >
              ลบหนังสือที่เลือก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBookForm;
