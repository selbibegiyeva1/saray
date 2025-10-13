import { useState } from "react";

function WithdrawnReport() {
  // Toggle this to test states
  const [hasTransactions] = useState(true);

  // Full transactions list (sampled from your markup)
  const transactions = [
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
    { date: "Авг 6, 2024", time: "15:56", txId: "Нвличными", orderId: "Выдача наличными офис номер 2", category: "58.451,32 ТМТ" },
  ];

  return (
    <div>
      <div className="grid-blocks">
        <div className="g-block">
          <div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8333 6.66634V5.33301C15.8333 4.22844 14.9379 3.33301 13.8333 3.33301H5.5C3.84315 3.33301 2.5 4.67615 2.5 6.33301V13.6663C2.5 15.3232 3.84315 16.6663 5.5 16.6663H15.5C16.6046 16.6663 17.5 15.7709 17.5 14.6663V8.33301C17.5 7.41253 16.7538 6.66634 15.8333 6.66634ZM15.8333 6.66634H5.83333M14.1667 11.6663H13.3333" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p>Выведено всего</p>
          </div>
          <p className="g-block-num">8.672,20 ТМТ</p>
        </div>

        <div className="g-block">
          <div>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.8333 6.66634V5.33301C15.8333 4.22844 14.9379 3.33301 13.8333 3.33301H5.5C3.84315 3.33301 2.5 4.67615 2.5 6.33301V13.6663C2.5 15.3232 3.84315 16.6663 5.5 16.6663H15.5C16.6046 16.6663 17.5 15.7709 17.5 14.6663V8.33301C17.5 7.41253 16.7538 6.66634 15.8333 6.66634ZM15.8333 6.66634H5.83333M14.1667 11.6663H13.3333" stroke="#2D85EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <p>Последний вывод</p>
          </div>
          <p className="g-block-num">8.672,20 ТМТ </p>
          <span style={{ fontWeight: 500 }}>12 окт 2025</span>
        </div>
      </div>

      <div className="transactions-container with">
        <div className="table-viewport">
          <table>
            <div className="search-table">
              <p className="tb-head">Итоги за период</p>
              <div className="search">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.1572 11.1572L15.833 15.833M7.91634 12.4997C10.4476 12.4997 12.4997 10.4476 12.4997 7.91634C12.4997 5.38504 10.4476 3.33301 7.91634 3.33301C5.38504 3.33301 3.33301 5.38504 3.33301 7.91634C3.33301 10.4476 5.38504 12.4997 7.91634 12.4997Z" stroke="black" stroke-opacity="0.6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <input type="text" placeholder='Введите ID транзакции' />
              </div>
            </div>

            <tr className='row-titles withdrawn' style={{ marginBottom: 16, marginTop: 14 }}>
              <p>Дата вывода</p>
              <p>Время вывода</p>
              <p>Способ вывода</p>
              <p>Комментарий</p>
              <p>Сумма вывода</p>
            </tr>

            {hasTransactions ? (
              transactions.map((tx, i) => {
                return (
                  <tr key={i} className='row-titles row-data withdrawn'>
                    <p>{tx.date}</p>
                    <p>{tx.time}</p>
                    <p className='trans-overflow'>{tx.txId}</p>
                    <p className='trans-overflow'>{tx.orderId}</p>
                    <p>{tx.category}</p>
                  </tr>
                );
              })
            ) : (
              // Keep it a row so the table never collapses
              <div className="no-data">
                <p>У вас пока нет транзакций</p>
              </div>
            )}
          </table>
        </div>
      </div>

      <div className="pags">
        <button className='active-btn'>1</button>
        <button className='inactive-btn'>2</button>
        <button className='inactive-btn'>3</button>
        <button className='inactive-btn'>4</button>
        <button className='inactive-btn'>5</button>
        <button className='inactive-btn'>...</button>
        <button className='inactive-btn'>24</button>
      </div>
    </div>
  )
}

export default WithdrawnReport