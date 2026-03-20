import Header from './Header'
import './App.css'
import Filters from './Filters'
import OrdersSection from './OrdersSection'
import CustomBarChart from './CustomBarChart'

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content-wrapper">
        <Filters />
        <OrdersSection />
        <CustomBarChart></CustomBarChart>
      </div>
    </div>
  )
}

export default App
