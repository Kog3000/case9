import './InputCase.css'

export default function InputCase({title, content, onChange, value}) {
    return(
        <div>
            <p>{title}</p>
            <input onChange={onChange} value={value || ''} placeholder={content}></input>
        </div>
    )
}
