export const roles = [
    {
        name: 'operator',
        login: 'login_operator',
        displayName: 'Оператор ПВЗ'
    },
    {
        name: 'supervizer',
        login: 'login_supervizer',
        displayName: 'Супервайзер'
    },
    {
        name: 'analyst',
        login: 'login_analyst',
        displayName: 'Аналитик'
    }
]

export const points = [
    'ПВЗ №1 (г. Москва, ул. Ленина, д. 13)',
    'ПВЗ №2 (г. Москва, ул. Малая Бронная, д. 27)'
]

export const orders = [
    {
        title: 'Заказ №1',
        status: 1, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 4200,
        article: 123456789
    },
    {
        title: 'Заказ №2',
        status: 2, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 5400,
        article: 123452229
    },
    {
        title: 'Заказ №3',
        status: 1, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 9800,
        article: 111456789
    },
    {
        title: 'Заказ №4',
        status: 3, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 500,
        article: 333456789
    }
]

export const barInfo = [
    {
        day: 'Пн',
        value: 21
    },
    {
        day: 'Вт',
        value: 55
    },
    {
        day: 'Ср',
        value: 15
    },
    {
        day: 'Чт',
        value: 80
    },
    {
        day: 'Пт',
        value: 35
    },
    {
        day: 'Сб',
        value: 62
    },
    {
        day: 'Вс',
        value: 82
    }
]