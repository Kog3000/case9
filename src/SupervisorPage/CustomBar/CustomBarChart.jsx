import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import './CustomBarChart.css'
import {barInfo} from '../../data.js'
import Button from '../../Button/Button.jsx'

export default function CustomBarChart() {
  const getColorByValue = (value) => {
    if (value <= 20) {
      return '#509F6A'
    } else if (value >= 21 && value <= 35) {
      return '#809F50'
    } else if (value >= 36 && value <= 50) {
      return '#9F6050'
    } else if (value >= 51 && value <= 70) {
      return '#9a4c4e'
    } else if (value >= 71) {
      return '#AA3B3B'
    }
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value
      return (
        <div className="custom-tooltip">
          <p className="tooltip-day">{label}</p>
          <p className="tooltip-value">
            <span>Клиентов:</span>
            <strong style={{ color: getColorByValue(value) }}>{value}</strong>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="chart-container">
      <p className="chart-title">Загруженность ПВЗ</p>
      
      {/* Легенда для пояснения цветов
      <div className="chart-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#22c55e' }}></div>
          <span>Высокая загрузка (&gt;45)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#eab308' }}></div>
          <span>Средняя загрузка (30-45)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#ef4444' }}></div>
          <span>Низкая загрузка (&lt;30)</span>
        </div>
      </div> */}
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barInfo} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
            <XAxis 
              dataKey="day" 
              tick={false}
              axisLine={{ stroke: '#ddd' }}
            />
            <YAxis 
              tick={{ fill: '#666', fontSize: 14 }}
              axisLine={{ stroke: '#ddd' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} animationDuration={1000}>
              {barInfo.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getColorByValue(entry.value)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* <div className='btn'>
        <Button content='Отчёт в CSV'></Button>
      </div> */}
    </div>
  )
}