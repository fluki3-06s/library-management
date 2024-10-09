import React from 'react';
import { BookCard } from './BookCard';

export const BookSelection = ({ books, selectedBook, onSelectBook }) => (
  <div className="mb-6">
    <label className="label">
      <span className="label-text">หนังสือที่สนใจ :</span>
    </label>
    <div className="flex flex-wrap gap-4 justify-center">
      {books.map((book) => (
        <BookCard
          key={book.id}
          title={book.title}
          author={book.author}
          imageUrl={book.imageUrl} // ส่ง imageUrl ไปยัง BookCard
          isSelected={selectedBook === book.id}
          onClick={() => onSelectBook(book.id)}
        />
      ))}
    </div>
  </div>
);
