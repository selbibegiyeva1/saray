import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';

// CSS
import "../styles/Navbar.css";

function Navbar() {
  const TOKEN =
    "8d5b81f8-e8125-4578-b1a7-e093b318d5b81f8-e8125-4578-b1a7-e093b31";

  // show a shortened version in the input, keep full token elsewhere
  const displayToken = `${TOKEN.slice(0, 32)}...`;

  const [profile, setProfile] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(TOKEN);
      setCopied(true);
    } catch {
      // Fallback for http/non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = TOKEN;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } finally {
        document.body.removeChild(ta);
      }
    } finally {
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const profileFunc = () => setProfile(!profile);

  return (
    <div className='Navbar'>
      <NavLink
        to="/home"
        className={({ isActive }) => (isActive ? "active" : "")}
        style={{ display: "flex" }}
      >
        <img src="/logo.png" style={{ width: 56 }} alt="logo" />
      </NavLink>
      <ul className='nav-ul'>
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Главная
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/transactions"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Транзакции
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reports"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Отчёты
          </NavLink>
        </li>
      </ul>
      <ul className='nav-ul ul2'>
        <li>
          <div className="lang-box">
            <span>TM</span>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
            </svg>
          </div>
        </li>
        <li>
          <Link to="/help">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 17H12.01M12 14C12.8906 12.0938 15 12.2344 15 10C15 8.5 14 7 12 7C10.4521 7 9.50325 7.89844 9.15332 9M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Помощь</span>
          </Link>
        </li>
        <li>
          <button onClick={profileFunc}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 24.9444C23.311 21.8333 20.7142 20 16.0002 20C11.2861 20 8.68901 21.8333 8 24.9444M16 28C22.6274 28 28 22.6274 28 16C28 9.37258 22.6274 4 16 4C9.37258 4 4 9.37258 4 16C4 22.6274 9.37258 28 16 28ZM16 16C17.7778 16 18.6667 15.0476 18.6667 12.6667C18.6667 10.2857 17.7778 9.33333 16 9.33333C14.2222 9.33333 13.3333 10.2857 13.3333 12.6667C13.3333 15.0476 14.2222 16 16 16Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <span>Мурад</span>
          </button>
        </li>
      </ul>

      <div className={profile ? "profile show" : "profile"}>
        <div className="prof-block">
          <div className="prof-flex">
            <span>Мой профиль</span>
            <svg width="24" height="24" viewBox="0 0 72 75" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ cursor: "pointer" }} onClick={profileFunc}>
              <g id="close">
                <path id="Icon" d="M18 19.5L54 55.5M54 19.5L18 55.5" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </g>
            </svg>
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>Email</p>
            <input type="text" placeholder='Введите логин' value="roycharyyew@gmail.com" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>Имя</p>
            <input type="text" placeholder='Введите пароль' value="Мурад" required />
          </div>
          <div style={{ marginBottom: 14 }}>
            <p>Фамилия</p>
            <input type="text" placeholder='Введите логин' value="Мурад" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <p>Роль</p>
            <input type="text" placeholder='Введите логин' value="Директор" required />
          </div>

          <div>
            <span className='tkn-spn'>Управление токенами</span>
            <p>Ваш токен</p>
            <div className="token" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="text"
                placeholder="Введите логин"
                className="token-inp"
                value={displayToken}   // shows ... at the end
                readOnly
                title={TOKEN}          // full token on hover
                required
              />

              {/* SVG as copy button */}
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ cursor: "pointer", outline: "none" }}
                role="button"
                tabIndex={0}
                aria-label={copied ? "Скопировано" : "Скопировать токен"}
                title={copied ? "Скопировано!" : "Скопировать"}
                onClick={copyToken}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && copyToken()}
              >
                <path
                  d="M9 15.5H5C3.89543 15.5 3 14.6046 3 13.5V5.5C3 4.39543 3.89543 3.5 5 3.5H13C14.1046 3.5 15 4.39543 15 5.5V9.5M11 21.5H19C20.1046 21.5 21 20.6046 21 19.5V11.5C21 10.3954 20.1046 9.5 19 9.5H11C9.89543 9.5 9 10.3954 9 11.5V19.5C9 20.6046 9.89543 21.5 11 21.5Z"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* quick feedback */}
              {copied && <span className='copied'>Успено скопировано!</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar