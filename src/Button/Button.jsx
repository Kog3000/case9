import './Button.css'

export default function Button({ content, onClick, variant='full', lengthBtn='short'}) {
    return (
        <button 
            className={`button-${variant}-${lengthBtn}`} 
            onClick={onClick}
        >
            {content}
        </button>
    )
}