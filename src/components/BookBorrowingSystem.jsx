import React, { useState, useEffect } from 'react';
import axios from 'axios'; // นำเข้า axios
import Swal from 'sweetalert2'; // นำเข้า sweetalert2
import { InputField } from './InputField';
import { BookSelection } from './BookSelection';
import { SubmittedData } from './SubmittedData';

const BookBorrowingSystem = () => {
  const [name, setName] = useState('');
  const [idCard, setIdCard] = useState(''); // เลขบัตรประจำตัวประชาชน
  const [phone, setPhone] = useState(''); // เบอร์โทร
  const [borrowDate, setBorrowDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [books, setBooks] = useState([]); // State สำหรับหนังสือ

  // ฟังก์ชันดึงข้อมูลหนังสือจาก API
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/books'); // URL ของ API
      setBooks(response.data); // กำหนดข้อมูลหนังสือที่ได้จาก API
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // เรียกฟังก์ชัน fetchBooks เมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async () => {
    // ตรวจสอบว่าข้อมูลครบถ้วน
      if (!name || !idCard || !phone || !borrowDate || !returnDate || !selectedBook) {
          Swal.fire({
              icon: 'error',
              title: 'ข้อมูลไม่ครบถ้วน',
              text: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
          });
          return;
      }

      // ตรวจสอบความยาวของเลขบัตรประจำตัวประชาชน
      if (idCard.length !== 13) {
          Swal.fire({
              icon: 'error',
              title: 'เลขบัตรไม่ถูกต้อง',
              text: 'เลขบัตรประจำตัวประชาชนต้องมี 13 หลัก!',
          });
          return;
      }

      // ตรวจสอบความยาวของเบอร์โทร
      if (phone.length !== 10) {
          Swal.fire({
              icon: 'error',
              title: 'เบอร์โทรไม่ถูกต้อง',
              text: 'เบอร์โทรต้องมี 10 หลัก!',
          });
          return;
      }

      const data = {
          name,
          idCard,
          contact: phone,
          borrowDate,
          returnDate,
          bookId: selectedBook, // ส่ง bookId เพื่อนำไปค้นหาข้อมูลใน API
      };

      try {
          const response = await axios.post('http://localhost:5000/api/borrow', data);
          setSubmittedData({ name, idCard, contact: phone, borrowDate, returnDate, book: books.find(book => book.id === selectedBook) });
          Swal.fire({
              icon: 'success',
              title: 'บันทึกข้อมูลสำเร็จ',
              text: 'ข้อมูลการยืมหนังสือถูกบันทึกเรียบร้อย!',
          });

          // รีเซ็ตค่าฟอร์มหลังจากบันทึกสำเร็จ
          setName('');
          setIdCard('');
          setPhone('');
          setBorrowDate('');
          setReturnDate('');
          setSelectedBook(null);
          
      } catch (error) {
          console.error('Error saving data:', error);
      }
  };

  // ตรวจสอบความยาวของ input ก่อนที่จะเปลี่ยนค่าใน state
  const handleIdCardChange = (e) => {
    const value = e.target.value;
    if (value.length <= 13) {
      setIdCard(value); // อัพเดตค่าเมื่อไม่เกิน 13 หลัก
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setPhone(value); // อัพเดตค่าเมื่อไม่เกิน 10 หลัก
    }
  };

  // ใช้ useEffect เพื่อซ่อนข้อมูลหลังจากแสดงผล 3 วินาที
  useEffect(() => {
    if (submittedData) {
      const timer = setTimeout(() => {
        setSubmittedData(null);
      }, 3000); // ซ่อนหลังจาก 3 วินาที
      return () => clearTimeout(timer); // ล้าง timer เมื่อคอมโพเนนต์ถูก unmount
    }
  }, [submittedData]);

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center">ระบบจัดเก็บข้อมูลการยืมหนังสือ</h1>

        <InputField
          label="ชื่อ - นามสกุล :"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ชื่อ - นามสกุล"
        />

        <InputField
          label="เลขบัตรประจำตัวประชาชน :"
          type="text"
          value={idCard}
          onChange={handleIdCardChange} // ใช้ฟังก์ชันควบคุม input
          placeholder="เลขบัตรประจำตัวประชาชน"
        />

        <InputField
          label="เบอร์โทร :"
          type="text"
          value={phone}
          onChange={handlePhoneChange} // ใช้ฟังก์ชันควบคุม input
          placeholder="เบอร์โทร"
        />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <InputField
            label="วันที่ยืม  :"
            type="date"
            value={borrowDate}
            onChange={(e) => setBorrowDate(e.target.value)}
          />
          <InputField
            label="วันที่คืน  :"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        <BookSelection
          books={books}
          selectedBook={selectedBook}
          onSelectBook={setSelectedBook}
        />

        <button className="btn btn-outline btn-active w-full" onClick={handleSubmit}>บันทึกข้อมูล</button>
      </div>

      {submittedData && <SubmittedData data={submittedData} />}
    </div>
  );
};

export default BookBorrowingSystem;
