import React, { useEffect, useState } from 'react';
import axios from 'axios'; // อย่าลืมติดตั้ง axios
import { BookCard } from './BookCard';
import Swal from 'sweetalert2'; // นำเข้า SweetAlert2

const HistoryItem = ({ book, borrower, borrowDate, returnDate, idCard, onDelete }) => {
  return (
    <div className="card bg-base-100 shadow-xl mb-4 flex flex-col md:flex-row">
      <div className="flex-none w-full md:w-1/3 p-4">
        <BookCard 
          title={book.title} 
          author={book.author} 
          imageUrl={book.imageUrl} // ส่ง imageUrl ไปที่ BookCard
          isSelected={false} 
          onClick={() => {}} 
        />
      </div>
      <div className="card-body flex-grow">
        <h2 className="card-title">{book.title}</h2>
        <p>ผู้ยืม: {borrower}</p>
        <p>เลขบัตรประชาชน: {idCard}</p>
        <p>เบอร์ติดต่อ: {book.contact}</p>
        <div className="flex justify-between text-sm text-base-content/70 mt-2">
          <span>ยืม: {borrowDate}</span>
          <span>คืน: {returnDate}</span>
        </div>
        <button 
          className="btn btn-outline btn-active mt-4" 
          onClick={onDelete}
        >
          คืนแล้ว
        </button>
      </div>
    </div>
  );
};

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowingHistory, setBorrowingHistory] = useState([]);

  const fetchBorrowingHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/borrowing-history');

      const formattedData = response.data.map(item => {
        return {
          id: item.id,
          book: {
            title: item.book_title,
            author: item.author,
            contact: item.contact,
            imageUrl: item.book_image
          },
          borrower: item.borrower,
          idCard: item.id_card,
          borrowDate: new Date(item.borrow_date).toLocaleDateString('th-TH'), // แปลงวันที่เป็นแบบ 'YYYY-MM-DD'
          returnDate: new Date(item.return_date).toLocaleDateString('th-TH') // แปลงวันที่เป็นแบบ 'YYYY-MM-DD'
        };
      });
      setBorrowingHistory(formattedData);
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
    }
  };

  const deleteBorrowingHistory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/borrowing-history/${id}`);
      setBorrowingHistory(borrowingHistory.filter(item => item.id !== id));

      // แสดง SweetAlert2 แจ้งเตือน
      Swal.fire({
        icon: 'success',
        title: 'ลบข้อมูลเรียบร้อยแล้ว!',
        text: 'ข้อมูลการยืมหนังสือนี้ถูกลบออกจากระบบแล้ว',
        confirmButtonText: 'ตกลง'
      });

    } catch (error) {
      console.error('Error deleting borrowing history:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถลบข้อมูลได้ โปรดลองอีกครั้ง',
        confirmButtonText: 'ตกลง'
      });
    }
  };

  useEffect(() => {
    fetchBorrowingHistory();
  }, []);

  const filteredHistory = borrowingHistory.filter(item => {
    return (
      item.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.borrower.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="text-2xl font-bold mb-6 text-center">ประวัติการยืมหนังสือ</h1>
          
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="form-control flex-grow">
              <div className="input-group">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหนังสือหรือชื่อผู้ยืม"
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map(item => (
                <HistoryItem key={item.id} {...item} onDelete={() => deleteBorrowingHistory(item.id)} />
              ))
            ) : (
              <div className="alert">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>ไม่พบประวัติการยืมหนังสือ</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;
