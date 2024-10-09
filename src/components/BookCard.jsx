import React from 'react';

export const BookCard = ({ title, author, imageUrl, isSelected, onClick }) => (
  <div 
    className={`card w-36 bg-base-100 shadow-xl cursor-pointer transition-all ${isSelected ? 'ring ring-neutral-500' : ''}`}
    onClick={onClick}
  >
    <figure className="px-4 pt-4">
      {imageUrl ? (
        <img
          src={`http://localhost:5000/${imageUrl}`} // ใช้ path จาก imageUrl
          alt={title}
          className="w-full h-32 object-cover"
        />
      ) : (
        <div className="bg-gray-300 w-full h-32 flex items-center justify-center text-gray-600 text-sm">
          150 x 200
        </div>
      )}
    </figure>
    <div className="card-body p-4 items-center text-center">
      <h2 className="card-title text-sm">{title}</h2>
      <p className="text-xs text-gray-500">{author}</p>
    </div>
  </div>
);
