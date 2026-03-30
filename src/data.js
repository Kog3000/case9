
export const points = [
    'ПВЗ №1 (г. Москва, ул. Ленина, д. 13)',
    'ПВЗ №2 (г. Москва, ул. Малая Бронная, д. 27)'
]

export const orders = [
    {
        title: 'Заказ №1',
        status: 1, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 4200,
        article: 123456789,
        date: '12.03.2026'
    },
    {
        title: 'Заказ №2',
        status: 2, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 5400,
        article: 123452229,
        date: '03.03.2026'
    },
    {
        title: 'Заказ №3',
        status: 1, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 9800,
        article: 111456789,
        date: '18.03.2026'
    },
    {
        title: 'Заказ №4',
        status: 2, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 500,
        article: 333456789,
        date: '21.03.2026'
    },
    {
        title: 'Заказ №5',
        status: 2, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 8060,
        article: 333537789,
        date: '15.03.2026'
    },
    {
        title: 'Заказ №6',
        status: 1, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 5007,
        article: 392656789,
        date: '17.03.2026'
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

export const defaultData = {
    image: 'https://avatars.mds.yandex.net/get-yapic/51169/7Zb7FYDemTULMCabgpZSOUNVRmE-1/orig'
}

export const notifications = [
    { id: 1, title: 'Новый заказ #12345', time: '5 минут назад', read: false },
    { id: 2, title: 'Товар "iPhone 15" закончился', time: '1 час назад', read: false },
    { id: 3, title: 'Изменение статуса заказа #12340', time: '2 часа назад', read: true },
    { id: 4, title: 'Новый комментарий к заказу', time: 'вчера', read: true },
    { id: 5, title: 'Напоминание: смена заканчивается через 1 час', time: 'сегодня', read: false },
]