import { useState } from 'react'
import Header from './Header'
import Filters from './Filters'
import OrdersSection from './OrdersSection'
import CustomBarChart from './CustomBarChart'
import ProfilePage from './ProfilePage' // Создайте этот компонент
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('main')

  // Функция для переключения страниц
  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  return (
    <div>
      {currentPage === 'main' ? (
        <div className="app-container">
          <Header onPageChange={handlePageChange} />
          <div className="content-wrapper">
            <Filters />
            <OrdersSection />
            <CustomBarChart />
          </div>
        </div>
      ) : (
        <ProfilePage onBack={() => handlePageChange('main')} />
      )}
    </div>
  )
}

export default App