export const roles = [
    {
        id: 1, 
        login: 'login_operator',
        password: '12345678',
        name: 'operator', 
        email: 'operator@example.com',
        avatar: '',
        displayName: 'Оператор ПВЗ'
    },
    {
        id: 2, 
        login: 'login_supervizer',
        password: '12345678',
        name: 'supervizer',
        email: 'supervizer@example.com',
        avatar: 'https://i.pinimg.com/originals/a3/5a/af/a35aaf8eefb85a1446e49a0494ea69e2.jpg?nii=t',
        displayName: 'Супервайзер'
    },
    {
        id: 3, 
        login: 'login_analyst',
        password: '12345678',
        name: 'analyst',
        email: 'analyst@example.com',
        avatar: 'https://i.pinimg.com/736x/b0/f2/59/b0f259fb6529bb1c1f7421384a55eac6.jpg',
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
        status: 3, // 1 - принять на склад, 2 - выдать клиенту, 3 - вернуть на склад
        price: 500,
        article: 333456789,
        date: '21.03.2026'
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