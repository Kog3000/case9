import CustomBarChart from "./CustomBar/CustomBarChart";
import OrdersSection from "./Orders/OrdersSection";
import './OperatorPage.css'
import Filters from "./Filters/Filters";


export default function OperatorPage() {
    return(
        <div className="content-wrapper">
            <Filters></Filters>
            <OrdersSection></OrdersSection>
            <CustomBarChart></CustomBarChart>
        </div>
    )
}