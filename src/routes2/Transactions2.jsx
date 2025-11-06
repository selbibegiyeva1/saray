import React from 'react';

import "../styles/Transactions2.css";

function Transactions2() {
    return (
        <div className='Home transhome'>
            <h1>Транзакции</h1>

            <div className="trans-filter">
                <p className="filter-h">Фильтры</p>
                <div className="filter-flex">
                    <div className='filter-b'>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>Категория</span>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <select>
                                <option>День</option>
                                <option>Неделя</option>
                                <option>Месяц</option>
                                <option>Год</option>
                                <option>Всё</option>
                            </select>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className='filt-arr'>
                                <path d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                    <div className='filter-b'>
                        <span style={{ fontSize: 14, fontWeight: 500 }}>Категория</span>
                        <div style={{ position: 'relative', marginTop: 8 }}>
                            <select>
                                <option>eSIM</option>
                                <option>Цифровые товары</option>
                                <option>Steam</option>
                                <option>Всё</option>
                            </select>
                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className='filt-arr'>
                                <path d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z" fill="black" />
                            </svg>
                        </div>
                    </div>
                    <div className="filter-b">
                        <span style={{ fontSize: 14, fontWeight: 500, opacity: 0 }}>Категория</span>
                        <div className="b-flex">
                            <div className="search-filt" style={{ position: 'relative', marginTop: 8 }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.1524 11.1572L15.8281 15.833M7.91146 12.4997C10.4428 12.4997 12.4948 10.4476 12.4948 7.91634C12.4948 5.38504 10.4428 3.33301 7.91146 3.33301C5.38015 3.33301 3.32812 5.38504 3.32812 7.91634C3.32812 10.4476 5.38015 12.4997 7.91146 12.4997Z" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <input type="text" placeholder='Введите ID транзакции' />
                            </div>
                            <button>Поиск</button>
                            <button>Сбросить</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Transactions2