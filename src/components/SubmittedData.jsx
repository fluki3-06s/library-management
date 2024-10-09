import React from 'react';

export const SubmittedData = ({ data }) => (
  <div className="mt-8 bg-green-100 p-6 rounded-lg border border-green-200">
    <h2 className="text-xl font-semibold mb-4 text-green-800">ข้อมูลการยืมหนังสือ</h2>
    <p className="mb-2"><span className="font-semibold">ชื่อ-นามสกุล :</span> {data.name}</p>
    <p className="mb-2"><span className="font-semibold">เลขบัตรประจำตัวประชาชน :</span> {data.idCard}</p>
    <p className="mb-2"><span className="font-semibold">เบอร์โทร :</span> {data.contact}</p>
    <p className="mb-2"><span className="font-semibold">วันที่ยืม :</span> {data.borrowDate}</p>
    <p className="mb-2"><span className="font-semibold">วันที่คืน :</span> {data.returnDate}</p>
    <p className="mb-2"><span className="font-semibold">หนังสือที่เลือก :</span> {data.book.title} โดย {data.book.author}</p>
  </div>
);
