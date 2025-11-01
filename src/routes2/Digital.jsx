import React from 'react';

import "../styles/Digital.css";

function Digital() {
    return (
        <div className='Digital'>
            <h1>Цифровые товары</h1>

            <div className="digital-search">
                <p className='digital-search-h'>Поиск по товарам</p>
                <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
                    <div className="search-input">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.1524 11.1572L15.8281 15.833M7.91146 12.4997C10.4428 12.4997 12.4948 10.4476 12.4948 7.91634C12.4948 5.38504 10.4428 3.33301 7.91146 3.33301C5.38015 3.33301 3.32812 5.38504 3.32812 7.91634C3.32812 10.4476 5.38015 12.4997 7.91146 12.4997Z" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <input type="text" placeholder='Введите игру' />
                    </div>
                    <button className='dig-search-btn'>Поиск</button>
                </div>
                <div className="dig-flex2">
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                    <div>
                        <img src="/pubgmobile 1.png" alt="img" style={{ width: 23 }} />
                        <p style={{ fontSize: 14, fontWeight: 600 }}>PUBG</p>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 24 }}>
                <p className='digital-search-h s2'>Игры</p>

                <div className='digital-btns'>
                    <button>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.375 13.625V17.125M17.125 15.375H13.625M14.75 9.25H16C17.1046 9.25 18 8.35457 18 7.25V6C18 4.89543 17.1046 4 16 4H14.75C13.6454 4 12.75 4.89543 12.75 6V7.25C12.75 8.35457 13.6454 9.25 14.75 9.25ZM6 18H7.25C8.35457 18 9.25 17.1046 9.25 16V14.75C9.25 13.6454 8.35457 12.75 7.25 12.75H6C4.89543 12.75 4 13.6454 4 14.75V16C4 17.1046 4.89543 18 6 18ZM6 9.25H7.25C8.35457 9.25 9.25 8.35457 9.25 7.25V6C9.25 4.89543 8.35457 4 7.25 4H6C4.89543 4 4 4.89543 4 6V7.25C4 8.35457 4.89543 9.25 6 9.25Z" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p>Сервисы</p>
                    </button>
                    <button>
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.08333 18.583H10.75M13.4167 18.583H10.75M10.75 18.583V15.958M10.75 15.958H16.75C17.8546 15.958 18.75 15.0626 18.75 13.958V6.58301C18.75 5.47844 17.8546 4.58301 16.75 4.58301H4.75C3.64543 4.58301 2.75 5.47844 2.75 6.58301V13.958C2.75 15.0626 3.64543 15.958 4.75 15.958H10.75Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <p>Игры</p>
                    </button>
                </div>

                <div className="digital-grid">
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                    <div>
                        <img src="/image.png" alt="img" />
                        <center><b>Apex Legends Mobile</b></center>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Digital