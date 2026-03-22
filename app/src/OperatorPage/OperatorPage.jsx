import CustomBarChart from "./CustomBarChart";
import Filters from "./Filters";
import OrdersSection from "./OrdersSection";
import './OperatorPage.css'


export default function OperatorPage() {
    return(
        <div className="content-wrapper">
            <Filters></Filters>
            <OrdersSection></OrdersSection>
            <CustomBarChart></CustomBarChart>
        </div>
    )
}