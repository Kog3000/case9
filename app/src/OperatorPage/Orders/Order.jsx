import './Order.css'

export default function Order({title, status, price, article, date}) {
    let buttonText = 'Принять на склад'
    let titleClass = 'productTitle1'
    let priceClass = 'productPrice1'
    if (status === 1) {
        buttonText = 'Принять на склад'
        titleClass = 'productTitle1'
        priceClass = 'productPrice1'
    } else if (status === 2) {
        buttonText = 'Выдать клиенту'
        titleClass = 'productTitle2'
        priceClass = 'productPrice2'
    } else if (status === 3) {
        buttonText = 'Вернуть на склад'
        // titleClass = 'productTitle3'
        // priceClass = 'productPrice3'
    }

    return(
        <li>
            <div className='productInfo'>
                <span className={titleClass}>{title}</span>
                <span className='productArticle'>(№{article})</span>
                <span className='date'>{date}</span>
                <span className={priceClass}>{price} руб.</span>
            </div>
            {status !== 1 ? 
            <div className='buttons'>
            <button className='productButton first'>Выдать клиенту</button>
            <button className='productButton second'>Вернуть на склад</button>
            </div> :
        <button className='productButton'>Принять на склад</button>}
            
        </li>
    )
}