import './Header.css'
import { defaultData } from '../data.js'
import { useState, useEffect, useRef } from 'react'
import ProfilePage from '../ProfilePage/ProfilePage'
import { userStorage } from '../Api/userStorageService.js'
import { fetchUserProfile, parseJwt } from '../Api/userService'
import Notifications from '../Notifications.jsx'

export default function Header({ onPageChange, currentPage, userName, userData, onLogout, onUserUpdate }) {
    const [now, setNow] = useState(new Date())
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [currentUser, setCurrentUser] = useState(userData)
    const [userNameState, setUserNameState] = useState('')
    const [userAvatar, setUserAvatar] = useState('')
    const [currentUserId, setCurrentUserId] = useState(null)
    const [userRole, setUserRole] = useState('')
    const profileModalRef = useRef(null)

    // Загрузка профиля пользователя с бэка
    const loadUserProfile = async () => {
        try {
            const profile = await fetchUserProfile();
            console.log('Header - профиль с бэка:', profile);
            
            let userName = profile.name || profile.display_name || profile.username;
            let userId = profile.id || profile.user_id;
            let role = profile.role;
            
            if (userName && userName !== 'Пользователь') {
                setUserNameState(userName);
                setUserRole(role);
                setCurrentUser(prev => ({ ...prev, name: userName, role: role }));
                
                if (userId) {
                    setCurrentUserId(userId);
                    userStorage.setCurrentUserId(userId.toString());
                    userStorage.setUserName(userId.toString(), userName);
                    if (role) userStorage.setUserRole(userId.toString(), role);
                    
                    const savedAvatar = userStorage.getUserAvatar(userId);
                    if (savedAvatar) {
                        setUserAvatar(savedAvatar);
                    } else {
                        setUserAvatar(defaultData.image);
                    }
                }
            } else {
                // Fallback на токен
                const token = localStorage.getItem('access_token');
                if (token) {
                    const tokenData = parseJwt(token);
                    if (tokenData) {
                        let fallbackName = tokenData.name || tokenData.username || tokenData.email?.split('@')[0] || 'Пользователь';
                        setUserNameState(fallbackName);
                        setUserRole(tokenData.role);
                    }
                }
            }
        } catch (error) {
            console.error('Header - ошибка загрузки профиля:', error);
            // Fallback на токен
            const token = localStorage.getItem('access_token');
            if (token) {
                const tokenData = parseJwt(token);
                if (tokenData) {
                    let userName = tokenData.name || tokenData.username || tokenData.email?.split('@')[0] || 'Пользователь';
                    setUserNameState(userName);
                    setUserRole(tokenData.role);
                }
            }
        }
    };

    // Загрузка данных пользователя
    useEffect(() => {
        loadUserProfile();
    }, []);

    // Слушаем обновления данных пользователя
    useEffect(() => {
        const handleUserDataUpdate = (event) => {
            const { userId, name, avatar } = event.detail || {};
            const targetUserId = userId || currentUserId;
            
            if (!targetUserId) return;
            
            if (name && name !== userNameState) {
                setUserNameState(name);
                setCurrentUser(prev => ({ ...prev, name: name }));
            }
            if (avatar && avatar !== userAvatar) {
                setUserAvatar(avatar);
                setCurrentUser(prev => ({ ...prev, avatar: avatar }));
            }
        };
        
        window.addEventListener('userDataUpdate', handleUserDataUpdate);
        return () => window.removeEventListener('userDataUpdate', handleUserDataUpdate);
    }, [currentUserId, userNameState, userAvatar]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

    useEffect(() => {
        if (showProfileModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showProfileModal]);

    const handleProfileClick = () => {
        setShowProfileModal(true);
    };

    const handleLogoClick = () => {
        if (onPageChange) {
            if (userRole === 'supervisor' || currentUser?.role === 'supervisor') {
                onPageChange('supervisor');
            } else if (userRole === 'analyst' || currentUser?.role === 'analyst') {
                onPageChange('analyst');
            } else {
                onPageChange('main');
            }
        }
    };

    const handleProfileLogout = () => {
        setShowProfileModal(false);
        userStorage.clearCurrentUserData();
        if (onLogout) {
            onLogout();
        }
    };

    const handleProfileBack = () => {
        setShowProfileModal(false);
        if (onPageChange) {
            if (userRole === 'supervisor' || currentUser?.role === 'supervisor') {
                onPageChange('supervisor');
            } else if (userRole === 'analyst' || currentUser?.role === 'analyst') {
                onPageChange('analyst');
            } else {
                onPageChange('main');
            }
        }
    };

    const handleUserUpdate = (updatedData) => {
        const userId = userStorage.getCurrentUserId() || currentUserId;
        if (userId) {
            if (updatedData.name || updatedData.displayName) {
                const newName = updatedData.name || updatedData.displayName;
                userStorage.setUserName(userId, newName);
                setUserNameState(newName);
                setCurrentUser(prev => ({ ...prev, name: newName }));
            }
            if (updatedData.avatar) {
                userStorage.setUserAvatar(userId, updatedData.avatar);
                setUserAvatar(updatedData.avatar);
                setCurrentUser(prev => ({ ...prev, avatar: updatedData.avatar }));
            }
            if (updatedData.role) {
                userStorage.setUserRole(userId, updatedData.role);
                setUserRole(updatedData.role);
                setCurrentUser(prev => ({ ...prev, role: updatedData.role }));
            }
        }
        
        if (onUserUpdate) {
            onUserUpdate(updatedData);
        }
        
        window.dispatchEvent(new CustomEvent('userDataUpdate', { 
            detail: { userId: userId || currentUserId, ...updatedData }
        }));
    };

    let roleDisplay = 'Оператор';
    const effectiveRole = userRole || currentUser?.role;
    if (effectiveRole === 'supervisor') {
        roleDisplay = 'Супервайзер';
    } else if (effectiveRole === 'analyst') {
        roleDisplay = 'Аналитик';
    } else if (effectiveRole === 'operator') {
        roleDisplay = 'Оператор';
    }
    
    const isOperator = effectiveRole === 'operator';
    const pvzAddress = currentUser?.pvz?.address || userData?.pvz?.address || localStorage.getItem('pvzAddress') || 'ПВЗ №1';
    const workStart = currentUser?.pvz?.work_start || userData?.pvz?.work_start || '10:00';
    const workEnd = currentUser?.pvz?.work_end || userData?.pvz?.work_end || '22:00';

    const finalDisplayName = userNameState || 
                            currentUser?.name || 
                            currentUser?.displayName || 
                            userData?.name ||
                            userData?.displayName ||
                            userName || 
                            'Пользователь';
    
    const finalAvatar = userAvatar || currentUser?.avatar || userData?.avatar || defaultData.image;

    return(
        <>
            <header className='headerText'>
                {isOperator ? (
                    <div className='compactLeft'>
                        <span className='point' onClick={handleLogoClick}>
                            {pvzAddress}
                        </span>
                        <span className='leftTwo'>
                            Смена: {workStart} – {workEnd}
                        </span>
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
                            <div className='user-name'>
                                {finalDisplayName}
                            </div>
                            <div className='user-role'>
                                {roleDisplay}
                            </div>
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