import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const EditHistory = ({onSave}) => {
  const navigate = useNavigate(); // ใช้ useNavigate ในการนำทาง

  const handleCancel = () => {
    navigate('/'); // นำทางไปยังหน้าที่ต้องการเมื่อกดปุ่ม
  };
  const [dataList, setDataList] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowerData, setBorrowerData] = useState({
    borrowerId: '',
    idCard: '',
    phone: '',
    borrowDate: '',
    returnDate: '',
    borrowersList: []
  });
  const [isBookSelected, setIsBookSelected] = useState(false);
  const [isBorrowerSelected, setIsBorrowerSelected] = useState(false);
  const [fileName, setFileName] = useState(''); // State สำหรับเก็บชื่อไฟล์

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setDataList(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถดึงข้อมูลหนังสือได้'
        });
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchBorrowingHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/borrowing-history');
        setBorrowerData(prev => ({
          ...prev,
          borrowersList: response.data
        }));
      } catch (error) {
        console.error('Error fetching borrowing history:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด!',
          text: 'ไม่สามารถดึงข้อมูลประวัติการยืมได้'
        });
      }
    };

    fetchBorrowingHistory();
  }, []);

  const handleSelectChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const book = dataList.find(item => item.id === selectedId);
    setSelectedBook(book);
    setIsBookSelected(!!book);
    setBorrowerData({
      borrowerId: '',
      idCard: '',
      phone: '',
      borrowDate: '',
      returnDate: '',
      borrowersList: borrowerData.borrowersList
    });
    setIsBorrowerSelected(false);
  };

  const handleBookChange = (e) => {
    const { name, value } = e.target;
    setSelectedBook(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedBook(prev => ({ ...prev, image: file })); // อัปเดตข้อมูลหนังสือ
      setFileName(file.name); // อัปเดตชื่อไฟล์ที่เลือก
    } else {
      setFileName(''); // ถ้าไม่เลือกไฟล์
    }
  };
  

  const handleBorrowerChange = (e) => {
    const { name, value } = e.target;
    if (name === 'borrowerId') {
      const selectedBorrower = borrowerData.borrowersList.find(borrower => borrower.id === parseInt(value));
      if (selectedBorrower) {
        setBorrowerData({
          ...borrowerData,
          borrowerId: selectedBorrower.id,
          idCard: selectedBorrower.id_card,
          phone: selectedBorrower.contact
        });
        setIsBorrowerSelected(true);
        setIsBookSelected(false);
        setSelectedBook(null);
      } else {
        setBorrowerData({
          ...borrowerData,
          borrowerId: '',
          idCard: '',
          phone: '',
          borrowDate: '',
          returnDate: ''
        });
        setIsBorrowerSelected(false);
      }
    } else {
      setBorrowerData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBookSubmit = async () => {
    if (!selectedBook || !selectedBook.title || !selectedBook.author) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
        text: 'กรุณากรอกชื่อหนังสือ และผู้เขียน',
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('title', selectedBook.title);
    formData.append('author', selectedBook.author);
    
    if (selectedBook.image) {
      formData.append('image', selectedBook.image);
    }
  
    // ถ้ามีภาพเก่า ให้ส่งไปยังเซิร์ฟเวอร์เพื่อให้ลบออก
    if (selectedBook.oldImage) { // สมมุติว่า oldImage เก็บชื่อไฟล์เก่า
      formData.append('oldImage', selectedBook.oldImage);
    }
  
    try {
      const response = await axios.put(`http://localhost:5000/api/books/${selectedBook.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.status === 200) {
        const updatedDataList = dataList.map(item =>
          item.id === selectedBook.id ? { ...selectedBook } : item
        );
        setDataList(updatedDataList);
        setSelectedBook({ ...selectedBook });
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขข้อมูลสำเร็จ!',
          text: 'ข้อมูลหนังสือถูกอัปเดตเรียบร้อยแล้ว'
        });
        if (typeof onSave === 'function') {
          onSave({ type: 'book', data: selectedBook });
        }
      }
    } catch (error) {
      console.error('Error updating book:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตข้อมูลหนังสือได้'
      });
    }
  };
  
  
  
  const handleBorrowerSubmit = async () => {
    // ตรวจสอบว่าข้อมูลที่จำเป็นทั้งหมดถูกกรอกแล้ว
    if (!borrowerData.borrowerId || !borrowerData.idCard || !borrowerData.phone || !borrowerData.borrowDate || !borrowerData.returnDate) {
        Swal.fire({
            icon: 'warning',
            title: 'กรุณากรอกข้อมูลให้ครบถ้วน!',
            text: 'กรุณากรอกข้อมูลผู้ยืมให้ครบถ้วน',
        });
        return;
    }

    // สร้าง payload สำหรับส่งข้อมูล
    const payload = {
        id_card: borrowerData.idCard,      // บัตรประชาชน
        contact: borrowerData.phone,       // เบอร์โทร
        borrow_date: borrowerData.borrowDate, // วันที่ยืม
        return_date: borrowerData.returnDate, // วันที่คืน
    };

    // เพิ่มกรณีที่มีภาพใหม่
    if (selectedBook && selectedBook.image) {
        payload.book_image = selectedBook.image; // เพิ่มภาพใหม่
    }

    try {
        // ส่งข้อมูลแบบ JSON โดยไม่ใช้ FormData
        const response = await axios.put(`http://localhost:5000/api/borrowing-history/${borrowerData.borrowerId}`, payload, {
            headers: {
                'Content-Type': 'application/json' // กำหนด header เป็น JSON
            }
        });

        if (response.status === 200) {
            // อัปเดต borrowersList โดยไม่เปลี่ยนแปลงข้อมูลที่ไม่ต้องการ
            const updatedBorrowersList = borrowerData.borrowersList.map(borrower =>
                borrower.id === borrowerData.borrowerId 
                    ? { 
                        ...borrower, // เก็บข้อมูลเดิมของ borrower
                        id_card: borrowerData.idCard, 
                        contact: borrowerData.phone, 
                        borrow_date: borrowerData.borrowDate, 
                        return_date: borrowerData.returnDate 
                    } 
                    : borrower
            );

            // อัปเดต state ด้วยข้อมูลที่แก้ไขแล้ว
            setBorrowerData(prev => ({
                ...prev,
                borrowersList: updatedBorrowersList
            }));

            Swal.fire({
                icon: 'success',
                title: 'แก้ไขข้อมูลสำเร็จ!',
                text: 'ข้อมูลผู้ยืมถูกอัปเดตเรียบร้อยแล้ว'
            });

            // เรียกฟังก์ชัน onSave ถ้ามี
            if (typeof onSave === 'function') {
                onSave({
                    type: 'borrower',
                    data: {
                        id_card: borrowerData.idCard,
                        contact: borrowerData.phone,
                        borrow_date: borrowerData.borrowDate,
                        return_date: borrowerData.returnDate
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error updating borrower:', error);
        Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด!',
            text: 'ไม่สามารถอัปเดตข้อมูลผู้ยืมได้'
        });
    }
};


  
return (
  <div className="container mx-auto p-4 max-w-4xl">
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">แก้ไขข้อมูลการยืม</h1>

      <div className="flex justify-between"> {/* ใช้ flex เพื่อจัดเรียงให้ขนานกัน */}
        {/* Book Information */}
        <div className="card bg-base-100 shadow-xl flex-1 mr-4"> {/* เพิ่ม flex-1 เพื่อให้แบ่งพื้นที่เท่ากัน */}
          <div className="card-body">
            <h2 className="card-title">ข้อมูลหนังสือ</h2>
            <select 
              onChange={handleSelectChange} 
              className="select select-bordered w-full"
              disabled={isBorrowerSelected}
            >
              <option value="">-- เลือกข้อมูล --</option>
              {dataList.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} - {item.author}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="ชื่อหนังสือ"
              name="title"
              value={selectedBook ? selectedBook.title : ''}
              onChange={handleBookChange}
              className="input input-bordered w-full mt-2"
              disabled={!isBookSelected || isBorrowerSelected}
            />
            <input
              type="text"
              placeholder="ผู้เขียน"
              name="author"
              value={selectedBook ? selectedBook.author : ''}
              onChange={handleBookChange}
              className="input input-bordered w-full mt-2"
              disabled={!isBookSelected || isBorrowerSelected}
            />
            <div className="mt-2 mb-2 relative">
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="input input-bordered w-full opacity-0 absolute"
                id="file-upload"
                required
                disabled={!isBookSelected}
              />
              <label 
                htmlFor="file-upload" 
                className={`btn btn-outline w-full cursor-pointer ${!isBookSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isBookSelected}
              >
                เลือกรูปภาพ
              </label>
              {fileName && (
                <p className="mt-5 text-sm text-gray-600">ไฟล์ที่เลือก: {fileName}</p>
              )}
            </div>
            <button 
              onClick={handleBookSubmit} 
              className="btn btn-outline btn-active w-full" 
              disabled={!isBookSelected || isBorrowerSelected}
            >
              บันทึกข้อมูลหนังสือ
            </button>
          </div>
        </div>

        {/* Borrower Information */}
        <div className="card bg-base-100 shadow-xl flex-1 ml-4"> {/* เพิ่ม flex-1 เพื่อให้แบ่งพื้นที่เท่ากัน */}
          <div className="card-body">
            <h2 className="card-title">ข้อมูลผู้ยืม</h2>
            <select
              name="borrowerId"
              value={borrowerData.borrowerId}
              onChange={handleBorrowerChange}
              className="select select-bordered w-full"
              disabled={isBookSelected}
            >
              <option value="">-- เลือกผู้ยืม --</option>
              {borrowerData.borrowersList && borrowerData.borrowersList.map((borrower) => (
                <option key={borrower.id} value={borrower.id}>
                  {borrower.borrower}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="เลขบัตรประชาชน"
              name="idCard"
              value={borrowerData.idCard}
              onChange={handleBorrowerChange}
              className="input input-bordered w-full mt-2"
              disabled={!isBorrowerSelected || isBookSelected}
            />
            <input
              type="text"
              placeholder="เบอร์โทร"
              name="phone"
              value={borrowerData.phone}
              onChange={handleBorrowerChange}
              className="input input-bordered w-full mt-2"
              disabled={!isBorrowerSelected || isBookSelected}
            />
            <div className="flex justify-between">
              <input
                type="date"
                placeholder="วันที่ยืม"
                name="borrowDate"
                value={borrowerData.borrowDate}
                onChange={handleBorrowerChange}
                className="input input-bordered w-full mt-2 mr-2"
                disabled={!isBorrowerSelected || isBookSelected}
              />
              <input
                type="date"
                placeholder="วันที่คืน"
                name="returnDate"
                value={borrowerData.returnDate}
                onChange={handleBorrowerChange}
                className="input input-bordered w-full mt-2"
                disabled={!isBorrowerSelected || isBookSelected}
              />
            </div>
            <button 
              onClick={handleBorrowerSubmit} 
              className="btn btn-outline btn-active mt-2 w-full" 
              disabled={!isBorrowerSelected || isBookSelected}
            >
              บันทึกข้อมูลผู้ยืม
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={handleCancel} className="btn btn-outline btn-error">ย้อนกลับ</button>
      </div>
    </div>
  </div>
);
};

export default EditHistory;