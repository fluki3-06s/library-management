import React from "react";
import { Link, useLocation } from "react-router-dom"; // Import useLocation
import logo from "../assets/logo.png";

export default function Navbar() {
  const location = useLocation(); // Get the current location

  return (
    <div className="navbar bg-base-200 shadow">
      <div className="container mx-auto flex">
        <div className="navbar-start">
          <div className="dropdown">
            <div className="flex items-center w-12 rounded-full">
              <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h8m-8 6h16"
                  />
                </svg>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] top-full w-52 p-2 shadow"
              >
                <li>
                  <Link to="/">บันทึกการยืมหนังสือ</Link>
                </li>
                <li>
                  <Link to="/Add">เพิ่มหนังสือ</Link>
                </li>
                <li>
                  <Link to="/Edit">แก้ไขข้อมูล</Link>
                </li>
                <li>
                  <Link to="/History">ตรวจสอบประวัติ</Link>
                </li>
              </ul>
              <img className="mr-2" alt="logo" src={logo} />
              <a className="btn btn-ghost text-2xl">ระบบจัดเก็บข้อมูลการยืมหนังสือ</a>
            </div>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex flex-grow justify-center">
          <ul className="menu menu-horizontal px-10 py-5 text-base">
            <li>
              <Link
                to="/"
                style={{
                  textDecoration: location.pathname === '/' ? 'underline' : 'none',
                  textDecorationColor: 'black',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '10px',
                }}
              >
                บันทึกการยืมหนังสือ
              </Link>
            </li>
            <li>
              <Link
                to="/Add"
                style={{
                  textDecoration: location.pathname === '/Add' ? 'underline' : 'none',
                  textDecorationColor: 'black',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '10px',
                }}
              >
                เพิ่มหนังสือ
              </Link>
            </li>
            <li>
              <Link
                to="/Edit"
                style={{
                  textDecoration: location.pathname === '/Edit' ? 'underline' : 'none',
                  textDecorationColor: 'black',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '10px',
                }}
              >
                แก้ไขข้อมูล
              </Link>
            </li>
            <li>
              <Link
                to="/History"
                style={{
                  textDecoration: location.pathname === '/History' ? 'underline' : 'none',
                  textDecorationColor: 'black',
                  textDecorationThickness: '2px',
                  textUnderlineOffset: '10px',
                }}
              >
                ตรวจสอบประวัติ
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
