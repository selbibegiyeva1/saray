import React from 'react';

// CSS
import "../styles/Login.css";

function Login() {
    return (
        <div className='Login'>
            <div className="logo" style={{ display: "flex", justifyContent: "center", marginBottom: 23.5 }}>
                <img src="/logo.png" style={{ width: 64 }} alt="logo" />
            </div>
            <div className="lang" style={{ display: "flex", justifyContent: "center" }}>
                <div className="lang-box">
                    <span>TM</span>
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.29289 5.29289L0.707107 1.70711C0.0771419 1.07714 0.523309 0 1.41421 0H8.58579C9.47669 0 9.92286 1.07714 9.29289 1.70711L5.70711 5.29289C5.31658 5.68342 4.68342 5.68342 4.29289 5.29289Z" fill="black" />
                    </svg>
                </div>
            </div>
            <center><h2 style={{ marginTop: 35.5 }}>Личный кабинет</h2></center>
            <center><span className='log-span'>Войдите в личный кабинет чтобы начать работу.</span></center>

            <form>
                <div>
                    <p>Логин</p>
                    <input type="text" placeholder='Введите логин' required />
                </div>
                <div>
                    <p>Логин</p>
                    <input type="text" placeholder='Введите пароль' required />
                </div>
                <button>Войти</button>
            </form>

            <center><span className='log-span span2'>Самостоятельная регистрация недоступна. Доступ выдаёт поддержка</span></center>
            <center><span className='log-span span3'>Поддержка:+99365 45 87 89</span></center>

            <div className="alerts">
                <div className='alt green'>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 3.93552C14.795 3.33671 13.4368 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 11.662 20.9814 11.3283 20.9451 11M21 5L12 14L9 11" stroke="#50A66A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Успешно зарегистрировано</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className='alt-close'>
                        <path d="M5 5L15 15M15 5L5 15" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default Login