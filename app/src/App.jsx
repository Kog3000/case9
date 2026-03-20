import Header from './Header'
import './App.css'
import Filters from './Filters'
import OrdersSection from './OrdersSection'

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="content-wrapper">
        <Filters />
        <OrdersSection />
      </div>
    </div>
  )
}

export default App
