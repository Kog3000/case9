import './Header.css'
import { defaultData } from '../data.js'
import { useState, useEffect, useRef } from 'react'
import ProfilePage from '../ProfilePage/ProfilePage'
import { fetchUserProfile, parseJwt, getFullImageUrl } from '../Api/userService'
import Notifications from '../Notifications.jsx'

const STORAGE_KEYS = {
    USER_ID: 'app_user_id',
    USER_NAME: 'app_user_name',
    USER_EMAIL: 'app_user_email',
    USER_ROLE: 'app_user_role',
    USER_AVATAR: 'app_user_avatar'
}

export default function Header({ onPageChange, currentPage, userName, userData, onLogout, onUserUpdate }) {
    const [now, setNow] = useState(new Date())
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [currentUser, setCurrentUser] = useState(userData)
    const [userNameState, setUserNameState] = useState('')

    // Инициализируем аватар из localStorage сразу
    const [userAvatar, setUserAvatar] = useState(() => {
        return getFullImageUrl(localStorage.getItem(STORAGE_KEYS.USER_AVATAR)) || defaultData.image
    })

    const [currentUserId, setCurrentUserId] = useState(null)
    const [userRole, setUserRole] = useState('')
    const profileModalRef = useRef(null)

    const setAndSaveAvatar = (avatarUrl) => {
        const normalizedAvatar = getFullImageUrl(avatarUrl) || defaultData.image

        setUserAvatar(normalizedAvatar)
        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar)

        setCurrentUser(prev => ({
            ...prev,
            avatar: normalizedAvatar,
            image_url: normalizedAvatar
        }))

        return normalizedAvatar
    }

    const loadUserProfile = async () => {
        try {
            const profile = await fetchUserProfile();
            console.log('Header - профиль:', profile);

            let userName = profile.name || profile.display_name || profile.username;
            let userId = profile.id || profile.user_id;
            let role = profile.role;
            let avatarUrl = profile.image_url;

            if (userName && userName !== 'Пользователь') {
                const finalAvatar = getFullImageUrl(
                    avatarUrl || localStorage.getItem(STORAGE_KEYS.USER_AVATAR)
                ) || defaultData.image;

                setUserNameState(userName);
                setUserRole(role);
                setCurrentUser(prev => ({
                    ...prev,
                    ...profile,
                    name: userName,
                    role: role,
                    avatar: finalAvatar,
                    image_url: finalAvatar
                }));

                setUserAvatar(finalAvatar);

                if (userId) {
                    setCurrentUserId(userId);
                    localStorage.setItem(STORAGE_KEYS.USER_ID, userId.toString());
                    localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
                    if (role) localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
                    if (finalAvatar) localStorage.setItem(STORAGE_KEYS.USER_AVATAR, finalAvatar);
                }
            } else {
                // Fallback через токен
                const token = localStorage.getItem('access_token');
                if (token) {
                    const tokenData = parseJwt(token);
                    if (tokenData) {
                        let fallbackName = tokenData.name || tokenData.email?.split('@')[0] || tokenData.sub?.split('@')[0] || 'Пользователь';
                        const fallbackAvatar = getFullImageUrl(
                            localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || tokenData.image_url
                        ) || defaultData.image;

                        setUserNameState(fallbackName);
                        setUserRole(tokenData.role);
                        setCurrentUserId(tokenData.id || tokenData.sub);
                        setUserAvatar(fallbackAvatar);

                        if (fallbackAvatar) {
                            localStorage.setItem(STORAGE_KEYS.USER_AVATAR, fallbackAvatar);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Header - ошибка:', error);
            const token = localStorage.getItem('access_token');
            if (token) {
                const tokenData = parseJwt(token);
                if (tokenData) {
                    let fallbackName = tokenData.name || tokenData.email?.split('@')[0] || tokenData.sub?.split('@')[0] || 'Пользователь';
                    const fallbackAvatar = getFullImageUrl(
                        localStorage.getItem(STORAGE_KEYS.USER_AVATAR) || tokenData.image_url
                    ) || defaultData.image;

                    setUserNameState(fallbackName);
                    setUserRole(tokenData.role);
                    setCurrentUserId(tokenData.id || tokenData.sub);
                    setUserAvatar(fallbackAvatar);

                    if (fallbackAvatar) {
                        localStorage.setItem(STORAGE_KEYS.USER_AVATAR, fallbackAvatar);
                    }
                }
            }
        }
    };

    useEffect(() => {
        loadUserProfile();
    }, []);

    // Подписка на обновление данных пользователя (имя, роль и т.д.)
    useEffect(() => {
        const handleUserDataUpdate = (event) => {
            const { userId, name, avatar, image_url } = event.detail || {};
            const targetUserId = userId || currentUserId;

            if (!targetUserId) return;

            if (name && name !== userNameState) {
                setUserNameState(name);
                setCurrentUser(prev => ({ ...prev, name: name }));
                localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
            }

            const incomingAvatar = avatar || image_url;

            if (incomingAvatar) {
                const normalizedAvatar = getFullImageUrl(incomingAvatar) || defaultData.image;

                if (normalizedAvatar !== userAvatar) {
                    setUserAvatar(normalizedAvatar);
                    setCurrentUser(prev => ({
                        ...prev,
                        avatar: normalizedAvatar,
                        image_url: normalizedAvatar
                    }));
                    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar);
                }
            }
        };

        window.addEventListener('userDataUpdate', handleUserDataUpdate);
        return () => window.removeEventListener('userDataUpdate', handleUserDataUpdate);
    }, [currentUserId, userNameState, userAvatar]);

    // Подписка на событие обновления аватара (из ProfilePage)
    useEffect(() => {
        const handleUserAvatarUpdate = (event) => {
            const { userId, image_url } = event.detail || {};
            console.log('Header получил userAvatarUpdate:', userId, image_url);

            const currentId = localStorage.getItem(STORAGE_KEYS.USER_ID);

            const isSameUser =
                userId && currentId
                    ? String(userId) === String(currentId)
                    : Boolean(currentId);

            if (isSameUser && image_url) {
                const normalizedAvatar = getFullImageUrl(image_url) || defaultData.image;

                if (normalizedAvatar !== userAvatar) {
                    setUserAvatar(normalizedAvatar);
                    setCurrentUser(prev => ({
                        ...prev,
                        avatar: normalizedAvatar,
                        image_url: normalizedAvatar
                    }));
                    localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar);
                    console.log('Header аватар обновлён на', normalizedAvatar);
                }
            }
        };

        window.addEventListener('userAvatarUpdate', handleUserAvatarUpdate);
        return () => window.removeEventListener('userAvatarUpdate', handleUserAvatarUpdate);
    }, [userAvatar]);

    // Часы
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Закрытие модалки по клику вне
    useEffect(() => {
        const handleClickOutsideProfile = (event) => {
            if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
                setShowProfileModal(false);
            }
        };
        if (showProfileModal) {
            document.addEventListener('mousedown', handleClickOutsideProfile);
            return () => document.removeEventListener('mousedown', handleClickOutsideProfile);
        }
    }, [showProfileModal]);

    // Блокировка прокрутки при открытой модалке
    useEffect(() => {
        if (showProfileModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showProfileModal]);

    const handleProfileClick = () => setShowProfileModal(true);

    const handleLogoClick = () => {
        if (onPageChange) {
            if (userRole === 'supervisor' || currentUser?.role === 'supervisor') onPageChange('supervisor');
            else if (userRole === 'analyst' || currentUser?.role === 'analyst') onPageChange('analyst');
            else onPageChange('main');
        }
    };

    const handleProfileLogout = () => {
        setShowProfileModal(false);
        Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
    };

    const handleProfileBack = () => {
        setShowProfileModal(false);
        if (onPageChange) {
            if (userRole === 'supervisor' || currentUser?.role === 'supervisor') onPageChange('supervisor');
            else if (userRole === 'analyst' || currentUser?.role === 'analyst') onPageChange('analyst');
            else onPageChange('main');
        }
    };

    const handleUserUpdate = (updatedData) => {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || currentUserId;

        if (userId) {
            if (updatedData.name || updatedData.displayName) {
                const newName = updatedData.name || updatedData.displayName;
                localStorage.setItem(STORAGE_KEYS.USER_NAME, newName);
                setUserNameState(newName);
                setCurrentUser(prev => ({ ...prev, name: newName }));
            }

            const incomingAvatar = updatedData.avatar || updatedData.image_url;

            if (incomingAvatar) {
                const normalizedAvatar = getFullImageUrl(incomingAvatar) || defaultData.image;

                localStorage.setItem(STORAGE_KEYS.USER_AVATAR, normalizedAvatar);
                setUserAvatar(normalizedAvatar);
                setCurrentUser(prev => ({
                    ...prev,
                    avatar: normalizedAvatar,
                    image_url: normalizedAvatar
                }));

                updatedData = {
                    ...updatedData,
                    avatar: normalizedAvatar,
                    image_url: normalizedAvatar
                };
            }

            if (updatedData.role) {
                localStorage.setItem(STORAGE_KEYS.USER_ROLE, updatedData.role);
                setUserRole(updatedData.role);
                setCurrentUser(prev => ({ ...prev, role: updatedData.role }));
            }
        }

        if (onUserUpdate) onUserUpdate(updatedData);

        window.dispatchEvent(new CustomEvent('userDataUpdate', {
            detail: { userId: userId || currentUserId, ...updatedData }
        }));
    };

    let roleDisplay = 'Оператор';
    const effectiveRole = userRole || currentUser?.role;
    if (effectiveRole === 'supervisor') roleDisplay = 'Супервайзер';
    else if (effectiveRole === 'analyst') roleDisplay = 'Аналитик';
    else if (effectiveRole === 'operator') roleDisplay = 'Оператор';

    const isOperator = effectiveRole === 'operator';
    const pvzAddress = currentUser?.pvz?.address || userData?.pvz?.address || localStorage.getItem('pvzAddress') || 'ПВЗ №1';
    const workStart = currentUser?.pvz?.work_start || userData?.pvz?.work_start || '10:00';
    const workEnd = currentUser?.pvz?.work_end || userData?.pvz?.work_end || '22:00';

    const finalDisplayName = userNameState || currentUser?.name || currentUser?.displayName || userData?.name || userData?.displayName || userName || 'Пользователь';

    const finalAvatar = getFullImageUrl(
        userAvatar ||
        currentUser?.avatar ||
        currentUser?.image_url ||
        userData?.avatar ||
        userData?.image_url
    ) || defaultData.image;

    return(
        <>
            <header className='headerText'>
                {isOperator ? (
                    <div className='compactLeft'>
                        <span className='point' onClick={handleLogoClick}>{pvzAddress}</span>
                        <span className='leftTwo'>Смена: {workStart} – {workEnd}</span>
                        <span className='rightOne'>{now.toLocaleTimeString()}</span>
                    </div>
                ) : (
                    <span className='leftTwo2'>Смена: 9:00 – 21:00</span>
                )}
                <div className='compactRight'>
                    <Notifications className='notif-bell' notifications={[]} />
                    <div className='user-info-wrapper' onClick={handleProfileClick} style={{ cursor: 'pointer' }}>
                        <div className='avatar'>
                            <img className='image' src={finalAvatar} alt='avatar' />
                        </div>
                        <div className='user-details'>
                            <div className='user-name'>{finalDisplayName}</div>
                            <div className='user-role'>{roleDisplay}</div>
                        </div>
                    </div>
                </div>
            </header>
            {showProfileModal && (
                <div className="profile-modal-overlay">
                    <div className="profile-modal-container" ref={profileModalRef}>
                        <ProfilePage
                            onBack={handleProfileBack}
                            onLogout={handleProfileLogout}
                            userData={currentUser}
                            onUserUpdate={handleUserUpdate}
                        />
                    </div>
                </div>
            )}
        </>
    );
}