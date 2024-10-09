import React from 'react';

export const InputField = ({ label, type, value, onChange, placeholder }) => (
  <div className="form-control">
    <label className="label">
      <span className="label-text">{label}</span>
    </label>
    <div className="relative">
      <input
        type={type}
        className="input input-bordered w-full"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  </div>
);
